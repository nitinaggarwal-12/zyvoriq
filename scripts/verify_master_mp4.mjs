import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });

    const videoStats = await page.evaluate(async () => {
      const v = document.createElement('video');
      v.src = 'http://127.0.0.1:3000/assets/video/hindi_wedding/hindi_wedding_music_video_32s_master.mp4';
      v.crossOrigin = 'anonymous';
      v.muted = true;
      v.playsInline = true;
      document.body.appendChild(v);

      await new Promise((res, rej) => {
        v.onloadedmetadata = () => res();
        v.onerror = (e) => rej(new Error('Failed to load video'));
        v.load();
      });

      // Seek to 12s (Act 2 Baraat / Dhol scene)
      v.currentTime = 12.0;
      await new Promise((res) => {
        v.onseeked = () => res();
      });

      return {
        duration: v.duration,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
        currentTime: v.currentTime
      };
    });

    console.log('Video stats verified:', JSON.stringify(videoStats, null, 2));

    const screenshotPath = path.resolve(process.cwd(), 'scratch/screenshots_verified_hindi_wedding/03_master_mp4_playback_frame.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Saved frame screenshot:', screenshotPath);
  } catch (err) {
    console.error('Master MP4 verification error:', err);
  } finally {
    await browser.close();
  }
}

main();
