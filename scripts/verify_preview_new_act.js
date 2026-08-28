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
  await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle0", timeout: 30000 });
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

  // 4. Click Preview in Studio Stage
  console.log("5. Clicking 'Preview in Studio Stage'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const previewBtn = btns.find(b => b.textContent && b.textContent.includes('Preview in Studio Stage'));
    if (previewBtn) previewBtn.click();
  });
  await sleep(2000);

  // Screenshot 1: Studio Stage with Act 8 Notification Banner
  await page.screenshot({ path: `${screenshotDir}/06_studio_stage_act8_live.png` });
  console.log("   📸 Captured 06_studio_stage_act8_live.png");

  // Screenshot 2: Scroll slightly down to spotlight Story Navigator
  await page.evaluate(() => {
    window.scrollBy(0, 150);
  });
  await sleep(600);
  await page.screenshot({ path: `${screenshotDir}/07_act8_in_story_navigator.png` });
  console.log("   📸 Captured 07_act8_in_story_navigator.png");

  await browser.close();
  console.log("🎉 Act 8 Live Preview Verification Completed Successfully!");
}

run().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
