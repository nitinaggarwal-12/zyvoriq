#!/usr/bin/env node
/**
 * scripts/telemetry_watchdog.mjs
 *
 * Automated live telemetry watchdog and log forensic auditor for Zyvoriq.
 * Continuously inspects live Railway logs from both `zyvoriq` and `zyvoriq-reel-worker`,
 * automatically diagnosing:
 *  - Genre resolution & validation
 *  - Script dialogue word budgeting & ceilings
 *  - Narration words-per-second (WPS) vs planner cadence
 *  - ChooseGenerationDuration bucket selection (4s/6s/8s)
 *  - Retime clamp bindings (clampFloorBound, surplus trimming)
 *  - Audio strategy consistency (native vs tts_dub, BGM selection)
 *  - Veo safety retries, backoffs, and recovery times
 *  - Worker queue states, heartbeats, and disk health
 */

import { execSync } from 'child_process';

const SERVICES = ['zyvoriq', 'zyvoriq-reel-worker'];

class TelemetryAuditor {
  constructor() {
    this.seenKeys = new Set();
    this.stats = {
      linesProcessed: 0,
      posts: 0,
      cadenceReadings: [],
      clampBindings: [],
      safetyRetries: [],
      audioStrategies: [],
      genresResolved: []
    };
  }

  logInfo(msg) {
    console.log(`\x1b[36m[AUDITOR INFO]\x1b[0m ${msg}`);
  }

  logWarn(msg) {
    console.log(`\x1b[33m[AUDITOR WARN]\x1b[0m ${msg}`);
  }

  logError(msg) {
    console.log(`\x1b[31m[AUDITOR ERROR]\x1b[0m ${msg}`);
  }

  logSuccess(msg) {
    console.log(`\x1b[32m[AUDITOR PASS]\x1b[0m ${msg}`);
  }

  parseLine(service, line) {
    if (!line || !line.trim()) return;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      entry = { message: line, timestamp: new Date().toISOString() };
    }

    const msg = entry.message || '';
    const ts = entry.timestamp || '';

    const key = `${service}:${ts}:${msg}`;
    if (this.seenKeys.has(key)) return;
    this.seenKeys.add(key);
    this.stats.linesProcessed++;

    this.analyzeMessage(service, msg, ts);
  }

  analyzeMessage(service, msg, ts) {
    // 1. Production Creation Incoming
    const postMatch = msg.match(/\[api\/studio1\/productions\] POST incoming: topic="([^"]+)", genre="([^"]+)", duration=(\d+)/);
    if (postMatch) {
      this.stats.posts++;
      this.logInfo(`[${service}] Incoming Production: topic="${postMatch[1]}", genre="${postMatch[2]}", duration=${postMatch[3]}s`);
    }

    // 2. OmniDirector Genre Resolution
    const omniGenreMatch = msg.match(/\[omni-director\] (?:Validated explicitGenre|Directorial compilation resolved genre): "([^"]+)"/);
    if (omniGenreMatch) {
      this.stats.genresResolved.push(omniGenreMatch[1]);
      this.logSuccess(`[${service}] OmniDirector Genre Confirmed: "${omniGenreMatch[1]}"`);
    }

    // 3. Audio Strategy Resolution
    const audioStratMatch = msg.match(/audio strategy \(genre: ([^,]+), audioStrategy: ([^)]+)\): (.*)/i);
    if (audioStratMatch) {
      const genre = audioStratMatch[1].trim();
      const strategy = audioStratMatch[2].trim();
      const desc = audioStratMatch[3].trim();
      this.stats.audioStrategies.push({ genre, strategy, desc });

      if (genre.toUpperCase() === 'MUSIC_VIDEO' && strategy !== 'native') {
        this.logError(`[${service}] AUDIO CONTRADICTION: Genre is MUSIC_VIDEO but audioStrategy is "${strategy}"! Expected "native" for live singing.`);
      } else {
        this.logSuccess(`[${service}] Audio Strategy Verified: genre=${genre} -> strategy=${strategy} (${desc})`);
      }
    }

    // 4. Narration Cadence & Measured WPS
    const cadenceMatch = msg.match(/\[narration-cadence\] shot ([^:]+): (\d+) words \/ ([\d.]+)s = ([\d.]+) wps/);
    if (cadenceMatch) {
      const shot = cadenceMatch[1];
      const words = parseInt(cadenceMatch[2], 10);
      const duration = parseFloat(cadenceMatch[3]);
      const wps = parseFloat(cadenceMatch[4]);
      this.stats.cadenceReadings.push({ shot, words, duration, wps });

      this.logInfo(`[${service}] Cadence Measured [${shot}]: ${words} words / ${duration.toFixed(2)}s = ${wps.toFixed(2)} wps`);
      if (wps < 1.6) {
        this.logWarn(`Unusually slow speech cadence measured: ${wps.toFixed(2)} wps (expected ~2.1 wps)`);
      } else if (wps > 3.2) {
        this.logWarn(`Unusually fast speech cadence measured: ${wps.toFixed(2)} wps (risk of rushed delivery)`);
      }
    }

    // 5. Retime Clamp Floor Bound & Surplus Trimming
    const clampMatch = msg.match(/\[studio1-sync\] Retime clamp floor \(([\d.]+)\) bound on shot ([^:]+): target ([\d.]+)s, source ([\d.]+)s, retime ([\d.]+)x \((\d+)% speedup\), surplus trimmed: ([\d.]+)s/);
    if (clampMatch) {
      const floor = clampMatch[1];
      const shot = clampMatch[2];
      const target = parseFloat(clampMatch[3]);
      const source = parseFloat(clampMatch[4]);
      const retime = clampMatch[5];
      const speedup = clampMatch[6];
      const surplus = parseFloat(clampMatch[7]);
      this.stats.clampBindings.push({ shot, target, source, retime, speedup, surplus });

      this.logWarn(`[${service}] RETIME CLAMP BOUND [${shot}]: target=${target}s, source=${source}s, surplus discarded=${surplus}s (${((surplus / source) * 100).toFixed(1)}% discarded)`);
    }

    // 6. Non-clamp successful Retime Sync
    const syncOkMatch = msg.match(/\[studio1-sync\] Retimed shot ([^:]+) perfectly to target ([\d.]+)s \(retime factor: ([\d.]+)x, surplus trimmed: ([\d.]+)s\)/);
    if (syncOkMatch) {
      this.logSuccess(`[${service}] Retime Perfect [${syncOkMatch[1]}]: target=${syncOkMatch[2]}s, factor=${syncOkMatch[3]}x, surplus=${syncOkMatch[4]}s`);
    }

    // 7. Continuous Score & Music Selection
    const scoreMatch = msg.match(/\[generateContinuousScore\] genre="([^"]+)", tempo=(\d+) bpm, style="([^"]+)"/);
    if (scoreMatch) {
      this.logInfo(`[${service}] Continuous Score: genre=${scoreMatch[1]}, bpm=${scoreMatch[2]}, style=${scoreMatch[3]}`);
    }

    // 8. Veo Safety Retry / Backoff
    const retryMatch = msg.match(/\[veo\] safety rejection or transient failure .* retry (\d+)\/(\d+) after (\d+)s backoff/i);
    if (retryMatch) {
      this.stats.safetyRetries.push(msg);
      this.logWarn(`[${service}] Veo Safety Backoff: retry ${retryMatch[1]}/${retryMatch[2]} (waiting ${retryMatch[3]}s)`);
    }

    // 9. Veo Recovery
    const recoveryMatch = msg.match(/\[veo\] operation recovered after safety retry: (.*)/i);
    if (recoveryMatch) {
      this.logSuccess(`[${service}] Veo Recovery Succeeded: ${recoveryMatch[1]}`);
    }

    // 10. Worker Heartbeat & System Health
    const heartbeatMatch = msg.match(/\[reel-worker\] \[heartbeat\] Active: (\d+) running \(oldest: (\d+)s\), (\d+) queued \(oldest: (\d+)s\), (\d+) blocked \| Disk: (\d+)MB free \/ (\d+)MB/);
    if (heartbeatMatch) {
      const running = parseInt(heartbeatMatch[1], 10);
      const queued = parseInt(heartbeatMatch[3], 10);
      const blocked = parseInt(heartbeatMatch[5], 10);
      const diskFree = parseInt(heartbeatMatch[6], 10);
      const diskTotal = parseInt(heartbeatMatch[7], 10);

      this.logInfo(`[${service}] Heartbeat: running=${running}, queued=${queued}, blocked=${blocked} | Disk: ${diskFree}MB free / ${diskTotal}MB total`);
      if (diskFree < 1000) {
        this.logWarn(`Low Disk Warning on reel worker volume: ${diskFree}MB free / ${diskTotal}MB total`);
      }
    }
  }

  fetchLogs(lines = 100) {
    for (const service of SERVICES) {
      try {
        const raw = execSync(`railway logs --service ${service} --lines ${lines} --json`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PATH: `${process.env.HOME}/bin:${process.env.PATH}` }
        });

        const linesArr = raw.split('\n');
        for (const l of linesArr) {
          this.parseLine(service, l);
        }
      } catch (err) {
        this.logError(`Failed to fetch logs for ${service}: ${err.message}`);
      }
    }
  }

  printSummary() {
    console.log('\n================ TELEMETRY AUDITOR SUMMARY ================');
    console.log(`Total log lines scanned:       ${this.stats.linesProcessed}`);
    console.log(`Productions requested:         ${this.stats.posts}`);
    console.log(`Genres resolved:               ${this.stats.genresResolved.length} (${this.stats.genresResolved.join(', ') || 'none in window'})`);
    console.log(`Audio strategies logged:       ${this.stats.audioStrategies.length}`);
    for (const a of this.stats.audioStrategies) {
      console.log(`  - ${a.genre} -> ${a.strategy} (${a.desc})`);
    }
    console.log(`Cadence readings:              ${this.stats.cadenceReadings.length}`);
    if (this.stats.cadenceReadings.length > 0) {
      const avgWps = (this.stats.cadenceReadings.reduce((sum, r) => sum + r.wps, 0) / this.stats.cadenceReadings.length).toFixed(2);
      console.log(`  - Average measured cadence:  ${avgWps} wps`);
    }
    console.log(`Retime clamp floor bindings:   ${this.stats.clampBindings.length}`);
    if (this.stats.clampBindings.length > 0) {
      const totalSurplus = this.stats.clampBindings.reduce((sum, c) => sum + c.surplus, 0).toFixed(2);
      console.log(`  - Total surplus discarded:   ${totalSurplus}s across ${this.stats.clampBindings.length} bound shots`);
    }
    console.log(`Safety retries / backoffs:     ${this.stats.safetyRetries.length}`);
    console.log('===========================================================\n');
  }

  runContinuous(intervalMs = 5000) {
    this.logInfo(`Starting Continuous Telemetry Watchdog across [${SERVICES.join(', ')}]...`);
    this.fetchLogs(100);
    this.printSummary();

    setInterval(() => {
      this.fetchLogs(30);
    }, intervalMs);
  }
}

// Check execution mode
const args = process.argv.slice(2);
const auditor = new TelemetryAuditor();

if (args.includes('--once')) {
  const lines = args.includes('--lines') ? parseInt(args[args.indexOf('--lines') + 1], 10) : 150;
  auditor.fetchLogs(lines);
  auditor.printSummary();
} else {
  auditor.runContinuous(5000);
}
