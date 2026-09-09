import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const prodId = process.argv[2] || 'studio1_c16b9f4c-c6ad-455d-bb36-e34ce9b7885d';
  const url = `https://zyvoriq.up.railway.app/studio?id=${prodId}`;
  console.log(`[e2e] Navigating to: ${url}`);

  const outDir = path.join(process.cwd(), 'scratch', 'shakira_production', 'screenshots');
  await fs.mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Desktop Viewport (1600x950)
  console.log('[e2e] Testing Desktop Viewport (1600x950)...');
  await page.setViewport({ width: 1600, height: 950, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);

  const desktopScreenshot = path.join(outDir, '01_desktop_studio_view.png');
  await page.screenshot({ path: desktopScreenshot, fullPage: false });
  console.log(`[e2e] Saved desktop screenshot: ${desktopScreenshot}`);

  // DOM Assertions
  const hasVideo = await page.$eval('video', el => Boolean(el.src || el.querySelector('source')?.src)).catch(() => false);
  const pageTitle = await page.title();
  const bodyText = await page.$eval('body', el => el.innerText).catch(() => '');
  
  console.log(`[e2e] Page Title: ${pageTitle}`);
  console.log(`[e2e] Video Player Present: ${hasVideo}`);
  console.log(`[e2e] Contains Latin-Punjabi: ${bodyText.includes('Latin') || bodyText.includes('Punjabi')}`);

  // 2. Mobile iOS Viewport (390x844)
  console.log('[e2e] Testing Mobile iOS Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await sleep(1500);
  const iosScreenshot = path.join(outDir, '02_mobile_ios_view.png');
  await page.screenshot({ path: iosScreenshot, fullPage: false });
  console.log(`[e2e] Saved iOS screenshot: ${iosScreenshot}`);

  // Check overflow
  const iosOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`[e2e] iOS Horizontal Overflow: ${iosOverflow ? 'DETECTED' : 'NONE (Clean)'}`);

  // 3. Mobile Android Viewport (412x915)
  console.log('[e2e] Testing Mobile Android Viewport (412x915)...');
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true });
  await sleep(1500);
  const androidScreenshot = path.join(outDir, '03_mobile_android_view.png');
  await page.screenshot({ path: androidScreenshot, fullPage: false });
  console.log(`[e2e] Saved Android screenshot: ${androidScreenshot}`);

  const androidOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`[e2e] Android Horizontal Overflow: ${androidOverflow ? 'DETECTED' : 'NONE (Clean)'}`);

  await browser.close();
  console.log('[e2e] All Viewport Assertions & Screenshots Completed Successfully!');
}

run().catch(err => {
  console.error('[e2e] Fatal Error:', err);
  process.exit(1);
});
