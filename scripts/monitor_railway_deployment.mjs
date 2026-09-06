const url = 'https://zyvoriq.up.railway.app/api/health';
const targetBuildId = 'omni-singlepage-portal-20260906-1935';
const startTime = Date.now();
const maxWaitSeconds = 180;

console.log(`📡 Monitoring Railway deployment for Omni Single-Page Portal (Target build: ${targetBuildId})...`);

async function check() {
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    const data = await res.json();
    const isNew = data.buildId === targetBuildId;

    console.log(`[T+${elapsed}s] Status: ${res.status} | Version: ${data.version} | BuildId: ${data.buildId || 'none'} | Railway-ID: ${res.headers.get('x-railway-request-id')}`);

    if (isNew) {
      console.log(`🎉 SUCCESS: Railway deployment detected at T+${elapsed}s!`);
      console.log(`Full payload: ${JSON.stringify(data, null, 2)}`);
      process.exit(0);
    }
  } catch (err) {
    console.log(`[T+${elapsed}s] Error fetching: ${err.message}`);
  }

  if (elapsed >= maxWaitSeconds) {
    console.log(`⚠️ TIMEOUT: Reached ${maxWaitSeconds}s without detecting new buildId.`);
    process.exit(1);
  }

  setTimeout(check, 5000);
}

check();
