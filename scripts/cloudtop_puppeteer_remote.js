const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 EXECUTING REMOTE HEADLESS PUPPETEER PAIR PROGRAMMING ON CLOUDTOP");
  console.log("   Target Host: nitinagga.c.googlers.com");
  console.log("   Viewport: 1600x1000 Ultra-Wide Desktop (Headless 'new')");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'cloudtop_e2e_screenshots');
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }

  // 1. Prepare remote runner script on Cloudtop
  const remoteScript = `
const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const outputDir = '/tmp/cloudtop_portal_screenshots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🚀 Launching Headless Chrome on Cloudtop (1600x1000)...");
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

  const BASE_URL = 'https://zyvoriq.up.railway.app';

  const targets = [
    { name: '01_history_multi_category_runs.png', path: '/studio/history', label: 'Multi-Category Production History' },
    { name: '02_library_all_categories_vault.png', path: '/studio/library', label: '16-Pillar Series Library & Media Vault' },
    { name: '03_production_monitor_live_job.png', path: '/studio/production/track_executive_sovereign', label: 'Executive Sovereign AI Production Monitor' },
    { name: '04_cinema_stage_4track_mixer.png', path: '/studio?track=track_wildlife_serengeti_120s', label: 'Cinema Stage Serengeti 15-Act 120s Master' },
    { name: '05_creator_hub_24pillars_transmutation.png', path: '/studio/create', label: '24-Pillars Creator Hub' },
    { name: '06_director_canvas_inpainting.png', path: '/director', label: 'Director Canvas Inpainting' },
    { name: '07_avatars_studio_voice_vault.png', path: '/studio/avatars', label: 'Avatars Studio & Dubbing' },
    { name: '08_veritas_synthid_inspector.png', path: '/veritas', label: 'Veritas zk-SNARK & SynthID' }
  ];

  for (const t of targets) {
    const url = BASE_URL + t.path;
    console.log('📸 Navigating to [' + t.label + ']: ' + url);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
      await sleep(1500); // 1500ms sync settling delay
      const outPath = path.join(outputDir, t.name);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log('✅ Captured ' + t.name + ' (' + fs.statSync(outPath).size + ' bytes)');
    } catch (e) {
      console.error('❌ Failed ' + t.path + ': ' + e.message);
    }
  }

  await browser.close();
  console.log('🎉 Cloudtop Headless Capture Complete!');
})();
`;

  // Write remote script to /tmp on local and scp to Cloudtop
  const tmpScriptPath = '/tmp/cloudtop_capture_runner.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring runner script to Cloudtop...");
  execSync(`scp -o BatchMode=yes ${tmpScriptPath} nitinagga.c.googlers.com:/tmp/cloudtop_capture_runner.js`);

  console.log("⚡ Executing Headless Puppeteer on Cloudtop...");
  const stdout = execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/cloudtop_capture_runner.js"`, { encoding: 'utf8' });
  console.log(stdout);

  console.log("📥 Copying captured screenshots from Cloudtop to local workspace...");
  execSync(`scp -o BatchMode=yes nitinagga.c.googlers.com:/tmp/cloudtop_portal_screenshots/*.png ${localOutputDir}/`);

  console.log("\n================================================================================");
  console.log("🎉 ALL LIVE PHYSICAL SCREENSHOTS TRANSFERRED TO WORKSPACE!");
  console.log("================================================================================");
  const files = fs.readdirSync(localOutputDir);
  files.forEach(f => {
    const p = path.join(localOutputDir, f);
    console.log(`📁 ${f} (${fs.statSync(p).size} bytes) -> file://${p}`);
  });
}

main().catch(err => {
  console.error("Cloudtop execution failed:", err);
  process.exit(1);
});
