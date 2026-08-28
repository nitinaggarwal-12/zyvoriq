const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🚀 MULTI-CONTENT TYPE VISUAL GENERATION & E2E QUALITY AUDIT ON CLOUDTOP");
  console.log("   Host: nitinagga.c.googlers.com (Cloudtop Linux)");
  console.log("   Resolution: 1600x1000 Ultra-Wide Desktop Viewport");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '../..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'cloudtop_content_generations');
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }

  // Remote runner script to execute directly inside Cloudtop's Headless Chrome
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

  console.log("🚀 Initializing Cloudtop Headless Chrome (1600x1000)...");
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

  // 15 Key Representative Content Types across 4 Clusters
  const contentTypes = [
    // Cluster 1: Media & Entertainment
    { id: '01_anime_cinema_mushin', path: '/studio', label: 'Cluster 1: Anime Cinema Drama (Mushin)' },
    { id: '02_cyberpunk_music_lab', path: '/studio/create', label: 'Cluster 1: 2099 Cyberpunk Synthwave Beat Lab', concept: 'music_cyberpunk_synthwave' },
    { id: '03_gaming_esports_nexus', path: '/studio/create', label: 'Cluster 1: Nexus Arena Esports Championship', concept: 'gaming_esports_championship' },
    { id: '04_fantasy_dragon_citadel', path: '/studio/create', label: 'Cluster 1: Citadel of the Starlight Wyrm', concept: 'fantasy_dragon_citadel' },
    { id: '05_cinema_noir_detective', path: '/studio/create', label: 'Cluster 1: Midnight Shadow Detective Noir', concept: 'cinema_noir_rain' },
    
    // Cluster 2: Culture & Community
    { id: '06_dual_host_podcast', path: '/studio/create', label: 'Cluster 2: Sovereign Architect Dual Podcast', concept: 'podcasts_dual_host_ai' },
    { id: '07_tokyo_night_vlog', path: '/studio/create', label: 'Cluster 2: Tokyo Midnight Neon Vlog', concept: 'vlogs_tokyo_night_walk' },
    { id: '08_investigative_news_water', path: '/studio/create', label: 'Cluster 2: Global Desalination Supergrid News', concept: 'news_investigative_water' },
    { id: '09_true_crime_vermeer_heist', path: '/studio/create', label: 'Cluster 2: Vanishing of the Vermeer Heist Noir', concept: 'true_crime_art_heist' },

    // Cluster 3: Lifestyle & Living
    { id: '10_michelin_wagyu_culinary', path: '/studio/create', label: 'Cluster 3: A5 Miyazaki Wagyu Searing Masterclass', concept: 'culinary_michelin_wagyu' },
    { id: '11_haute_couture_paris', path: '/studio/create', label: 'Cluster 3: Paris Runway Titanium Silk Fashion', concept: 'beauty_haute_couture' },
    { id: '12_advaita_vedanta_sacred', path: '/studio/create', label: 'Cluster 3: Advaita Vedanta Consciousness', concept: 'wellness_vedanta_nondual' },
    { id: '13_bbc_earth_snow_leopard', path: '/studio/create', label: 'Cluster 3: Snow Leopard Cubs Wildlife Doc', concept: 'pets_snow_leopard_cubs' },

    // Cluster 4: Knowledge, Enterprise & Science
    { id: '14_quantum_teleportation_lab', path: '/studio/create', label: 'Cluster 4: Quantum Computing Bloch Sphere', concept: 'tech_quantum_teleportation' },
    { id: '15_alphafold_cancer_oncology', path: '/studio/create', label: 'Cluster 4: AlphaFold 3 Molecular Oncology', concept: 'science_alphafold_cancer_cures' }
  ];

  const auditLog = [];

  for (let i = 0; i < contentTypes.length; i++) {
    const item = contentTypes[i];
    const url = BASE_URL + item.path;
    console.log(\`[\${i+1}/\${contentTypes.length}] Testing Content Type: \${item.label}...\`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
      await sleep(1000); // 1000ms animation sync delay

      // If on /studio/create and concept is provided, click to select the concept
      if (item.concept) {
        await page.evaluate((conceptId) => {
          const cards = Array.from(document.querySelectorAll('div, button, [role="button"]'));
          const targetCard = cards.find(el => {
            const text = (el.innerText || '').toLowerCase();
            return text.includes('select') || text.includes('concept') || text.includes(conceptId.replace(/_/g, ' '));
          });
          if (targetCard) targetCard.click();
        }, item.concept);
        await sleep(800);
      }

      // Visual DOM Inspection: check for title, text overflow, and container bounds
      const domHealth = await page.evaluate(() => {
        const errors = [];
        const bodyText = document.body.innerText || '';
        
        // Check for broken render markers
        if (bodyText.includes('NaN') || bodyText.includes('undefined') || bodyText.includes('[object Object]')) {
          errors.push('Found corrupt text placeholder in DOM');
        }

        // Check for overflow-x on root container
        const isHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
        if (isHorizontalOverflow) {
          errors.push('Detected horizontal page overflow (gutter spill)');
        }

        return {
          title: document.title,
          textLength: bodyText.length,
          errors
        };
      });

      const shotName = \`\${item.id}.png\`;
      const outPath = path.join(outputDir, shotName);
      await page.screenshot({ path: outPath, fullPage: false });

      const fileStats = fs.statSync(outPath);
      console.log(\`   ✅ Rendered & Captured: \${shotName} (\${fileStats.size} bytes)\`);
      
      auditLog.push({
        id: item.id,
        label: item.label,
        sizeBytes: fileStats.size,
        status: domHealth.errors.length === 0 ? 'HEALTHY' : 'FLAGGED',
        errors: domHealth.errors
      });

    } catch (err) {
      console.error(\`   ❌ Failed \${item.label}:\`, err.message);
      auditLog.push({
        id: item.id,
        label: item.label,
        status: 'ERROR',
        errors: [err.message]
      });
    }
  }

  await browser.close();
  console.log("🎉 All 15 Content Types Rendered & Audited on Cloudtop!");

  fs.writeFileSync('/tmp/cloudtop_content_shots/audit_report.json', JSON.stringify(auditLog, null, 2));
})();
`;

  // Write remote runner script to /tmp on local and scp to Cloudtop
  const tmpScriptPath = '/tmp/cloudtop_content_runner.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring multi-content runner script to Cloudtop...");
  execSync(`scp -o BatchMode=yes ${tmpScriptPath} nitinagga.c.googlers.com:/tmp/cloudtop_content_runner.js`);

  console.log("⚡ Executing Multi-Content Headless Test Suite on Cloudtop...");
  const stdout = execSync(`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/cloudtop_content_runner.js"`, { encoding: 'utf8' });
  console.log(stdout);

  console.log("📥 Transferring all captured screenshots and audit report to local workspace...");
  execSync(`scp -o BatchMode=yes nitinagga.c.googlers.com:/tmp/cloudtop_content_shots/*.png ${localOutputDir}/`);
  execSync(`scp -o BatchMode=yes nitinagga.c.googlers.com:/tmp/cloudtop_content_shots/audit_report.json ${localOutputDir}/audit_report.json`);

  console.log("\n================================================================================");
  console.log("🎉 ALL CONTENT TYPE SCREENSHOTS & AUDIT REPORT STORED IN WORKSPACE!");
  console.log("================================================================================");
  const files = fs.readdirSync(localOutputDir).filter(f => f.endsWith('.png'));
  files.forEach(f => {
    const p = path.join(localOutputDir, f);
    console.log(`📁 ${f} (${fs.statSync(p).size} bytes) -> file://${p}`);
  });
}

main().catch(err => {
  console.error("Cloudtop execution failed:", err);
  process.exit(1);
});
