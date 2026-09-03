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

  console.log('🚀 Starting Comprehensive Light & Dark Theme Dual-Engine E2E Suite on macOS Google Chrome...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1600,1000',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  // 1. Visit /studio in Dark Theme (Default)
  console.log('1. Navigating to http://localhost:3001/studio in Default Dark Theme (Obsidian Cinema)...');
  await page.goto('http://localhost:3001/studio', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  // Dismiss cookie banner
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent && b.textContent.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(800);

  const darkThemeStatus = await page.evaluate(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    return { isDark, bgColor };
  });
  console.log(`[Dark Theme Studio Verification]: isDark=${darkThemeStatus.isDark}, bgColor=${darkThemeStatus.bgColor} -> ${darkThemeStatus.isDark ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 59_live_dark_theme_studio.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '59_live_dark_theme_studio.png'), fullPage: false });

  // 2. Toggle to Light Theme (Daylight Studio Mode)
  console.log('2. Clicking Theme Toggle button to switch to Light Theme (Daylight Studio)...');
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[aria-label="Toggle Theme"]');
    if (themeBtn) {
      themeBtn.click();
    } else {
      // Fallback selector
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.title && (b.title.includes('Light Mode') || b.title.includes('Theme')));
      if (btn) btn.click();
    }
  });
  await sleep(1200);

  const lightThemeStatus = await page.evaluate(() => {
    const isLight = document.documentElement.classList.contains('light') || !document.documentElement.classList.contains('dark');
    const colorScheme = document.documentElement.style.colorScheme;
    return { isLight, colorScheme };
  });
  console.log(`[Light Theme Studio Verification]: isLight=${lightThemeStatus.isLight}, colorScheme=${lightThemeStatus.colorScheme} -> ${lightThemeStatus.isLight ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 60_live_light_theme_studio.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '60_live_light_theme_studio.png'), fullPage: false });

  // 3. Navigate to /nda/sign in Light Theme
  console.log('3. Navigating to http://localhost:3001/nda/sign in Light Theme...');
  await page.goto('http://localhost:3001/nda/sign?token=demo_theme_test_88&name=Sophia+Vanderbilt&company=Vanderbilt+Media+Group', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  console.log('📸 Capturing 61_live_light_theme_nda.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '61_live_light_theme_nda.png'), fullPage: false });

  // 4. Navigate to /admin/moderation in Light Theme
  console.log('4. Navigating to http://localhost:3001/admin/moderation in Light Theme...');
  await page.goto('http://localhost:3001/admin/moderation', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  console.log('📸 Capturing 62_live_light_theme_moderation.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '62_live_light_theme_moderation.png'), fullPage: false });

  // 5. Navigate to /creator/analytics in Light Theme
  console.log('5. Navigating to http://localhost:3001/creator/analytics in Light Theme...');
  await page.goto('http://localhost:3001/creator/analytics', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);

  console.log('📸 Capturing 63_live_light_theme_creator_growth.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '63_live_light_theme_creator_growth.png'), fullPage: false });

  // 6. Toggle back to Dark Theme
  console.log('6. Toggling back to Dark Theme...');
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[aria-label="Toggle Theme"]');
    if (themeBtn) themeBtn.click();
  });
  await sleep(1000);

  const revertedDarkStatus = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark');
  });
  console.log(`[Reverted Dark Theme Verification]: isDark=${revertedDarkStatus} -> ${revertedDarkStatus ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing 64_live_dark_theme_reversion.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '64_live_dark_theme_reversion.png'), fullPage: false });

  await browser.close();

  if (!darkThemeStatus.isDark || !lightThemeStatus.isLight || !revertedDarkStatus) {
    console.error('❌ Theme dual-engine assertions failed.');
    process.exit(1);
  }

  console.log('🎉 All Light and Dark Theme Dual-Engine E2E Tests PASSED with 0 errors!');
}

run().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
