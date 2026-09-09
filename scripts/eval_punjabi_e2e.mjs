import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function main() {
  const prodId = process.argv[2] || 'studio1_2c955cf6-914a-4e71-b70d-60185cc7e8b4';
  const targetUrl = `https://zyvoriq.up.railway.app/studio?id=${prodId}`;
  const outDir = path.resolve('scratch/eval_punjabi_girls');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`[puppeteer] Launching browser to audit: ${targetUrl}`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

    console.log(`[puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Mandatory settling delay
    await new Promise(r => setTimeout(r, 2000));

    // Capture desktop studio screenshot
    const shotPath = path.join(outDir, '01_studio_punjabi_pop_master.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`[puppeteer] Captured studio screenshot: ${shotPath}`);

    // Check if video element is present
    const videoInfo = await page.evaluate(() => {
      const video = document.querySelector('video');
      const title = document.querySelector('h1, h2')?.innerText || '';
      return {
        hasVideo: !!video,
        src: video ? video.currentSrc || video.src : null,
        duration: video ? video.duration : null,
        title
      };
    });
    console.log('[puppeteer] Video Element QA:', JSON.stringify(videoInfo, null, 2));

    // Mobile Viewport (iPhone 14)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 1200));
    const mobileShotPath = path.join(outDir, '02_mobile_punjabi_pop_studio.png');
    await page.screenshot({ path: mobileShotPath, fullPage: false });
    console.log(`[puppeteer] Captured mobile screenshot: ${mobileShotPath}`);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('[puppeteer] Error:', err);
  process.exit(1);
});
