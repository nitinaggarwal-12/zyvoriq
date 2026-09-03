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

  console.log('🚀 Launching Google Chrome to test Online Pre-Demo NDA Signing & Admin Dispatch Hub...');

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

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  // 1. Visit Admin NDA Hub
  console.log('1. Navigating to http://localhost:3001/admin/agreements...');
  await page.goto('http://localhost:3001/admin/agreements', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1000);

  // Dismiss cookie banner
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(500);

  console.log('📸 Capturing 45_live_admin_agreements_hub.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '45_live_admin_agreements_hub.png'), fullPage: false });

  // 2. Open Dispatch Modal
  console.log('2. Opening Dispatch New NDA Link modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const dispatchBtn = buttons.find(b => b.textContent?.includes('Dispatch New NDA Link'));
    if (dispatchBtn) dispatchBtn.click();
  });
  await sleep(800);

  console.log('📸 Capturing 46_live_admin_dispatch_nda_modal.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '46_live_admin_dispatch_nda_modal.png'), fullPage: false });

  // 3. Navigate to Customer Signing Page
  console.log('3. Navigating to http://localhost:3001/nda/sign?token=demo_sarah_lin_99&name=Dr.+Sarah+Lin&company=Quantum+Media+Holdings...');
  await page.goto('http://localhost:3001/nda/sign?token=demo_sarah_lin_99&name=Dr.+Sarah+Lin&company=Quantum+Media+Holdings', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1200);

  console.log('📸 Capturing 47_live_customer_nda_signing_page.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '47_live_customer_nda_signing_page.png'), fullPage: false });

  // 4. Complete Customer Signing
  console.log('4. Completing Customer Digital Signature & Legal Consents...');
  
  // Type email
  await page.type('input[type="email"]', 'sarah.lin@quantummedia.io');
  await sleep(300);

  // Click Type Legal Signature tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const typeSigBtn = buttons.find(b => b.textContent?.includes('Type Legal Signature'));
    if (typeSigBtn) typeSigBtn.click();
  });
  await sleep(500);

  // Check all checkboxes
  await page.evaluate(() => {
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    checkboxes.forEach(c => {
      c.click();
    });
  });
  await sleep(500);

  // Submit Signature Form
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await sleep(2000);

  const isSigned = await page.evaluate(() => {
    return document.body.innerText.includes('MUTUAL NDA EXECUTED & VERIFIED') && document.body.innerText.includes('SHA-256 AUDIT DIGEST');
  });
  console.log(`[Customer Signing Verification] Signed & Verified: ${isSigned ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 48_live_customer_nda_signed_attestation.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '48_live_customer_nda_signed_attestation.png'), fullPage: false });

  // 5. Verify Admin Hub shows updated signed agreement
  console.log('5. Returning to Admin Hub to verify real-time signed record and notification...');
  await page.goto('http://localhost:3001/admin/agreements', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  const isAdminUpdated = await page.evaluate(() => {
    return document.body.innerText.includes('Dr. Sarah Lin') && document.body.innerText.includes('Quantum Media Holdings');
  });
  console.log(`[Admin Real-Time Verification] Agreement Appears in Admin Table: ${isAdminUpdated ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 49_live_admin_agreements_signed_verified.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '49_live_admin_agreements_signed_verified.png'), fullPage: false });

  await browser.close();

  if (!isSigned || !isAdminUpdated) {
    console.error('❌ NDA E2E Test Suite failed assertions.');
    process.exit(1);
  }

  console.log('🎉 Online NDA Signing & Admin Dispatch E2E Verification completely PASSED with 0 errors!');
}

run().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
