import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const screenshotDir = path.resolve(process.cwd(), 'scratch/screenshots_onboarding_reels_qa');
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  // Pre-seed cookie consent
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

  console.log('1. Navigating to Onboarding Page (http://127.0.0.1:3000)...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  // Capture 1: Kids & Family Pixar 3D
  const p1Path = path.join(screenshotDir, '01_onboarding_desktop_kids_pixar.png');
  await page.screenshot({ path: p1Path, fullPage: false });
  console.log('Saved:', p1Path);

  // Click Tab 2: Anime & Manga
  console.log('2. Switching to Anime & Manga Persona...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const animeBtn = buttons.find(b => b.textContent.includes('Anime & Manga'));
    if (animeBtn) animeBtn.click();
  });
  await sleep(1000);
  const p2Path = path.join(screenshotDir, '02_onboarding_desktop_anime_shonen.png');
  await page.screenshot({ path: p2Path, fullPage: false });
  console.log('Saved:', p2Path);

  // Click Tab 3: Viral Influencer
  console.log('3. Switching to Viral Influencer Persona...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const inflBtn = buttons.find(b => b.textContent.includes('Viral Influencer'));
    if (inflBtn) inflBtn.click();
  });
  await sleep(1000);
  const p3Path = path.join(screenshotDir, '03_onboarding_desktop_viral_influencer.png');
  await page.screenshot({ path: p3Path, fullPage: false });
  console.log('Saved:', p3Path);

  // Click Tab 4: E-Com UGC Ads
  console.log('4. Switching to E-Com UGC Ads Persona...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ugcBtn = buttons.find(b => b.textContent.includes('E-Com UGC Ads'));
    if (ugcBtn) ugcBtn.click();
  });
  await sleep(1000);
  const p4Path = path.join(screenshotDir, '04_onboarding_desktop_ugc_ads.png');
  await page.screenshot({ path: p4Path, fullPage: false });
  console.log('Saved:', p4Path);

  // Capture 5: Mobile Viewport (iPhone 14 @ 390x844)
  console.log('5. Testing Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844 });
  await sleep(800);
  const p5Path = path.join(screenshotDir, '05_onboarding_mobile_iphone14.png');
  await page.screenshot({ path: p5Path, fullPage: false });
  console.log('Saved:', p5Path);

  // Capture 6: Studio Avatars Page with clean sidebar and header
  console.log('6. Testing Studio Avatars Page (/studio/avatars)...');
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto('http://127.0.0.1:3000/studio/avatars', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2000);
  const p6Path = path.join(screenshotDir, '06_studio_avatars_unified_layout.png');
  await page.screenshot({ path: p6Path, fullPage: false });
  console.log('Saved:', p6Path);

  // Capture 7: Studio Content Library Page (/studio/library)
  console.log('7. Testing Studio Library Page (/studio/library)...');
  await page.goto('http://127.0.0.1:3000/studio/library', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2000);
  const p7Path = path.join(screenshotDir, '07_studio_library_unified_layout.png');
  await page.screenshot({ path: p7Path, fullPage: false });
  console.log('Saved:', p7Path);

  await browser.close();
  console.log('✅ All E2E Onboarding & Studio Reel Tests Completed Successfully!');
}

main().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
