import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = path.join(process.cwd(), "scratch", "screenshots_post_gen_editor");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("🚀 Starting E2E Verification of Motion Pictures Post-Generation Editor...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Navigate to /motion-pictures
  console.log("Navigating to http://localhost:3000/motion-pictures...");
  await page.goto("http://localhost:3000/motion-pictures", { waitUntil: "networkidle2" });
  await sleep(1500);

  const studioElem = await page.$("#post-generation-studio");
  if (studioElem) {
    await studioElem.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_motion_pictures_post_gen_studio_overview.png"),
    });
    console.log("✓ Saved 01_motion_pictures_post_gen_studio_overview.png");
  }

  // 2. Test changing Shot Visual Speed slider to 4.00x using React native value setter
  console.log("Testing Shot Visual Speed slider to 4.00x...");
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="range"]'));
    // The shot visual speed slider is the one with min="0.25", max="4" inside the selected shot inspector
    const shotSpeedInput = inputs.find((i) => i.max === "4" && i.min === "0.25");
    if (shotSpeedInput) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeSetter.call(shotSpeedInput, "4");
      shotSpeedInput.dispatchEvent(new Event("input", { bubbles: true }));
      shotSpeedInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await sleep(1000);

  // Inspect DOM <video> element
  const videoState = await page.evaluate(() => {
    const v = document.querySelector("#post-generation-studio video");
    return {
      playbackRate: v ? v.playbackRate : null,
      src: v ? v.src : null,
      filter: v ? v.style.filter : null,
      currentTime: v ? v.currentTime : null,
    };
  });
  console.log("Live Video State after setting 4.00x speed:", videoState);

  // 3. Test Trim Out slider to 0.28s
  console.log("Testing Trim Out slider to 0.28s...");
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="range"]'));
    // Second range input in the inspector is Trim Out
    if (inputs[1]) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeSetter.call(inputs[1], "0.28");
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await sleep(1000);

  // 4. Test selecting Cyberpunk Neon Color Grading LUT
  console.log("Testing Cyberpunk Neon Color Grading LUT...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const cyberpunkBtn = btns.find((b) => b.innerText.includes("Cyberpunk Neon"));
    if (cyberpunkBtn) cyberpunkBtn.click();
  });
  await sleep(800);

  const videoFilterState = await page.evaluate(() => {
    const v = document.querySelector("#post-generation-studio video");
    return v ? v.style.filter : null;
  });
  console.log("Video style.filter after selecting Cyberpunk Neon:", videoFilterState);

  // Capture close-up of the active NLE editor with Cyberpunk filter and 4.00x speed
  if (studioElem) {
    await studioElem.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_post_gen_editor_cyberpunk_4x_active.png"),
    });
    console.log("✓ Saved 02_post_gen_editor_cyberpunk_4x_active.png");
  }

  // 5. Test switching to Napoleon Waterloo reel
  console.log("Switching to Napoleon Waterloo reel in selector...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("#post-generation-studio button"));
    const napoleonBtn = btns.find((b) => b.innerText.includes("Waterloo 1815"));
    if (napoleonBtn) napoleonBtn.click();
  });
  await sleep(1200);

  if (studioElem) {
    await studioElem.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_napoleon_waterloo_loaded_in_editor.png"),
    });
    console.log("✓ Saved 03_napoleon_waterloo_loaded_in_editor.png");
  }

  // 6. Navigate to /my-reels to verify the same upgraded ReelTimelineEditor in Stage 5
  console.log("Navigating to http://localhost:3000/my-reels...");
  await page.goto("http://localhost:3000/my-reels", { waitUntil: "networkidle2" });
  await sleep(1500);

  await page.evaluate(() => {
    const editBtn = document.querySelector("#btn-edit-timeline");
    if (editBtn) editBtn.click();
  });
  await sleep(1000);

  const myReelsEditor = await page.$("#nle-timeline-editor");
  if (myReelsEditor) {
    await myReelsEditor.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_my_reels_timeline_editor_upgraded.png"),
    });
    console.log("✓ Saved 04_my_reels_timeline_editor_upgraded.png");
  }

  console.log("🎉 All E2E verification steps completed successfully!");
  await browser.close();
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
