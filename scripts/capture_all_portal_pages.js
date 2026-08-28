const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const PAGES = [
  { name: '01_homepage.png', path: '/', label: 'Home Landing Portal' },
  { name: '02_studio_cinema.png', path: '/studio', label: 'Studio Cinema Master Stage' },
  { name: '03_studio_avatars.png', path: '/studio/avatars', label: 'Avatars & Cast Hub' },
  { name: '04_studio_create.png', path: '/studio/create', label: 'Dedicated Studio Creator Suite' },
  { name: '05_studio_library.png', path: '/studio/library', label: 'Media Vault & Series Library' },
  { name: '06_studio_history.png', path: '/studio/history', label: 'Production History & Run Timeline' },
  { name: '07_director_console.png', path: '/director', label: 'Autonomous Director Console' },
  { name: '08_veritas_qa.png', path: '/veritas', label: 'Veritas zk-SNARK Verification Hub' },
  { name: '09_governance.png', path: '/governance', label: 'Policy & Trust Governance Hub' },
  { name: '10_analytics_dashboard.png', path: '/dashboard', label: 'Executive Analytics & Telemetry' }
];

(async () => {
  const outputDir = '/tmp/screenshots_portal_audit';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🚀 Launching Cloudtop Puppeteer Browser (1600x1000 Viewport)...");
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

  for (const item of PAGES) {
    const targetUrl = `${BASE_URL}${item.path}`;
    console.log(`\n📸 Visiting [${item.label}]: ${targetUrl}...`);
    
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 35000 });
      await sleep(1500); // 1500ms sync settling delay for transitions and video canvas

      const filePath = path.join(outputDir, item.name);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✅ Captured ${item.name} (${fs.statSync(filePath).size} bytes)`);
    } catch (err) {
      console.error(`❌ Error capturing ${item.path}:`, err.message);
    }
  }

  await browser.close();
  console.log("\n🎉 All 10 portal pages successfully captured!");
})();
