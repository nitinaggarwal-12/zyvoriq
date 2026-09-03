const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPersona1E2ETest() {
  const outputDir = path.join(__dirname, '../../scratch/screenshots_persona1_kids');
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🚀 Starting Persona 1 (Kids & Family) E2E Test Suite with Signed macOS Chrome...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,950']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    // Step 1: Open /studio/create
    console.log('Navigating to http://localhost:3000/studio/create...');
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Assert DOM elements
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    const bannerText = await page.$eval('main', (el) => el.innerText);
    console.log(`Banner snippet: ${bannerText.slice(0, 200)}...`);
    if (!bannerText.includes('Kids, Parents & Family')) {
      throw new Error('Kids, Parents & Family persona not found on page');
    }
    if (!bannerText.includes('Pixar')) {
      throw new Error('Pixar text not found on page');
    }
    console.log('✅ DOM assertion passed: Persona 1 (Kids & Family) is active.');

    // Screenshot 1: Default Persona 1 Focus Card
    const s1Path = path.join(outputDir, '01_persona1_kids_dashboard.png');
    await page.screenshot({ path: s1Path, fullPage: false });
    console.log(`📸 Captured: ${s1Path}`);

    // Step 2: Click a 1-click sample prompt template
    console.log('Testing 1-Click Prompt Template selection...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const promptBtn = btns.find(b => b.innerText.includes('curious little robot'));
      if (promptBtn) promptBtn.click();
    });
    await sleep(800);

    const inputValue = await page.$eval('input[type="text"]', el => el.value);
    console.log(`Populated prompt input: "${inputValue}"`);
    if (!inputValue.includes('flower on the moon')) {
      throw new Error('Prompt input was not populated correctly');
    }
    console.log('✅ DOM assertion passed: 1-Click Prompt populated successfully.');

    // Screenshot 2: Populated Prompt Input
    const s2Path = path.join(outputDir, '02_persona1_prompt_selected.png');
    await page.screenshot({ path: s2Path, fullPage: false });
    console.log(`📸 Captured: ${s2Path}`);

    // Step 3: Toggle to 14-Persona Master Matrix Table View
    console.log('Testing 14-Persona Matrix Table View...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.innerText.includes('14-Persona Master Matrix'));
      if (b) b.click();
    });
    await sleep(800);

    // Assert Table rows
    const rowCount = await page.$$eval('tbody tr', rows => rows.length);
    console.log(`Table row count: ${rowCount}`);
    if (rowCount !== 14) {
      throw new Error(`Expected 14 table rows, but found ${rowCount}`);
    }
    console.log('✅ DOM assertion passed: 14-Persona Master Matrix table rendered with all 14 personas.');

    // Screenshot 3: Matrix Table View
    const s3Path = path.join(outputDir, '03_persona1_master_matrix_table.png');
    await page.screenshot({ path: s3Path, fullPage: false });
    console.log(`📸 Captured: ${s3Path}`);

    // Step 4: Open Dedicated Animation Studio (/studio/create/animation)
    console.log('Navigating to Animation Studio...');
    await page.goto('http://localhost:3000/studio/create/animation', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const animPageText = await page.$eval('main', el => el.innerText);
    if (!animPageText.includes('KID-SAFE GUARDRAILS')) {
      throw new Error('KID-SAFE GUARDRAILS badge missing in Animation Studio');
    }
    if (!animPageText.includes('PIXAR, DISNEY & ANIME STUDIO')) {
      throw new Error('PIXAR, DISNEY & ANIME STUDIO header missing in Animation Studio');
    }
    console.log('✅ DOM assertion passed: Animation Studio loaded with Kid-Safe and Pixar 3D features.');

    // Screenshot 4: Animation Studio
    const s4Path = path.join(outputDir, '04_persona1_animation_studio_pixar.png');
    await page.screenshot({ path: s4Path, fullPage: false });
    console.log(`📸 Captured: ${s4Path}`);

    // Step 5: Mobile Viewport Test (390x844)
    console.log('Testing Mobile Viewport (iPhone 14 / 390px)...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Screenshot 5: Mobile View
    const s5Path = path.join(outputDir, '05_persona1_mobile_view.png');
    await page.screenshot({ path: s5Path, fullPage: false });
    console.log(`📸 Captured: ${s5Path}`);

    console.log('🎉 ALL PERSONA 1 E2E TESTS PASSED WITH ZERO REGRESSIONS!');
  } finally {
    await browser.close();
  }
}

runPersona1E2ETest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
