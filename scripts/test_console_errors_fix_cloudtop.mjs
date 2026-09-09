import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots/console_fix');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("=== Testing My-Reels Console & 502 Bug Fix on Cloudtop ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const errors = [];
  const warnings = [];
  const failedResponses = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100 });

    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      if (type === 'error') {
        errors.push(text);
        console.log("PAGE ERROR:", text);
      } else if (type === 'warning') {
        warnings.push(text);
        if (text.includes("sizes") || text.includes("fill")) {
          console.log("PAGE WARNING (Image sizes):", text);
        }
      }
    });

    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (status >= 500) {
        failedResponses.push({ status, url });
        console.log(`SERVER ERROR ${status}: ${url}`);
      }
    });

    // 1. Navigate to /my-reels
    console.log("Navigating to http://localhost:3000/my-reels ...");
    await page.goto("http://localhost:3000/my-reels", { waitUntil: "networkidle2" });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_my_reels_clean_load.png'), fullPage: true });

    // 2. Click to toggle expand on reels
    console.log("Toggling expand on reel...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chevronBtn = buttons.find(b => b.querySelector('svg') && (b.textContent?.includes("Clips") || b.textContent?.includes("Shot") || b.getAttribute("aria-label")?.includes("expand")));
      if (chevronBtn) {
        chevronBtn.click();
      } else if (buttons[0]) {
        buttons[0].click();
      }
    });
    await sleep(1000);

    // Check URL state
    const currentUrl = page.url();
    console.log("Current URL after expand toggle:", currentUrl);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_my_reels_expanded_state.png'), fullPage: true });

    // 3. Mobile Viewport Tests
    console.log("Testing iOS Mobile Viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    const iosScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log("iOS scrollWidth <= 390:", iosScrollWidth <= 390, `(${iosScrollWidth}px)`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mobile_ios_my_reels.png'), fullPage: true });

    console.log("Testing Android Mobile Viewport (412x915)...");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);
    const androidScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log("Android scrollWidth <= 412:", androidScrollWidth <= 412, `(${androidScrollWidth}px)`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_android_my_reels.png'), fullPage: true });

    // Summary assertions
    console.log("\n--- Verification Summary ---");
    const routerErrors = errors.filter(e => e.includes("Cannot update a component (`Router`) while rendering a different component"));
    console.log("Router setState in render errors count:", routerErrors.length);
    console.log("502 Bad Gateway responses count:", failedResponses.filter(r => r.status === 502).length);
    const sizeWarnings = warnings.filter(w => w.includes("has \"fill\" but is missing \"sizes\" prop"));
    console.log("Missing sizes prop warnings count:", sizeWarnings.length);

    if (routerErrors.length > 0) {
      throw new Error(`Found ${routerErrors.length} Router setState in render errors!`);
    }
    if (failedResponses.some(r => r.status === 502)) {
      throw new Error(`Found ${failedResponses.length} 502 Bad Gateway responses!`);
    }

    console.log("✅ ALL AUDIT GATES PASSED CLEANLY!");
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
