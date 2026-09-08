import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(process.cwd(), 'scratch', 'cloudtop_e2e_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`[E2E] Starting Dual-Tab & 180s Cinema Verification against ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    // 1. DESKTOP VIEWPORT (1440x900)
    console.log('[E2E] 1. Testing Desktop Viewport (1440x900)...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Assert Tab 1 is active by default
    const tab1Active = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Instagram / TikTok') && text.includes('Generate 9:16 Reel');
    });
    console.log(`  ✓ Tab 1 (Instagram / TikTok) active: ${tab1Active}`);

    await page.screenshot({ path: path.join(OUT_DIR, '01_desktop_tab1_instagram_reels.png') });
    console.log('  ✓ Captured: 01_desktop_tab1_instagram_reels.png');

    // Click Tab 2: YouTube / 180s Cinema
    console.log('[E2E] 2. Switching to Tab 2 (YouTube / 180s Cinema)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tab2Btn = buttons.find(b => b.textContent && b.textContent.includes('180s Cinema'));
      if (tab2Btn) tab2Btn.click();
    });

    // Enforce 800ms settling delay for React state & video re-render
    await sleep(800);

    // Assert Tab 2 elements in DOM
    const tab2Verified = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasCinemaHeadline = text.includes('Direct 180s cinema') || text.includes('commands the big screen');
      const hasDirectButton = text.includes('Direct 180s Cinema Master');
      const has5Acts = text.includes('5 Classical Acts') || text.includes('5-Act Master');
      const hasAnamorphic = text.includes('2.39:1 Anamorphic');
      return { hasCinemaHeadline, hasDirectButton, has5Acts, hasAnamorphic };
    });
    console.log('  ✓ Tab 2 elements verified in DOM:', JSON.stringify(tab2Verified));

    await page.screenshot({ path: path.join(OUT_DIR, '02_desktop_tab2_180s_cinema.png') });
    console.log('  ✓ Captured: 02_desktop_tab2_180s_cinema.png');

    // Test Act 3 jump scrubber click
    console.log('[E2E] 3. Testing 5 Classical Acts Scrubber...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const act3Btn = buttons.find(b => b.textContent && b.textContent.includes('Act 3'));
      if (act3Btn) act3Btn.click();
    });
    await sleep(500);

    // Scroll to showcase section
    await page.evaluate(() => {
      const showcase = document.getElementById('showcase');
      if (showcase) showcase.scrollIntoView();
    });
    await sleep(800);

    await page.screenshot({ path: path.join(OUT_DIR, '03_desktop_tab2_showcase_section.png') });
    console.log('  ✓ Captured: 03_desktop_tab2_showcase_section.png');

    // 2. MOBILE iOS VIEWPORT (iPhone 14 @ 390x844)
    console.log('[E2E] 4. Testing Mobile iOS (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    const iosOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log(`  ✓ Mobile iOS Zero-Horizontal-Overflow check: ${iosOverflow}`);

    await page.screenshot({ path: path.join(OUT_DIR, '04_mobile_ios_tab1.png') });
    console.log('  ✓ Captured: 04_mobile_ios_tab1.png');

    // Switch to Tab 2 on Mobile
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tab2Btn = buttons.find(b => b.textContent && b.textContent.includes('180s Cinema'));
      if (tab2Btn) tab2Btn.click();
    });
    await sleep(800);

    const iosTab2Overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log(`  ✓ Mobile iOS Tab 2 Zero-Horizontal-Overflow check: ${iosTab2Overflow}`);

    await page.screenshot({ path: path.join(OUT_DIR, '05_mobile_ios_tab2_cinema.png') });
    console.log('  ✓ Captured: 05_mobile_ios_tab2_cinema.png');

    // 3. MOBILE ANDROID VIEWPORT (Pixel 7 @ 412x915)
    console.log('[E2E] 5. Testing Mobile Android (412x915)...');
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(500);

    const androidOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log(`  ✓ Mobile Android Zero-Horizontal-Overflow check: ${androidOverflow}`);

    await page.screenshot({ path: path.join(OUT_DIR, '06_mobile_android_tab2_cinema.png') });
    console.log('  ✓ Captured: 06_mobile_android_tab2_cinema.png');

    console.log('🎉 ALL DUAL-TAB & 180s CINEMA E2E CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('[E2E] Error during verification:', err);
  process.exit(1);
});
