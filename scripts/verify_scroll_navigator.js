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

  await page.goto("http://localhost:3005/studio", { waitUntil: "networkidle0", timeout: 30000 });
  await sleep(2000);

  // 1. Open modal & generate
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes('CREATE NEW ACT') || btn.textContent.includes('Create New Act')));
    if (b) b.click();
  });
  await sleep(1000);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const preset = btns.find(b => b.textContent && b.textContent.includes('Thunderstorm of Mushin'));
    if (preset) preset.click();
  });
  await sleep(500);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const kickoff = btns.find(b => b.textContent && b.textContent.includes('Kickoff Veo 3.1'));
    if (kickoff) kickoff.click();
  });
  await sleep(6500);

  // 2. Click preview
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const previewBtn = btns.find(b => b.textContent && b.textContent.includes('Preview in Studio Stage'));
    if (previewBtn) previewBtn.click();
  });
  await sleep(2000);

  // 3. Scroll the navigator container directly down to reveal Act 8!
  await page.evaluate(() => {
    const navContainers = document.querySelectorAll('.overflow-y-auto');
    navContainers.forEach(c => {
      c.scrollTop = c.scrollHeight;
    });
  });
  await sleep(800);

  await page.screenshot({ path: `${screenshotDir}/07_act8_in_story_navigator.png` });
  console.log("   📸 Captured 07_act8_in_story_navigator.png (Scrolled View)");

  await browser.close();
}

run().catch(console.error);
