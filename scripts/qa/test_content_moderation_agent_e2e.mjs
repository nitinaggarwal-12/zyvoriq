import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('🚀 Launching Google Chrome to test Content Moderator Agent & Admin Governance Hub...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1440,900',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit Content Moderation Hub
  console.log('1. Navigating to http://localhost:3001/admin/moderation...');
  await page.goto('http://localhost:3001/admin/moderation', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  // Dismiss cookie banner
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(800);

  const isHubLoaded = await page.evaluate(() => {
    return document.body.innerText.includes('Content Moderator Agent') && document.body.innerText.includes('TOTAL EVALUATED ITEMS');
  });
  console.log(`[Hub Loaded Verification]: ${isHubLoaded ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 50_live_content_moderation_hub.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '50_live_content_moderation_hub.png'), fullPage: false });

  // 2. Open Forensic Report Modal on Pending Item
  console.log('2. Opening Forensic Report Modal on Pending Item...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const reviewBtn = buttons.find(b => b.textContent?.includes('Review Forensic Report'));
    if (reviewBtn) {
      reviewBtn.click();
      return true;
    }
    return false;
  });
  console.log(`Clicked Review Forensic Report button: ${clicked}`);
  await sleep(1500);

  const isModalOpen = await page.evaluate(() => {
    const hasReportTitle = document.body.innerText.includes('FORENSIC COMPLIANCE REPORT') || document.body.innerText.includes('Forensic Activity Trail');
    const hasDecision = document.body.innerText.includes('Admin Governance Decision');
    return hasReportTitle && hasDecision;
  });
  console.log(`[Forensic Modal Verification]: ${isModalOpen ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 51_live_moderation_forensic_report_modal.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '51_live_moderation_forensic_report_modal.png'), fullPage: false });

  // 3. Apply Admin Decision (Approve with Warning)
  console.log('3. Applying Admin Decision: "Approve with Warning"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const warningBtn = buttons.find(b => b.textContent?.includes('Approve with Warning'));
    if (warningBtn) warningBtn.click();
  });
  await sleep(2000);

  const isDecisionSaved = await page.evaluate(() => {
    return document.body.innerText.includes('Decision successfully applied') || document.body.innerText.includes('WARNING ATTACHED');
  });
  console.log(`[Admin Decision Applied Verification]: ${isDecisionSaved ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 52_live_admin_decision_applied.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '52_live_admin_decision_applied.png'), fullPage: false });

  await browser.close();

  if (!isHubLoaded || !isModalOpen || !isDecisionSaved) {
    console.error('❌ Content Moderation E2E Test failed assertions.');
    process.exit(1);
  }

  console.log('🎉 Content Moderator Agent & Admin Governance E2E Verification completely PASSED with 0 errors!');
}

run().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
