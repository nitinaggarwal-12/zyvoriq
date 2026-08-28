const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 CAPTURING DISTINCT LIVE VISUAL CONTENT OUTPUTS ACROSS ALL STUDIO SUITES");
  console.log("   Host: nitinagga.c.googlers.com (Cloudtop Linux)");
  console.log("   Viewport: 1600x1000 Ultra-Wide Desktop");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '../..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'cloudtop_content_generations');
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }

  // Puppeteer runner to execute on Cloudtop
  const remoteScript = `
const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const outputDir = '/tmp/cloudtop_content_shots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🚀 Launching Headless Chrome on Cloudtop...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
  const BASE_URL = 'https://zyvoriq.up.railway.app';

  // 1. Output 1: Cinema Master Stage & 4-Track Spatial Mixer
  console.log("[1/8] Capturing 4-Track Spatial Audio Mixer (/studio)...");
  await page.goto(BASE_URL + '/studio', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.evaluate(() => {
    window.scrollTo({ top: 450, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '01_cinema_stage_4track_mixer.png') });

  // 2. Output 2: 24-Pillar Creator Hub & Category Taxonomy
  console.log("[2/8] Capturing 24-Pillar Creator Hub (/studio/create)...");
  await page.goto(BASE_URL + '/studio/create', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.evaluate(() => {
    window.scrollTo({ top: 300, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '02_creator_hub_24pillars_taxonomy.png') });

  // 3. Output 3: 4-Shot Imagen 3 Pre-Vis Storyboard Modal
  console.log("[3/8] Triggering & Capturing 4-Shot Pre-Vis Storyboard Modal (/studio/create)...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const previsBtn = buttons.find(b => (b.innerText || '').includes('Pre-Vis Storyboard') || (b.innerText || '').includes('Generate 4-Shot'));
    if (previsBtn) {
      previsBtn.click();
    }
  });
  await sleep(2500); // Wait for modal animation and diffusion rendering
  await page.screenshot({ path: path.join(outputDir, '03_previs_storyboard_modal_output.png') });

  // 4. Output 4: Autonomous Director Swarm & Inpainting Canvas Editor
  console.log("[4/8] Capturing Director Inpainting Canvas & Candidate Takes (/director)...");
  await page.goto(BASE_URL + '/director', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1200);
  await page.evaluate(() => {
    window.scrollTo({ top: 250, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '04_director_inpainting_candidate_takes.png') });

  // 5. Output 5: 30s Neural Voice Clone Vault Tab
  console.log("[5/8] Capturing 30s Neural Voice Clone Vault (/studio/avatars)...");
  await page.goto(BASE_URL + '/studio/avatars', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const vaultTab = tabs.find(t => (t.innerText || '').includes('Voice Clone Vault') || (t.innerText || '').includes('30s'));
    if (vaultTab) vaultTab.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outputDir, '05_voice_clone_vault_formants.png') });

  // 6. Output 6: 30-Language Multilingual Dubbing Matrix Tab
  console.log("[6/8] Capturing 30-Language Multilingual Dubbing Matrix (/studio/avatars)...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const dubTab = tabs.find(t => (t.innerText || '').includes('Dubbing Matrix') || (t.innerText || '').includes('30-Language'));
    if (dubTab) dubTab.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outputDir, '06_multilingual_dubbing_matrix.png') });

  // 7. Output 7: DeepMind SynthID Latent Frequency Spectrum Heatmap
  console.log("[7/8] Capturing SynthID Latent Frequency Heatmap (/veritas)...");
  await page.goto(BASE_URL + '/veritas', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1200);
  await page.evaluate(() => {
    window.scrollTo({ top: 380, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '07_synthid_latent_frequency_heatmap.png') });

  // 8. Output 8: Production Act Stream Player & Telemetry
  console.log("[8/8] Capturing Production Act Stream Timeline (/studio/history)...");
  await page.goto(BASE_URL + '/studio/history', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.screenshot({ path: path.join(outputDir, '08_production_history_timeline.png') });

  await browser.close();
  console.log("🎉 All 8 Distinct Visual Outputs Successfully Captured on Cloudtop!");
})();
`;

  const tmpScriptPath = '/tmp/capture_distinct_outputs.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring runner script to Cloudtop...");
  execSync(`scp -o BatchMode=yes ${tmpScriptPath} nitinagga.c.googlers.com:/tmp/capture_distinct_outputs.js`);

  console.log("⚡ Executing Capture Run on Cloudtop...");
  const stdout = execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/capture_distinct_outputs.js"`, { encoding: 'utf8' });
  console.log(stdout);

  console.log("📥 Transferring all distinct output screenshots via tar stream...");
  execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "tar -czf - -C /tmp/cloudtop_content_shots ." | tar -xzf - -C ${localOutputDir}/`);

  console.log("\n================================================================================");
  console.log("🎉 ALL DISTINCT CONTENT OUTPUTS STORED IN WORKSPACE!");
  console.log("================================================================================");
  const files = fs.readdirSync(localOutputDir).filter(f => f.endsWith('.png')).sort();
  files.forEach(f => {
    const p = path.join(localOutputDir, f);
    console.log(`📁 ${f} (${fs.statSync(p).size} bytes) -> file://${p}`);
  });
}

main().catch(err => {
  console.error("Cloudtop execution failed:", err);
  process.exit(1);
});
