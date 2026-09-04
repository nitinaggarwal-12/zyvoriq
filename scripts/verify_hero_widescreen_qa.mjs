import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OUT_DIR = path.resolve("./scratch/screenshots_hero_widescreen_qa");

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });

  const page = await browser.newPage();

  // Test 1: Ultra-wide Desktop 1920x1080 (the user's monitor resolution!)
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const heroStats1920 = await page.evaluate(() => {
    const hero = document.querySelector("section");
    const container = hero?.querySelector(".grid");
    const rect = container?.getBoundingClientRect();
    return {
      windowWidth: window.innerWidth,
      containerWidth: rect?.width,
      leftGutter: rect?.left,
      rightGutter: window.innerWidth - (rect?.right || 0)
    };
  });
  console.log("Stats @ 1920px:", heroStats1920);

  const shot1920 = path.join(OUT_DIR, "01_hero_widescreen_1920px.png");
  await page.screenshot({ path: shot1920, fullPage: false });
  console.log("Saved screenshot:", shot1920);

  // Test 2: Standard Desktop 1600x1000
  await page.setViewport({ width: 1600, height: 1000 });
  await sleep(1500);
  const shot1600 = path.join(OUT_DIR, "02_hero_widescreen_1600px.png");
  await page.screenshot({ path: shot1600, fullPage: false });
  console.log("Saved screenshot:", shot1600);

  await browser.close();
  console.log("Hero widescreen verification complete!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
