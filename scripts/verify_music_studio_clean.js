const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function run() {
  const screenshotDir = path.join(__dirname, '../scratch/screenshots_verified_hindi_wedding');
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  // Pre-seed cookie consent so banner doesn't obstruct view
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("zyvoriq_cookie_consent", JSON.stringify({
      essential: true,
      analytics: true,
      aiProvenance: true,
      timestamp: new Date().toISOString()
    }));
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://127.0.0.1:3000/studio/create/music...');
  await page.goto('http://127.0.0.1:3000/studio/create/music', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await new Promise(r => setTimeout(r, 2000));

  // Dismiss cookie/privacy banner if present
  try {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Accept All & Enable C2PA') || b.textContent.includes('Accept'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));
  } catch (e) {
    console.log('Consent dismiss error:', e.message);
  }

  const desktopPath = path.join(screenshotDir, '01_desktop_music_studio_clean.png');
  await page.screenshot({ path: desktopPath, fullPage: false });
  console.log('Saved:', desktopPath);

  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 800));
  const mobilePath = path.join(screenshotDir, '02_mobile_music_studio_clean.png');
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log('Saved:', mobilePath);

  await browser.close();
  console.log('Done verification!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
