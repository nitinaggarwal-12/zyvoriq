import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "https://zyvoriq.up.railway.app";
const SCREENSHOT_DIR = path.resolve(process.env.HOME, "zyvoriq_remote/scratch/cloudtop_e2e_screenshots");

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`🚀 Starting Creator Page E2E Verification against ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage();

    // 1. DESKTOP VIEWPORT (1600x1000)
    console.log("\n--- Step 1: Testing Desktop Viewport (1600x1000) ---");
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2000);

    // Physical DOM Assertions
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Required Differentiators & Creator Features
    const requiredStrings = [
      "Single Unbroken Take",
      "Zero Character Drift",
      "actually keep the same face",
      "~7 minutes for a 6-shot reel",
      "Labeled as AI, so platforms won't penalize you",
      "Midnight Cyberpunk Dance",
      "Alpine Sunrise Expedition",
      "Dune Nomad Odyssey",
      "Cosmic Deep Space Ascent",
      "Plans built for publishing velocity",
      "Starter Creator",
      "Pro Publisher",
      "Agency & Studio"
    ];

    for (const reqStr of requiredStrings) {
      if (!bodyText.includes(reqStr)) {
        throw new Error(`Missing required creator string: "${reqStr}" in page body`);
      }
      console.log(`  ✓ Found required text: "${reqStr}"`);
    }

    // Prohibited Technical/Bogus Claims
    const prohibitedStrings = [
      "Zero 3rd-Party Cloud Egress",
      "30-Min Movie & Duration Guide",
      "95% Pre-Flight Verification Gate",
      "Cryptographic Provenance",
      "11 phases"
    ];

    for (const badStr of prohibitedStrings) {
      if (bodyText.includes(badStr)) {
        throw new Error(`Found prohibited string: "${badStr}" on creator page!`);
      }
      console.log(`  ✓ Verified absent: "${badStr}"`);
    }

    // Assert video element is present and active
    const videoCount = await page.$$eval("video", videos => videos.length);
    console.log(`  ✓ Found ${videoCount} video elements on page`);
    if (videoCount < 4) {
      throw new Error(`Expected at least 4 video elements (fold + 4 reels), found ${videoCount}`);
    }

    // Screenshot 1: Fold (Hero + 9:16 Video + Prompt Bar)
    console.log("  📸 Capturing 01_creator_fold.png...");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_creator_fold.png") });

    // Screenshot 2: Showcase of Finished Reels
    console.log("  📸 Scrolling to showcase & capturing 02_finished_reels_showcase.png...");
    await page.$eval("#showcase", el => el.scrollIntoView({ behavior: "smooth" }));
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_finished_reels_showcase.png") });

    // Screenshot 3: Unbroken Take Differentiator
    console.log("  📸 Scrolling to differentiator & capturing 03_unbroken_take_differentiator.png...");
    await page.$eval("#differentiator", el => el.scrollIntoView({ behavior: "smooth" }));
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_unbroken_take_differentiator.png") });

    // Screenshot 4: Pricing Section
    console.log("  📸 Scrolling to pricing & capturing 04_creator_pricing.png...");
    await page.$eval("#pricing", el => el.scrollIntoView({ behavior: "smooth" }));
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_creator_pricing.png") });

    // 2. MOBILE VIEWPORT (390x844 - iPhone 14)
    console.log("\n--- Step 2: Testing Mobile Viewport (iPhone 14 @ 390x844) ---");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1500);

    // Assert zero horizontal overflow
    const overflowCheck = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    console.log(`  ✓ Mobile scrollWidth: ${overflowCheck.scrollWidth}px, innerWidth: ${overflowCheck.innerWidth}px`);
    if (overflowCheck.overflow) {
      throw new Error(`Mobile horizontal overflow detected! scrollWidth (${overflowCheck.scrollWidth}) > innerWidth (${overflowCheck.innerWidth})`);
    }

    console.log("  📸 Capturing 05_mobile_creator_fold.png...");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_mobile_creator_fold.png") });

    console.log("\n✅ ALL CREATOR PAGE QUALITY GATES & PUPPETEER ASSERTIONS PASSED!");
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error("\n❌ E2E Test Failure:", err.message);
  process.exit(1);
});
