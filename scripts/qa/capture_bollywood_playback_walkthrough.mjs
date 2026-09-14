import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.join(process.cwd(), "scratch", "screenshots_bollywood_college_42s");
const PROD_ID = "studio1_aebb020a-490c-4157-8985-eb8ac75e04d6";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  console.log(`\n🎬 [Puppeteer] Capturing live playback walkthrough for ${PROD_ID}...`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1600,1000"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    // Step 1: Open My Reels library
    console.log("1. Navigating to http://localhost:3000/my-reels...");
    await page.goto("http://localhost:3000/my-reels", { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2500);

    const shot1 = path.join(SCREENSHOT_DIR, "01_bollywood_college_library.png");
    await page.screenshot({ path: shot1 });
    console.log(`📸 Saved: ${shot1}`);

    // Step 2: Click on the 42s master video card to open the spotlight player
    console.log("2. Clicking master card to open spotlight player...");
    await page.evaluate(() => {
      const playOverlay = document.querySelector(".cursor-pointer.aspect-\\[9\\/16\\], .cursor-pointer.group");
      if (playOverlay && typeof playOverlay.click === "function") {
        playOverlay.click();
      }
    });
    await sleep(1500);

    const shot2 = path.join(SCREENSHOT_DIR, "02_bollywood_college_spotlight_opened.png");
    await page.screenshot({ path: shot2 });
    console.log(`📸 Saved: ${shot2}`);

    // Step 3: Unmute and play the video in spotlight
    console.log("3. Playing master 42s video in spotlight player...");
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) {
        v.muted = true;
        v.play().catch(() => {});
      }
    });
    await sleep(2500);

    const shot3 = path.join(SCREENSHOT_DIR, "03_bollywood_college_playing_shot1.png");
    await page.screenshot({ path: shot3 });
    console.log(`📸 Saved: ${shot3}`);

    // Step 4: Seek to 14.0s (Shot 3: Ananya dance choreography)
    console.log("4. Seeking to 14.0s (Shot 3)...");
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) v.currentTime = 14.0;
    });
    await sleep(1500);

    const shot4 = path.join(SCREENSHOT_DIR, "04_bollywood_college_playing_shot3.png");
    await page.screenshot({ path: shot4 });
    console.log(`📸 Saved: ${shot4}`);

    // Step 5: Seek to 28.0s (Shot 5: Neon stage festival flash mob)
    console.log("5. Seeking to 28.0s (Shot 5)...");
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) v.currentTime = 28.0;
    });
    await sleep(1500);

    const shot5 = path.join(SCREENSHOT_DIR, "05_bollywood_college_playing_shot5.png");
    await page.screenshot({ path: shot5 });
    console.log(`📸 Saved: ${shot5}`);

    // Step 6: Seek to 38.0s (Shot 6: Fireworks finale)
    console.log("6. Seeking to 38.0s (Shot 6)...");
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) v.currentTime = 38.0;
    });
    await sleep(1500);

    const shot6 = path.join(SCREENSHOT_DIR, "06_bollywood_college_playing_shot6_finale.png");
    await page.screenshot({ path: shot6 });
    console.log(`📸 Saved: ${shot6}`);

    // Step 7: Mobile iOS Viewport (390x844)
    console.log("7. Testing Mobile iOS viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(1000);
    const shot7 = path.join(SCREENSHOT_DIR, "07_bollywood_college_mobile_ios.png");
    await page.screenshot({ path: shot7 });
    console.log(`📸 Saved: ${shot7}`);

    // Step 8: Mobile Android Viewport (412x915)
    console.log("8. Testing Mobile Android viewport (412x915)...");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(1000);
    const shot8 = path.join(SCREENSHOT_DIR, "08_bollywood_college_mobile_android.png");
    await page.screenshot({ path: shot8 });
    console.log(`📸 Saved: ${shot8}`);

    console.log("\n🎉 [All Walkthrough Screenshots Successfully Captured!]");
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("Puppeteer Walkthrough Error:", err);
  process.exit(1);
});
