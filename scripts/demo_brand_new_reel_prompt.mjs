import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_URL || "https://zyvoriq.up.railway.app";
const SCREENSHOT_DIR = path.resolve("scratch/cloudtop_e2e_screenshots");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("===============================================================");
  console.log("🎬 ZERO-DEBT BRAND NEW REEL GENERATION DEMO (CLOUDTOP)");
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

    await page.waitForSelector("#omni-multiphase-studio", { timeout: 15000 });
    await sleep(800);

    // Scroll top and clear floating modals
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const cookie = document.querySelector(".fixed.bottom-4");
      if (cookie) cookie.remove();
    });
    await sleep(600);

    const s1 = path.join(SCREENSHOT_DIR, "demo_01_ui_landing_default.png");
    await page.screenshot({ path: s1 });
    console.log(`📸 Captured: ${s1}`);

    // Step 2: Enter brand new prompt into #omni-prompt-input
    const newPrompt = "A lone astrophysicist on the Atacama desert plateau tracking an anomalous cosmic microwave signal at midnight under the Milky Way, whisper-quiet tension, 24fps anamorphic";
    console.log(`\nStep 2: Entering brand new prompt into #omni-prompt-input:\n"${newPrompt}"`);

    const inputSel = "#omni-prompt-input";
    await page.waitForSelector(inputSel);
    
    // Clear and type new prompt
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = "";
        el.focus();
      }
    }, inputSel);
    await page.type(inputSel, newPrompt, { delay: 15 });
    await sleep(400);

    const s2 = path.join(SCREENSHOT_DIR, "demo_02_brand_new_prompt_entered.png");
    await page.screenshot({ path: s2 });
    console.log(`📸 Captured: ${s2}`);

    // Step 3: Click the one send button (#omni-send-btn)
    console.log("\nStep 3: Clicking the Send button (#omni-send-btn)...");
    const sendBtn = await page.$("#omni-send-btn");
    if (!sendBtn) throw new Error("Could not find #omni-send-btn!");

    await sendBtn.click();
    await sleep(300);

    const s3 = path.join(SCREENSHOT_DIR, "demo_03_generating_in_progress.png");
    await page.screenshot({ path: s3 });
    console.log(`📸 Captured: ${s3}`);

    // Step 4: Wait for reel synthesis to complete
    console.log("\nStep 4: Waiting for fast reel synthesis & celebration banner...");
    await page.waitForSelector("#reel-ready-banner", { timeout: 12000 });
    await sleep(800);

    // Inspect newly generated reel metadata
    const generatedInfo = await page.evaluate(() => {
      const reelBadge = document.querySelector("#current-reel-id-badge");
      const video = document.querySelector("video");
      const banner = document.querySelector("#reel-ready-banner");
      const title = document.querySelector("h2");
      return {
        reelId: reelBadge ? reelBadge.textContent.trim() : null,
        title: title ? title.textContent.trim() : null,
        videoSrc: video ? video.src : null,
        videoPaused: video ? video.paused : true,
        bannerText: banner ? banner.textContent.trim() : null,
        url: window.location.href
      };
    });

    console.log("✓ Brand New Reel Successfully Generated!");
    console.log(`  - New Reel ID: ${generatedInfo.reelId}`);
    console.log(`  - Generated Title: ${generatedInfo.title}`);
    console.log(`  - Active Video Stream: ${generatedInfo.videoSrc}`);
    console.log(`  - Synchronized Deep-Link URL: ${generatedInfo.url}`);

    const s4 = path.join(SCREENSHOT_DIR, "demo_04_brand_new_reel_generated_playing.png");
    await page.screenshot({ path: s4 });
    console.log(`📸 Captured: ${s4}`);

    // Step 5: Open Screening Suite Modal
    console.log("\nStep 5: Opening Screening Suite to inspect master delivery assets...");
    await page.click("#banner-open-delivery-suite-btn");
    await sleep(800);

    const suiteInfo = await page.evaluate(() => {
      const modal = document.querySelector("#omni-delivery-modal");
      return {
        isOpen: Boolean(modal),
        contentSnippet: modal ? modal.textContent.slice(0, 300) : null
      };
    });

    console.log(`✓ Screening Suite Open: ${suiteInfo.isOpen}`);

    const s5 = path.join(SCREENSHOT_DIR, "demo_05_screening_suite_modal.png");
    await page.screenshot({ path: s5 });
    console.log(`📸 Captured: ${s5}`);

    // Close modal cleanly
    await page.click("#modal-close-delivery-btn");
    await sleep(500);

    console.log("\n===============================================================");
    console.log("🎉 BRAND NEW REEL DEMO COMPLETED WITH ZERO TECHNICAL DEBT!");
    console.log("===============================================================");

  } catch (err) {
    console.error("Demo failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
