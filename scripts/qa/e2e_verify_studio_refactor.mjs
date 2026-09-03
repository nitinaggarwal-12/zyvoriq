import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runStudioVerification() {
  const screenshotDir = path.join(process.cwd(), "scratch/screenshots_studio_refactored");
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log("🚀 Launching Chrome for Studio Verification...");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();

  // 1. Desktop 1600x1000 - /studio
  console.log("📡 Testing /studio on Desktop...");
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2" });
  await sleep(1000);
  await page.screenshot({ path: path.join(screenshotDir, "01_studio_refactored_desktop.png"), fullPage: false });
  console.log("📸 Captured: 01_studio_refactored_desktop.png");

  // 2. Desktop 1600x1000 - /studio/inspector
  console.log("📡 Testing /studio/inspector on Desktop...");
  await page.goto("http://localhost:3000/studio/inspector", { waitUntil: "networkidle2" });
  await sleep(1000);
  await page.screenshot({ path: path.join(screenshotDir, "02_studio_inspector_refactored_desktop.png"), fullPage: false });
  console.log("📸 Captured: 02_studio_inspector_refactored_desktop.png");

  // 3. Desktop 1600x1000 - /studio/books
  console.log("📡 Testing /studio/books on Desktop...");
  await page.goto("http://localhost:3000/studio/books", { waitUntil: "networkidle2" });
  await sleep(1000);
  await page.screenshot({ path: path.join(screenshotDir, "03_studio_books_refactored_desktop.png"), fullPage: false });
  console.log("📸 Captured: 03_studio_books_refactored_desktop.png");

  // 4. Mobile iPhone 14 (390x844) - /studio
  console.log("📱 Testing /studio on iPhone 14...");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2" });
  await sleep(1000);
  const studioMobileOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log("Mobile Studio Overflow:", studioMobileOverflow);
  await page.screenshot({ path: path.join(screenshotDir, "04_studio_refactored_iphone14.png"), fullPage: false });
  console.log("📸 Captured: 04_studio_refactored_iphone14.png");

  await browser.close();
  console.log("🎉 All Studio Verification Screenshots Captured Successfully!");
}

runStudioVerification().catch(console.error);
