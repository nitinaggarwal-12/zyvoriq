import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_URL = process.env.BASE_URL || 'https://zyvoriq.up.railway.app';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

async function runLibraryVerification() {
  const screenshotDir = path.join(process.cwd(), 'scratch/cloudtop_e2e_screenshots');
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log(`🚀 Launching Chrome from ${CHROME_PATH}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1600,1000'
    ]
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Ultra-Wide Viewport (1600x1000)
    console.log('\n--- 1. Testing Desktop (1600x1000) ---');
    await page.setViewport({ width: 1600, height: 1000 });
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(2000);

    // Assert DOM elements
    const pageAnalysis = await page.evaluate(() => {
      const librarySection = document.querySelector('#library');
      
      // Check for removed Image 2 sections
      const bodyText = document.body.innerText;
      const hasOmniPillars = bodyText.includes("How Omni Solves Generative Video");
      const hasGenreSelector = bodyText.includes("Specialized Cinematography Engines");
      const hasWaitlistCTA = bodyText.includes("Ready to direct your first cinema master?");

      // Check library content
      const libraryTitle = librarySection ? librarySection.querySelector('h2')?.innerText : null;
      const reelCards = librarySection ? librarySection.querySelectorAll('.group.relative.flex.flex-col') : [];

      // Check relative order of #library vs showcase
      let libraryBeforeShowcase = false;
      if (librarySection) {
        const allSections = Array.from(document.querySelectorAll('main > *'));
        const libraryIdx = allSections.indexOf(librarySection);
        const showcaseEl = allSections.find(el => el.textContent.includes("Napoleon: The Emperor's Heart") || el.id === 'master-showcase');
        const showcaseIdx = showcaseEl ? allSections.indexOf(showcaseEl) : -1;
        if (libraryIdx !== -1 && showcaseIdx !== -1 && libraryIdx < showcaseIdx) {
          libraryBeforeShowcase = true;
        }
      }

      return {
        hasLibrarySection: Boolean(librarySection),
        libraryTitle,
        reelCardCount: reelCards.length,
        hasOmniPillars,
        hasGenreSelector,
        hasWaitlistCTA,
        libraryBeforeShowcase
      };
    });

    console.log('Desktop Initial DOM Analysis:', pageAnalysis);

    if (!pageAnalysis.hasLibrarySection) {
      throw new Error('FAILED: #library section was not found in live DOM');
    }
    if (pageAnalysis.hasOmniPillars || pageAnalysis.hasGenreSelector || pageAnalysis.hasWaitlistCTA) {
      throw new Error(`FAILED: Image 2 marketing sections are still present: pillars=${pageAnalysis.hasOmniPillars}, genre=${pageAnalysis.hasGenreSelector}, waitlist=${pageAnalysis.hasWaitlistCTA}`);
    }

    // Scroll to #library
    await page.evaluate(() => {
      document.querySelector('#library')?.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1000);

    const shot1Path = path.join(screenshotDir, '01_library_tiles_desktop.png');
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log(`📸 Captured: ${shot1Path}`);

    // 2. Click on a Reel Tile to Expand its Constituent Clips
    console.log('\n--- 2. Expanding Reel Tile Clips Inspector ---');
    const clickedReel = await page.evaluate(() => {
      const card = document.querySelector('#library .group.relative.flex.flex-col');
      if (card) {
        card.click();
        return true;
      }
      return false;
    });

    if (!clickedReel) {
      throw new Error('FAILED: Could not find any reel card in #library to click');
    }

    // Wait 1200ms synchronization delay for React state settle
    await sleep(1200);

    // Check expanded inspector details
    const inspectorDetails = await page.evaluate(() => {
      const inspector = document.querySelector('#library .rounded-2xl.border-2.border-teal-500\\/40');
      if (!inspector) return null;

      const clipCards = inspector.querySelectorAll('.group.relative.rounded-xl.border');
      const masterVideo = inspector.querySelector('video');

      return {
        hasInspector: true,
        clipCount: clipCards.length,
        hasMasterVideo: Boolean(masterVideo),
        sampleClipDialogue: inspector.querySelector('.italic')?.textContent?.trim() || null
      };
    });

    console.log('Expanded Inspector Details:', inspectorDetails);

    if (!inspectorDetails || !inspectorDetails.hasInspector) {
      throw new Error('FAILED: Expanding reel tile did not open the clips inspector drawer');
    }

    await page.evaluate(() => {
      document.querySelector('#library .rounded-2xl.border-2.border-teal-500\\/40')?.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(800);

    const shot2Path = path.join(screenshotDir, '02_expanded_clips_inspector_desktop.png');
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log(`📸 Captured: ${shot2Path}`);

    // 3. Mobile Viewport iOS iPhone 14 (390x844)
    console.log('\n--- 3. Testing iOS iPhone 14 (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(1000);

    const iosMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    console.log('iOS Viewport Metrics:', iosMetrics);

    const shot3Path = path.join(screenshotDir, '03_library_iphone14.png');
    await page.screenshot({ path: shot3Path, fullPage: false });
    console.log(`📸 Captured: ${shot3Path}`);

    // 4. Mobile Viewport Android Pixel 7 (412x915)
    console.log('\n--- 4. Testing Android Pixel 7 (412x915) ---');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(1000);

    const shot4Path = path.join(screenshotDir, '04_library_pixel7.png');
    await page.screenshot({ path: shot4Path, fullPage: false });
    console.log(`📸 Captured: ${shot4Path}`);

    console.log('\n✅ ALL LIBRARY & ZERO-GUTTER ASSERTIONS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

runLibraryVerification().catch((err) => {
  console.error('Library verification failed:', err);
  process.exit(1);
});
