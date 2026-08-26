const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://127.0.0.1:3000/studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2200));

  await page.screenshot({ path: '3d_holo_stage_priya_live.jpg', quality: 90 });
  console.log('✅ Captured updated 3D Holo-Stage live rendering!');
  await browser.close();
})();
