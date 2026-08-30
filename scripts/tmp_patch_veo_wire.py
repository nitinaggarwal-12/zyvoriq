from pathlib import Path

p = Path('scripts/reel_worker_v2.mjs')
s = p.read_text()

old = '    if (ref) instance.image = { inlineData: { mimeType: "image/png", data: ref.buffer.toString("base64") } };'
new = '    if (ref) instance.image = { mimeType: "image/png", bytesBase64Encoded: ref.buffer.toString("base64") };'
if old not in s:
    raise SystemExit('Veo inlineData anchor not found')
s = s.replace(old, new, 1)

anchor = 'await recoverLegacyAmbiguousVeoFailures();\n\nasync function publishHeartbeat() {'
recovery = '''await recoverLegacyAmbiguousVeoFailures();

async function recoverLegacyVeoInlineDataFailures() {
  const failed = await pool.query(`
    SELECT id, production_id, target_id
    FROM reel_operations
    WHERE kind='SHOT'
      AND status='FAILED'
      AND last_error LIKE '%inlineData%supported by this model%'
    ORDER BY updated_at ASC
  `);
  for (const row of failed.rows) {
    const reset = await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0, provider_operation_name=NULL, result_json=NULL,
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
      m.qa.failures = m.qa.failures.filter(x => !(String(x).includes('inlineData') && String(x).includes('supported by this model')));
    }
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;
    if (shot && !shot.asset?.videoUrl) {
      shot.status = 'FAILED';
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !(String(x).includes('inlineData') && String(x).includes('supported by this model')));
      }
    }
    if (m.status === 'FAILED') m.status = 'REPAIRING';
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered legacy Veo inlineData rejection ${row.id} with corrected image wire format`);
  }
}
await recoverLegacyVeoInlineDataFailures();

async function publishHeartbeat() {'''
if anchor not in s:
    raise SystemExit('Veo recovery insertion anchor not found')
s = s.replace(anchor, recovery, 1)

if 'version: "v2.2"' not in s:
    raise SystemExit('worker version anchor not found')
s = s.replace('version: "v2.2"', 'version: "v2.3"', 1)

p.write_text(s)
