const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 CAPTURING LIVE STUDIO UI & DYNAMIC PLAYER SCREENSHOTS ON CLOUDTOP");
  console.log("   Target Host: nitinagga.c.googlers.com");
  console.log("   Viewport: 1600x1000 Ultra-Wide Desktop");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'screenshots_studio_player');
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
  const outputDir = '/tmp/cloudtop_studio_player_shots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Launching Headless Chrome on Cloudtop...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  const BASE_URL = 'https://zyvoriq.up.railway.app';

  // 1. Studio Main Overview with Player
  console.log("📸 [1/4] Capturing /studio workspace with video monitor...");
  await page.goto(BASE_URL + '/studio', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1500);
  await page.screenshot({ path: path.join(outputDir, '01_studio_full_workspace.png') });

  // 2. Format & Auto-Zoom Tab
  console.log("📸 [2/4] Clicking 'Format' tab to capture Auto-Zoom presets...");
  try {
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await (await tab.getProperty('innerText')).jsonValue();
      if (text.includes('Format')) {
        await tab.click();
        break;
      }
    }
    await sleep(800);
    await page.screenshot({ path: path.join(outputDir, '02_studio_format_autozoom_tab.png') });
  } catch (e) { console.error(e); }

  // 3. Audio & Subtitles Tab
  console.log("📸 [3/4] Clicking 'Audio & Subtitles' tab...");
  try {
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await (await tab.getProperty('innerText')).jsonValue();
      if (text.includes('Audio & Subtitles')) {
        await tab.click();
        break;
      }
    }
    await sleep(800);
    await page.screenshot({ path: path.join(outputDir, '03_studio_audio_subtitles_tab.png') });
  } catch (e) { console.error(e); }

  // 4. Persona Vault Modal
  console.log("📸 [4/4] Opening Persona & Avatar Vault modal...");
  try {
    const cloneButtons = await page.$$('button');
    for (const btn of cloneButtons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Change / Clone')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);
    await page.screenshot({ path: path.join(outputDir, '04_persona_vault_modal.png') });
  } catch (e) { console.error(e); }

  await browser.close();
  console.log("Done remote capture.");
})();
`;

  const tmpScriptPath = '/tmp/local_run_studio_player_shots.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring runner script to Cloudtop...");
  execSync(`scp -o BatchMode=yes ${tmpScriptPath} nitinagga.c.googlers.com:/tmp/run_studio_player_shots.js`);

  console.log("⚡ Executing Capture Run on Cloudtop...");
  const stdout = execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/run_studio_player_shots.js"`, { encoding: 'utf8' });
  console.log(stdout);

  console.log("📥 Transferring screenshots via tar stream...");
  execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "tar -czf - -C /tmp/cloudtop_studio_player_shots ." | tar -xzf - -C ${localOutputDir}/`);

  console.log(`\n🎉 Screenshots copied to ${localOutputDir}:`);
  const files = fs.readdirSync(localOutputDir).filter(f => f.endsWith('.png')).sort();
  for (const f of files) {
    console.log(`  ✓ file://${path.join(localOutputDir, f)}`);
  }
}

main().catch(console.error);
