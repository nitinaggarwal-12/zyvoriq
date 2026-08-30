from pathlib import Path

p = Path('scripts/reel_worker_v2.mjs')
s = p.read_text()

heartbeat_old = 'version: "v2.1"'
if heartbeat_old not in s:
    raise SystemExit('worker heartbeat version anchor not found')
s = s.replace(heartbeat_old, 'version: "v2.2"', 1)

publish_anchor = 'async function publishHeartbeat() {'
if publish_anchor not in s:
    raise SystemExit('publishHeartbeat anchor not found')
recovery = r'''async function recoverLegacyAmbiguousVeoFailures() {
  const failed = await pool.query(`
    SELECT id, production_id, target_id
    FROM reel_operations
    WHERE kind='SHOT'
      AND status='FAILED'
      AND last_error LIKE '%AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID%'
    ORDER BY updated_at ASC
  `);
  for (const row of failed.rows) {
    const reset = await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0, provider_operation_name='veo-dispatch-started', result_json=NULL,
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1 AND status='FAILED'
      RETURNING id
    `, [row.id]);
    if (!reset.rows[0]) continue;
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    m.qa = m.qa || { minimumReadyScore: 90, passed: false, warnings: [], failures: [] };
    if (Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes('AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID'));
    }
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;
    if (shot && !shot.asset?.videoUrl) {
      shot.status = 'FAILED';
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !String(x).includes('AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID'));
      }
    }
    if (m.status === 'FAILED') m.status = 'REPAIRING';
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered legacy ambiguous Veo operation ${row.id} for one bounded redispatch`);
  }
}
await recoverLegacyAmbiguousVeoFailures();

'''
s = s.replace(publish_anchor, recovery + publish_anchor, 1)

start = s.find('async function generateShot(')
end = s.find('async function applyShot(', start)
if start < 0 or end < 0:
    raise SystemExit('generateShot function boundaries not found')
new_generate = r'''async function generateShot(op, manifest, shot) {
  if (!apiKey() || !assetRoot()) throw new Error("Veo prerequisites missing");
  const tier = op.payload_json?.modelTier || "fast";
  const model = veoModel(tier);
  const ref = await extractReference(op, shot, manifest);
  const prior = String(op.provider_operation_name || "");
  const dispatchMarkers = new Set(["veo-dispatch-started", "veo-recovery-dispatch-started"]);
  let name = prior && !dispatchMarkers.has(prior) ? prior : null;

  if (!name) {
    if (prior === "veo-recovery-dispatch-started") {
      throw new Error("AMBIGUOUS_VEO_DISPATCH_AFTER_BOUNDED_RECOVERY");
    }
    await assertApplicable(op, { beforeDispatch: true });
    const dispatchMarker = prior === "veo-dispatch-started" ? "veo-recovery-dispatch-started" : "veo-dispatch-started";
    await updateOperation(op.id, { providerOperationName: dispatchMarker });

    const instance = { prompt: shot.generationPrompt };
    if (ref) instance.image = { inlineData: { mimeType: "image/png", data: ref.buffer.toString("base64") } };

    let d;
    try {
      d = await fetch(`${API_BASE}/v1beta/models/${model}:predictLongRunning`, {
        method: "POST",
        headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [instance], parameters: { aspectRatio: "9:16", durationSeconds: shot.generationDurationSec } }),
      });
    } catch (error) {
      throw error;
    }

    let j;
    try {
      j = await d.json();
    } catch (error) {
      throw new Error(`Veo dispatch returned an unreadable Operation response (${d.status})`);
    }

    if (!d.ok || j?.error) {
      await updateOperation(op.id, { providerOperationName: null });
      throw new Error(`Veo dispatch failed: ${j?.error?.message || d.status}`);
    }

    name = j?.name;
    if (!name) {
      throw new Error("Veo dispatch succeeded without operation name");
    }
    await updateOperation(op.id, { providerOperationName: name });
  }

  let uri = null;
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    if (i % 3 === 0) {
      await operationHeartbeat(op.id);
      await assertApplicable(op);
    }
    const p = await fetch(`${API_BASE}/v1beta/${name}`, { headers: { "x-goog-api-key": apiKey() } });
    const j = await p.json();
    if (!p.ok || j.error) throw new Error(`Veo polling failed: ${j.error?.message || p.status}`);
    if (j.done) {
      uri = j.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error("Veo completed without video URI");
      break;
    }
  }
  if (!uri) throw new Error(`Veo operation ${name} timed out`);
  await assertApplicable(op);
  const sep = uri.includes("?") ? "&" : "?";
  const dl = await fetch(`${uri}${sep}key=${apiKey()}`);
  if (!dl.ok) throw new Error(`Veo download failed (${dl.status})`);
  const buffer = Buffer.from(await dl.arrayBuffer());
  const probe = await probeVideo(buffer);
  if (probe.durationSec + .05 < shot.trimOutSec) throw new Error(`${shot.id} source ${probe.durationSec}s shorter than trim ${shot.trimOutSec}s`);
  await assertApplicable(op);
  const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const asset = await writeAsset(`reels/${op.production_id}/shots/${shot.id}-${digest}.mp4`, buffer);
  return { videoUrl: asset.url, actualDurationSec: probe.durationSec, operationName: name, provider: "google-veo", model, continuityReferenceUrl: ref?.url };
}
'''
s = s[:start] + new_generate + s[end:]

old_amb = 'const ambiguous = message.includes("AMBIGUOUS_TTS_RESULT_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID");'
new_amb = 'const ambiguous = message.includes("AMBIGUOUS_TTS_RESULT_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID");'
if old_amb not in s:
    raise SystemExit('outer ambiguity guard anchor not found')
s = s.replace(old_amb, new_amb, 1)

p.write_text(s)
