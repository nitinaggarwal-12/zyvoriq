#!/usr/bin/env node
/**
 * Rule 56 Pre-Traffic Canary & In-Container BeyondCorp Loopback E2E Entrypoint
 * (`scripts/gate5_self_verify_entrypoint.mjs`)
 *
 * Why this runs BEFORE binding Cloud Run's external `PORT` (8080):
 * 1. Cloud Run request-scoped CPU allocation (`cpu-throttling: true`) provides 100%
 *    unthrottled startup CPU boost ONLY until the `tcpSocket: 8080` startup probe
 *    succeeds, after which CPU is throttled to 0% until an external request arrives.
 * 2. Running the full loopback HTTP E2E + Dual-Engine CAS verification on an ephemeral
 *    loopback port (`127.0.0.1:18080`) BEFORE opening `0.0.0.0:8080` guarantees:
 *      (a) Full unthrottled startup CPU during verification (`~450ms`),
 *      (b) Fail-closed canary protection (`process.exit(1)` prevents a broken revision
 *          from ever binding port 8080 or receiving 100% BeyondCorp traffic), and
 *      (c) Zero reverse-proxy overhead in production (`server.js` binds `0.0.0.0:8080`
 *          natively immediately after preflight passes).
 */

import { spawn } from "node:child_process";
import path from "node:path";

const EXTERNAL_PORT = Number(process.env.PORT || 8080);
const PREFLIGHT_PORT = EXTERNAL_PORT === 18080 ? 18081 : 18080;
const REVISION = process.env.K_REVISION || "local-gate5-preflight";
const SERVER_SCRIPT = process.env.ZYVORIQ_SERVER_ENTRY
  ? path.resolve(process.env.ZYVORIQ_SERVER_ENTRY)
  : path.resolve(process.cwd(), "server.js");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(baseUrl, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      if (res.status === 200) return true;
    } catch {
      // Waiting for Next.js listener
    }
    await sleep(200);
  }
  return false;
}

async function runPreflightE2E(baseUrl) {
  const [
    healthRes,
    swarmMuiRes,
    capRes,
    reelsListRes,
    reelsFeedbackListRes,
    studio1PrunedRes,
    omniGenPrunedRes,
    opRetryPrunedRes,
  ] = await Promise.all([
    fetch(`${baseUrl}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(6000) }),
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

  const swarmMuiHtml = await swarmMuiRes.text().catch(() => "");
  const capJson = await capRes.json().catch(() => ({}));
  const reelsListJson = await reelsListRes.json().catch(() => ({}));
  const reelsFeedbackJson = await reelsFeedbackListRes.json().catch(() => ({}));
  const opRetryJson = await opRetryPrunedRes.json().catch(() => ({}));

  const PROBE_TOPIC = "Cloud Run Boot Self-Test Probe";
  let dualEngineCrudRoundTrip = false;
  let createdProbeId = null;

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
    const createJson = await createRes.json().catch(() => ({}));
    createdProbeId = createJson?.production?.id || null;

    if (createRes.status === 201 && createdProbeId) {
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
      const staleCasJson = await staleCasRes.json().catch(() => ({}));

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
      const getJson = await getRes.json().catch(() => ({}));

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
      await fetch(`${baseUrl}/api/reels/productions/${encodeURIComponent(createdProbeId)}`, {
        method: "DELETE",
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      }).catch(() => {});
    }
    try {
      const sweepRes = await fetch(`${baseUrl}/api/reels/productions?limit=15`, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      const sweepJson = await sweepRes.json().catch(() => ({}));
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

  // Verify >32 MiB MP4 open-ended Range request returns <= 8 MiB HTTP 206 chunk + ISO BMFF ftyp header + clean stream cancel
  let largeMp4Range206 = false;
  let largeMp4ChunkBytes = 0;
  try {
    const mp4Res = await fetch(
      `${baseUrl}/api/media/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/combined_300s.mp4`,
      {
        headers: { Range: "bytes=0-" },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }
    );
    largeMp4ChunkBytes = Number(mp4Res.headers.get("content-length") || "0");
    const contentRange = mp4Res.headers.get("content-range") || "";
    const reader = mp4Res.body?.getReader();
    let hasFtyp = false;
    if (reader) {
      const firstRead = await reader.read();
      const bytes = firstRead?.value;
      if (bytes && bytes.length >= 8) {
        const boxType = Buffer.from(bytes.subarray(4, 8)).toString("ascii");
        hasFtyp = boxType === "ftyp";
      }
      await reader.cancel();
    }
    largeMp4Range206 =
      mp4Res.status === 206 &&
      largeMp4ChunkBytes > 0 &&
      largeMp4ChunkBytes <= 8 * 1024 * 1024 &&
      contentRange.startsWith("bytes 0-") &&
      hasFtyp;
  } catch {
    largeMp4Range206 = false;
  }

  let cartagenaEntityReady = false;
  let zeroSeedHijack404 = false;
  let audioVoices200 = false;
  try {
    const [canonRes, aliasRes, unknownRes, voicesRes, cartMp4Res] = await Promise.all([
      fetch(`${baseUrl}/api/entity/ZYV-REEL-SHAKIRAHIP-60S-IC8B`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${baseUrl}/api/entity/ZYV-REEL-AMUSICAL-300S`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${baseUrl}/api/entity/ZYV-UNKNOWN-BOOT-PROBE-404`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${baseUrl}/api/audio/voices`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }),
      fetch(
        `${baseUrl}/api/media/assets/swarm/generated/job_1793244563480_9dcef9/combined_60s.mp4`,
        {
          headers: { Range: "bytes=0-" },
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
        }
      ),
    ]);
    const canonJson = await canonRes.json().catch(() => ({}));
    const aliasJson = await aliasRes.json().catch(() => ({}));
    const cartChunkLen = Number(cartMp4Res.headers.get("content-length") || "0");
    await cartMp4Res.body?.cancel().catch(() => {});
    zeroSeedHijack404 = unknownRes.status === 404;
    audioVoices200 = voicesRes.status === 200;
    cartagenaEntityReady =
      canonRes.status === 200 &&
      aliasRes.status === 200 &&
      canonJson?.entity?.renderStatus === "ready" &&
      aliasJson?.entity?.canonicalId === "ZYV-REEL-SHAKIRAHIP-60S-IC8B" &&
      aliasJson?.entity?.isFallbackMaster === false &&
      cartMp4Res.status === 206 &&
      cartChunkLen > 0 &&
      cartChunkLen <= 8 * 1024 * 1024;
  } catch {
    cartagenaEntityReady = false;
  }

  const checks = {
    health: healthRes.status,
    swarmMui: swarmMuiRes.status,
    swarmMuiHasHtml: swarmMuiHtml.includes("<html") || swarmMuiHtml.includes("<!DOCTYPE html"),
    capabilities: capRes.status,
    engineArchitecture: capJson?.capabilities?.engineArchitecture || null,
    persistence: capJson?.capabilities?.persistence || null,
    reelProductionsList: reelsListRes.status,
    reelProductionsSuccess: Boolean(reelsListJson?.success),
    reelFeedbackList: reelsFeedbackListRes.status,
    reelFeedbackSuccess: Boolean(reelsFeedbackJson?.success),
    dualEngineCrudRoundTrip,
    largeMp4Range206,
    largeMp4ChunkBytes,
    cartagenaEntityReady,
    zeroSeedHijack404,
    audioVoices200,
    studio1Pruned: studio1PrunedRes.status,
    omniGeneratePruned: omniGenPrunedRes.status,
    operationRetryPruned: opRetryPrunedRes.status,
    operationRetryCode: opRetryJson?.code || null,
  };

  const passed =
    checks.health === 200 &&
    checks.swarmMui === 200 &&
    checks.swarmMuiHasHtml === true &&
    checks.capabilities === 200 &&
    checks.engineArchitecture === "option_a_omni11_primary_veo31_safety_net" &&
    checks.reelProductionsList === 200 &&
    checks.reelProductionsSuccess === true &&
    checks.reelFeedbackList === 200 &&
    checks.reelFeedbackSuccess === true &&
    checks.dualEngineCrudRoundTrip === true &&
    checks.largeMp4Range206 === true &&
    checks.cartagenaEntityReady === true &&
    checks.zeroSeedHijack404 === true &&
    checks.audioVoices200 === true &&
    checks.studio1Pruned === 404 &&
    checks.omniGeneratePruned === 404 &&
    checks.operationRetryPruned === 410 &&
    checks.operationRetryCode === "STUDIO1_WORKER_PRUNED_OPTION_A";

  return { passed, checks };
}

async function terminateChild(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  for (let i = 0; i < 25; i++) {
    if (child.exitCode !== null) return;
    await sleep(100);
  }
  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

async function main() {
  if (process.env.ZYVORIQ_SKIP_GATE5_PREFLIGHT !== "1") {
    const preflightUrl = `http://127.0.0.1:${PREFLIGHT_PORT}`;
    const preflightChild = spawn(process.execPath, [SERVER_SCRIPT], {
      env: {
        ...process.env,
        HOSTNAME: "127.0.0.1",
        PORT: String(PREFLIGHT_PORT),
        ZYVORIQ_GATE5_PREFLIGHT_DONE: "1",
        ZYVORIQ_BOOT_SELFTEST: "0",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    preflightChild.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    try {
      const ready = await waitForHealth(preflightUrl, 20000);
      if (!ready) {
        const failPayload = {
          revision: REVISION,
          verifiedAt: new Date().toISOString(),
          error: `Preflight Next.js server did not bind ${preflightUrl} within 20s`,
        };
        console.error(`[CLOUDRUN_BOOT_SELFTEST_FAIL] ${JSON.stringify(failPayload)}`);
        await terminateChild(preflightChild);
        process.exit(1);
      }

      const { passed, checks } = await runPreflightE2E(preflightUrl);
      const receipt = {
        revision: REVISION,
        verifiedAt: new Date().toISOString(),
        checks,
      };

      if (!passed) {
        console.error(`[CLOUDRUN_BOOT_SELFTEST_FAIL] ${JSON.stringify(receipt)}`);
        await terminateChild(preflightChild);
        process.exit(1);
      }

      console.log(`[CLOUDRUN_BOOT_SELFTEST_PASS] ${JSON.stringify(receipt)}`);
      console.log(`CLOUDRUN_LIVE_E2E_VERIFICATION_RESULT: ${JSON.stringify(receipt)}`);
    } finally {
      await terminateChild(preflightChild);
    }

    if (process.env.ZYVORIQ_PREFLIGHT_EXIT_AFTER_PASS === "1") {
      process.exit(0);
    }
  }

  // Launch production Next.js server natively on 0.0.0.0:${EXTERNAL_PORT} (zero proxy overhead)
  const prodServer = spawn(process.execPath, [SERVER_SCRIPT], {
    env: {
      ...process.env,
      HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
      PORT: String(EXTERNAL_PORT),
      ZYVORIQ_GATE5_PREFLIGHT_DONE: "1",
      ZYVORIQ_BOOT_SELFTEST: "0",
    },
    stdio: "inherit",
  });

  const forwardSignal = (sig) => {
    if (prodServer.exitCode === null) {
      prodServer.kill(sig);
    }
  };
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));
  process.on("SIGINT", () => forwardSignal("SIGINT"));

  prodServer.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}

main().catch((err) => {
  console.error(
    `[CLOUDRUN_BOOT_SELFTEST_FAIL] ${JSON.stringify({
      revision: REVISION,
      error: err?.message || String(err),
    })}`
  );
  process.exit(1);
});
