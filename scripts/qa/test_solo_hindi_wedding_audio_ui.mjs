import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_solo_hindi_qa');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log("🧪 Auditing Solo Hindi Wedding Audio Player in Google Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });
    await page.goto('http://localhost:3000/studio/create/music', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);

    const shot1 = path.join(SCREENSHOT_DIR, '01_desktop_solo_audio_overlay.png');
    await page.screenshot({ path: shot1 });
    console.log("📸 Saved Overlay Screenshot:", shot1);

    // Click to start audio experience
    await page.evaluate(() => {
      const overlay = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('Click to Play with Solo Lead Hindi Singing'));
      if (overlay) overlay.click();
    });

    await sleep(1200);

    const shot2 = path.join(SCREENSHOT_DIR, '02_desktop_solo_audio_playing.png');
    await page.screenshot({ path: shot2 });
    console.log("📸 Saved Playing Screenshot:", shot2);

    const audioState = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      return {
        src: aud?.src,
        paused: aud?.paused,
        volume: aud?.volume,
        duration: aud?.duration
      };
    });

    console.log("🔊 Live Audio State:", audioState);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
