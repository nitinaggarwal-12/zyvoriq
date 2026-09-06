import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots');

async function run() {
  console.log('🚀 Running Cloudtop E2E Verification on nitinagga.c.googlers.com...');

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    const targetUrl = 'https://zyvoriq.up.railway.app';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    console.log(`Current page URL: ${page.url()}`);
    if (page.url().includes('/studio')) {
      throw new Error(`FAIL: Landed on studio unexpectedly: ${page.url()}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_cloudtop_hero_default.png'), fullPage: false });
    console.log('📸 Captured 01_cloudtop_hero_default.png');

    // Click "Generate 4K Video"
    const generateBtnSelector = 'button[type="submit"]';
    await page.waitForSelector(generateBtnSelector, { visible: true });
    console.log('Clicking "Generate 4K Video"...');
    await page.$eval(generateBtnSelector, el => el.click());

    await new Promise(r => setTimeout(r, 800));
    const urlDuringGen = page.url();
    console.log(`URL during generation: ${urlDuringGen}`);
    if (urlDuringGen.includes('/studio')) {
      throw new Error(`FAIL: Redirected to ${urlDuringGen}!`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_cloudtop_hero_generating.png'), fullPage: false });
    console.log('📸 Captured 02_cloudtop_hero_generating.png');

    // Wait for synthesis to complete
    console.log('Waiting for in-place generation synthesis...');
    await new Promise(r => setTimeout(r, 2800));

    const finalUrl = page.url();
    console.log(`Final page URL: ${finalUrl}`);
    if (finalUrl.includes('/studio')) {
      throw new Error(`FAIL: Final URL redirected to ${finalUrl}`);
    }

    // Verify video player
    await page.waitForSelector('video', { timeout: 5000 });
    const videoSrc = await page.$eval('video', el => el.src);
    console.log(`✅ Cloudtop verified video source: ${videoSrc}`);

    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_cloudtop_hero_video_playing.png'), fullPage: false });
    console.log('📸 Captured 03_cloudtop_hero_video_playing.png');

    console.log('🎉 CLOUDTOP E2E TEST COMPLETED WITH 100% SUCCESS: 0 REDIRECTS!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Cloudtop E2E failed:', err);
  process.exit(1);
});
