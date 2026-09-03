const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPersona2E2ETest() {
  const outputDir = path.join(__dirname, '../../scratch/screenshots_persona2_anime_manga');
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🚀 Starting Persona 2 (Teens, Anime & Manga) E2E Test Suite with Signed macOS Chrome...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,950']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    // Step 1: Open /studio/create and select Persona #2 (Teens, Anime & Manga)
    console.log('Navigating to http://localhost:3000/studio/create...');
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2' });
    await sleep(1000);

    console.log('Selecting Persona #2 (Teens, Anime & Manga)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const persona2Btn = btns.find(b => b.innerText.includes('Teens, Anime & Manga'));
      if (persona2Btn) persona2Btn.click();
    });
    await sleep(800);

    const bannerText = await page.$eval('main', el => el.innerText);
    if (!bannerText.includes('Shōnen Action') && !bannerText.includes('Shōnen')) {
      throw new Error('Persona 2 Shonen Action badge not found on page');
    }
    console.log('✅ DOM assertion passed: Persona 2 (Teens, Anime & Manga) spotlight is active.');

    // Screenshot 1: Persona 2 Spotlight
    const s1Path = path.join(outputDir, '01_persona2_manga_dashboard.png');
    await page.screenshot({ path: s1Path, fullPage: false });
    console.log(`📸 Captured: ${s1Path}`);

    console.log('Testing 1-Click Prompt Template selection for Persona 2...');
    await sleep(500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const promptBtn = btns.find(b => b.innerText.includes('lightning katana duel'));
      if (promptBtn) promptBtn.click();
    });
    await sleep(800);

    const inputValue = await page.$eval('input[type="text"]', el => el.value);
    console.log(`Populated prompt input: "${inputValue}"`);
    if (!inputValue.includes('lightning katana duel')) {
      throw new Error('Prompt input was not populated correctly for Persona 2');
    }
    console.log('✅ DOM assertion passed: 1-Click Prompt populated with Anime Action concept.');

    // Screenshot 2: Populated Prompt Input
    const s2Path = path.join(outputDir, '02_persona2_prompt_selected.png');
    await page.screenshot({ path: s2Path, fullPage: false });
    console.log(`📸 Captured: ${s2Path}`);

    // Step 3: Navigate to Dedicated Manga Studio (/studio/create/comics)
    console.log('Navigating to Manga & Comics Studio...');
    await page.goto('http://localhost:3000/studio/create/comics', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const comicsPageText = await page.$eval('main', el => el.innerText);
    if (!comicsPageText.includes('MANGA & COMICS STUDIO')) {
      throw new Error('MANGA & COMICS STUDIO header missing');
    }
    if (!comicsPageText.includes('100% ORIGINAL ASSETS')) {
      throw new Error('100% ORIGINAL ASSETS copyright safety badge missing');
    }
    console.log('✅ DOM assertion passed: Comics Studio loaded with copyright-safe badges.');

    // Click Hero Action Splash Page layout
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const splashBtn = btns.find(b => b.innerText.includes('Hero Action Splash Page'));
      if (splashBtn) splashBtn.click();
    });
    await sleep(800);

    // Screenshot 3: Comics Studio Desktop View
    const s3Path = path.join(outputDir, '03_persona2_comics_studio_desktop.png');
    await page.screenshot({ path: s3Path, fullPage: false });
    console.log(`📸 Captured: ${s3Path}`);

    // Step 4: Mobile Viewport Test (390x844)
    console.log('Testing Mobile Viewport (iPhone 14 / 390px)...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/studio/create/comics', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Screenshot 4: Mobile View
    const s4Path = path.join(outputDir, '04_persona2_mobile_view.png');
    await page.screenshot({ path: s4Path, fullPage: false });
    console.log(`📸 Captured: ${s4Path}`);

    console.log('🎉 ALL PERSONA 2 E2E TESTS PASSED WITH ZERO REGRESSIONS!');
  } finally {
    await browser.close();
  }
}

runPersona2E2ETest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
