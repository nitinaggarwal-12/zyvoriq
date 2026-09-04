import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve('scratch/screenshots_cinema_studio');
const BASE_URL = 'http://localhost:3000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🎬 Starting Zyvoriq Autonomous Cinema Studio Verification Suite...');

  // 1. Purge screenshot directory
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  const errors = [];

  // Ignore harmless aborts on media element destruction
  page.on('pageerror', (err) => {
    errors.push(`Page Error: ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('net::ERR_ABORTED')) {
      console.warn(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Desktop Ultra-Wide Viewport (1600x1000)
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Desktop Ultra-Wide Viewport (1600x1000) ---');
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/studio/cinema`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    const titleText = await page.$eval('h1', (el) => el.textContent);
    console.log(`Page H1 Title: "${titleText.trim()}"`);
    if (!titleText.includes('ZYVORIQ CINEMA ORIGINALS')) {
      throw new Error(`Expected H1 to contain "ZYVORIQ CINEMA ORIGINALS", got "${titleText}"`);
    }

    const bodyContent = await page.content();
    if (!bodyContent.includes('Noor-e-Ishq') || !bodyContent.includes('Yash Chopra')) {
      throw new Error('Missing Noor-e-Ishq marquee or Yash Chopra aesthetic details');
    }
    console.log('✅ Desktop Viewport & Originals Marquee verified.');

    const shot1 = path.join(SCREENSHOT_DIR, '01_cinema_originals_vault_desktop.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot1}`);

    // -------------------------------------------------------------
    // TEST 2: Subtitle & Multilingual Track Switcher
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Subtitle & Multilingual Track Switcher ---');
    // Click on Hindi (HI) subtitle button via DOM click
    await page.waitForSelector('#lang-btn-hi', { timeout: 5000 });
    await page.$eval('#lang-btn-hi', (el) => el.click());
    await sleep(800); // 800ms settling delay

    const hindiSubText = await page.$eval('#cinema-subtitle-text', (el) => el.textContent);
    console.log(`Hindi Subtitle Displayed: "${hindiSubText.trim()}"`);
    if (!hindiSubText.includes('कबीर') && !hindiSubText.includes('ख्वाब')) {
      throw new Error(`Expected Hindi subtitle, got "${hindiSubText}"`);
    }
    console.log('✅ Hindi subtitle switching verified.');

    const shot2 = path.join(SCREENSHOT_DIR, '02_cinema_multilingual_subtitles.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot2}`);

    // -------------------------------------------------------------
    // TEST 3: Tab Switch to "Autonomous Movie Studio (Create)"
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Tab Switch to Autonomous Movie Studio (Create) ---');
    await page.waitForSelector('#tab-produce', { timeout: 5000 });
    await page.$eval('#tab-produce', (el) => el.click());
    await sleep(800); // 800ms settling delay

    const produceText = await page.content();
    if (!produceText.includes('Autonomous Screenplay-to-Feature Engine') || !produceText.includes('12–18 Mins')) {
      throw new Error('Creation Studio components not rendered after tab switch');
    }
    console.log('✅ Production Console tab & Sweet Spot duration verified.');

    const shot3 = path.join(SCREENSHOT_DIR, '03_cinema_produce_studio_desktop.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot3}`);

    // -------------------------------------------------------------
    // TEST 4: Launch Autonomous Production & Verify Telemetry
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Launch Autonomous Production & Verify Telemetry ---');
    await page.waitForSelector('#launch-production-btn', { timeout: 5000 });
    await page.$eval('#launch-production-btn', (el) => el.click());
    await sleep(1500); // Wait for dispatch and pipeline progress

    const telemetryText = await page.content();
    if (!telemetryText.includes('Autonomous Production Mission Control') || !telemetryText.includes('ArcFace Mean Match')) {
      throw new Error('Telemetry Mission Control not rendered or gauges missing');
    }
    console.log('✅ Live Mission Control & 4-Tier QA Telemetry verified.');

    const shot4 = path.join(SCREENSHOT_DIR, '04_cinema_mission_control_telemetry.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot4}`);

    // -------------------------------------------------------------
    // TEST 5: C2PA Cryptographic Certificate Modal
    // -------------------------------------------------------------
    console.log('\n--- Test 5: C2PA Cryptographic Certificate Modal ---');
    await page.waitForSelector('#tab-originals', { timeout: 5000 });
    await page.$eval('#tab-originals', (el) => el.click());
    await sleep(1000); // 1000ms settling delay

    await page.waitForSelector('#inspect-c2pa-btn', { timeout: 5000 });
    await page.$eval('#inspect-c2pa-btn', (el) => el.click());
    await sleep(800); // 800ms settling delay

    const modalContent = await page.content();
    if (!modalContent.includes('C2PA Cryptographic Provenance Certificate') || !modalContent.includes('Ed25519')) {
      throw new Error('C2PA Provenance Modal failed to render');
    }
    console.log('✅ C2PA Cryptographic Provenance modal verified.');

    const shot5 = path.join(SCREENSHOT_DIR, '05_cinema_c2pa_certificate_modal.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot5}`);

    // Close modal
    await page.waitForSelector('#close-c2pa-btn', { timeout: 5000 });
    await page.$eval('#close-c2pa-btn', (el) => el.click());
    await sleep(500);

    // -------------------------------------------------------------
    // TEST 6: Mobile iOS Viewport (iPhone 14 @ 390x844)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Mobile iOS Viewport (iPhone 14 @ 390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);

    const iosScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const iosInnerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`iOS Viewport Audit: scrollWidth=${iosScrollWidth}, innerWidth=${iosInnerWidth}`);
    if (iosScrollWidth > iosInnerWidth) {
      throw new Error(`iOS Horizontal Overflow Detected: scrollWidth (${iosScrollWidth}) > innerWidth (${iosInnerWidth})`);
    }
    console.log('✅ iOS Viewport zero-horizontal-overflow confirmed.');

    const shot6 = path.join(SCREENSHOT_DIR, '06_cinema_ios_mobile_390px.png');
    await page.screenshot({ path: shot6, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot6}`);

    // -------------------------------------------------------------
    // TEST 7: Mobile Android Viewport (Pixel 7 @ 412x915)
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Mobile Android Viewport (Pixel 7 @ 412x915) ---');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);

    const androidScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const androidInnerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Android Viewport Audit: scrollWidth=${androidScrollWidth}, innerWidth=${androidInnerWidth}`);
    if (androidScrollWidth > androidInnerWidth) {
      throw new Error(`Android Horizontal Overflow Detected: scrollWidth (${androidScrollWidth}) > innerWidth (${androidInnerWidth})`);
    }
    console.log('✅ Android Viewport zero-horizontal-overflow confirmed.');

    const shot7 = path.join(SCREENSHOT_DIR, '07_cinema_android_mobile_412px.png');
    await page.screenshot({ path: shot7, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot7}`);

    // -------------------------------------------------------------
    // TEST 8: Sidebar Integration Check
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Sidebar Integration Check ---');
    await page.setViewport({ width: 1600, height: 1000 });
    await page.goto(`${BASE_URL}/studio`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    const cinemaLink = await page.$('a[href="/studio/cinema"]');
    if (!cinemaLink) {
      throw new Error('Sidebar missing link to /studio/cinema');
    }
    await cinemaLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await sleep(800);

    const currentUrl = page.url();
    if (!currentUrl.includes('/studio/cinema')) {
      throw new Error(`Expected navigation to /studio/cinema, got ${currentUrl}`);
    }
    console.log('✅ Sidebar link directly navigates to /studio/cinema.');

    const shot8 = path.join(SCREENSHOT_DIR, '08_sidebar_cinema_link_verified.png');
    await page.screenshot({ path: shot8, fullPage: false });
    console.log(`📸 Screenshot saved: file://${shot8}`);

    console.log('\n🎉 ALL 8 TESTS PASSED WITH 100% SUCCESS!');

  } catch (err) {
    console.error('❌ E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
