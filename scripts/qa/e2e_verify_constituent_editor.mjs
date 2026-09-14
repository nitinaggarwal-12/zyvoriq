import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_constituent_editor');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('🎬 Running E2E Verification for Constituent Shots NLE Editor...');

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    const targetUrl = 'http://localhost:3000/music-video?reel=yt_a8d79bfc-20a4-4bc6-85f9-495b858c5603';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Scroll to Stage 5
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h4')).find((el) =>
        el.textContent?.includes('Individual Veo / Omni Generated Shots')
      );
      if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(800);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01_stage_5_with_action_buttons.png'),
      fullPage: false,
    });
    console.log('📸 Saved 01_stage_5_with_action_buttons.png');

    // Click "Edit & Combine" button
    console.log('Clicking "Edit & Combine" button...');
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Edit & Combine')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      throw new Error('Could not find "Edit & Combine" button in Stage 5');
    }

    await sleep(1500);

    // Scroll to NLE Editor container
    await page.evaluate(() => {
      const editor = document.getElementById('nle-timeline-editor');
      if (editor) editor.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(800);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02_nle_timeline_editor_loaded.png'),
      fullPage: false,
    });
    console.log('📸 Saved 02_nle_timeline_editor_loaded.png');

    console.log('✅ Verification script completed successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Error during E2E verification:', err);
  process.exit(1);
});
