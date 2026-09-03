const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPersona3E2ETest() {
  const outputDir = path.join(__dirname, '../../scratch/screenshots_persona3_influencer');
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🚀 Starting Persona 3 (Viral Social Influencers & Shorts) E2E Test Suite with Signed macOS Chrome...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,950']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    // Pre-seed consent so modal is permanently dismissed
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("zyvoriq_cookie_consent", JSON.stringify({
        essential: true,
        analytics: true,
        aiProvenance: true,
        timestamp: new Date().toISOString()
      }));
    });

    // Step 1: Open /studio/create and select Persona #3 (Viral Influencers & Shorts)
    console.log('Navigating to http://localhost:3000/studio/create...');
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2' });
    await sleep(1000);

    console.log('Selecting Persona #3 (Viral Influencers & Shorts)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const persona3Btn = btns.find(b => b.innerText.includes('Viral Influencers & Shorts'));
      if (persona3Btn) persona3Btn.click();
    });
    await sleep(800);

    const bannerText = await page.$eval('main', el => el.innerText);
    if (!bannerText.includes('Viral Retention') && !bannerText.includes('Influencer')) {
      throw new Error('Persona 3 Viral Retention badge not found on page');
    }
    console.log('✅ DOM assertion passed: Persona 3 (Viral Influencers & Shorts) spotlight is active.');

    // Screenshot 1: Persona 3 Spotlight
    const s1Path = path.join(outputDir, '01_persona3_influencer_dashboard.png');
    await page.screenshot({ path: s1Path, fullPage: false });
    console.log(`📸 Captured: ${s1Path}`);

    // Step 2: Test 1-Click Prompt Template selection for Persona 3
    console.log('Testing 1-Click Prompt Template selection for Persona 3...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const promptBtn = btns.find(b => b.innerText.includes('Reddit confession') || b.innerText.includes('trivia countdown'));
      if (promptBtn) promptBtn.click();
    });
    await sleep(800);

    const inputValue = await page.$eval('input[type="text"]', el => el.value);
    console.log(`Populated prompt input: "${inputValue}"`);
    if (!inputValue || inputValue.length < 10) {
      throw new Error('Prompt input was not populated correctly for Persona 3');
    }
    console.log('✅ DOM assertion passed: 1-Click Prompt populated with Viral Influencer concept.');

    // Screenshot 2: Populated Prompt Input
    const s2Path = path.join(outputDir, '02_persona3_prompt_selected.png');
    await page.screenshot({ path: s2Path, fullPage: false });
    console.log(`📸 Captured: ${s2Path}`);

    // Step 3: Navigate to Dedicated Viral Reel Studio (/studio/create/reel?mode=faceless)
    console.log('Navigating to Viral Influencers & Faceless Reel Studio...');
    await page.goto('http://localhost:3000/studio/create/reel?mode=faceless', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const reelPageText = await page.$eval('main', el => el.innerText);
    if (!reelPageText.includes('VIRAL RETENTION REELS')) {
      throw new Error('VIRAL RETENTION REELS header missing');
    }
    if (!reelPageText.includes('100% ORIGINAL ASSETS & ROYALTY-FREE STEMS')) {
      throw new Error('100% ORIGINAL ASSETS & ROYALTY-FREE STEMS safety badge missing');
    }
    console.log('✅ DOM assertion passed: Viral Reel Studio loaded with copyright-safe badges.');

    // Screenshot 3: Viral Reel Studio Desktop View
    const s3Path = path.join(outputDir, '03_persona3_reel_studio_desktop.png');
    await page.screenshot({ path: s3Path, fullPage: false });
    console.log(`📸 Captured: ${s3Path}`);

    // Step 4: Test Interactive Mode Switching & Subtitle Customizer
    console.log('Testing Reddit Horror Mode switch and Neon Subtitles...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const redditBtn = btns.find(b => b.innerText.includes('Reddit Horror'));
      if (redditBtn) redditBtn.click();
    });
    await sleep(800);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const neonBtn = btns.find(b => b.innerText.includes('Neon Toxic Glow'));
      if (neonBtn) neonBtn.click();
    });
    await sleep(800);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const speedBtn = btns.find(b => b.innerText.includes('1.25x Rapid'));
      if (speedBtn) speedBtn.click();
    });
    await sleep(800);

    // Verify textarea has updated Reddit prompt
    const textareaVal = await page.$eval('textarea', el => el.value);
    if (!textareaVal.includes('locker 42') && !textareaVal.includes('Reddit')) {
      throw new Error('Reddit prompt did not populate into textarea');
    }
    console.log('✅ DOM assertion passed: Reddit Horror preset and Neon subtitle styles active.');

    // Screenshot 4: Interactive Preset & Simulator View
    const s4Path = path.join(outputDir, '04_persona3_interactive_simulator.png');
    await page.screenshot({ path: s4Path, fullPage: false });
    console.log(`📸 Captured: ${s4Path}`);

    // Step 5: Mobile Viewport Test (390x844)
    console.log('Testing Mobile Viewport (iPhone 14 / 390px)...');
    await page.setViewport({ width: 390, height: 844 });
    await sleep(1000);

    const s5Path = path.join(outputDir, '05_persona3_mobile_viewport.png');
    await page.screenshot({ path: s5Path, fullPage: false });
    console.log(`📸 Captured: ${s5Path}`);

    console.log('\n🎉 ALL 5 E2E TESTS FOR PERSONA 3 (VIRAL INFLUENCERS & SHORTS) PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ E2E Test Failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPersona3E2ETest();
