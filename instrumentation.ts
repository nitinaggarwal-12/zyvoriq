/**
 * Next.js Server Boot Instrumentation (Option A — Cloud Run In-Container E2E Gate)
 *
 * Because Cloud Run enforces `run.googleapis.com/ingress: internal-and-cloud-load-balancing`
 * behind Google's BeyondCorp Global External Application Load Balancer (`*.cr.gclb.goog`),
 * external unauthenticated CLI probes cannot bypass corporate UberProxy WebAuthn SSO.
 *
 * When a Cloud Run revision (`K_REVISION`) or `ZYVORIQ_BOOT_SELFTEST=1` boots, this hook
 * executes an asynchronous loopback HTTP E2E self-test against the live Next.js server
 * on `http://127.0.0.1:${PORT}` and emits a structured `[CLOUDRUN_BOOT_SELFTEST_PASS]`
 * receipt directly into Google Cloud Logging, verified synchronously by Gate 5 of
 * `scripts/deploy_zyvoriq_cloudrun.py`.
 */

let bootSelfTestStarted = false;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCloudRunBootSelfTest() {
  const revision = process.env.K_REVISION || "local-boot-selftest";
  const port = Number(process.env.PORT || 8080);
  const baseUrl = `http://127.0.0.1:${port}`;

  // Wait up to 15s for the Next.js HTTP listener on 127.0.0.1:${port}
  let listenerReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const healthRes = await fetch(`${baseUrl}/api/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      if (healthRes.status === 200) {
        listenerReady = true;
        break;
      }
    } catch {
      // Listener still binding
    }
    await sleep(500);
  }

  if (!listenerReady) {
    console.error(
      `[CLOUDRUN_BOOT_SELFTEST_FAIL] ${JSON.stringify({
        revision,
        port,
        error: "HTTP listener did not respond on /api/health within 15s",
      })}`
    );
    return;
  }

  try {
    const [
      swarmMuiRes,
      capRes,
      reelsListRes,
      reelsFeedbackListRes,
      studio1PrunedRes,
      omniGenPrunedRes,
      opRetryPrunedRes,
    ] = await Promise.all([
      fetch(`${baseUrl}/swarm-MUI`, { cache: "no-store", signal: AbortSignal.timeout(6000) }),
      fetch(`${baseUrl}/api/reels/capabilities`, { cache: "no-store", signal: AbortSignal.timeout(6000) }),
      fetch(`${baseUrl}/api/reels/productions?limit=3`, { cache: "no-store", signal: AbortSignal.timeout(6000) }),
      fetch(`${baseUrl}/api/reels/feedback?productionId=boot_selftest_probe`, { cache: "no-store", signal: AbortSignal.timeout(6000) }),
      fetch(`${baseUrl}/api/studio1/productions`, { cache: "no-store", signal: AbortSignal.timeout(6000) }),
      fetch(`${baseUrl}/api/studio/omni-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${baseUrl}/api/reels/operations/boot_selftest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }),
    ]);

    const capJson: any = await capRes.json().catch(() => ({}));
    const reelsListJson: any = await reelsListRes.json().catch(() => ({}));
    const reelsFeedbackJson: any = await reelsFeedbackListRes.json().catch(() => ({}));
    const opRetryJson: any = await opRetryPrunedRes.json().catch(() => ({}));

    // Self-cleaning Dual-Engine CRUD + Optimistic Revision CAS round-trip (leaves 0 residual rows)
    const PROBE_TOPIC = "Cloud Run Boot Self-Test Probe";
    let dualEngineCrudRoundTrip = false;
    let createdProbeId: string | null = null;
    try {
      const createRes = await fetch(`${baseUrl}/api/reels/productions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: PROBE_TOPIC,
          scriptText:
            "Frame one verifies BeyondCorp loopback ingress. Frame two verifies dual-engine SQLite WAL and PostgreSQL persistence parity.",
          requestedDurationSec: 15,
          priority: 42,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const createJson: any = await createRes.json().catch(() => ({}));
      createdProbeId = createJson?.production?.id || null;

      if (createRes.status === 201 && createdProbeId) {
        // 1. Positive CAS update: expectedRevision=1 -> revision=2, starred=true
        const starRes = await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "setStarred", starred: true, expectedRevision: 1 }),
            cache: "no-store",
            signal: AbortSignal.timeout(6000),
          }
        );

        // 2. Negative CAS conflict check: stale expectedRevision=1 -> HTTP 409 REVISION_CONFLICT
        const staleCasRes = await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "setStarred", starred: false, expectedRevision: 1 }),
            cache: "no-store",
            signal: AbortSignal.timeout(6000),
          }
        );
        const staleCasJson: any = await staleCasRes.json().catch(() => ({}));

        // 3. Clear starred=false with valid expectedRevision=2 -> revision=3, starred=false
        const unstarRes = await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "setStarred", starred: false, expectedRevision: 2 }),
            cache: "no-store",
            signal: AbortSignal.timeout(6000),
          }
        );

        const getRes = await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`,
          { cache: "no-store", signal: AbortSignal.timeout(6000) }
        );
        const getJson: any = await getRes.json().catch(() => ({}));

        // 4. CAS-guarded DELETE with expectedRevision=3 -> HTTP 200, followed by 404
        const delRes = await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}?expectedRevision=3`,
          { method: "DELETE", cache: "no-store", signal: AbortSignal.timeout(6000) }
        );
        const afterDelRes = await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`,
          { cache: "no-store", signal: AbortSignal.timeout(6000) }
        );

        dualEngineCrudRoundTrip =
          starRes.status === 200 &&
          staleCasRes.status === 409 &&
          staleCasJson?.code === "REVISION_CONFLICT" &&
          unstarRes.status === 200 &&
          getRes.status === 200 &&
          getJson?.production?.revision === 3 &&
          getJson?.production?.starred === false &&
          getJson?.production?.manifest?.starred === false &&
          getJson?.production?.priority === 42 &&
          delRes.status === 200 &&
          afterDelRes.status === 404;
      }
    } finally {
      if (createdProbeId) {
        await fetch(
          `${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`,
          { method: "DELETE", cache: "no-store", signal: AbortSignal.timeout(4000) }
        ).catch(() => {});
      }
      // Sweep any orphan probe rows in case POST committed just before a client timeout
      try {
        const sweepRes = await fetch(`${baseUrl}/api/reels/productions?limit=15`, {
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        });
        const sweepJson: any = await sweepRes.json().catch(() => ({}));
        const rows = Array.isArray(sweepJson?.productions) ? sweepJson.productions : [];
        for (const item of rows) {
          if (item?.manifest?.topic === PROBE_TOPIC && item?.id) {
            await fetch(`${baseUrl}/api/reels/productions/${encodeURIComponent(String(item.id))}`, {
              method: "DELETE",
              cache: "no-store",
              signal: AbortSignal.timeout(4000),
            }).catch(() => {});
          }
        }
      } catch {
        // Best-effort sweep
      }
    }

    const checks = {
      swarmMui: swarmMuiRes.status,
      capabilities: capRes.status,
      engineArchitecture: capJson?.capabilities?.engineArchitecture || null,
      persistence: capJson?.capabilities?.persistence || null,
      reelProductionsList: reelsListRes.status,
      reelProductionsSuccess: Boolean(reelsListJson?.success),
      reelFeedbackList: reelsFeedbackListRes.status,
      reelFeedbackSuccess: Boolean(reelsFeedbackJson?.success),
      dualEngineCrudRoundTrip,
      studio1Pruned: studio1PrunedRes.status,
      omniGeneratePruned: omniGenPrunedRes.status,
      operationRetryPruned: opRetryPrunedRes.status,
      operationRetryCode: opRetryJson?.code || null,
    };

    const allPassed =
      checks.swarmMui === 200 &&
      checks.capabilities === 200 &&
      checks.engineArchitecture === "option_a_omni11_primary_veo31_safety_net" &&
      checks.reelProductionsList === 200 &&
      checks.reelProductionsSuccess === true &&
      checks.reelFeedbackList === 200 &&
      checks.reelFeedbackSuccess === true &&
      checks.dualEngineCrudRoundTrip === true &&
      checks.studio1Pruned === 404 &&
      checks.omniGeneratePruned === 404 &&
      checks.operationRetryPruned === 410 &&
      checks.operationRetryCode === "STUDIO1_WORKER_PRUNED_OPTION_A";

    const tag = allPassed ? "[CLOUDRUN_BOOT_SELFTEST_PASS]" : "[CLOUDRUN_BOOT_SELFTEST_FAIL]";
    console.log(`${tag} ${JSON.stringify({ revision, verifiedAt: new Date().toISOString(), checks })}`);
  } catch (err: any) {
    console.error(
      `[CLOUDRUN_BOOT_SELFTEST_FAIL] ${JSON.stringify({
        revision,
        error: err?.message || String(err),
      })}`
    );
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const { ensurePostgresSchema } = await import("@/lib/db/client");
  await ensurePostgresSchema().catch(() => {});

  if (process.env.ZYVORIQ_GATE5_PREFLIGHT_DONE === "1") {
    return;
  }
  if (!process.env.K_REVISION && process.env.ZYVORIQ_BOOT_SELFTEST !== "1") {
    return;
  }
  if (bootSelfTestStarted) return;
  bootSelfTestStarted = true;
  setTimeout(() => {
    void runCloudRunBootSelfTest();
  }, 750);
}
