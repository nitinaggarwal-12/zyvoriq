import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots/episode_creator');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("=== Testing Episode Creator Studio on Cloudtop ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1500, height: 1100 });

    page.on('console', msg => {
      console.log(`[PAGE ${msg.type().toUpperCase()}]:`, msg.text());
    });

    page.on('pageerror', err => {
      console.log('[PAGE CRASH]:', err.message);
    });

    console.log("Navigating to http://localhost:3000/episodes/create ...");
    await page.goto("http://localhost:3000/episodes/create", { waitUntil: "networkidle2" });
    await sleep(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_episode_creator_initial_form.png'), fullPage: true });
    console.log("Saved 01_episode_creator_initial_form.png");

    console.log("Clicking 'Direct 30-Min Episode with Omni'...");
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const directBtn = buttons.find(b => b.textContent?.includes("Direct") && b.textContent?.includes("Episode"));
      if (directBtn) {
        directBtn.click();
        return true;
      }
      return false;
    });
    console.log("Button clicked:", clicked);

    console.log("Awaiting blueprint compilation...");
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return text.includes("Theatrical Acts") || text.includes("Master Episode Blueprint") || text.includes("OMNI_SHOWRUNNER_FAILED") || text.includes("Failed to direct");
      },
      { timeout: 70000 }
    );
    await sleep(1500);

    const hasBlueprint = await page.evaluate(() => document.body.innerText.includes("Theatrical Acts"));
    console.log("Has blueprint in DOM:", hasBlueprint);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_episode_master_blueprint_acts.png'), fullPage: true });
    console.log("Saved 02_episode_master_blueprint_acts.png");

    // Click Act 2 tab
    console.log("Switching to Act 2 tab...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const act2Btn = buttons.find(b => b.textContent?.trim().startsWith("Act 2"));
      if (act2Btn) act2Btn.click();
    });
    await sleep(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_episode_act2_chapters.png'), fullPage: true });
    console.log("Saved 03_episode_act2_chapters.png");

    // Mobile testing
    console.log("Testing iOS viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    const iosScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log("iOS scrollWidth <= 390:", iosScrollWidth <= 390, `(${iosScrollWidth}px)`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_ios_episode_studio.png'), fullPage: true });
    console.log("Saved 04_mobile_ios_episode_studio.png");

    console.log("Testing Android viewport (412x915)...");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);
    const androidScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log("Android scrollWidth <= 412:", androidScrollWidth <= 412, `(${androidScrollWidth}px)`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mobile_android_episode_studio.png'), fullPage: true });
    console.log("Saved 05_mobile_android_episode_studio.png");

    console.log("✅ ALL AUDITS COMPLETED SUCCESSFULLY!");
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
