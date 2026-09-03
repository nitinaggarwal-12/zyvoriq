import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_content_edit_studio');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureContentEditStudioScreenshots() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log(`🚀 Launching Signed macOS Google Chrome for Content Edit Studio Screenshots...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Viewport (1440x900)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // Cookie consent pre-seed
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('zyvoriq_cookie_consent', JSON.stringify({ analytics: true, marketing: true, timestamp: Date.now() }));
    });

    // Capture 01: /studio (Master Timeline & Video Reel Editor)
    console.log(`📡 Capturing /studio (Multi-Track Timeline Editor)...`);
    await page.goto('http://localhost:3000/studio', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_content_edit_studio_timeline_desktop.png'), fullPage: false });
    console.log(`📸 Captured: 01_content_edit_studio_timeline_desktop.png`);

    // Capture 02: /studio/inspector (Frame-by-Frame Scrubber & Scene Prompt Inspector)
    console.log(`📡 Capturing /studio/inspector (Frame-by-Frame Scrubber)...`);
    await page.goto('http://localhost:3000/studio/inspector', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_content_inspector_frame_scrubber_desktop.png'), fullPage: false });
    console.log(`📸 Captured: 02_content_inspector_frame_scrubber_desktop.png`);

    // Capture 03: /studio/books (Original Book & Narrative Script Editor)
    console.log(`📡 Capturing /studio/books (Book Studio Editor)...`);
    await page.goto('http://localhost:3000/studio/books', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_book_narrative_editor_desktop.png'), fullPage: false });
    console.log(`📸 Captured: 03_book_narrative_editor_desktop.png`);

    // 2. Mobile iPhone 14 Viewport (390x844)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    // Capture 04: /studio on iPhone 14
    console.log(`📱 Capturing /studio on iPhone 14...`);
    await page.goto('http://localhost:3000/studio', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_content_edit_studio_iphone14.png'), fullPage: false });
    console.log(`📸 Captured: 04_content_edit_studio_iphone14.png`);

    // Capture 05: /studio/inspector on iPhone 14
    console.log(`📱 Capturing /studio/inspector on iPhone 14...`);
    await page.goto('http://localhost:3000/studio/inspector', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_content_inspector_iphone14.png'), fullPage: false });
    console.log(`📸 Captured: 05_content_inspector_iphone14.png`);

    console.log(`🎉 All Content Edit Studio Screenshots Captured Successfully!`);
  } finally {
    await browser.close();
  }
}

captureContentEditStudioScreenshots().catch(err => {
  console.error('❌ Screenshot capture failed:', err);
  process.exit(1);
});
