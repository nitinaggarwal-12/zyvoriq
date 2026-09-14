import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const PROD_ID = "studio1_d1218706-44a7-4da9-be83-d24741e6f2fd";
const URL = `http://localhost:3000/my-reels?reel=${PROD_ID}`;
const OUT_DIR = path.join(process.cwd(), "scratch", "screenshots_alpha_reel");

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`🚀 Launching Chrome to verify ${URL}...`);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000)); // Settling delay

  const shot1 = path.join(OUT_DIR, "01_alpha_reels_library.png");
  await page.screenshot({ path: shot1, fullPage: true });
  console.log(`Saved screenshot: ${shot1}`);

  // Also check direct video player or home page
  console.log(`Navigating to home page with reel open...`);
  await page.goto(`http://localhost:3000/?continueReel=${PROD_ID}`, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));

  const shot2 = path.join(OUT_DIR, "02_alpha_reel_player.png");
  await page.screenshot({ path: shot2, fullPage: true });
  console.log(`Saved screenshot: ${shot2}`);

  await browser.close();
  console.log("✅ Puppeteer validation complete!");
}

run().catch(err => {
  console.error("Puppeteer error:", err);
  process.exit(1);
});
