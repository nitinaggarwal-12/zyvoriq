import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const PORT = process.env.TEST_PORT || 3333;
const BASE_URL = process.env.TEST_URL || `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.resolve("scratch/cloudtop_e2e_screenshots");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("===============================================================");
  console.log("🎬 GOOGLE OMNI 11-PHASE PRODUCTION PIPELINE E2E TEST HARNESS");
  console.log("===============================================================");
  console.log(`Target URL: ${BASE_URL}`);

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Find Chrome on Cloudtop
  let executablePath = "/usr/bin/google-chrome";
  if (!fs.existsSync(executablePath)) {
    try {
      executablePath = execSync("which google-chrome || which chromium").toString().trim();
    } catch {
      executablePath = undefined;
    }
  }

  console.log(`Using Browser: ${executablePath || "default puppeteer bundled"}`);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: executablePath || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1920,1080"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  try {
    console.log("\nStep 1: Navigating to studio landing page...");
    const res = await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 35000 });
    console.log(`HTTP Status: ${res ? res.status() : "N/A"}`);
    if (res && res.status() >= 400) {
      throw new Error(`Failed to load page, status: ${res.status()}`);
    }

    // Wait for the hero director section and multi-phase studio
    await page.waitForSelector("#omni-multiphase-studio", { timeout: 15000 });
    await sleep(800);

    // Cleanly ensure page is at top Y=0 and remove any floating cookie modals
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const cookieBanner = document.querySelector(".fixed.bottom-4");
      if (cookieBanner) cookieBanner.remove();
    });
    await sleep(600);

    console.log("\nStep 2: Asserting Studio Elements, Unique Reel ID & Initial State...");

    // Assert Unique Reel ID badge is present and shows reel_mumbai_luxury_penthouse
    const reelIdBadge = await page.evaluate(() => {
      const badge = document.querySelector("#current-reel-id-badge");
      const video = document.querySelector("#player-video") || document.querySelector("video");
      return {
        badgeText: badge ? badge.textContent.trim() : null,
        videoSrc: video ? video.src : null
      };
    });

    console.log(`✓ Initial Reel ID Badge: ${reelIdBadge.badgeText}`);
    console.log(`✓ Initial Master Video Source: ${reelIdBadge.videoSrc}`);

    if (!reelIdBadge.badgeText || !reelIdBadge.badgeText.includes("reel_mumbai_luxury_penthouse")) {
      throw new Error(`Expected reel_mumbai_luxury_penthouse badge, got: ${reelIdBadge.badgeText}`);
    }

    // Verify it is NOT pointing to Napoleon!
    if (reelIdBadge.videoSrc && reelIdBadge.videoSrc.includes("napoleon")) {
      throw new Error(`CRITICAL DEFECT: Mumbai Penthouse must NOT play Napoleon video! Got: ${reelIdBadge.videoSrc}`);
    }
    if (!reelIdBadge.videoSrc || !reelIdBadge.videoSrc.includes("mumbai_penthouse_180s_master.mp4")) {
      throw new Error(`Expected mumbai_penthouse_180s_master.mp4, got: ${reelIdBadge.videoSrc}`);
    }
    console.log("✓ Verified Mumbai Penthouse correctly points to mumbai_penthouse_180s_master.mp4 (Napoleon defect resolved)!");

    // Capture initial studio screenshot
    const screenshot1 = path.join(SCREENSHOT_DIR, "01_omni_studio_initial_mumbai.png");
    await page.screenshot({ path: screenshot1 });
    console.log(`📸 Captured: ${screenshot1}`);

    // Step 3: Trigger Reel Generation via the Top Send button (#omni-send-btn)
    console.log("\nStep 3: Triggering Reel Generation via the top Send button (#omni-send-btn)...");
    const sendBtn = (await page.$("#omni-send-btn")) || (await page.$("#omni-start-generation-btn"));
    if (!sendBtn) throw new Error("Could not find #omni-send-btn on top of studio!");
    await sendBtn.click();
    await sleep(250);

    const screenshot2 = path.join(SCREENSHOT_DIR, "02_omni_prompt_send_generating.png");
    await page.screenshot({ path: screenshot2 });
    console.log(`📸 Captured: ${screenshot2}`);

    // Wait for reel synthesis to complete and celebration banner to appear (fast, no 10s delay!)
    console.log("Waiting for reel synthesis to complete and celebration banner to display...");
    await page.waitForSelector("#reel-ready-banner", { timeout: 10000 });
    await sleep(800);
    console.log("✓ Reel synthesized rapidly! Celebration Banner displayed.");

    // Step 4: Verify Zero Overlapping Audio & Master Video Playback
    console.log("\nStep 4: Verifying Master Video Playback & Audio State...");
    const playbackState = await page.evaluate(() => {
      const video = document.querySelector("video");
      const modal = document.querySelector("#omni-delivery-modal");
      const banner = document.querySelector("#reel-ready-banner");
      return {
        hasBanner: Boolean(banner),
        modalOpen: Boolean(modal),
        videoSrc: video ? video.src : null,
        videoPaused: video ? video.paused : true,
        url: window.location.href
      };
    });

    console.log(`✓ Master Reel Ready Banner Visible: ${playbackState.hasBanner}`);
    console.log(`✓ Modal Is NOT Auto-Opened (No double video/overlapping audio): ${!playbackState.modalOpen}`);
    console.log(`✓ Active Cinema Video Source: ${playbackState.videoSrc}`);
    console.log(`✓ Current URL Query: ${playbackState.url}`);

    if (playbackState.modalOpen) {
      throw new Error("Modal should NOT auto-open on reel generation (causes overlapping audio)");
    }
    if (!playbackState.videoSrc || !playbackState.videoSrc.includes("mumbai_penthouse_180s_master.mp4")) {
      throw new Error(`Master video source wrong: ${playbackState.videoSrc}`);
    }
    if (!playbackState.url.includes("reel=reel_mumbai_luxury_penthouse") || !playbackState.url.includes("phase=11")) {
      throw new Error(`URL did not synchronize with generated reel query params: ${playbackState.url}`);
    }

    const screenshot3 = path.join(SCREENSHOT_DIR, "03_reel_ready_playing_in_cinema.png");
    await page.screenshot({ path: screenshot3 });
    console.log(`📸 Captured: ${screenshot3}`);

    // Step 5: Open Screening Suite & Verify Audio Isolation
    console.log("\nStep 5: Opening Screening Suite & Asserting Audio Isolation...");
    await page.click("#banner-open-delivery-suite-btn");
    await sleep(600);

    const suiteState = await page.evaluate(() => {
      const modal = document.querySelector("#omni-delivery-modal");
      const videos = document.querySelectorAll("video");
      const backgroundVideo = videos[0];
      const modalVideo = videos[1] || videos[0];
      return {
        modalPresent: Boolean(modal),
        modalText: modal ? modal.textContent : "",
        backgroundPaused: backgroundVideo ? backgroundVideo.paused : true,
        modalAutoPlay: modalVideo ? modalVideo.hasAttribute("autoplay") : false
      };
    });

    console.log(`✓ Screening Suite Opened: ${suiteState.modalPresent}`);
    console.log(`✓ Background Video Paused (Zero Overlapping Audio): ${suiteState.backgroundPaused}`);
    console.log(`✓ Modal Video Has No Unwanted AutoPlay: ${!suiteState.modalAutoPlay}`);
    console.log(`✓ Modal Contains REEL ID: ${suiteState.modalText.includes("reel_mumbai_luxury_penthouse")}`);

    if (!suiteState.modalPresent) throw new Error("Delivery Suite modal failed to open");
    if (!suiteState.backgroundPaused) throw new Error("Background video should be paused when modal opens");
    if (!suiteState.modalText.includes("reel_mumbai_luxury_penthouse")) throw new Error("REEL ID missing from modal metadata");

    const screenshot4 = path.join(SCREENSHOT_DIR, "04_screening_suite_modal_with_reel_id.png");
    await page.screenshot({ path: screenshot4 });
    console.log(`📸 Captured: ${screenshot4}`);

    // Test Copy Deep Link & Copy Reel ID
    await page.click("#modal-copy-link-btn");
    await sleep(300);
    await page.click("#modal-copy-reel-id-btn");
    await sleep(300);

    // Close modal
    await page.click("#modal-close-delivery-btn");
    await sleep(600);

    // Step 5B: Test Deep Link Two-Way Synchronization & Page Reload
    console.log("\nStep 5B: Testing Two-Way URL Deep-Link Restoration on Page Reload...");
    const targetDeepLink = `${BASE_URL}/?reel=reel_notre_dame_coronation&phase=7`;
    console.log(`Navigating directly to deep link: ${targetDeepLink}`);
    await page.goto(targetDeepLink, { waitUntil: "networkidle2", timeout: 25000 });
    await sleep(800);

    const restoredState = await page.evaluate(() => {
      const badge = document.querySelector("#current-reel-id-badge");
      const video = document.querySelector("video");
      const title = document.querySelector("h2");
      return {
        badgeId: badge ? badge.textContent.trim() : null,
        videoSrc: video ? video.src : null,
        titleText: title ? title.textContent.trim() : null
      };
    });

    console.log(`✓ Restored Reel ID: ${restoredState.badgeId}`);
    console.log(`✓ Restored Video Source: ${restoredState.videoSrc}`);
    console.log(`✓ Restored Title: ${restoredState.titleText}`);

    if (!restoredState.badgeId || !restoredState.badgeId.includes("reel_notre_dame_coronation")) {
      throw new Error(`Failed to restore deep-linked reel ID. Got: ${restoredState.badgeId}`);
    }
    if (!restoredState.videoSrc || !restoredState.videoSrc.includes("coronation_180s_master.mp4")) {
      throw new Error(`Failed to restore deep-linked video asset. Got: ${restoredState.videoSrc}`);
    }

    const screenshot5 = path.join(SCREENSHOT_DIR, "05_deep_link_restored_notre_dame.png");
    await page.screenshot({ path: screenshot5 });
    console.log(`📸 Captured: ${screenshot5}`);

    // Step 5C: Test Custom Prompt Generation via Top Textbox & Send Button
    console.log("\nStep 5C: Testing Custom Prompt Input & Send Button on Top...");
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(400);

    await page.click("#omni-prompt-input", { clickCount: 3 });
    await sleep(200);
    await page.keyboard.press("Backspace");
    await sleep(200);
    await page.type("#omni-prompt-input", "Cyberpunk rogue operative infiltration in Neo-Tokyo alleyways", { delay: 15 });
    await sleep(300);

    const customSendBtn = await page.$("#omni-send-btn");
    if (!customSendBtn) throw new Error("Could not find #omni-send-btn!");
    await customSendBtn.click();
    console.log("Clicked #omni-send-btn with custom Cyberpunk prompt...");

    // Wait for rapid completion and celebration banner
    await page.waitForSelector("#reel-ready-banner", { timeout: 10000 });
    await sleep(800);

    const customGeneratedState = await page.evaluate(() => {
      const badge = document.querySelector("#current-reel-id-badge");
      const video = document.querySelector("video");
      return {
        badgeText: badge ? badge.textContent.trim() : "",
        videoSrc: video ? video.src : ""
      };
    });

    console.log(`✓ Custom Prompt Generated Reel ID: ${customGeneratedState.badgeText}`);
    console.log(`✓ Custom Prompt Generated Video: ${customGeneratedState.videoSrc}`);

    if (!customGeneratedState.videoSrc.includes("neotokyo_180s_master.mp4")) {
      throw new Error(`Expected neotokyo_180s_master.mp4, got: ${customGeneratedState.videoSrc}`);
    }
    console.log("✓ Successfully verified Top Prompt Textbox + Send Button generates custom reel rapidly!");

    const screenshot5c = path.join(SCREENSHOT_DIR, "05c_custom_prompt_generated_cyberpunk.png");
    await page.screenshot({ path: screenshot5c });
    console.log(`📸 Captured: ${screenshot5c}`);

    // Step 6: Test Mobile Viewport (iPhone 14 @ 390x844) & Zero Horizontal Overflow
    console.log("\nStep 6: Auditing Mobile Viewport (iPhone 14 @ 390x844)...");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await sleep(800);

    const overflowCheck = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        noOverflow: document.documentElement.scrollWidth <= window.innerWidth
      };
    });
    console.log(`Mobile Scroll Width: ${overflowCheck.scrollWidth}px, Inner Width: ${overflowCheck.innerWidth}px`);
    console.log(`✓ Zero Horizontal Overflow Protocol (iOS): ${overflowCheck.noOverflow ? "PASS" : "FAIL"}`);
    if (!overflowCheck.noOverflow) {
      throw new Error(`Mobile horizontal overflow detected: ${overflowCheck.scrollWidth} > ${overflowCheck.innerWidth}`);
    }

    const screenshot6 = path.join(SCREENSHOT_DIR, "06_mobile_ios_responsive_390x844.png");
    await page.screenshot({ path: screenshot6, fullPage: false });
    console.log(`📸 Captured: ${screenshot6}`);

    // Step 7: Auditing Android Viewport (Pixel 7 @ 412x915)
    console.log("\nStep 7: Auditing Android Viewport (Pixel 7 @ 412x915)...");
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true });
    await sleep(800);

    const androidOverflowCheck = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        noOverflow: document.documentElement.scrollWidth <= window.innerWidth
      };
    });
    console.log(`Android Scroll Width: ${androidOverflowCheck.scrollWidth}px, Inner Width: ${androidOverflowCheck.innerWidth}px`);
    console.log(`✓ Zero Horizontal Overflow Protocol (Android): ${androidOverflowCheck.noOverflow ? "PASS" : "FAIL"}`);
    if (!androidOverflowCheck.noOverflow) {
      throw new Error(`Android horizontal overflow detected: ${androidOverflowCheck.scrollWidth} > ${androidOverflowCheck.innerWidth}`);
    }

    const screenshot7 = path.join(SCREENSHOT_DIR, "07_mobile_android_responsive_412x915.png");
    await page.screenshot({ path: screenshot7, fullPage: false });
    console.log(`📸 Captured: ${screenshot7}`);

    console.log("\n===============================================================");
    console.log("🎉 ALL 11-PHASE OMNI PRODUCTION QUALITY GATES PASSED (100%)");
    console.log("===============================================================");
    await browser.close();
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Test Suite Failed:", err);
    try {
      const errorShot = path.join(SCREENSHOT_DIR, "error_failure.png");
      await page.screenshot({ path: errorShot, fullPage: false });
      console.log(`📸 Failure Screenshot Saved: ${errorShot}`);
    } catch {}
    await browser.close();
    process.exit(1);
  }
}

main();
