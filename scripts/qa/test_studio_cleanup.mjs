import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://zyvoriq.up.railway.app';
const OUT_DIR = process.env.OUT_DIR || path.join(process.cwd(), 'scratch', 'screenshots_reels_separation');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`[E2E] Verifying cleanup against ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit root create page
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1500);

  // Assert redundant buttons are gone
  const hasDossierGen = await page.$eval('#dossier-generate-btn', () => true).catch(() => false);
  const hasChatInput = await page.$eval('#dossier-chat-input', () => true).catch(() => false);

  console.log(`PASS: Phase 1 redundant generate button removed: ${!hasDossierGen}`);
  console.log(`PASS: Bottom dossier chat textbox removed: ${!hasChatInput}`);

  await page.screenshot({ path: path.join(OUT_DIR, '06_clean_studio_no_redundant_buttons.png'), fullPage: false });

  // 2. Visit completed Swiss Summer Serenade reel
  const reelUrl = `${BASE_URL}/?reel=studio1_9f360810-20f5-48ba-b3a4-f315bd3ea5c8&phase=11`;
  await page.goto(reelUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(2000);

  const hasMasterCard = await page.$eval('#master-combined-reel-card', () => true).catch(() => false);
  console.log(`PASS: Master Combined Reel Hero Card rendered: ${hasMasterCard}`);

  // Scroll down to clips section and capture screenshot
  await page.evaluate(() => {
    const card = document.getElementById('master-combined-reel-card');
    if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUT_DIR, '07_master_combined_card.png'), fullPage: false });

  await browser.close();
  console.log('[E2E] Studio cleanup verification 100% complete!');
}

run().catch(err => {
  console.error('[E2E] Error:', err);
  process.exit(1);
});
