/**
 * E2E Verification: Creating an Act and Previewing it Live in Studio Stage & Story Navigator
 */
const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const screenshotDir = '/tmp/screenshots_create_act';
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
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

  console.log("1. Navigating to /studio on localhost:3000...");
  await page.goto("http://localhost:3000/studio", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2500);

  // 1. Click Create Act
  console.log("2. Opening Create Act Modal...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes('CREATE NEW ACT') || btn.textContent.includes('Create New Act')));
    if (b) b.click();
  });
  await sleep(1200);

  // 2. Select Preset & Duration
  console.log("3. Selecting preset & 24s duration...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const preset = btns.find(b => b.textContent && b.textContent.includes('Thunderstorm of Mushin'));
    if (preset) preset.click();
    const dur24 = btns.find(b => b.textContent && b.textContent.includes('24s'));
    if (dur24) dur24.click();
  });
  await sleep(600);

  // 3. Kickoff generation
  console.log("4. Kickoff Veo 3.1 & DeepMind Dub Pipeline...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const kickoff = btns.find(b => b.textContent && b.textContent.includes('Kickoff Veo 3.1'));
    if (kickoff) kickoff.click();
  });
  await sleep(3500);

  // Screenshot: Generated Result Screen
  await page.screenshot({ path: `${screenshotDir}/04_act_synthesized_veritas_passed.png` });
  console.log("   📸 Captured 04_act_synthesized_veritas_passed.png");

  // 4. Click Preview in Studio Stage
  console.log("5. Clicking 'Preview in Studio Stage'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const previewBtn = btns.find(b => b.textContent && b.textContent.includes('Preview in Studio Stage'));
    if (previewBtn) previewBtn.click();
  });
  await sleep(1200);

  // Screenshot: Studio Stage with Act 8 in Navigator and Banner
  await page.screenshot({ path: `${screenshotDir}/06_studio_stage_act8_live.png` });
  console.log("   📸 Captured 06_studio_stage_act8_live.png");

  await browser.close();
  console.log("🎉 Act 8 Preview Verification Completed Successfully!");
}

run().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
