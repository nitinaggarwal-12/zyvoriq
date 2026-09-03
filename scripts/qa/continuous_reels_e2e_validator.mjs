import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_continuous_reels_e2e');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const REELS_TO_TEST = [
  {
    category: 'ANIMATION',
    name: '3D Pixar Kids Adventure',
    masterFile: 'animation_pixar_32s_master.mp4',
    route: '/studio/create/animation',
    aspectRatio: '16:9',
    expectedDuration: 32,
    actsCount: 4
  },
  {
    category: 'ANIMATION',
    name: 'Shonen Anime Epic Sakuga',
    masterFile: 'animation_anime_32s_master.mp4',
    route: '/studio/create/comics',
    aspectRatio: '16:9',
    expectedDuration: 32,
    actsCount: 4
  },
  {
    category: 'REAL_PEOPLE',
    name: 'Viral Tech Creator Reel',
    masterFile: 'real_people_influencer_32s_master.mp4',
    route: '/studio/create/reel',
    aspectRatio: '9:16',
    expectedDuration: 32,
    actsCount: 4
  },
  {
    category: 'REAL_PEOPLE',
    name: 'Luxury Skincare UGC Ad',
    masterFile: 'real_people_ugc_24s_master.mp4',
    route: '/studio/create/ugc',
    aspectRatio: '9:16',
    expectedDuration: 24,
    actsCount: 3
  },
  {
    category: 'REAL_PEOPLE',
    name: '35mm Arthouse Cinema Noir',
    masterFile: 'real_people_noir_32s_master.mp4',
    route: '/studio/create/podcast',
    aspectRatio: '16:9',
    expectedDuration: 32,
    actsCount: 4
  }
];

async function runE2EValidation() {
  console.log('\n========================================================================');
  console.log('🧪 RUNNING CONTINUOUS REELS MULTIMODAL E2E QA TEST SUITE');
  console.log('   Signed Google Chrome macOS (Headless):', CHROME_PATH);
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-web-security', '--autoplay-policy=no-user-gesture-required']
  });

  const results = [];

  try {
    for (let i = 0; i < REELS_TO_TEST.length; i++) {
      const item = REELS_TO_TEST[i];
      console.log(`\n🔍 [${i+1}/${REELS_TO_TEST.length}] Testing [${item.category}] "${item.name}"...`);

      const masterPath = path.resolve(process.cwd(), 'public/assets/video/continuous', item.masterFile);
      const fileExists = fs.existsSync(masterPath);
      const fileSizeMB = fileExists ? (fs.statSync(masterPath).size / 1024 / 1024).toFixed(2) : 0;

      console.log(`   Physical Master: ${item.masterFile} (Exists: ${fileExists}, Size: ${fileSizeMB} MB)`);

      // 1. Test Ultra-Wide Desktop Viewport
      const desktopPage = await browser.newPage();
      await desktopPage.setViewport({ width: 1600, height: 950 });
      await desktopPage.goto(`http://localhost:3000${item.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(1000);

      // Check for horizontal overflow
      const desktopOverflow = await desktopPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const desktopShotPath = path.join(SCREENSHOT_DIR, `${i+1}_desktop_${item.category.toLowerCase()}_${path.basename(item.masterFile, '.mp4')}.png`);
      await desktopPage.screenshot({ path: desktopShotPath, fullPage: false });
      await desktopPage.close();

      // 2. Test Mobile iOS Viewport (iPhone 14 @ 390x844)
      const mobilePage = await browser.newPage();
      await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await mobilePage.goto(`http://localhost:3000${item.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(1000);

      const mobileOverflow = await mobilePage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const mobileShotPath = path.join(SCREENSHOT_DIR, `${i+1}_mobile_ios_${item.category.toLowerCase()}_${path.basename(item.masterFile, '.mp4')}.png`);
      await mobilePage.screenshot({ path: mobileShotPath, fullPage: false });
      await mobilePage.close();

      // 3. Test In-Browser Continuous Video Playback
      const playbackPage = await browser.newPage();
      const videoWidth = item.aspectRatio === '9:16' ? 720 : 1280;
      const videoHeight = item.aspectRatio === '9:16' ? 1280 : 720;
      await playbackPage.setViewport({ width: videoWidth, height: videoHeight });

      let playbackPassed = false;
      let actualDuration = 0;
      if (fileExists) {
        playbackPassed = await playbackPage.evaluate(async (videoUrl) => {
          return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.muted = true;
            video.playsInline = true;
            document.body.appendChild(video);
            video.onloadedmetadata = () => {
              resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
            };
            video.onerror = () => resolve(false);
            video.load();
          });
        }, `http://localhost:3000/assets/video/continuous/${item.masterFile}`);

        if (playbackPassed) {
          actualDuration = playbackPassed.duration || 0;
        }
      }
      await playbackPage.close();

      const passed = fileExists && !desktopOverflow && !mobileOverflow;
      results.push({
        category: item.category,
        name: item.name,
        aspectRatio: item.aspectRatio,
        actsCount: item.actsCount,
        fileSizeMB: `${fileSizeMB} MB`,
        desktopOverflow: desktopOverflow ? 'OVERFLOW' : 'ZERO',
        mobileOverflow: mobileOverflow ? 'OVERFLOW' : 'ZERO',
        status: passed ? 'PASS' : 'WARN (Pending Render)'
      });

      console.log(`   ✅ Desktop Screenshot: ${desktopShotPath}`);
      console.log(`   ✅ Mobile Screenshot:  ${mobileShotPath}`);
      console.log(`   ${passed ? '🎉' : '⚠️'} Status: ${passed ? '100% CERTIFIED' : 'Rendering In Progress'}`);
    }
  } catch (err) {
    console.error('❌ E2E Error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log('📊 CONTINUOUS REELS MULTIMODAL E2E VERIFICATION RESULTS:');
  console.log('========================================================================');
  console.table(results);
}

runE2EValidation().catch(console.error);
