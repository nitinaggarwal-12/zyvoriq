import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  // 1. Identity & Age Verification Vault
  console.log('Navigating to /governance/verify...');
  await page.goto('http://localhost:3001/governance/verify', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss cookie banner if present
  await page.evaluate(() => {
    const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const verifyIdlePath = path.join(SCREENSHOT_DIR, '24_live_identity_verification_vault.png');
  await page.screenshot({ path: verifyIdlePath, fullPage: false });
  console.log(`Saved screenshot: ${verifyIdlePath}`);

  // Trigger verification
  console.log('Executing live verification challenge...');
  await page.evaluate(() => {
    const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Start Live ID'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 5500));

  const verifyCompletePath = path.join(SCREENSHOT_DIR, '25_live_identity_verified_attestation.png');
  await page.screenshot({ path: verifyCompletePath, fullPage: false });
  console.log(`Saved screenshot: ${verifyCompletePath}`);

  // 2. PostgreSQL Market Forecasting Page
  console.log('Navigating to /analytics/forecasting...');
  await page.goto('http://localhost:3001/analytics/forecasting', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  const forecastPath = path.join(SCREENSHOT_DIR, '26_live_postgresql_market_forecasting.png');
  await page.screenshot({ path: forecastPath, fullPage: false });
  console.log(`Saved screenshot: ${forecastPath}`);

  // 3. Studio with Live Screen Share & Voice Copilot
  console.log('Navigating to /studio for Screen Share Copilot...');
  await page.goto('http://localhost:3001/studio', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Open concierge
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Toggle live AI support concierge"]') ||
                document.querySelector('aside button');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Open Screen Share Copilot Drawer
  await page.evaluate(() => {
    const copilotBtn = document.querySelector('button[title="Live Screen Share & Voice Copilot"]');
    if (copilotBtn) copilotBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Connect screen share
  await page.evaluate(() => {
    const connectBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Connect Screen Share'));
    if (connectBtn) connectBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const copilotPath = path.join(SCREENSHOT_DIR, '27_live_screen_share_voice_copilot.png');
  await page.screenshot({ path: copilotPath, fullPage: false });
  console.log(`Saved screenshot: ${copilotPath}`);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
