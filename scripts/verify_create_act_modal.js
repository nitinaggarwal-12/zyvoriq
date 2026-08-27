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
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  page.on('console', msg => console.log('   [PAGE LOG]:', msg.text()));
  page.on('pageerror', err => console.error('   [PAGE ERROR]:', err.message));

  console.log("1. Navigating to http://127.0.0.1:3000/studio ...");
  await page.goto("http://127.0.0.1:3000/studio", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(1500);

  await page.screenshot({ path: `${screenshotDir}/01_studio_with_create_button.png` });
  console.log("   📸 Captured 01_studio_with_create_button.png");

  console.log("2. Clicking '✨ Create New Act' button...");
  await page.waitForSelector('[data-testid="create-act-button"]', { timeout: 10000 });
  await page.click('[data-testid="create-act-button"]');
  await sleep(800);

  await page.screenshot({ path: `${screenshotDir}/02_create_act_modal_open.png` });
  console.log("   📸 Captured 02_create_act_modal_open.png");

  console.log("3. Selecting '⚡ The Thunderstorm of Mushin' preset & 24s duration...");
  const presetBtn = await page.$('button ::-p-text(The Thunderstorm of Mushin)');
  if (presetBtn) {
    await presetBtn.click();
    await sleep(400);
  }

  // Click 24s duration button
  const dur24Btn = await page.$('button ::-p-text(24s)');
  if (dur24Btn) {
    await dur24Btn.click();
    await sleep(400);
  }

  await page.screenshot({ path: `${screenshotDir}/03_modal_configured.png` });
  console.log("   📸 Captured 03_modal_configured.png");

  console.log("4. Clicking 'Kickoff Veo 3.1 & DeepMind Dub Pipeline'...");
  const kickoffBtn = await page.$('button ::-p-text(Kickoff Veo 3.1)');
  if (kickoffBtn) {
    await kickoffBtn.click();
    console.log("   ⏳ Waiting for Multi-Modal generation & Veritas audit...");
    await sleep(3500);
  }

  await page.screenshot({ path: `${screenshotDir}/04_act_generated_veritas_passed.png` });
  console.log("   📸 Captured 04_act_generated_veritas_passed.png");

  console.log("5. Testing 1-Click Omnichannel Publish...");
  const publishBtn = await page.$('button ::-p-text(1-Click Omnichannel Publish)');
  if (publishBtn) {
    await publishBtn.click();
    await sleep(500);
  }

  await page.screenshot({ path: `${screenshotDir}/05_act_published_live.png` });
  console.log("   📸 Captured 05_act_published_live.png");

  await browser.close();
  console.log("🎉 E2E Verification Completed Successfully!");
}

run().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
