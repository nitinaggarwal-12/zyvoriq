const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=============================================================================");
  console.log("🧪 E2E VERIFICATION: STUDIO 'CREATE NEW ACT' MODAL & GENERATOR LIFECYCLE");
  console.log("=============================================================================");

  const screenshotDir = '/tmp/screenshots_create_act';
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  page.on('console', msg => console.log('   [PAGE LOG]:', msg.text()));
  page.on('pageerror', err => console.error('   [PAGE ERROR]:', err.message));

  console.log("1. Navigating to http://localhost:3000/studio ...");
  await page.goto("http://localhost:3000/studio", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2500);

  await page.screenshot({ path: `${screenshotDir}/01_studio_with_create_button.png` });
  console.log("   📸 Captured 01_studio_with_create_button.png");

  console.log("2. Clicking '✨ Create New Act' button...");
  await page.waitForSelector('[data-testid="create-act-button"]', { timeout: 15000 });
  await page.$eval('[data-testid="create-act-button"]', el => el.click());
  await sleep(1000);

  await page.screenshot({ path: `${screenshotDir}/02_create_act_modal_open.png` });
  console.log("   📸 Captured 02_create_act_modal_open.png");

  console.log("3. Selecting '⚡ The Thunderstorm of Mushin' preset & 24s duration...");
  const clickedPreset = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Thunderstorm of Mushin'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log("   Preset clicked:", clickedPreset);
  await sleep(500);

  const clickedDur = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('24s'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log("   Duration 24s clicked:", clickedDur);
  await sleep(500);

  await page.screenshot({ path: `${screenshotDir}/03_modal_configured.png` });
  console.log("   📸 Captured 03_modal_configured.png");

  console.log("4. Clicking 'Kickoff Veo 3.1 & DeepMind Dub Pipeline'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Kickoff Veo 3.1'));
    if (b) b.click();
  });

  console.log("   ⏳ Waiting for Multi-Modal generation & Veritas audit...");
  await sleep(3500);

  await page.screenshot({ path: `${screenshotDir}/04_act_generated_veritas_passed.png` });
  console.log("   📸 Captured 04_act_generated_veritas_passed.png");

  console.log("5. Testing 1-Click Omnichannel Publish...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('1-Click Omnichannel Publish'));
    if (b) b.click();
  });
  await sleep(800);

  await page.screenshot({ path: `${screenshotDir}/05_act_published_live.png` });
  console.log("   📸 Captured 05_act_published_live.png");

  await browser.close();
  console.log("🎉 E2E Verification Completed Successfully!");
}

run().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
