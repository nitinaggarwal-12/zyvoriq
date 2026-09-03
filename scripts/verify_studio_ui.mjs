import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_live_macos');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting next server on port 3000...');
  const server = spawn('npx', ['next', 'start', '-p', '3000'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    detached: false
  });

  try {
    let connected = false;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://localhost:3000/studio');
        if (res.status === 200) {
          connected = true;
          break;
        }
      } catch (e) {}
      await wait(1000);
    }

    if (!connected) {
      throw new Error('Server failed to start on port 3000');
    }

    console.log('Server online. Launching signed Google Chrome...');
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1000']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

    console.log('Navigating to http://localhost:3000/studio ...');
    await page.goto('http://localhost:3000/studio', { waitUntil: 'networkidle2' });
    await wait(1500);

    const studioShotPath = path.join(SCREENSHOT_DIR, '01_studio_redesign.png');
    await page.screenshot({ path: studioShotPath, fullPage: false });
    console.log('Saved studio screenshot to:', studioShotPath);

    // Open Prompt Director Modal
    console.log('Clicking Prompt Director button...');
    const promptButtons = await page.$$('button');
    for (const btn of promptButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Prompt Director')) {
        await btn.click();
        break;
      }
    }
    await wait(1000);

    const promptModalShotPath = path.join(SCREENSHOT_DIR, '03_prompt_director_modal.png');
    await page.screenshot({ path: promptModalShotPath, fullPage: false });
    console.log('Saved Prompt Director modal screenshot to:', promptModalShotPath);

    await browser.close();
    console.log('Verification completed successfully!');
  } finally {
    server.kill();
  }
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
