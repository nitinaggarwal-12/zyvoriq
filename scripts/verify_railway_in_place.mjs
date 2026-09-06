import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_landing_inline_generation');

async function run() {
  console.log('🚀 Verifying LIVE Railway deployment in-place video generation...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    console.log('Navigating to https://zyvoriq.up.railway.app ...');
    await page.goto('https://zyvoriq.up.railway.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Assert initial URL
    const initialUrl = page.url();
    console.log(`Live Initial URL: ${initialUrl}`);
    if (initialUrl.includes('/studio')) {
      throw new Error(`FAIL: Initial URL is studio: ${initialUrl}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_railway_live_default.png'), fullPage: false });
    console.log('📸 Captured 05_railway_live_default.png');

    // Click "Generate 4K Video"
    const generateBtnSelector = 'button[type="submit"]';
    await page.waitForSelector(generateBtnSelector, { visible: true });
    console.log('Clicking "Generate 4K Video" on Railway live...');
    await page.$eval(generateBtnSelector, el => el.click());

    await new Promise(r => setTimeout(r, 800));
    const urlDuringGen = page.url();
    console.log(`URL during generation: ${urlDuringGen}`);
    if (urlDuringGen.includes('/studio')) {
      throw new Error(`FAIL: Page redirected to ${urlDuringGen}!`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_railway_live_generating.png'), fullPage: false });
    console.log('📸 Captured 06_railway_live_generating.png');

    // Wait for synthesis to complete
    console.log('Waiting for generation synthesis...');
    await new Promise(r => setTimeout(r, 2800));

    const finalUrl = page.url();
    console.log(`Live Final URL: ${finalUrl}`);
    if (finalUrl.includes('/studio')) {
      throw new Error(`FAIL: Redirected to ${finalUrl}`);
    }

    // Assert in-line video player is rendered
    await page.waitForSelector('video', { timeout: 5000 });
    const videoSrc = await page.$eval('video', el => el.src);
    console.log(`✅ Live In-Line Video Player rendered with source: ${videoSrc}`);

    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_railway_live_video_playing.png'), fullPage: false });
    console.log('📸 Captured 07_railway_live_video_playing.png');

    console.log('🎉 LIVE RAILWAY VERIFICATION 100% SUCCESSFUL: Zero redirects!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Live Railway verification failed:', err);
  process.exit(1);
});
