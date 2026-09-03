const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function evalLandingPage() {
  const outputDir = path.join(__dirname, '../../scratch/screenshots_landing_eval');
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🔍 Starting Comprehensive Landing Page Audit with Signed macOS Chrome...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1000']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    // Pre-seed cookie consent for clean review
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("zyvoriq_cookie_consent", JSON.stringify({
        essential: true,
        analytics: true,
        aiProvenance: true,
        timestamp: new Date().toISOString()
      }));
    });

    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Capture 1: Hero & Navbar
    await page.screenshot({
      path: path.join(outputDir, '01_landing_hero_desktop.png'),
      clip: { x: 0, y: 0, width: 1600, height: 950 }
    });
    console.log('📸 Captured: 01_landing_hero_desktop.png');

    // Capture 2: Multimodal Studio Section
    await page.evaluate(() => {
      const el = document.getElementById('multimodal');
      if (el) el.scrollIntoView();
    });
    await sleep(800);
    await page.screenshot({
      path: path.join(outputDir, '02_landing_multimodal_section.png'),
      clip: { x: 0, y: 800, width: 1600, height: 950 }
    });
    console.log('📸 Captured: 02_landing_multimodal_section.png');

    // Capture 3: Use Cases & Creator Roles
    await page.evaluate(() => {
      const el = document.getElementById('use-cases');
      if (el) el.scrollIntoView();
    });
    await sleep(800);
    await page.screenshot({
      path: path.join(outputDir, '03_landing_usecases_section.png'),
      clip: { x: 0, y: 1600, width: 1600, height: 950 }
    });
    console.log('📸 Captured: 03_landing_usecases_section.png');

    // Capture 4: CTA & Footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await sleep(800);
    await page.screenshot({
      path: path.join(outputDir, '04_landing_cta_and_footer.png')
    });
    console.log('📸 Captured: 04_landing_cta_and_footer.png');

    // Capture 5: Full Page Desktop
    await page.screenshot({
      path: path.join(outputDir, '05_landing_full_page_desktop.png'),
      fullPage: true
    });
    console.log('📸 Captured: 05_landing_full_page_desktop.png');

    // Capture 6: Mobile Viewport (390x844)
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(800);
    await page.screenshot({
      path: path.join(outputDir, '06_landing_mobile_hero.png'),
      fullPage: false
    });
    console.log('📸 Captured: 06_landing_mobile_hero.png');

    // Mobile Menu Open Test
    await page.evaluate(() => {
      const btn = document.querySelector('header button');
      if (btn) btn.click();
    });
    await sleep(800);
    await page.screenshot({
      path: path.join(outputDir, '07_landing_mobile_menu_open.png'),
      fullPage: false
    });
    console.log('📸 Captured: 07_landing_mobile_menu_open.png');

    console.log('\n🎉 LANDING PAGE AUDIT SCREENSHOTS READY!');
  } catch (err) {
    console.error('Audit failure:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

evalLandingPage();
