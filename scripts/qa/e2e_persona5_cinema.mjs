import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPersona5E2E() {
  const screenshotDir = path.join(process.cwd(), 'scratch/screenshots_persona5_cinema');
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log('🚀 Launching Chrome for Persona #5 Cinema E2E Test...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();

  // Pre-seed cookie consent so banner doesn't obscure UI
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('zyvoriq_cookie_consent', 'accepted');
  });

  // 1. Desktop Viewport (1600x1000)
  console.log('📡 Testing Persona #5 on Desktop (1600x1000)...');
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto('http://localhost:3000/studio/create/podcast', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(screenshotDir, '01_persona5_cinema_desktop.png'), fullPage: false });
  console.log('📸 Captured: 01_persona5_cinema_desktop.png');

  // 2. Mobile iPhone 14 Viewport (390x844)
  console.log('📱 Testing Persona #5 on iPhone 14 (390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/studio/create/podcast', { waitUntil: 'networkidle2' });
  await sleep(1000);
  const mobileOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log('Mobile Overflow Status:', mobileOverflow);
  await page.screenshot({ path: path.join(screenshotDir, '02_persona5_cinema_iphone14.png'), fullPage: false });
  console.log('📸 Captured: 02_persona5_cinema_iphone14.png');

  await browser.close();
  console.log('🎉 Persona #5 E2E Verification Complete!');
}

runPersona5E2E().catch(console.error);
