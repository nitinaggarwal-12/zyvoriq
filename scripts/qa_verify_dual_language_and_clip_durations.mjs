import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "scratch/cloudtop_e2e_screenshots/dual_lang_verification");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("🚀 Starting Dual-Language & Shot Duration E2E Verification...");
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1600,950"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });

  const results = {
    checks: [],
    screenshots: []
  };

  try {
    // 1. Load /my-reels
    console.log(`📡 Navigating to ${BASE_URL}/my-reels...`);
    await page.goto(`${BASE_URL}/my-reels`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(1000);

    // Verify track switcher in library toolbar
    const enBtn = await page.$("#audio-lang-en-btn");
    const hiBtn = await page.$("#audio-lang-hi-btn");
    if (enBtn && hiBtn) {
      console.log("✅ Library toolbar audio track buttons (EN & HI) found.");
      results.checks.push({ test: "Toolbar Audio Track Switcher", passed: true });
    } else {
      console.error("❌ Toolbar audio track buttons missing.");
      results.checks.push({ test: "Toolbar Audio Track Switcher", passed: false });
    }

    // Expand clips breakdown if not already expanded
    console.log("📂 Expanding constituent clips breakdown...");
    await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll("div, span, button"));
      const trigger = triggers.find(el => el.textContent && el.textContent.includes("Expand") && el.textContent.includes("Constituent"));
      if (trigger) trigger.click();
    });
    await sleep(1200);

    const shot1 = path.join(SCREENSHOT_DIR, "01_library_expanded_clips.png");
    await page.screenshot({ path: shot1, fullPage: false });
    results.screenshots.push(shot1);
    console.log(`📸 Saved: ${shot1}`);

    // 2. Click on Shot 29
    console.log("🎬 Clicking on Shot 29 in the clips grid...");
    const clickedShot29 = await page.evaluate(() => {
      const tags = Array.from(document.querySelectorAll("div, span"));
      const shot29Tag = tags.find(el => el.textContent && el.textContent.trim() === "Shot 29");
      if (shot29Tag) {
        const parentCard = shot29Tag.closest(".rounded-xl") || shot29Tag.parentElement?.parentElement;
        if (parentCard) {
          const btn = parentCard.querySelector("button") || parentCard;
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (!clickedShot29) {
      console.log("⚠️ Fallback: Clicking directly on shot 29 play button via query selector...");
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll("div.grid > div"));
        if (cards[28]) {
          const btn = cards[28].querySelector("button");
          if (btn) btn.click();
        }
      });
    }

    await sleep(1800); // Allow modal to open & video metadata to load

    // Inspect Spotlight Cinema Modal
    const modalData = await page.evaluate(() => {
      const video = document.querySelector("div.fixed video");
      const titleEl = document.querySelector("div.fixed h3");
      const subtitleEl = document.querySelector("div.fixed p.text-zinc-400");
      const enBtn = document.querySelector("#spotlight-lang-en-btn");
      const hiBtn = document.querySelector("#spotlight-lang-hi-btn");

      return {
        hasModal: Boolean(video),
        videoSrc: video ? video.currentSrc || video.src : null,
        duration: video ? video.duration : null,
        title: titleEl ? titleEl.textContent : null,
        subtitle: subtitleEl ? subtitleEl.textContent : null,
        hasEnBtn: Boolean(enBtn),
        hasHiBtn: Boolean(hiBtn)
      };
    });

    console.log("📊 Shot 29 Spotlight Modal State:", JSON.stringify(modalData, null, 2));

    const isCorrectShot29 = modalData.videoSrc && modalData.videoSrc.includes("shot_29");
    const isDurationAccurate = modalData.duration !== null && modalData.duration > 0 && modalData.duration < 20;

    if (isCorrectShot29 && isDurationAccurate) {
      console.log(`✅ SUCCESS: Shot 29 plays exact clip file with duration ${modalData.duration.toFixed(1)}s (NOT 2:01!)`);
      results.checks.push({ test: "Shot 29 Exact File & Duration", passed: true, detail: `${modalData.duration.toFixed(1)}s` });
    } else {
      console.error(`❌ FAILURE: Shot 29 duration or src mismatch! duration=${modalData.duration}, src=${modalData.videoSrc}`);
      results.checks.push({ test: "Shot 29 Exact File & Duration", passed: false, detail: `duration=${modalData.duration}, src=${modalData.videoSrc}` });
    }

    const shot2 = path.join(SCREENSHOT_DIR, "02_shot_29_exact_duration_modal.png");
    await page.screenshot({ path: shot2, fullPage: false });
    results.screenshots.push(shot2);
    console.log(`📸 Saved: ${shot2}`);

    // 3. Test Language Switching in Spotlight Modal
    console.log("🌐 Switching to Hindi (HI) in Spotlight Modal...");
    await page.click("#spotlight-lang-hi-btn");
    await sleep(800);

    const hiSubtitle = await page.evaluate(() => {
      const subtitleEl = document.querySelector("div.fixed p.text-zinc-400");
      return subtitleEl ? subtitleEl.textContent : null;
    });
    console.log(`🇮🇳 Hindi Subtitle: "${hiSubtitle}"`);
    results.checks.push({ test: "Hindi Subtitle Rendered", passed: Boolean(hiSubtitle && hiSubtitle.includes("Hamesha")) });

    const shot3 = path.join(SCREENSHOT_DIR, "03_shot_29_hindi_subtitle.png");
    await page.screenshot({ path: shot3, fullPage: false });
    results.screenshots.push(shot3);
    console.log(`📸 Saved: ${shot3}`);

    // Switch back to EN
    await page.click("#spotlight-lang-en-btn");
    await sleep(800);

    // 4. Close Spotlight and Test Combined Master Reel Playback
    console.log("✖️ Closing Spotlight Modal...");
    await page.evaluate(() => {
      const closeBtn = document.querySelector("div.fixed button[title='Close Player']");
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);

    console.log("🎞️ Clicking 'Play Combined Reel (EN Master Audio)'...");
    const clickedMaster = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const masterBtn = btns.find(b => b.textContent && b.textContent.includes("Play Combined Reel"));
      if (masterBtn) {
        masterBtn.click();
        return true;
      }
      return false;
    });

    if (clickedMaster) {
      await sleep(1500);
      const masterData = await page.evaluate(() => {
        const video = document.querySelector("div.fixed video");
        const titleEl = document.querySelector("div.fixed h3");
        return {
          src: video ? video.currentSrc || video.src : null,
          duration: video ? video.duration : null,
          title: titleEl ? titleEl.textContent : null
        };
      });
      console.log("🎬 English Master Cut Modal State:", JSON.stringify(masterData, null, 2));

      const isEnMaster = masterData.src && masterData.src.includes("narrated_rough_master_en.mp4");
      results.checks.push({ test: "English Theatrical Master Cut", passed: Boolean(isEnMaster), detail: masterData.src });

      const shot4 = path.join(SCREENSHOT_DIR, "04_combined_master_en.png");
      await page.screenshot({ path: shot4, fullPage: false });
      results.screenshots.push(shot4);
      console.log(`📸 Saved: ${shot4}`);

      // Now toggle to Hindi Master inside modal
      console.log("🇮🇳 Toggling Master Cut to Hindi (HI) Track inside modal...");
      await page.click("#spotlight-lang-hi-btn");
      await sleep(1200);

      const hiMasterData = await page.evaluate(() => {
        const video = document.querySelector("div.fixed video");
        const titleEl = document.querySelector("div.fixed h3");
        return {
          src: video ? video.currentSrc || video.src : null,
          duration: video ? video.duration : null,
          title: titleEl ? titleEl.textContent : null
        };
      });
      console.log("🎬 Hindi Master Cut Modal State:", JSON.stringify(hiMasterData, null, 2));

      const isHiMaster = hiMasterData.src && (hiMasterData.src.includes("narrated-rough") || hiMasterData.src.includes("narrated_rough_master.mp4"));
      results.checks.push({ test: "Hindi Bollywood Master Cut", passed: Boolean(isHiMaster), detail: hiMasterData.src });

      const shot5 = path.join(SCREENSHOT_DIR, "05_combined_master_hi.png");
      await page.screenshot({ path: shot5, fullPage: false });
      results.screenshots.push(shot5);
      console.log(`📸 Saved: ${shot5}`);
    }

    // 5. Cross-Viewport Responsiveness & Mobile Zero-Overflow Assertions
    console.log("📱 Auditing Mobile iOS Viewport (iPhone 14 @ 390x844)...");
    await page.setViewport({ width: 390, height: 844 });
    await sleep(800);
    const iosOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    results.checks.push({ test: "iOS Mobile Zero-Overflow (390px)", passed: iosOverflow });
    const shot6 = path.join(SCREENSHOT_DIR, "06_mobile_ios_spotlight.png");
    await page.screenshot({ path: shot6, fullPage: false });
    results.screenshots.push(shot6);
    console.log(`📸 Saved: ${shot6}`);

    console.log("🤖 Auditing Mobile Android Viewport (Pixel 7 @ 412x915)...");
    await page.setViewport({ width: 412, height: 915 });
    await sleep(800);
    const androidOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    results.checks.push({ test: "Android Mobile Zero-Overflow (412px)", passed: androidOverflow });
    const shot7 = path.join(SCREENSHOT_DIR, "07_mobile_android_spotlight.png");
    await page.screenshot({ path: shot7, fullPage: false });
    results.screenshots.push(shot7);
    console.log(`📸 Saved: ${shot7}`);

  } catch (err) {
    console.error("💥 Error during QA run:", err);
    results.error = err.message;
  } finally {
    await browser.close();
  }

  console.log("\n================ SUMMARY ================");
  console.log(JSON.stringify(results, null, 2));

  const allPassed = results.checks.every(c => c.passed);
  if (!allPassed) {
    console.error("❌ Some verification checks failed.");
    process.exit(1);
  } else {
    console.log("🎉 ALL QUALITY GATE CHECKS PASSED!");
  }
}

run().catch(err => {
  console.error("Fatal QA Error:", err);
  process.exit(1);
});
