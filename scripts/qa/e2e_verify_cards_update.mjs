import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_cards_update');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('🎬 Running E2E Verification for Cards Update on Cloudtop...');

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    console.log('Navigating to http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    // Assert video sources for Music Video and Feature Films
    const musicVideoCardVideo = await page.$eval('[data-testid="card-format-music_video"] video', (el) => el.src);
    console.log(`Music Video Card Video: ${musicVideoCardVideo}`);
    if (!musicVideoCardVideo.includes('yt_5d8d946f-2528-4c23-9f4f-d9c1c960a069')) {
      throw new Error(`Expected Music Video to have yt_5d8d946f-2528-4c23-9f4f-d9c1c960a069, got: ${musicVideoCardVideo}`);
    }

    const featureFilmsCardVideo = await page.$eval('[data-testid="card-format-feature_films"] video', (el) => el.src);
    console.log(`Feature Films Card Video: ${featureFilmsCardVideo}`);
    if (!featureFilmsCardVideo.includes('napoleon_180s_master.mp4')) {
      throw new Error(`Expected Feature Films to have napoleon_180s_master.mp4, got: ${featureFilmsCardVideo}`);
    }

    // Scroll to 3 format cards
    await page.evaluate(() => {
      const section = document.querySelector('[aria-label="Production Formats"]');
      if (section) section.scrollIntoView();
    });
    await sleep(800);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01_cards_updated_overview.png'),
      fullPage: false,
    });
    console.log('📸 Saved 01_cards_updated_overview.png');

    // Click on Feature Films Card to view sandbox
    console.log('Clicking Feature Films card to verify sandbox hydration...');
    await page.click('[data-testid="card-format-feature_films"]');
    await sleep(800);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02_feature_films_sandbox_napoleon.png'),
      fullPage: false,
    });
    console.log('📸 Saved 02_feature_films_sandbox_napoleon.png');

    // Navigate to /feature-films
    console.log('Navigating to http://localhost:3000/feature-films ...');
    await page.goto('http://localhost:3000/feature-films', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    const featureFilmPageVideo = await page.$eval('video', (el) => el.src);
    console.log(`Feature Films page video: ${featureFilmPageVideo}`);
    if (!featureFilmPageVideo.includes('napoleon_180s_master.mp4')) {
      throw new Error(`Expected /feature-films to feature napoleon_180s_master.mp4, got: ${featureFilmPageVideo}`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03_feature_films_studio_napoleon.png'),
      fullPage: false,
    });
    console.log('📸 Saved 03_feature_films_studio_napoleon.png');

    console.log('🎉 ALL CARD UPDATES VERIFIED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
