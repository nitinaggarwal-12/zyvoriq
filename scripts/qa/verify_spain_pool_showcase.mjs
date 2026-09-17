import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const SCRATCH_DIR = path.join(process.cwd(), 'scratch', 'screenshots_spain_pool');
const ARTIFACT_DIR = '/Users/nitinagga/.gemini/jetski/brain/c4f568bc-2709-495a-a8da-a9297cf7c39c';
fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop 1600x950
    await page.setViewport({ width: 1600, height: 950 });
    await page.goto('http://localhost:3000/swarm#spain-pool-english-pop-showcase', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await sleep(1000);
    await page.evaluate(() => {
      const el = document.getElementById('spain-pool-english-pop-showcase');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(800);

    const desktopShot = path.join(SCRATCH_DIR, '01_spain_pool_english_showcase_desktop.png');
    await page.screenshot({ path: desktopShot });
    fs.copyFileSync(desktopShot, path.join(ARTIFACT_DIR, '01_spain_pool_english_showcase_desktop.png'));
    console.log(`✅ Desktop screenshot saved: ${desktopShot}`);

    // 2. Mobile iOS 390x844
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.evaluate(() => {
      const el = document.getElementById('spain-pool-english-pop-showcase');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(800);

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    console.log(`📱 Mobile iOS horizontal overflow check (scrollWidth <= innerWidth): ${noOverflow}`);

    const mobileShot = path.join(SCRATCH_DIR, '02_spain_pool_english_showcase_ios_390x844.png');
    await page.screenshot({ path: mobileShot });
    fs.copyFileSync(mobileShot, path.join(ARTIFACT_DIR, '02_spain_pool_english_showcase_ios_390x844.png'));
    console.log(`✅ Mobile screenshot saved: ${mobileShot}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
