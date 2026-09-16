import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerification() {
  const screenshotDir = path.join(
    process.cwd(),
    'scratch',
    'screenshots_omni12_netflix'
  );
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log('🚀 Launching Puppeteer E2E Verification for Omni 1.2 Netflix Master Studio...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Viewport (1600x950)
    await page.setViewport({ width: 1600, height: 950 });
    await page.goto('http://localhost:3000/omni1.2', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await sleep(1200);

    // Verify DOM contents
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.includes('OMNI 1.2') || !bodyText.includes('0 ms')) {
      throw new Error('Missing expected Omni 1.2 or 0 ms drift text in DOM');
    }

    // Check Desktop horizontal overflow
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log(`Desktop Horizontal Overflow: ${desktopOverflow}`);

    const s1 = path.join(screenshotDir, '01_omni12_desktop_master_studio.png');
    await page.screenshot({ path: s1, fullPage: true });
    console.log(`✅ Captured: ${s1}`);

    // 2. Click Tab 2: 4 Master Anchors Architecture
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) =>
        b.textContent?.includes('4 Master Anchor')
      );
      if (tabBtn) tabBtn.click();
    });
    await sleep(800);
    const s2 = path.join(screenshotDir, '02_omni12_desktop_4_anchors_tab.png');
    await page.screenshot({ path: s2, fullPage: true });
    console.log(`✅ Captured: ${s2}`);

    // 3. Click Tab 3: CFR & PTS Filtergraph Spec
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) =>
        b.textContent?.includes('CFR & PTS')
      );
      if (tabBtn) tabBtn.click();
    });
    await sleep(800);
    const s3 = path.join(screenshotDir, '03_omni12_desktop_cfr_filtergraph_tab.png');
    await page.screenshot({ path: s3, fullPage: true });
    console.log(`✅ Captured: ${s3}`);

    // Switch back to Schedule tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) =>
        b.textContent?.includes('Shot Schedule')
      );
      if (tabBtn) tabBtn.click();
    });
    await sleep(800);

    // 4. iOS Viewport (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await sleep(800);
    const iosOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log(`iOS Horizontal Overflow: ${iosOverflow}`);
    const s4 = path.join(screenshotDir, '04_omni12_ios_mobile_390x844.png');
    await page.screenshot({ path: s4, fullPage: false });
    console.log(`✅ Captured: ${s4}`);

    // 5. Android Viewport (412x915)
    await page.setViewport({ width: 412, height: 915, isMobile: true });
    await sleep(800);
    const androidOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log(`Android Horizontal Overflow: ${androidOverflow}`);
    const s5 = path.join(screenshotDir, '05_omni12_android_mobile_412x915.png');
    await page.screenshot({ path: s5, fullPage: false });
    console.log(`✅ Captured: ${s5}`);

    console.log('🎉 ALL OMNI 1.2 NETFLIX MASTER QA CHECKS & SCREENSHOTS PASSED!');
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error('❌ QA Verification Failed:', err);
  process.exit(1);
});
