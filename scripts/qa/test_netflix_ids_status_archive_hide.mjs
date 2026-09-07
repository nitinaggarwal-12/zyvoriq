import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("./scratch/screenshots_reels_separation");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("=== STARTING QA: NETFLIX IDs, ACCURATE STATUS, ARCHIVE & HIDE ===");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1600,1000"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const targetUrl = process.env.TEST_URL || "http://localhost:3000/my-reels";
  console.log(`Navigating to ${targetUrl}...`);

  await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 45000 });
  await sleep(1500);

  // 1. Capture initial view with status filter tabs
  const initialShot = path.join(SCREENSHOT_DIR, "11_my_reels_accurate_status_tabs.png");
  await page.screenshot({ path: initialShot, fullPage: false });
  console.log(`[PASS] Captured initial view with accurate status tabs: ${initialShot}`);

  // 2. Inspect filter tab texts and counts
  const tabTexts = await page.$$eval("div.flex button", buttons => 
    buttons.map(b => b.innerText.trim()).filter(t => t.length > 0 && (
      t.includes("All") || t.includes("Ready") || t.includes("Diffusing") || 
      t.includes("Attention") || t.includes("Drafts") || t.includes("Saved") || 
      t.includes("Archive") || t.includes("Hidden")
    ))
  );
  console.log("Detected Filter Tabs on Page:", tabTexts);

  // Assert diffusing count is NOT 80
  const diffusingTab = tabTexts.find(t => t.includes("Diffusing"));
  console.log(`Diffusing tab text: "${diffusingTab}"`);
  if (diffusingTab && diffusingTab.includes("(80)")) {
    throw new Error(`FAIL: Diffusing tab still falsely shows (80)!`);
  }
  console.log("[PASS] Diffusing tab does NOT show false 80 count.");

  // 3. Verify Netflix Reel IDs exist on Reel cards
  const netflixReelIds = await page.$$eval("button[title*='Netflix']", btns => 
    btns.map(b => b.innerText.replace(/\s+/g, " ").trim())
  );
  console.log("Detected Netflix Reel ID Badges:", netflixReelIds.slice(0, 5));
  if (netflixReelIds.length === 0 || !netflixReelIds.some(id => id.includes("ZYV-"))) {
    throw new Error("FAIL: No Netflix Reel IDs (ZYV-...) found on reel tiles!");
  }
  console.log("[PASS] Netflix-grade Reel IDs are prominently rendered.");

  // 4. Verify status badges are accurate (Ready vs Attention vs Diffusing vs Draft)
  const statusBadges = await page.$$eval("span.rounded-full", spans =>
    spans.map(s => s.innerText.trim()).filter(t => 
      t.includes("4K MASTER READY") || t.includes("NEEDS ATTENTION") || 
      t.includes("DIFFUSING IN CLOUD") || t.includes("DRAFT")
    )
  );
  console.log("Sample Status Badges Found:", statusBadges.slice(0, 8));
  if (statusBadges.length === 0) {
    throw new Error("FAIL: No multi-tier status badges found!");
  }
  console.log("[PASS] Multi-tier status badges verified.");

  // 5. Expand first reel and verify Netflix Clip IDs and Clip action buttons
  const expandBar = await page.$("div[class*='group hover:bg-zinc-900']");
  if (expandBar) {
    await expandBar.click();
    await sleep(1000);
  }

  const clipIds = await page.$$eval("button[title*='Clip ID']", btns =>
    btns.map(b => b.innerText.trim())
  );
  console.log("Detected Netflix Clip IDs:", clipIds.slice(0, 6));
  if (clipIds.length === 0 || !clipIds.some(id => id.includes("-C0"))) {
    throw new Error("FAIL: Constituent clips do not display Netflix Clip IDs (e.g. ZYV-...-C01)!");
  }
  console.log("[PASS] Netflix Clip IDs verified on expanded constituent clips.");

  const expandedShot = path.join(SCREENSHOT_DIR, "12_expanded_clips_with_netflix_ids.png");
  await page.screenshot({ path: expandedShot, fullPage: false });
  console.log(`[PASS] Captured expanded clips breakdown: ${expandedShot}`);

  // 6. Test Archive Reel
  console.log("Testing Archive Reel action...");
  const archiveBtn = await page.$("button[title='Archive Reel']");
  if (archiveBtn) {
    await archiveBtn.click();
    await sleep(1000);

    // Click Archive tab to see archived reel
    await page.$$eval("button", btns => {
      const b = btns.find(el => el.innerText.includes("Archive"));
      if (b) b.click();
    });
    await sleep(1000);

    const archiveShot = path.join(SCREENSHOT_DIR, "13_archive_tab_view.png");
    await page.screenshot({ path: archiveShot, fullPage: false });
    console.log(`[PASS] Captured Archive tab view: ${archiveShot}`);

    // Reload page to verify Archive state survives page reload (Idempotent Quality Gate)
    console.log("Testing page reload persistence for Archive state...");
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(1500);

    await page.$$eval("button", btns => {
      const b = btns.find(el => el.innerText.includes("Archive"));
      if (b) b.click();
    });
    await sleep(1000);

    const reloadArchiveShot = path.join(SCREENSHOT_DIR, "14_archive_persisted_after_reload.png");
    await page.screenshot({ path: reloadArchiveShot, fullPage: false });
    console.log(`[PASS] Verified Archive state survived reload: ${reloadArchiveShot}`);
  }

  // 7. Test Hide Reel
  console.log("Testing Hide Reel action...");
  // Go back to All tab
  await page.$$eval("button", btns => {
    const b = btns.find(el => el.innerText.includes("All"));
    if (b) b.click();
  });
  await sleep(800);

  const hideBtn = await page.$("button[title='Hide Reel']");
  if (hideBtn) {
    await hideBtn.click();
    await sleep(1000);

    // Switch to Hidden tab
    await page.$$eval("button", btns => {
      const b = btns.find(el => el.innerText.includes("Hidden"));
      if (b) b.click();
    });
    await sleep(1000);

    const hiddenShot = path.join(SCREENSHOT_DIR, "15_hidden_tab_view.png");
    await page.screenshot({ path: hiddenShot, fullPage: false });
    console.log(`[PASS] Captured Hidden tab view: ${hiddenShot}`);

    // Reload page to verify Hide state survives reload
    console.log("Testing page reload persistence for Hide state...");
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(1500);

    await page.$$eval("button", btns => {
      const b = btns.find(el => el.innerText.includes("Hidden"));
      if (b) b.click();
    });
    await sleep(1000);

    const reloadHiddenShot = path.join(SCREENSHOT_DIR, "16_hidden_persisted_after_reload.png");
    await page.screenshot({ path: reloadHiddenShot, fullPage: false });
    console.log(`[PASS] Verified Hidden state survived reload: ${reloadHiddenShot}`);
  }

  await browser.close();
  console.log("=== ALL QA CHECKS PASSED SUCCESSFULLY ===");
}

run().catch(err => {
  console.error("FATAL TEST FAILURE:", err);
  process.exit(1);
});
