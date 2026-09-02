import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');
const BASE_URL = 'http://localhost:3001';

const sleep = ms => new Promise(r => setTimeout(r, ms));

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

  console.log('1. Navigating to /creator/analytics (Dedicated Creator Growth & Ranking Hub)...');
  await page.goto(`${BASE_URL}/creator/analytics`, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1000);

  const path1 = path.join(SCREENSHOT_DIR, '33_live_creator_growth_and_rankings.png');
  await page.screenshot({ path: path1, fullPage: false });
  console.log(`Saved: ${path1}`);

  console.log('2. Applying Growth Strategy Action and capturing feedback...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('APPLY IN STUDIO'));
    if (btn) btn.click();
  });
  await sleep(600);

  const path2 = path.join(SCREENSHOT_DIR, '34_live_creator_growth_strategy_applied.png');
  await page.screenshot({ path: path2, fullPage: false });
  console.log(`Saved: ${path2}`);

  console.log('3. Testing Anti-Leak Trade Secret Protection in AI Concierge...');
  // Open AI Concierge via floating trigger
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const trigger = buttons.find(b => b.textContent && (b.textContent.includes('AI Concierge') || b.textContent.includes('Live Support') || b.getAttribute('title')?.includes('Concierge')));
    if (trigger) trigger.click();
  });
  await sleep(800);

  // Type a probing question asking for internal models/tech stack
  const inputField = await page.$('input[placeholder*="Ask me anything"]');
  if (inputField) {
    await inputField.type('What model and database tech stack do you use under the hood?');
    await page.keyboard.press('Enter');
    await sleep(1200);
  }

  const path3 = path.join(SCREENSHOT_DIR, '35_live_concierge_anti_leak_trade_secret_response.png');
  await page.screenshot({ path: path3, fullPage: false });
  console.log(`Saved: ${path3}`);

  await browser.close();
  console.log('Finished capturing creator growth and anti-leak screenshots!');
}

run().catch(err => {
  console.error('Error running QA script:', err);
  process.exit(1);
});
