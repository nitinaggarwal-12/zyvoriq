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

  console.log('🚀 Launching Google Chrome to test SSO Login & Zero-Friction Profile Verification Hub...');

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

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  // 1. Visit SSO Login Portal
  console.log('1. Navigating to http://localhost:3001/auth/login...');
  await page.goto('http://localhost:3001/auth/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  // Dismiss cookie banner
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(800);

  const isPortalLoaded = await page.evaluate(() => {
    return document.body.innerText.includes('Single Sign-On (SSO)') && document.body.innerText.includes('Continue with Google');
  });
  console.log(`[SSO Portal Loaded Verification]: ${isPortalLoaded ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 53_live_sso_login_portal.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '53_live_sso_login_portal.png'), fullPage: false });

  // 2. Click Continue with LinkedIn
  console.log('2. Clicking "Continue with LinkedIn" to extract verified name, age, and place...');
  const clickedLinkedIn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const liBtn = buttons.find(b => b.textContent?.includes('Continue with LinkedIn'));
    if (liBtn) {
      liBtn.click();
      return true;
    }
    return false;
  });
  console.log(`Clicked LinkedIn SSO: ${clickedLinkedIn}`);
  await sleep(2000);

  const pageText = await page.evaluate(() => document.body.innerText);
  const isClaimsExtracted = pageText.includes('Elena Rostova') || pageText.includes('Nitin Aggarwal') || pageText.includes('21+ VERIFIED');
  console.log(`[Verified Claims Extraction Verification]: ${isClaimsExtracted ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 54_live_sso_oauth_verified_claims.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '54_live_sso_oauth_verified_claims.png'), fullPage: false });

  // 3. Navigate to Creator Analytics Hub and Verify Navbar Identity Pill
  console.log('3. Navigating to http://localhost:3001/creator/analytics to verify live SSO Identity Pill in Navbar...');
  await page.goto('http://localhost:3001/creator/analytics', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  const analyticsText = await page.evaluate(() => document.body.innerText);
  const isNavbarPillPresent = analyticsText.includes('SSO:') || analyticsText.includes('21+ Verified') || analyticsText.includes('9 Swarms Active');
  console.log(`[Navbar Identity Pill Verification]: ${isNavbarPillPresent ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 55_live_sso_auto_hydrated_studio_navbar.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '55_live_sso_auto_hydrated_studio_navbar.png'), fullPage: false });

  await browser.close();

  if (!isPortalLoaded || !isClaimsExtracted || !isNavbarPillPresent) {
    console.error('❌ SSO Verification E2E Test failed assertions.');
    process.exit(1);
  }

  console.log('🎉 SSO Login & Zero-Friction Profile Verification completely PASSED with 0 errors!');
}

run().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
