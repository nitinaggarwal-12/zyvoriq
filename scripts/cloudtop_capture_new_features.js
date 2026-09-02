const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 CAPTURING REAL LIVE BROWSER SCREENSHOTS ON CLOUDTOP VIA PUPPETEER");
  console.log("   Target Host: nitinagga.c.googlers.com");
  console.log("   Viewport: 1600x1000 Ultra-Wide Desktop");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'screenshots_live_cloudtop');
  if (fs.existsSync(localOutputDir)) {
    fs.rmSync(localOutputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(localOutputDir, { recursive: true });

  const remoteScript = `
const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const outputDir = '/tmp/cloudtop_live_features_shots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🌐 Launching Headless Chrome on Cloudtop (1600x1000)...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1600,1000',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  const BASE_URL = process.env.BASE_URL || 'https://zyvoriq.up.railway.app';

  // 1. Studio Workspace with Navbar Buttons
  console.log("📸 [1/4] Capturing Live /studio workspace with 7-Day Trend Radar and Book Studio buttons...");
  await page.goto(BASE_URL + '/studio', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1500);
  await page.screenshot({ path: path.join(outputDir, '01_live_studio_workspace.png') });

  // 2. Open 7-Day Trend Radar Modal
  console.log("📸 [2/4] Clicking '🔮 7-Day Trend Radar' button...");
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Trend Radar')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);
    await page.screenshot({ path: path.join(outputDir, '02_live_trend_radar_modal.png') });

    // Close modal
    const closeBtns = await page.$$('button');
    for (const btn of closeBtns) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text === '✕') {
        await btn.click();
        break;
      }
    }
    await sleep(500);
  } catch (e) {
    console.error("Error opening Trend Radar modal:", e.message);
  }

  // 3. Open Original Book Studio Modal
  console.log("📸 [3/4] Clicking '📚 Book Studio' button...");
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Book Studio')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);
    await page.screenshot({ path: path.join(outputDir, '03_live_book_studio_modal.png') });

    // Switch to Chapter Prose Reader Tab
    const tabBtns = await page.$$('button');
    for (const btn of tabBtns) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Chapter Prose Reader')) {
        await btn.click();
        break;
      }
    }
    await sleep(800);
    await page.screenshot({ path: path.join(outputDir, '04_live_book_prose_reader.png') });

    // Close modal
    const closeBtns = await page.$$('button');
    for (const btn of closeBtns) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text === '✕') {
        await btn.click();
        break;
      }
    }
    await sleep(500);
  } catch (e) {
    console.error("Error opening Book Studio modal:", e.message);
  }

  // 4. Dopamine Split-Screen Modal
  console.log("📸 [4/4] Clicking '🎮 Dopamine' button...");
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Dopamine')) {
        await btn.click();
        break;
      }
    }
    await sleep(800);
    await page.screenshot({ path: path.join(outputDir, '05_live_dopamine_modal.png') });
  } catch (e) {
    console.error("Error opening Dopamine modal:", e.message);
  }

  await browser.close();
  console.log("✅ Remote Headless Puppeteer Capture Complete on Cloudtop!");
})();
`;

  const tmpScriptPath = '/tmp/local_run_capture_new_features.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring runner script to Cloudtop...");
  execSync(`scp -o BatchMode=yes ${tmpScriptPath} nitinagga.c.googlers.com:/tmp/run_capture_new_features.js`);

  console.log("⚡ Executing Headless Puppeteer Suite on Cloudtop...");
  const stdout = execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/run_capture_new_features.js"`, { encoding: 'utf8' });
  console.log(stdout);

  console.log("📥 Transferring physical screenshots via tar stream...");
  execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "tar -czf - -C /tmp/cloudtop_live_features_shots ." | tar -xzf - -C ${localOutputDir}/`);

  console.log(`\n🎉 Physical Screenshots Downloaded to ${localOutputDir}:`);
  const files = fs.readdirSync(localOutputDir).filter(f => f.endsWith('.png')).sort();
  for (const f of files) {
    console.log(`  ✓ [${f}](file://${path.join(localOutputDir, f)})`);
  }
}

main().catch(console.error);
