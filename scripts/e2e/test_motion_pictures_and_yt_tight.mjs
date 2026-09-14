import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = path.resolve(process.cwd(), "scratch/screenshots_verification_audit");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("=== Starting Headless E2E Verification on Cloudtop ===");

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // TEST 1: /yt?reel=yt_a8d79bfc-20a4-4bc6-85f9-495b858c5603
  console.log("\n--- TEST 1: Testing /yt 16.7s Tight Video Playback ---");
  await page.goto("http://localhost:3000/yt?reel=yt_a8d79bfc-20a4-4bc6-85f9-495b858c5603", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await sleep(1000);

  // Click "16.7s Tight" button
  console.log("Clicking '16.7s Tight' button...");
  const clickedTight = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const tightBtn = buttons.find((b) => b.textContent && b.textContent.includes("16.7s Tight"));
    if (tightBtn) {
      tightBtn.click();
      return true;
    }
    return false;
  });
  console.log(`Tight button clicked: ${clickedTight}`);
  await sleep(1200);

  const ytVideoInfo = await page.evaluate(() => {
    const v = document.querySelector("video");
    return {
      src: v ? v.src : null,
      duration: v ? v.duration : 0,
      readyState: v ? v.readyState : 0,
      paused: v ? v.paused : true,
    };
  });
  console.log("YT Video Info after clicking 16.7s Tight:", ytVideoInfo);

  const shot1Path = path.join(SCREENSHOT_DIR, "01_yt_16s_tight_playing.png");
  await page.screenshot({ path: shot1Path });
  console.log(`📸 Saved screenshot: ${shot1Path}`);

  // TEST 2: /motion-pictures
  console.log("\n--- TEST 2: Testing /motion-pictures Clean Workstation & Reset Controls ---");
  await page.goto("http://localhost:3000/motion-pictures", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await sleep(1000);

  // Assert no "Production #studio1_" cards exist
  const reelCards = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("#post-generation-studio button"));
    return buttons.map((b) => b.textContent?.trim()).filter(Boolean);
  });
  console.log(`Found ${reelCards.length} buttons in post-gen studio.`);

  const hasOrphanDrafts = reelCards.some((txt) => txt.includes("Production #studio1_"));
  console.log(`Contains orphan 'Production #studio1_' cards: ${hasOrphanDrafts}`);

  // Inspect active video element
  const editorVideoInfo = await page.evaluate(() => {
    const v = document.querySelector("#post-generation-studio video");
    return {
      src: v ? v.src : null,
      duration: v ? v.duration : 0,
      filter: v ? v.style.filter : null,
    };
  });
  console.log("Post-Gen Editor Video Info:", editorVideoInfo);

  // Test Reset Shot Button
  const resetShotClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes("Reset Shot"));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log(`Reset Shot button clicked: ${resetShotClicked}`);
  await sleep(800);

  // Test Reset LUT Button
  await page.evaluate(() => {
    const lutButtons = Array.from(document.querySelectorAll("button"));
    const cyberpunk = lutButtons.find((b) => b.textContent && b.textContent.includes("Cyberpunk Neon"));
    if (cyberpunk) cyberpunk.click();
  });
  await sleep(500);

  const resetLutClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes("Reset LUT"));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log(`Reset LUT button clicked: ${resetLutClicked}`);
  await sleep(800);

  const shot2Path = path.join(SCREENSHOT_DIR, "02_motion_pictures_clean_workstation.png");
  await page.screenshot({ path: shot2Path });
  console.log(`📸 Saved screenshot: ${shot2Path}`);

  // Check unique key errors
  const keyErrors = consoleErrors.filter((err) => err.includes("unique \"key\" prop"));
  console.log(`\nUnique key warning count: ${keyErrors.length}`);
  if (keyErrors.length > 0) {
    console.error("Key warnings found:", keyErrors);
  } else {
    console.log("✓ Zero React key warnings detected!");
  }

  await browser.close();
  console.log("\n=== Headless E2E Verification Complete ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
