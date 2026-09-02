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

  console.log('Navigating to Studio Avatars Page...');
  await page.goto('http://localhost:3001/studio/avatars', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss cookie banner if present
  await page.evaluate(() => {
    const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const customizerViewPath = path.join(SCREENSHOT_DIR, '28_live_avatar_profile_customizer.png');
  await page.screenshot({ path: customizerViewPath, fullPage: false });
  console.log(`Saved screenshot: ${customizerViewPath}`);

  // Select Priya Sharma
  console.log('Selecting Priya Sharma persona...');
  await page.evaluate(() => {
    const priyaCard = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('Priya Sharma') && d.textContent?.includes('Chief AI Officer'));
    if (priyaCard) priyaCard.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Select Executive Blazer
  console.log('Selecting Executive Blazer attire...');
  await page.evaluate(() => {
    const blazer = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('Navy Executive Blazer'));
    if (blazer) blazer.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Save to Profile
  console.log('Saving avatar to profile...');
  await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Save Preferred Avatar'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const savedToastPath = path.join(SCREENSHOT_DIR, '29_live_avatar_saved_toast.png');
  await page.screenshot({ path: savedToastPath, fullPage: false });
  console.log(`Saved screenshot: ${savedToastPath}`);

  // Open the concierge to verify the updated avatar is now active in chat & header
  console.log('Opening concierge to verify new avatar persona...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Toggle live AI support concierge"]') ||
                document.querySelector('aside button');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const conciergeUpdatedPath = path.join(SCREENSHOT_DIR, '30_live_concierge_with_custom_avatar.png');
  await page.screenshot({ path: conciergeUpdatedPath, fullPage: false });
  console.log(`Saved screenshot: ${conciergeUpdatedPath}`);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
