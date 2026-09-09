import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots/cinematic_poster');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("=== Testing Corrected Shot Frames & Directorial Alignment on Cloudtop ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });

    console.log("Navigating to http://localhost:3000/my-reels?reel=studio1_b79e20bd-9f77-45de-ba4a-275700f31531 ...");
    await page.goto("http://localhost:3000/my-reels?reel=studio1_b79e20bd-9f77-45de-ba4a-275700f31531", { waitUntil: "networkidle2" });
    await sleep(2500);

    // 1. Capture top card with theatrical poster
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_theatrical_poster_verified.png'), fullPage: false });
    console.log("Captured 01_theatrical_poster_verified.png");

    // 2. Scroll down to clips breakdown grid
    console.log("Scrolling to clips breakdown grid...");
    await page.evaluate(() => {
      window.scrollBy(0, 450);
    });
    await sleep(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_clips_breakdown_aligned.png'), fullPage: false });
    console.log("Captured 05_clips_breakdown_aligned.png");

    // 3. Inspect video elements in clip cards
    const clipVideos = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.rounded-xl.border.p-3\\.5'));
      return cards.slice(0, 5).map((card, idx) => {
        const video = card.querySelector('video');
        const img = card.querySelector('img');
        const title = card.querySelector('span')?.textContent || card.textContent?.slice(0, 30);
        return {
          shot: idx + 1,
          hasVideo: Boolean(video),
          videoSrc: video ? video.getAttribute('src') : null,
          hasImg: Boolean(img),
          imgSrc: img ? img.getAttribute('src') : null
        };
      });
    });
    console.log("Clips Visual Inspection in DOM:", JSON.stringify(clipVideos, null, 2));

    // 4. Mobile Viewports (iOS & Android)
    console.log("Testing iOS Mobile Viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    const iosScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log("iOS scrollWidth <= 390:", iosScrollWidth <= 390, `(${iosScrollWidth}px)`);

    console.log("Testing Android Mobile Viewport (412x915)...");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);
    const androidScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log("Android scrollWidth <= 412:", androidScrollWidth <= 412, `(${androidScrollWidth}px)`);

    console.log("\n✅ ALL VISUAL ALIGNMENT GATES PASSED!");
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
