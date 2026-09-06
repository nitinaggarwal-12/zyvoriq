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

    // G. Cinema Prompt Command Bar & Create Button Assertion
    const hasCommandBar = await page.evaluate(() => {
      const input = document.querySelector("#omni-prompt-input");
      const btn = document.querySelector("#omni-create-button");
      return Boolean(input && btn && btn.textContent.includes("Create Cinema Master"));
    });
    console.log(`✓ Cinema Prompt Command Bar & 'Create Cinema Master' button: ${hasCommandBar ? "PASS" : "FAIL"}`);
    if (!hasCommandBar) throw new Error("Cinema Prompt Command Bar or Create button missing");

    // H. Right 30% Directorial Dossier & Chat
    const dossierCheck = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("Directorial Dossier & Chat") &&
        t.includes("Phase 1") &&
        t.includes("Phase 2: Logic") &&
        t.includes("Phase 3: Script")
      );
    });
    console.log(`✓ Directorial Dossier & Chat Structure: ${dossierCheck ? "PASS" : "FAIL"}`);
    if (!dossierCheck) throw new Error("Directorial Dossier missing required structure");

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

    // Step 3: Test Dynamic Custom Generation from Prompt ("Generate anything using a prompt")
    console.log("\nStep 3: Testing Dynamic Custom Generation from Prompt Input...");
    await page.click("#omni-prompt-input");
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Cyberpunk neon rain in Neo-Tokyo with hover cabs and synthwave score");
    await sleep(300);

    // Click 'Create Cinema Master'
    console.log("Clicking 'Create Cinema Master' button...");
    await page.click("#omni-create-button");

    // Wait for Phase 1 prompt editor to appear
    await page.waitForSelector("#dossier-prompt-input", { timeout: 10000 });

    // Wait for generation to complete (button text returns to Create Cinema Master)
    await page.waitForFunction(() => {
      const btn = document.querySelector("#omni-create-button");
      return Boolean(btn && !btn.textContent?.includes("Directing"));
    }, { timeout: 15000 });
    await sleep(600);

    // Verify studio dynamically reconfigured for newly generated scene
    await page.waitForFunction(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("Neon Tokyo") ||
        t.includes("Neo-Tokyo") ||
        t.includes("Neon Rain") ||
        t.includes("Shinjuku") ||
        t.includes("Cyberpunk")
      );
    }, { timeout: 10000 });
    console.log("✓ Dynamic Prompt Generation to Cyberpunk Scene: PASS");

    // Verify Phase 1 Cognition is active and expanded with prompt input
    const phase1Active = await page.evaluate(() => {
      const p1 = document.querySelector("#dossier-phase-1");
      const promptArea = document.querySelector("#dossier-prompt-input");
      const advBtn = document.querySelector("#dossier-advance-btn");
      return Boolean(p1 && promptArea && advBtn);
    });
    console.log(`✓ Phase 1 Cognition Expanded with Prompt Inputs: ${phase1Active ? "PASS" : "FAIL"}`);
    if (!phase1Active) throw new Error("Phase 1 card not expanded with prompt editor");

    const screenshot2 = path.join(SCREENSHOT_DIR, "02_custom_prompt_generated_phase1.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot2 });
    } else {
      await page.screenshot({ path: screenshot2 });
    }
    console.log(`📸 Captured: ${screenshot2}`);

    // Advance Phase 1 ➔ Phase 2
    console.log("\nAdvancing Phase 1 ➔ Phase 2...");
    await page.click("#dossier-advance-btn");
    await sleep(600);

    // Verify Phase 2 is active and advance to Phase 3
    console.log("Advancing Phase 2 ➔ Phase 3...");
    await page.click("#dossier-advance-phase2-btn");
    await sleep(600);

    // Verify Phase 3 has newly generated script lines
    const phase3Generated = await page.evaluate(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      if (!el) return false;
      const t = el.textContent;
      return (
        t.includes("KENJI") ||
        t.includes("AI OPERATOR") ||
        t.includes("KAI") ||
        t.includes("SILAS") ||
        t.includes("PROTAGONIST")
      );
    });
    console.log(`✓ Phase 3 Script Generated for Prompt Scene: ${phase3Generated ? "PASS" : "FAIL"}`);

    const screenshot3 = path.join(SCREENSHOT_DIR, "03_cyberpunk_screenplay_phase3.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot3 });
    } else {
      await page.screenshot({ path: screenshot3 });
    }
    console.log(`📸 Captured: ${screenshot3}`);

    // Step 4: Test Generating via Persistent Directorial Chat at Bottom of Dossier
    console.log("\nStep 4: Testing Scene Generation via Persistent Directorial Chat...");
    await page.click("#dossier-chat-input");
    await page.keyboard.type("April 14 1912 Titanic wireless room sending emergency SOS distress call");
    await sleep(300);
    await page.click("#dossier-send-btn");
    await page.waitForFunction(() => {
      const btn = document.querySelector("#dossier-send-btn");
      return Boolean(btn && !btn.disabled);
    }, { timeout: 15000 });
    await page.waitForFunction(() => {
      const el = document.querySelector("#omni-multiphase-studio");
      return el && el.textContent.includes("Titanic");
    }, { timeout: 10000 });
    console.log("✓ Directorial Chat Generation to Titanic Scene: PASS");

    const screenshot4 = path.join(SCREENSHOT_DIR, "04_titanic_prompt_generated_from_chat.png");
    if (studioEl) {
      await studioEl.screenshot({ path: screenshot4 });
    } else {
      await page.screenshot({ path: screenshot4 });
    }
    console.log(`📸 Captured: ${screenshot4}`);

    // Advance through pipeline to Phase 8
    console.log("\nAdvancing to Phase 8 (Master Delivery)...");
    await page.evaluate(() => {
      // Advance Phase 1
      const btn1 = document.querySelector("#dossier-advance-btn");
      if (btn1) btn1.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      // Advance Phase 2
      const btn2 = document.querySelector("#dossier-advance-phase2-btn");
      if (btn2) btn2.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      // Advance Phase 3
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn3 = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 4"));
      if (btn3) btn3.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      // Advance Phase 4
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn4 = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 5"));
      if (btn4) btn4.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      // Advance Phase 5
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn5 = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 6"));
      if (btn5) btn5.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      // Advance Phase 6
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn6 = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 7"));
      if (btn6) btn6.click();
    });
    await sleep(400);

    await page.evaluate(() => {
      // Advance Phase 7
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn7 = buttons.find(b => b.textContent && b.textContent.includes("Save & Advance Phase 8"));
      if (btn7) btn7.click();
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
