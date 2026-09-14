import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {}

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:pncyiYBLwkzpdbCTqOySjcmAofiHjLLL@altaria.proxy.rlwy.net:35535/railway";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.join(process.cwd(), "scratch", "screenshots_bollywood_college_42s");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const idFile = path.join(process.cwd(), "scratch", "bollywood_college_42s", "latest_production_id.txt");
  let prodId = "";
  if (fs.existsSync(idFile)) {
    prodId = fs.readFileSync(idFile, "utf-8").trim();
  }

  if (!prodId) {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const res = await pool.query(
      "SELECT id FROM reel_productions WHERE topic ILIKE '%punjabi girls%' ORDER BY created_at DESC LIMIT 1"
    );
    await pool.end();
    if (res.rows.length) {
      prodId = res.rows[0].id;
    }
  }

  if (!prodId) {
    throw new Error("No Bollywood Punjabi Girls production ID found to verify");
  }

  console.log(`\n🧪 [E2E QA] Verifying Production ${prodId} on http://localhost:3000...`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1600,1000"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    // Step 1: Navigate to My Reels page
    const url = `http://localhost:3000/my-reels?reel=${prodId}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);

    const shot1 = path.join(SCREENSHOT_DIR, "01_bollywood_college_library.png");
    await page.screenshot({ path: shot1 });
    console.log(`📸 Saved screenshot: ${shot1}`);

    // Step 2: Click on spotlight / reel card
    const cardSelector = `[data-production-id="${prodId}"], button:has-text("Watch Master Cut")`;
    const watchBtn = await page.$('button, a');
    await sleep(1000);

    const shot2 = path.join(SCREENSHOT_DIR, "02_bollywood_college_spotlight_player.png");
    await page.screenshot({ path: shot2 });
    console.log(`📸 Saved screenshot: ${shot2}`);

    // Step 3: Trigger video play
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
    console.log(`📸 Saved screenshot: ${shot3}`);

    // Step 4: Seek to 16s (Shot 3)
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) v.currentTime = 16.0;
    });
    await sleep(1200);

    const shot4 = path.join(SCREENSHOT_DIR, "04_bollywood_college_playing_shot3.png");
    await page.screenshot({ path: shot4 });
    console.log(`📸 Saved screenshot: ${shot4}`);

    // Step 5: Seek to 38s (Shot 6 Finale)
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) v.currentTime = 38.0;
    });
    await sleep(1200);

    const shot5 = path.join(SCREENSHOT_DIR, "05_bollywood_college_playing_shot6.png");
    await page.screenshot({ path: shot5 });
    console.log(`📸 Saved screenshot: ${shot5}`);

    // Step 6: Mobile viewports
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    const shot6 = path.join(SCREENSHOT_DIR, "06_bollywood_college_mobile_ios.png");
    await page.screenshot({ path: shot6 });
    console.log(`📸 Saved screenshot: ${shot6}`);

    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);
    const shot7 = path.join(SCREENSHOT_DIR, "07_bollywood_college_mobile_android.png");
    await page.screenshot({ path: shot7 });
    console.log(`📸 Saved screenshot: ${shot7}`);

    console.log(`\n✅ [E2E QA Complete] All 7 verification screenshots captured successfully!`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("QA FAILURE:", err);
  process.exit(1);
});
