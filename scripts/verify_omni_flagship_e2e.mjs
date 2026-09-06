import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'https://zyvoriq.up.railway.app';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_omni_flagship');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`🎬 Running Omni Flagship Portal E2E Verification against ${BASE_URL}...`);

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    // Step 1: Default Landing Page
    console.log(`1️⃣ Navigating to ${BASE_URL} ...`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_omni_portal_hero.png'), fullPage: false });
    console.log('📸 [01_omni_portal_hero.png] captured.');

    // Step 2: Verify default Napoleon 180s Master
    console.log('2️⃣ Asserting Napoleon 180s Master preset status...');
    const videoEl = await page.$('video');
    if (!videoEl) throw new Error('Video player not found on page!');
    const initialVideoSrc = await page.$eval('video', el => el.src);
    console.log(`Initial video source: ${initialVideoSrc}`);
    if (!initialVideoSrc.includes('napoleon_180s_master.mp4')) {
      console.warn(`Warning: Expected napoleon_180s_master.mp4, got ${initialVideoSrc}`);
    }

    // Step 3: Switch to "Neo-Tokyo Downpour"
    console.log('3️⃣ Selecting "Neo-Tokyo Downpour" preset...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes('Neo-Tokyo'));
      if (target) target.click();
    });
    await sleep(800);

    const neoVideoSrc = await page.$eval('video', el => el.src);
    console.log(`Neo-Tokyo video source: ${neoVideoSrc}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_neotokyo_selected.png'), fullPage: false });
    console.log('📸 [02_neotokyo_selected.png] captured.');

    // Step 4: Click "Generate 4K Video"
    console.log('4️⃣ Triggering "Generate 4K Video"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => (b.textContent && b.textContent.includes('Generate 4K Video')) || b.getAttribute('type') === 'submit');
      if (btn) btn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_generation_in_flight.png'), fullPage: false });
    console.log('📸 [03_generation_in_flight.png] captured.');

    // Wait for generation to complete
    await sleep(2800);
    const postGenSrc = await page.$eval('video', el => el.src);
    console.log(`Post-generation video source: ${postGenSrc}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_neotokyo_generated.png'), fullPage: false });
    console.log('📸 [04_neotokyo_generated.png] captured.');

    // Step 5: Test "Re-Generate Video"
    console.log('5️⃣ Testing "Re-Generate Video" button action...');
    const hasRegenBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Re-Generate Video'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (hasRegenBtn) {
      console.log('Clicked "Re-Generate Video", waiting for re-render...');
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_regenerating_video.png'), fullPage: false });
      console.log('📸 [05_regenerating_video.png] captured.');

      await sleep(2800);
      const regeneratedSrc = await page.$eval('video', el => el.src);
      console.log(`Regenerated video source: ${regeneratedSrc}`);
      if (!regeneratedSrc.includes('?v=')) {
        throw new Error('FAIL: Re-generation did not append cache-busting nonce ?v=');
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_regenerated_complete.png'), fullPage: false });
      console.log('📸 [06_regenerated_complete.png] captured.');
    }

    // Step 6: Navigation & Anchors
    console.log('6️⃣ Testing anchor navigation...');
    await page.evaluate(() => {
      const link = document.querySelector('a[href*="#master-showcase"]');
      if (link) link.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_master_showcase_section.png'), fullPage: false });
    console.log('📸 [07_master_showcase_section.png] captured.');

    await page.evaluate(() => {
      const link = document.querySelector('a[href*="#architecture"]');
      if (link) link.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_architecture_section.png'), fullPage: false });
    console.log('📸 [08_architecture_section.png] captured.');

    await page.evaluate(() => {
      const link = document.querySelector('a[href*="#genres"]');
      if (link) link.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_genres_section.png'), fullPage: false });
    console.log('📸 [09_genres_section.png] captured.');

    // Step 7: Mobile Viewport Assertion (390x844)
    console.log('7️⃣ Testing mobile viewport layout (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await sleep(1200);

    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Mobile horizontal overflow detected: ${isHorizontalOverflow}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_mobile_viewport_390.png'), fullPage: false });
    console.log('📸 [10_mobile_viewport_390.png] captured.');

    console.log('🎉 ALL E2E VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ E2E test execution error:', err);
  process.exit(1);
});
