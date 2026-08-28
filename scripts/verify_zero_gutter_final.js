const puppeteer = require('puppeteer');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/tmp/screenshots_zero_gutter';
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  await page.goto('http://localhost:3005/studio/create', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Click Kickoff
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Kickoff Veo 3.1'));
    if (b) b.click();
  });

  // Wait 4.5s for 100% completion
  await sleep(4500);

  await page.screenshot({ path: `${screenshotDir}/03_final_completed_master_fullwidth.png` });
  console.log("📸 Captured 03_final_completed_master_fullwidth.png");

  await browser.close();
})();
