import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.join(process.cwd(), "scratch", "screenshots_persona6_heritage");
const DOWNLOAD_DIR = path.join(process.cwd(), "scratch", "downloads_persona6_test");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPersona6E2E() {
  console.log("🚀 Starting Persona #6 (Heritage & Mythology) E2E Test Suite...");

  // 1. Clean and prepare output directories
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  if (fs.existsSync(DOWNLOAD_DIR)) {
    fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--autoplay-policy=no-user-gesture-required"]
  });

  try {
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOAD_DIR
    });

    // 2. Desktop Viewport (1600x950)
    await page.setViewport({ width: 1600, height: 950 });
    await page.goto("http://localhost:3000/studio/create/story", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => {
      localStorage.setItem("zyvoriq_cookie_consent", "accepted");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await sleep(800);

    // Assert Title and Header
    const titleText = await page.$eval("h1", el => el.innerText);
    console.log("✅ Page Title:", titleText);
    if (!titleText.includes("Heritage, Mythology")) {
      throw new Error("Page title mismatch: " + titleText);
    }

    // Verify Video Element
    const videoSrc = await page.$eval("video", el => el.getAttribute("src"));
    console.log("✅ Video Element Src:", videoSrc);
    if (!videoSrc || !videoSrc.includes("persona6_heritage_mythology_reel.mp4")) {
      throw new Error("Video source invalid: " + videoSrc);
    }

    const playsInline = await page.$eval("video", el => el.hasAttribute("playsinline") || el.hasAttribute("playsInline"));
    console.log("✅ Video playsInline attribute present:", playsInline);

    // Screenshot 1: Desktop Video View
    const shot1Path = path.join(SCREENSHOT_DIR, "01_persona6_desktop_video.png");
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log("📸 Saved Screenshot 1:", shot1Path);

    // Switch to Manuscript Tab
    await page.waitForSelector("#tab-btn-manuscript");
    await page.click("#tab-btn-manuscript");
    await sleep(800);

    // Screenshot 2: Desktop Manuscript Tab
    const shot2Path = path.join(SCREENSHOT_DIR, "02_persona6_desktop_manuscript.png");
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log("📸 Saved Screenshot 2:", shot2Path);

    // Switch to Sacred Acoustics Tab
    await page.waitForSelector("#tab-btn-acoustics");
    await page.click("#tab-btn-acoustics");
    await sleep(800);

    // Screenshot 3: Desktop Acoustics Tab
    const shot3Path = path.join(SCREENSHOT_DIR, "03_persona6_desktop_acoustics.png");
    await page.screenshot({ path: shot3Path, fullPage: false });
    console.log("📸 Saved Screenshot 3:", shot3Path);

    // Switch back to Video Tab & Test Physical File Downloads
    await page.waitForSelector("#tab-btn-video");
    await page.click("#tab-btn-video");
    await sleep(800);

    // Trigger OPF, Cue Sheet and Script Downloads
    const downloadBtns = await page.$$("button");
    for (const btn of downloadBtns) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes("Download OPF") || text.includes("Audio Cues") || text.includes("Full Script")) {
        await btn.click();
        await sleep(300);
      }
    }
    await sleep(1200);

    // 3. iOS Mobile Viewport (iPhone 14: 390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);

    const isIosOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log("📱 iOS iPhone 14 (390x844) Zero-Overflow Pass:", !isIosOverflowing);
    if (isIosOverflowing) {
      throw new Error("iOS viewport horizontal overflow detected!");
    }

    const shot4Path = path.join(SCREENSHOT_DIR, "04_persona6_mobile_ios.png");
    await page.screenshot({ path: shot4Path, fullPage: false });
    console.log("📸 Saved Screenshot 4 (iOS):", shot4Path);

    // 4. Android Mobile Viewport (Pixel 7: 412x915)
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);

    const isAndroidOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log("📱 Android Pixel 7 (412x915) Zero-Overflow Pass:", !isAndroidOverflowing);
    if (isAndroidOverflowing) {
      throw new Error("Android viewport horizontal overflow detected!");
    }

    const shot5Path = path.join(SCREENSHOT_DIR, "05_persona6_mobile_android.png");
    await page.screenshot({ path: shot5Path, fullPage: false });
    console.log("📸 Saved Screenshot 5 (Android):", shot5Path);

    await browser.close();
    console.log("🏆 Persona #6 E2E Test Suite Passed 100%!");
  } catch (err) {
    console.error("❌ Persona #6 E2E Test Failed:", err);
    await browser.close();
    process.exit(1);
  }
}

runPersona6E2E().catch(console.error);
