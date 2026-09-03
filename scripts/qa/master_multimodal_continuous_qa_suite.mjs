import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_master_continuous_qa');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const CONTINUOUS_REELS_CATALOG = [
  // 1. BOLLYWOOD HINDI WEDDING (Real Multiple People)
  {
    category: 'BOLLYWOOD_WEDDING',
    name: 'Grand Family Wedding Sangeet Anthem',
    route: '/studio/create/music',
    aspectRatio: '16:9',
    totalDuration: '32s',
    acts: [
      { act: 1, file: 'public/assets/video/hindi_wedding/hindi_wedding_act1_sangeet_entry.mp4', label: 'Sangeet Palace Entry' },
      { act: 2, file: 'public/assets/video/hindi_wedding/hindi_wedding_act2_baraat_dhol.mp4', label: 'Groom Baraat & Dhol' },
      { act: 3, file: 'public/assets/video/hindi_wedding/hindi_wedding_act3_couple_dance.mp4', label: 'Couple Stage Dance' },
      { act: 4, file: 'public/assets/video/hindi_wedding/hindi_wedding_act4_grand_finale.mp4', label: 'Grand Family Finale' }
    ]
  },
  // 2. ANIMATION: 3D Pixar Kids Adventure
  {
    category: 'ANIMATION_3D_PIXAR',
    name: 'Pippin Robot Wonder Adventure',
    route: '/studio/create/animation',
    aspectRatio: '16:9',
    totalDuration: '32s',
    acts: [
      { act: 1, file: 'public/assets/video/continuous/anim_pixar_act1_awakening.mp4', label: 'Workshop Awakening' },
      { act: 2, file: 'public/assets/video/continuous/anim_pixar_act2_portal.mp4', label: 'Rainforest Portal' },
      { act: 3, file: 'public/assets/video/continuous/anim_pixar_act3_fox.mp4', label: 'Spirit Fox Bridge' },
      { act: 4, file: 'public/assets/video/continuous/anim_pixar_act4_sun_core.mp4', label: 'Sun Core Altar' }
    ]
  },
  // 3. ANIMATION: Shonen Anime Epic Battle
  {
    category: 'ANIMATION_ANIME',
    name: 'Ren Lightning Blade Sakuga',
    route: '/studio/create/comics',
    aspectRatio: '16:9',
    totalDuration: '32s',
    acts: [
      { act: 1, file: 'public/assets/video/continuous/anim_anime_act1_stance.mp4', label: 'Katana Stance' },
      { act: 2, file: 'public/assets/video/continuous/anim_anime_act2_dash.mp4', label: 'Bamboo Dash' },
      { act: 3, file: 'public/assets/video/continuous/anim_anime_act3_dragon.mp4', label: 'Lightning Dragon Slash' },
      { act: 4, file: 'public/assets/video/continuous/anim_anime_act4_victory.mp4', label: 'Rooftop Sheath' }
    ]
  },
  // 4. REAL PEOPLE: Viral Tech Influencer
  {
    category: 'REAL_PEOPLE_INFLUENCER',
    name: 'Viral Tech Creator Reel',
    route: '/studio/create/reel',
    aspectRatio: '9:16',
    totalDuration: '32s',
    acts: [
      { act: 1, file: 'public/assets/video/continuous/real_influencer_act1_hook.mp4', label: 'Hook & Device' },
      { act: 2, file: 'public/assets/video/continuous/real_influencer_act2_demo.mp4', label: 'Live Hologram Demo' },
      { act: 3, file: 'public/assets/video/continuous/real_influencer_act3_reaction.mp4', label: 'Creator Reaction' },
      { act: 4, file: 'public/assets/video/continuous/real_influencer_act4_cta.mp4', label: 'Closing CTA' }
    ]
  },
  // 5. REAL PEOPLE: Luxury Skincare UGC Ad
  {
    category: 'REAL_PEOPLE_UGC',
    name: 'Luxury Skincare UGC Ad',
    route: '/studio/create/ugc',
    aspectRatio: '9:16',
    totalDuration: '24s',
    acts: [
      { act: 1, file: 'public/assets/video/continuous/real_ugc_act1_unboxing.mp4', label: 'Serum Unboxing' },
      { act: 2, file: 'public/assets/video/continuous/real_ugc_act2_application.mp4', label: 'Cheek Application' },
      { act: 3, file: 'public/assets/video/continuous/real_ugc_act3_glow.mp4', label: 'Golden Hour Glow' }
    ]
  },
  // 6. REAL PEOPLE: 35mm Arthouse Cinema Noir
  {
    category: 'REAL_PEOPLE_NOIR',
    name: '35mm Arthouse Cinema Noir',
    route: '/studio/create/podcast',
    aspectRatio: '16:9',
    totalDuration: '32s',
    acts: [
      { act: 1, file: 'public/assets/video/continuous/real_noir_act1_rain.mp4', label: 'Midnight Rain Alley' },
      { act: 2, file: 'public/assets/video/continuous/real_noir_act2_match.mp4', label: 'Match Light Shadow' },
      { act: 3, file: 'public/assets/video/continuous/real_noir_act3_lookout.mp4', label: 'Vintage Sedan Pass' },
      { act: 4, file: 'public/assets/video/continuous/real_noir_act4_resolve.mp4', label: 'Fedora Rain Step' }
    ]
  }
];

async function runMasterContinuousQA() {
  console.log('========================================================================');
  console.log('🚀 UNIFIED MULTIMODAL CONTINUOUS REELS QA TEST SUITE');
  console.log('   Signed Google Chrome macOS:', CHROME_PATH);
  console.log('========================================================================\n');

  const summary = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    for (let i = 0; i < CONTINUOUS_REELS_CATALOG.length; i++) {
      const reel = CONTINUOUS_REELS_CATALOG[i];
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`🎬 [${i+1}/${CONTINUOUS_REELS_CATALOG.length}] Auditing: [${reel.category}] "${reel.name}" (${reel.totalDuration}, ${reel.aspectRatio})`);
      console.log(`------------------------------------------------------------------------`);

      let allActsExist = true;
      let totalBytes = 0;

      for (const act of reel.acts) {
        const fullPath = path.resolve(process.cwd(), act.file);
        const exists = fs.existsSync(fullPath);
        const sizeMB = exists ? (fs.statSync(fullPath).size / 1024 / 1024).toFixed(2) : 0;
        if (!exists) allActsExist = false;
        totalBytes += exists ? fs.statSync(fullPath).size : 0;
        console.log(`   Act ${act.act} (${act.label}): ${path.basename(act.file)} ➔ ${exists ? '✅ VALID' : '❌ MISSING'} (${sizeMB} MB)`);
      }

      const totalSizeMB = (totalBytes / 1024 / 1024).toFixed(2);

      // Desktop Check
      const desktopPage = await browser.newPage();
      await desktopPage.setViewport({ width: 1600, height: 950 });
      await desktopPage.goto(`http://localhost:3000${reel.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(1000);
      const desktopOverflow = await desktopPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const desktopShot = path.join(SCREENSHOT_DIR, `${i+1}_desktop_${reel.category.toLowerCase()}.png`);
      await desktopPage.screenshot({ path: desktopShot, fullPage: false });
      await desktopPage.close();

      // Mobile Check
      const mobilePage = await browser.newPage();
      await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await mobilePage.goto(`http://localhost:3000${reel.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(1000);
      const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const mobileShot = path.join(SCREENSHOT_DIR, `${i+1}_mobile_${reel.category.toLowerCase()}.png`);
      await mobilePage.screenshot({ path: mobileShot, fullPage: false });
      await mobilePage.close();

      const passed = allActsExist && !desktopOverflow && !mobileOverflow;
      summary.push({
        name: reel.name,
        category: reel.category,
        acts: `${reel.acts.length} Acts`,
        totalDuration: reel.totalDuration,
        aspectRatio: reel.aspectRatio,
        totalSize: `${totalSizeMB} MB`,
        desktopOverflow: desktopOverflow ? 'OVERFLOW' : 'ZERO',
        mobileOverflow: mobileOverflow ? 'OVERFLOW' : 'ZERO',
        status: passed ? 'PASS ✅' : 'FAIL ❌'
      });
    }
  } catch (err) {
    console.error('❌ QA Error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================================');
  console.log('📊 MASTER MULTIMODAL CONTINUOUS REELS QA CERTIFICATION TABLE:');
  console.log('========================================================================================');
  console.table(summary);
}

runMasterContinuousQA().catch(console.error);
