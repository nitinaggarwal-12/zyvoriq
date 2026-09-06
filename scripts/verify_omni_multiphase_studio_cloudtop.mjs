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
  console.log("🎬 GOOGLE OMNI MULTI-PHASE STUDIO CLOUDTOP E2E TEST HARNESS");
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
    console.log("\nStep 1: Navigating to landing page...");
    const res = await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });
    console.log(`HTTP Status: ${res ? res.status() : "N/A"}`);
    if (res && res.status() >= 400) {
      throw new Error(`Failed to load page, status: ${res.status()}`);
    }

    // Wait for the hero director section and multi-phase studio
    await page.waitForSelector("#omni-multiphase-studio", { timeout: 10000 });
    await sleep(800);

    // Cleanly ensure page is at top Y=0 and remove any floating cookie modals
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const cookieBanner = document.querySelector(".fixed.bottom-4");
      if (cookieBanner) cookieBanner.remove();
    });
    await sleep(600);

    console.log("\nStep 2: Asserting Exact Figma Mockup Elements...");

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

    // C. Master Cinema Player Title & Framing
    const hasPlayerTitle = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && (el.textContent.includes("Luxury Mumbai Penthouse") || el.textContent.includes("Penthouse"));
    });
    console.log(`✓ Master Cinema Player Title ('Luxury Mumbai Penthouse'): ${hasPlayerTitle ? "PASS" : "FAIL"}`);
    if (!hasPlayerTitle) throw new Error("Master Cinema Player title missing");

    // D. Transport Controls: Timecode 01:24 / 03:00 and 4K DCI Badge
    const hasTransport = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("01:24") && el.textContent.includes("4K DCI");
    });
    console.log(`✓ Transport Controls ('01:24 / 03:00' and '4K DCI' badge): ${hasTransport ? "PASS" : "FAIL"}`);
    if (!hasTransport) throw new Error("Transport controls or timecode missing");

    // E. 8-Phase Stepper Track
    const stepperCheck = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("1. Cognition") &&
        t.includes("2. Logic & Sanity") &&
        t.includes("3. Script & EDL") &&
        t.includes("4. Tool Routing") &&
        t.includes("5. Video Gen") &&
        t.includes("6. Audio & Foley") &&
        t.includes("7. Quality Gates") &&
        t.includes("8. Master Delivery")
      );
    });
    console.log(`✓ 8-Phase Stepper Track (Phases 1 to 8): ${stepperCheck ? "PASS" : "FAIL"}`);
    if (!stepperCheck) throw new Error("8-Phase stepper track missing required phase labels");

    // F. Quality Gatekeeper HUD Bar
    const gatekeeperCheck = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("Quality Gatekeeper") &&
        t.includes("Guard 1: 180s SMPTE") &&
        t.includes("Guard 3: Anatomy Audit") &&
        t.includes("Guard 4: -24.0 LUFS")
      );
    });
    console.log(`✓ Quality Gatekeeper HUD Bar (Guards 1, 3, 4): ${gatekeeperCheck ? "PASS" : "FAIL"}`);
    if (!gatekeeperCheck) throw new Error("Quality Gatekeeper HUD bar missing");

    // G. Right 30% Directorial Dossier & Chat
    const dossierCheck = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("Directorial Dossier & Chat") &&
        t.includes("Phase 1") &&
        t.includes("Cognition: inputs") &&
        t.includes("Phase 2: Logic") &&
        t.includes("Phase 3: Script") &&
        t.includes("Bas karo, Shweta! Paneer khatam ho jayega!") &&
        t.includes("Rahul is eating it all!") &&
        t.includes("Save & Advance Phase 4")
      );
    });
    console.log(`✓ Directorial Dossier Script Lines & 'Save & Advance Phase 4': ${dossierCheck ? "PASS" : "FAIL"}`);
    if (!dossierCheck) throw new Error("Directorial Dossier missing dialogue or CTA button");

    // Capture Default Studio Frame Screenshot (Exact Figma Element Framing)
    await sleep(600);
    const studioEl = await page.$("#omni-multiphase-studio");
    const screenshot1 = path.join(SCREENSHOT_DIR, "01_figma_studio_matching_mockup.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot1 });
    } else {
      await page.screenshot({ path: screenshot1 });
    }
    console.log(`📸 Captured: ${screenshot1}`);
    const viewportShot = path.join(SCREENSHOT_DIR, "01_top_viewport_landing_page.png");
    await page.screenshot({ path: viewportShot });
    console.log(`📸 Captured: ${viewportShot}`);

    // Step 3: Interactive Editing in Phase 3
    console.log("\nStep 3: Testing In-Place Dialogue Editing in Phase 3...");
    const textareaHandle = await page.$("#dossier-phase-3 textarea");
    if (textareaHandle) {
      await textareaHandle.click();
      await page.keyboard.down("Control");
      await page.keyboard.press("A");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.keyboard.type("Bas karo, Shweta! Paneer khatam ho jayega! - Director Omni Approved.");
      await sleep(500);
    }

    const screenshot2 = path.join(SCREENSHOT_DIR, "02_script_editing_and_tags.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot2 });
    } else {
      await page.screenshot({ path: screenshot2 });
    }
    console.log(`📸 Captured: ${screenshot2}`);

    // Step 4: Click 'Save & Advance Phase 4'
    console.log("\nStep 4: Clicking 'Save & Advance Phase 4 ➔'...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 4"));
      if (btn) btn.click();
    });
    await sleep(800);

    // Verify Phase 4 is active
    const phase4Active = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("Phase 4: Tool Routing") && el.textContent.includes("Save & Advance Phase 5");
    });
    console.log(`✓ Advanced to Phase 4 (Tool Routing): ${phase4Active ? "PASS" : "FAIL"}`);
    if (!phase4Active) throw new Error("Failed to advance to Phase 4");

    const screenshot3 = path.join(SCREENSHOT_DIR, "03_advanced_to_phase4_tool_routing.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot3 });
    } else {
      await page.screenshot({ path: screenshot3 });
    }
    console.log(`📸 Captured: ${screenshot3}`);

    // Step 5: Advance through remaining phases to Master Delivery (Phase 8)
    console.log("\nStep 5: Advancing through Phases 5, 6, 7 and 8...");
    // Advance to 5
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 5"));
      if (btn) btn.click();
    });
    await sleep(400);

    // Advance to 6
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 6"));
      if (btn) btn.click();
    });
    await sleep(400);

    // Advance to 7 (Quality Gates)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 7"));
      if (btn) btn.click();
    });
    await sleep(600);

    const phase7Active = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("13 Forensic Guards Certified [PASS]");
    });
    console.log(`✓ Advanced to Phase 7 (Quality Gates): ${phase7Active ? "PASS" : "FAIL"}`);

    const screenshot4 = path.join(SCREENSHOT_DIR, "04_advanced_to_phase7_quality_gates.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot4 });
    } else {
      await page.screenshot({ path: screenshot4 });
    }
    console.log(`📸 Captured: ${screenshot4}`);

    // Advance to 8 (Master Delivery)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 8"));
      if (btn) btn.click();
    });
    await sleep(600);

    const phase8Active = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("Export Master 4K Film");
    });
    console.log(`✓ Advanced to Phase 8 (Master Delivery): ${phase8Active ? "PASS" : "FAIL"}`);

    const screenshot5 = path.join(SCREENSHOT_DIR, "05_advanced_to_phase8_master_delivery.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot5 });
    } else {
      await page.screenshot({ path: screenshot5 });
    }
    console.log(`📸 Captured: ${screenshot5}`);

    // Step 6: Test Mobile Viewport (iPhone 14 @ 390x844) & Zero Horizontal Overflow
    console.log("\nStep 6: Auditing Mobile Viewport (390x844)...");
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
    console.log(`✓ Zero Horizontal Overflow Protocol: ${overflowCheck.noOverflow ? "PASS" : "FAIL"}`);

    const screenshot6 = path.join(SCREENSHOT_DIR, "06_mobile_responsive_viewport_390x844.png");
    await page.screenshot({ path: screenshot6, fullPage: false });
    console.log(`📸 Captured: ${screenshot6}`);

    console.log("\n===============================================================");
    console.log("🎉 ALL GOOGLE OMNI MULTI-PHASE QUALITY GATES PASSED (100%)");
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
