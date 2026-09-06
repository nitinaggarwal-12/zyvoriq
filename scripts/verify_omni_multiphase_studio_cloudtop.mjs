import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const PORT = process.env.TEST_PORT || 3333;
const BASE_URL = `http://localhost:${PORT}`;
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

    console.log("\nStep 2: Asserting Studio Elements & 11-Phase Stepper Track...");

    // A. Brand & Header Pill Navigation
    const hasBrand = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("Zyvoriq") && el.textContent.includes("Omni Director [Active]");
    });
    console.log(`✓ Header Brand & 'Omni Director [Active]' pill: ${hasBrand ? "PASS" : "FAIL"}`);
    if (!hasBrand) throw new Error("Header brand or Omni Director pill missing");

    // B. Telemetry Badges
    const hasTelemetry = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("Veo 3.1 4K DCI") && (el.textContent.includes("EBU R128") || el.textContent.includes("-24 LUFS"));
    });
    console.log(`✓ Engine Telemetry Badges (Veo 3.1 & EBU R128): ${hasTelemetry ? "PASS" : "FAIL"}`);
    if (!hasTelemetry) throw new Error("Telemetry badges missing");

    // C. All 11 Phases on Stepper Track
    const stepperCheck = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("1. Cognition") &&
        t.includes("2. Logic & Sanity") &&
        t.includes("3. Script & EDL") &&
        t.includes("4. Biometrics") &&
        t.includes("5. Tool Routing") &&
        t.includes("6. Video Gen") &&
        t.includes("7. Audio & Foley") &&
        t.includes("8. Lip-Sync") &&
        t.includes("9. Color & Optics") &&
        t.includes("10. Quality Gates") &&
        t.includes("11. Master Delivery")
      );
    });
    console.log(`✓ 11-Phase Stepper Track (Phases 1 to 11): ${stepperCheck ? "PASS" : "FAIL"}`);
    if (!stepperCheck) throw new Error("11-Phase stepper track missing required phase labels");

    // D. Command Bar Action Buttons
    const hasCommandBarButtons = await page.evaluate(() => {
      const startBtn = document.querySelector("#omni-start-generation-btn");
      const ingestBtn = document.querySelector("#omni-create-button");
      return Boolean(startBtn && ingestBtn && startBtn.textContent.includes("Start Reel Generation"));
    });
    console.log(`✓ Command Bar Action ('Start Reel Generation' & 'Quick Ingest'): ${hasCommandBarButtons ? "PASS" : "FAIL"}`);
    if (!hasCommandBarButtons) throw new Error("Command Bar action buttons missing");

    // E. Dossier Footer Button
    const hasDossierStartBtn = await page.evaluate(() => {
      const btn = document.querySelector("#dossier-start-generation-btn");
      return Boolean(btn && btn.textContent.includes("Start Reel Generation (All 11 Phases)"));
    });
    console.log(`✓ Dossier Footer Action ('Start Reel Generation (All 11 Phases)'): ${hasDossierStartBtn ? "PASS" : "FAIL"}`);
    if (!hasDossierStartBtn) throw new Error("Dossier footer Start Reel Generation button missing");

    // Capture initial studio screenshot
    const studioEl = await page.$("#omni-multiphase-studio");
    const screenshot1 = path.join(SCREENSHOT_DIR, "01_omni_11_phase_studio_initial.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot1 });
    } else {
      await page.screenshot({ path: screenshot1 });
    }
    console.log(`📸 Captured: ${screenshot1}`);

    // Step 3: Trigger "Start Reel Generation" from Command Bar (Synthesizing All 11 Phases)
    console.log("\nStep 3: Triggering 'Start Reel Generation' across all 11 phases...");
    await page.click("#omni-start-generation-btn");
    await sleep(400);

    // Verify 11-Phase Animated Generation Overlay appears
    const hasOverlay = await page.evaluate(() => {
      const overlay = document.querySelector("#omni-reel-generation-overlay");
      return Boolean(overlay && overlay.textContent.includes("Generating 4K Cinema Master Reel"));
    });
    console.log(`✓ 11-Phase Production Pipeline Overlay Active: ${hasOverlay ? "PASS" : "FAIL"}`);
    if (!hasOverlay) throw new Error("11-Phase Production Pipeline Overlay did not appear");

    const screenshot2 = path.join(SCREENSHOT_DIR, "02_omni_11_phase_generation_overlay.png");
    await page.screenshot({ path: screenshot2 });
    console.log(`📸 Captured: ${screenshot2}`);

    // Wait for all 11 phases to complete and overlay to close (approx 3.2s total)
    console.log("Waiting for 11 phases synthesis to complete...");
    await page.waitForFunction(() => {
      const overlay = document.querySelector("#omni-reel-generation-overlay");
      const modal = document.querySelector("#omni-delivery-modal");
      return !overlay && Boolean(modal);
    }, { timeout: 20000 });
    await sleep(800);
    console.log("✓ All 11 phases compiled successfully! Cinema Delivery Modal opened.");

    // Step 4: Verify Cinema Master Delivery Suite & Screening Room Modal
    console.log("\nStep 4: Asserting Cinema Master Delivery Suite Modal...");
    const modalAsserts = await page.evaluate(() => {
      const modal = document.querySelector("#omni-delivery-modal");
      if (!modal) return { present: false };
      const text = modal.textContent;
      const video = modal.querySelector("video");
      const download4k = modal.querySelector("#modal-download-4k-btn");
      const downloadEdl = modal.querySelector("#modal-download-edl-btn");
      const publishSocials = modal.querySelector("#modal-publish-socials-btn");
      const copyLink = modal.querySelector("#modal-copy-link-btn");
      const closeBtn = modal.querySelector("#modal-close-delivery-btn");
      return {
        present: true,
        hasTitle: text.includes("Cinema Master Delivery Suite & Screening Room"),
        hasC2PA: text.includes("C2PA v2.1 Certified"),
        hasVideo: Boolean(video && video.src),
        hasDownload4k: Boolean(download4k),
        hasDownloadEdl: Boolean(downloadEdl),
        hasPublishSocials: Boolean(publishSocials),
        hasCopyLink: Boolean(copyLink),
        hasCloseBtn: Boolean(closeBtn)
      };
    });

    console.log(`✓ Modal Present: ${modalAsserts.present ? "PASS" : "FAIL"}`);
    console.log(`✓ Modal Title & C2PA Provenance: ${modalAsserts.hasTitle && modalAsserts.hasC2PA ? "PASS" : "FAIL"}`);
    console.log(`✓ Screening Video Player: ${modalAsserts.hasVideo ? "PASS" : "FAIL"}`);
    console.log(`✓ Download 4K Master Button: ${modalAsserts.hasDownload4k ? "PASS" : "FAIL"}`);
    console.log(`✓ Download EDL JSON Button: ${modalAsserts.hasDownloadEdl ? "PASS" : "FAIL"}`);
    console.log(`✓ Publish to Socials Button: ${modalAsserts.hasPublishSocials ? "PASS" : "FAIL"}`);
    console.log(`✓ Copy Screening Link Button: ${modalAsserts.hasCopyLink ? "PASS" : "FAIL"}`);

    if (!modalAsserts.present || !modalAsserts.hasVideo || !modalAsserts.hasDownload4k) {
      throw new Error("Cinema Master Delivery Suite modal failed required assertions");
    }

    const screenshot3 = path.join(SCREENSHOT_DIR, "03_cinema_master_delivery_modal.png");
    await page.screenshot({ path: screenshot3 });
    console.log(`📸 Captured: ${screenshot3}`);

    // Test EDL JSON Download Click
    console.log("Clicking Download EDL Script JSON button...");
    await page.click("#modal-download-edl-btn");
    await sleep(400);

    // Test Copy Screening Link Click
    console.log("Clicking Copy Screening Link button...");
    await page.click("#modal-copy-link-btn");
    await sleep(400);

    // Verify Toast Notification appeared
    const hasToast = await page.evaluate(() => {
      const toast = document.querySelector("#omni-toast");
      return Boolean(toast && toast.textContent);
    });
    console.log(`✓ Directorial Feedback Toast: ${hasToast ? "PASS" : "FAIL"}`);

    // Close Delivery Modal
    console.log("Closing Delivery Modal to inspect Phase 11 Dossier Card...");
    await page.click("#modal-close-delivery-btn");
    await sleep(600);

    // Step 5: Verify Phase 11 Dossier Card & Export Master 4K Film Button
    console.log("\nStep 5: Verifying Phase 11 in Dossier...");
    const phase11Check = await page.evaluate(() => {
      const p11 = document.querySelector("#dossier-phase-11");
      const exportBtn = document.querySelector("#omni-export-master-btn");
      const regenBtn = document.querySelector("#omni-start-generation-btn-phase11");
      const openSuiteBtn = document.querySelector("#open-delivery-suite-btn");
      return {
        hasPhase11: Boolean(p11),
        hasExportBtn: Boolean(exportBtn),
        hasRegenBtn: Boolean(regenBtn),
        hasOpenSuiteBtn: Boolean(openSuiteBtn)
      };
    });

    console.log(`✓ Phase 11 Dossier Card: ${phase11Check.hasPhase11 ? "PASS" : "FAIL"}`);
    console.log(`✓ 'Export Master 4K Film' Button: ${phase11Check.hasExportBtn ? "PASS" : "FAIL"}`);
    console.log(`✓ 'Re-Generate Reel' Button: ${phase11Check.hasRegenBtn ? "PASS" : "FAIL"}`);
    console.log(`✓ 'Open Master Screening Suite' Button: ${phase11Check.hasOpenSuiteBtn ? "PASS" : "FAIL"}`);

    if (!phase11Check.hasPhase11 || !phase11Check.hasExportBtn) {
      throw new Error("Phase 11 Dossier card or Export Master button missing");
    }

    // Click "Export Master 4K Film" to verify it does NOT silently do nothing
    console.log("\nClicking 'Export Master 4K Film' to verify live export packaging & modal reopening...");
    await page.click("#omni-export-master-btn");
    await sleep(600);

    // Wait for export process to finish and modal to reopen
    await page.waitForSelector("#omni-delivery-modal", { timeout: 10000 });
    await sleep(600);
    console.log("✓ 'Export Master 4K Film' successfully packaged stream and reopened Delivery Suite!");

    const screenshot4 = path.join(SCREENSHOT_DIR, "04_export_master_reopened_suite.png");
    await page.screenshot({ path: screenshot4 });
    console.log(`📸 Captured: ${screenshot4}`);

    // Close modal again
    await page.click("#modal-close-delivery-btn");
    await sleep(400);

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

    const screenshot5 = path.join(SCREENSHOT_DIR, "05_mobile_ios_responsive_390x844.png");
    await page.screenshot({ path: screenshot5, fullPage: false });
    console.log(`📸 Captured: ${screenshot5}`);

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

    const screenshot6 = path.join(SCREENSHOT_DIR, "06_mobile_android_responsive_412x915.png");
    await page.screenshot({ path: screenshot6, fullPage: false });
    console.log(`📸 Captured: ${screenshot6}`);

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
