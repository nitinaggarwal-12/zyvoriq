const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 REGENERATING & AUDITING ALL 12 E2E CONTENT TYPES ON CLOUDTOP");
  console.log("   Host: nitinagga.c.googlers.com (Cloudtop Linux)");
  console.log("   Viewport: 1600x1000 Ultra-Wide Desktop Viewport");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '../..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'cloudtop_e2e_content_audit');
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }

  // Cloudtop Headless Chrome Runner
  const remoteScript = `
const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const outputDir = '/tmp/cloudtop_e2e_audit_shots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🚀 Initializing Cloudtop Headless Chrome (1600x1000)...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
  const BASE_URL = 'https://zyvoriq.up.railway.app';

  const auditTelemetry = [];

  // Helper function to inspect layout telemetry
  async function auditView(id, title) {
    return await page.evaluate((id, title) => {
      const mainContainer = document.querySelector('main') || document.body;
      const rect = mainContainer.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const containerWidth = rect.width;
      const marginRatio = ((viewportWidth - containerWidth) / viewportWidth);
      const isHorizontalOverflow = document.documentElement.scrollWidth > viewportWidth;
      
      const buttons = document.querySelectorAll('button');
      const textNodes = document.body.innerText || '';

      return {
        id,
        title,
        viewportWidth,
        containerWidth: Math.round(containerWidth),
        marginRatio: (marginRatio * 100).toFixed(1) + '%',
        gutterWaste: marginRatio > 0.3 ? 'HIGH' : marginRatio > 0.15 ? 'MEDIUM' : 'LOW',
        buttonCount: buttons.length,
        textLength: textNodes.length,
        hasOverflow: isHorizontalOverflow
      };
    }, id, title);
  }

  // =========================================================================
  // 1. Content Type 1: Anime Cinema Master Stage & 4-Track Spatial Mixer
  // =========================================================================
  console.log("[1/12] Generating Content Type 1: Anime Cinema & 4-Track Spatial Mixer...");
  await page.goto(BASE_URL + '/studio', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.evaluate(() => {
    window.scrollTo({ top: 400, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '01_anime_cinema_4track_mixer.png') });
  auditTelemetry.push(await auditView('01_anime_cinema_4track_mixer', 'Anime Cinema Master Stage & 4-Track Mixer'));

  // =========================================================================
  // 2. Content Type 2: 2099 Cyberpunk Synthwave Beat Lab (Creator Hub)
  // =========================================================================
  console.log("[2/12] Generating Content Type 2: 2099 Cyberpunk Synthwave Beat Lab...");
  await page.goto(BASE_URL + '/studio/create', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  // Select Cyberpunk Beat Lab
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button, div[role="button"], div.cursor-pointer'));
    const beatLab = cards.find(c => (c.innerText || '').includes('2099 Cyberpunk Synthwave'));
    if (beatLab) beatLab.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '02_cyberpunk_synthwave_creator.png') });
  auditTelemetry.push(await auditView('02_cyberpunk_synthwave_creator', '2099 Cyberpunk Synthwave Beat Lab'));

  // =========================================================================
  // 3. Content Type 3: 4-Shot Imagen 3 Pre-Vis Storyboard Modal
  // =========================================================================
  console.log("[3/12] Generating Content Type 3: 4-Shot Imagen 3 Pre-Vis Storyboard Modal...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const previsBtn = buttons.find(b => (b.innerText || '').includes('Pre-Vis Storyboard') || (b.innerText || '').includes('Generate 4-Shot'));
    if (previsBtn) previsBtn.click();
  });
  await sleep(2500); // Diffusion render animation delay
  await page.screenshot({ path: path.join(outputDir, '03_previs_storyboard_modal.png') });
  auditTelemetry.push(await auditView('03_previs_storyboard_modal', '4-Shot Pre-Vis Storyboard Modal'));

  // Close modal
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const closeBtn = closeBtns.find(b => (b.innerText || '').includes('✕') || (b.innerText || '').includes('Close') || (b.innerText || '').includes('Confirm'));
    if (closeBtn) closeBtn.click();
  });
  await sleep(600);

  // =========================================================================
  // 4. Content Type 4: Nexus Arena Esports Championship & Vertical 9:16 Mode
  // =========================================================================
  console.log("[4/12] Generating Content Type 4: Esports Championship (9:16 Vertical)...");
  await page.evaluate(() => {
    // Select 9:16 Vertical
    const buttons = Array.from(document.querySelectorAll('button'));
    const verticalBtn = buttons.find(b => (b.innerText || '').includes('9:16'));
    if (verticalBtn) verticalBtn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '04_esports_vertical_aspect.png') });
  auditTelemetry.push(await auditView('04_esports_vertical_aspect', 'Nexus Arena Esports Championship (9:16 Vertical)'));

  // =========================================================================
  // 5. Content Type 5: Autonomous Director Swarm DAG & Inpainting Canvas
  // =========================================================================
  console.log("[5/12] Generating Content Type 5: Director Inpainting Canvas & Takes...");
  await page.goto(BASE_URL + '/director', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1200);
  await page.evaluate(() => {
    window.scrollTo({ top: 260, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '05_director_inpainting_swarm.png') });
  auditTelemetry.push(await auditView('05_director_inpainting_swarm', 'Autonomous Director Inpainting & Swarm'));

  // =========================================================================
  // 6. Content Type 6: 30s Neural Voice Clone Vault (Record State & Formants)
  // =========================================================================
  console.log("[6/12] Generating Content Type 6: 30s Neural Voice Clone Vault...");
  await page.goto(BASE_URL + '/studio/avatars', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const vaultTab = tabs.find(t => (t.innerText || '').includes('Voice Clone Vault') || (t.innerText || '').includes('30s'));
    if (vaultTab) vaultTab.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outputDir, '06_voice_clone_vault_active.png') });
  auditTelemetry.push(await auditView('06_voice_clone_vault_active', '30s Neural Voice Clone Vault'));

  // =========================================================================
  // 7. Content Type 7: 30-Language Multilingual Dubbing Matrix
  // =========================================================================
  console.log("[7/12] Generating Content Type 7: 30-Language Multilingual Dubbing Matrix...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const dubTab = tabs.find(t => (t.innerText || '').includes('Dubbing Matrix') || (t.innerText || '').includes('30-Language'));
    if (dubTab) dubTab.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outputDir, '07_multilingual_dubbing_grid.png') });
  auditTelemetry.push(await auditView('07_multilingual_dubbing_grid', '30-Language Multilingual Dubbing Matrix'));

  // =========================================================================
  // 8. Content Type 8: DeepMind SynthID 24x24 Latent Frequency Spectrum Heatmap
  // =========================================================================
  console.log("[8/12] Generating Content Type 8: SynthID Latent Frequency Heatmap...");
  await page.goto(BASE_URL + '/veritas', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1200);
  await page.evaluate(() => {
    window.scrollTo({ top: 380, behavior: 'instant' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '08_synthid_latent_heatmap_grid.png') });
  auditTelemetry.push(await auditView('08_synthid_latent_heatmap_grid', 'DeepMind SynthID Latent Heatmap'));

  // =========================================================================
  // 9. Content Type 9: True Crime & Forensic Noir (Cultural Transmutation)
  // =========================================================================
  console.log("[9/12] Generating Content Type 9: True Crime Art Heist & Transmutation...");
  await page.goto(BASE_URL + '/studio/create', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.evaluate(() => {
    const flags = Array.from(document.querySelectorAll('button'));
    const mexicoFlag = flags.find(f => (f.innerText || '').includes('Mexico') || (f.innerText || '').includes('🇲🇽'));
    if (mexicoFlag) mexicoFlag.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '09_true_crime_transmutation.png') });
  auditTelemetry.push(await auditView('09_true_crime_transmutation', 'True Crime & Cultural Transmutation'));

  // =========================================================================
  // 10. Content Type 10: Michelin-Star Wagyu Culinary Arts
  // =========================================================================
  console.log("[10/12] Generating Content Type 10: Michelin Wagyu Culinary Masterclass...");
  await page.evaluate(() => {
    // Select Lifestyle & Living cluster
    const tabs = Array.from(document.querySelectorAll('button'));
    const lifestyleTab = tabs.find(t => (t.innerText || '').includes('Lifestyle') || (t.innerText || '').includes('Living'));
    if (lifestyleTab) lifestyleTab.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '10_michelin_wagyu_culinary_hub.png') });
  auditTelemetry.push(await auditView('10_michelin_wagyu_culinary_hub', 'Michelin Wagyu Culinary Masterclass'));

  // =========================================================================
  // 11. Content Type 11: Quantum Computing & Enterprise Science Cluster
  // =========================================================================
  console.log("[11/12] Generating Content Type 11: Quantum Computing & Enterprise Science...");
  await page.evaluate(() => {
    // Select Knowledge & Enterprise cluster
    const tabs = Array.from(document.querySelectorAll('button'));
    const scienceTab = tabs.find(t => (t.innerText || '').includes('Knowledge') || (t.innerText || '').includes('Enterprise') || (t.innerText || '').includes('Science'));
    if (scienceTab) scienceTab.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outputDir, '11_quantum_science_hub.png') });
  auditTelemetry.push(await auditView('11_quantum_science_hub', 'Quantum Science & Enterprise Cluster'));

  // =========================================================================
  // 12. Content Type 12: Production History & Master Act Timeline
  // =========================================================================
  console.log("[12/12] Generating Content Type 12: Production History Timeline...");
  await page.goto(BASE_URL + '/studio/history', { waitUntil: 'networkidle2', timeout: 35000 });
  await sleep(1000);
  await page.screenshot({ path: path.join(outputDir, '12_production_history_layout.png') });
  auditTelemetry.push(await auditView('12_production_history_layout', 'Production History Timeline'));

  await browser.close();
  console.log("🎉 All 12 E2E Content Types Rendered & Audited on Cloudtop!");

  fs.writeFileSync('/tmp/cloudtop_e2e_audit_shots/telemetry.json', JSON.stringify(auditTelemetry, null, 2));
})();
`;

  const tmpScriptPath = '/tmp/regenerate_and_audit_runner.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring E2E audit runner script to Cloudtop...");
  execSync(`scp -o BatchMode=yes ${tmpScriptPath} nitinagga.c.googlers.com:/tmp/regenerate_and_audit_runner.js`);

  console.log("⚡ Executing 12-Content Type E2E Generation Run on Cloudtop...");
  const stdout = execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/regenerate_and_audit_runner.js"`, { encoding: 'utf8' });
  console.log(stdout);

  console.log("📥 Transferring all 12 screenshots and telemetry from Cloudtop via tar stream...");
  execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "tar -czf - -C /tmp/cloudtop_e2e_audit_shots ." | tar -xzf - -C ${localOutputDir}/`);

  console.log("\n================================================================================");
  console.log("🎉 ALL 12 E2E OUTPUT SCREENSHOTS STORED IN WORKSPACE!");
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
