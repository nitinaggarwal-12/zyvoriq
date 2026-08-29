const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 EXECUTING CLOUDTOP VERIFICATION FOR MULTI-CATEGORY CONTENT & HISTORY");
  console.log("   Target Host: nitinagga.c.googlers.com");
  console.log("   Viewport: 1600x1000 Ultra-Wide Desktop (Headless 'new')");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'cloudtop_e2e_screenshots');
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }

  const scriptContent = `
const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const outputDir = '/tmp/cloudtop_history_screenshots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Launching Headless Chrome on Cloudtop (1600x1000)...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  const BASE_URL = process.env.BASE_URL || 'https://zyvoriq.up.railway.app';

  const targets = [
    { name: '01_history_multi_category_runs.png', path: '/studio/history', label: 'Multi-Category Production History & Filters' },
    { name: '02_library_all_categories_vault.png', path: '/studio/library', label: '16-Pillar Series Library & Media Vault' },
    { name: '03_production_monitor_live_job.png', path: '/studio/production/track_executive_sovereign', label: 'Executive Sovereign AI Production Monitor' },
    { name: '04_cinema_stage_with_master_track.png', path: '/studio?track=track_wildlife_serengeti_120s', label: 'Cinema Stage Serengeti 15-Act 120s Master' }
  ];

  for (const t of targets) {
    const url = BASE_URL + t.path;
    console.log("Capturing [" + t.label + "] at " + url + "...");
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(1500);

      const screenshotPath = path.join(outputDir, t.name);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log("Saved screenshot: " + t.name);
    } catch (err) {
      console.error("Failed to capture " + t.name + ": " + err.message);
    }
  }

  await browser.close();
  console.log("Cloudtop Headless Capture Run Complete!");
})();
`;

  const localTempScript = path.join(projectRoot, 'scratch', 'temp_remote_runner.js');
  fs.writeFileSync(localTempScript, scriptContent, 'utf8');

  try {
    console.log("📡 Copying script to Cloudtop...");
    execSync(`scp "${localTempScript}" nitinagga.c.googlers.com:/tmp/run_history_verify.js`);
    
    console.log("⚡ Executing runner on Cloudtop...");
    const stdout = execSync(`ssh nitinagga.c.googlers.com "node /tmp/run_history_verify.js"`, { encoding: 'utf8' });
    console.log(stdout);

    console.log("📥 Syncing physical screenshot artifacts to local workspace...");
    execSync(`scp nitinagga.c.googlers.com:/tmp/cloudtop_history_screenshots/* "${localOutputDir}/"`);
    
    console.log(`\n🎉 Physical screenshots successfully synced to: file://${localOutputDir}`);
  } catch (err) {
    console.warn("⚠️ Remote run status:", err.message);
  }
}

main().catch(console.error);
