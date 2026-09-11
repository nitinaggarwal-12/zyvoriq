import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 3008;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve(process.cwd(), 'scratch', 'cloudtop_e2e_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
  console.log(`[E2E] Starting Next.js standalone server on port ${PORT}...`);
  const srv = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) {
        console.log(`[E2E] Server ready on ${BASE_URL}`);
        return srv;
      }
    } catch {}
  }
  throw new Error(`Server failed to start on port ${PORT}`);
}

async function run() {
  let srv = null;
  let browser = null;

  try {
    srv = await startServer();

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // 1. Ultra-Wide Desktop (1600x950)
    console.log(`[E2E] 1. Auditing Desktop Viewport (1600x950)...`);
    await page.setViewport({ width: 1600, height: 950, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);

    // Verify all 5 music video titles are present in DOM
    const titles = [
      'Neon Horizon — Airi',
      'Sunkissed Riviera — Elena',
      'Ocean Boulevard — Sierra',
      'Golden Mirage — Ananya',
      'White Nights Melodia — Polina'
    ];

    const bodyText = await page.evaluate(() => document.body.innerText);
    for (const title of titles) {
      if (!bodyText.includes(title)) {
        throw new Error(`Missing title in DOM: ${title}`);
      }
      console.log(`   ✅ Found title: ${title}`);
    }

    const shot1 = path.join(OUT_DIR, '01_desktop_summer_college_mvs.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`📸 Captured Desktop: ${shot1}`);

    // 2. Mobile iOS (iPhone 14 @ 390x844)
    console.log(`[E2E] 2. Auditing iOS Mobile Viewport (390x844)...`);
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    const iosNoOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log(`   iOS Zero Horizontal Overflow: ${iosNoOverflow ? '✅ PASS' : '❌ FAIL'}`);
    if (!iosNoOverflow) throw new Error('iOS horizontal overflow detected!');

    const shot2 = path.join(OUT_DIR, '02_mobile_ios_summer_mvs.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`📸 Captured iOS: ${shot2}`);

    // 3. Mobile Android (Pixel 7 @ 412x915)
    console.log(`[E2E] 3. Auditing Android Mobile Viewport (412x915)...`);
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    const androidNoOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log(`   Android Zero Horizontal Overflow: ${androidNoOverflow ? '✅ PASS' : '❌ FAIL'}`);
    if (!androidNoOverflow) throw new Error('Android horizontal overflow detected!');

    const shot3 = path.join(OUT_DIR, '03_mobile_android_summer_mvs.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`📸 Captured Android: ${shot3}`);

    console.log('\n🎉 ALL CLOUDTOP UI & MOBILE PROTOCOL GATES PASSED 100%!');
  } finally {
    if (browser) await browser.close();
    if (srv) {
      console.log(`[E2E] Shutting down Next.js server...`);
      srv.kill('SIGTERM');
    }
  }
}

run().catch(err => {
  console.error('❌ E2E Failure:', err);
  process.exit(1);
});
