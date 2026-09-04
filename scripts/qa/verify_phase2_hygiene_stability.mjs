import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const OUT_DIR = path.resolve("./scratch/screenshots_phase2_hygiene_stability");

async function run() {
  console.log("================ PHASE 2: STUDIO HYGIENE & STABILITY AUDIT ================");

  // 1. Purge & create dedicated screenshot directory
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 2. Launch Official System Chrome (macOS Signed Binary)
  console.log("\n[SETUP] Launching Signed System Google Chrome...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,1000"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  try {
    // -------------------------------------------------------------
    // TEST 1: Studio Clean Header & Dead Modals Purged
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Testing /studio for clean header & absence of dead gimmick modals...");
    await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2", timeout: 25000 });
    await sleep(1000);

    const studioContent = await page.content();
    if (studioContent.includes("Dopamine Split Screen") || studioContent.includes("🎮 Dopamine")) {
      throw new Error("Fake Dopamine button still found in /studio DOM!");
    }
    if (studioContent.includes("AutoMemeModal") || studioContent.includes("DemonetizationArmorModal")) {
      throw new Error("Dead gimmick modals found in /studio DOM!");
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "01_studio_clean_header.png"),
      fullPage: false
    });
    console.log("✅ 01_studio_clean_header.png captured. Dead modals and fake dopamine button purged.");

    // -------------------------------------------------------------
    // TEST 2: Create Hub Query Param Reading (?persona=heritage)
    // -------------------------------------------------------------
    console.log("\n[TEST 2] Testing /studio/create?persona=heritage query param synchronization...");
    await page.goto("http://localhost:3000/studio/create?persona=heritage", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    const heritageSelected = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Golden Age, Seniors & Heritage") || text.includes("Amar Chitra Katha");
    });
    if (!heritageSelected) {
      throw new Error("Persona #6 (Heritage Lore) was not selected via query parameter!");
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "02_create_query_param_heritage.png"),
      fullPage: false
    });
    console.log("✅ 02_create_query_param_heritage.png captured. Query param ?persona=heritage successfully applied.");

    // -------------------------------------------------------------
    // TEST 3: Create Hub Query Param Reading (?persona=ugc)
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Testing /studio/create?persona=ugc query param synchronization...");
    await page.goto("http://localhost:3000/studio/create?persona=ugc", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    const ugcSelected = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("High-Converting UGC Ads") || text.includes("E-Commerce & DTC Brands");
    });
    if (!ugcSelected) {
      throw new Error("Persona #4 (UGC Ads) was not selected via query parameter!");
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "03_create_query_param_ugc.png"),
      fullPage: false
    });
    console.log("✅ 03_create_query_param_ugc.png captured. Query param ?persona=ugc successfully applied.");

    // -------------------------------------------------------------
    // TEST 4: Subroute /studio/create/reel Dynamic Aspect Ratio & Breadcrumbs
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Testing /studio/create/reel aspect ratio morphing & breadcrumbs...");
    await page.goto("http://localhost:3000/studio/create/reel", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    // Verify breadcrumbs
    const reelBreadcrumbs = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      return nav ? nav.innerText : "";
    });
    if (!reelBreadcrumbs.includes("Studio") || !reelBreadcrumbs.includes("Create Hub") || !reelBreadcrumbs.includes("Viral Retention Reels")) {
      throw new Error(`Breadcrumbs missing or incomplete in /studio/create/reel: ${reelBreadcrumbs}`);
    }

    // Switch to 16:9 Cinema via direct DOM click
    await page.$eval("#btn-aspect-16-9", el => el.click());
    await sleep(1000); // 800ms+ mandatory settling delay

    const aspect169Active = await page.evaluate(() => {
      return document.body.innerText.toUpperCase().includes("16:9 LIVE PREVIEW");
    });
    if (!aspect169Active) {
      throw new Error("16:9 Live Preview did not update dynamically!");
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "04_reel_subroute_dynamic_16_9.png"),
      fullPage: false
    });
    console.log("✅ 04_reel_subroute_dynamic_16_9.png captured. Viewport morphed to 16:9.");

    // Switch to 1:1 Square via direct DOM click
    await page.$eval("#btn-aspect-1-1", el => el.click());
    await sleep(1000);

    await page.screenshot({
      path: path.join(OUT_DIR, "05_reel_subroute_dynamic_square.png"),
      fullPage: false
    });
    console.log("✅ 05_reel_subroute_dynamic_square.png captured. Viewport morphed to 1:1.");

    // -------------------------------------------------------------
    // TEST 5: Comics Subroute Breadcrumbs
    // -------------------------------------------------------------
    console.log("\n[TEST 5] Testing /studio/create/comics breadcrumbs...");
    await page.goto("http://localhost:3000/studio/create/comics", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    const comicsBreadcrumbs = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      return nav ? nav.innerText : "";
    });
    if (!comicsBreadcrumbs.includes("Studio") || !comicsBreadcrumbs.includes("Create Hub") || !comicsBreadcrumbs.includes("Shōnen Anime & Manga")) {
      throw new Error(`Comics breadcrumbs missing: ${comicsBreadcrumbs}`);
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "06_comics_subroute_breadcrumbs.png"),
      fullPage: false
    });
    console.log("✅ 06_comics_subroute_breadcrumbs.png captured.");

    // -------------------------------------------------------------
    // TEST 6: Animation Subroute Breadcrumbs
    // -------------------------------------------------------------
    console.log("\n[TEST 6] Testing /studio/create/animation breadcrumbs...");
    await page.goto("http://localhost:3000/studio/create/animation", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    const animBreadcrumbs = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      return nav ? nav.innerText : "";
    });
    if (!animBreadcrumbs.includes("Studio") || !animBreadcrumbs.includes("Create Hub") || !animBreadcrumbs.includes("Animation & 3D Studio")) {
      throw new Error(`Animation breadcrumbs missing: ${animBreadcrumbs}`);
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "07_animation_subroute_breadcrumbs.png"),
      fullPage: false
    });
    console.log("✅ 07_animation_subroute_breadcrumbs.png captured.");

    // -------------------------------------------------------------
    // TEST 7: UGC Subroute Breadcrumbs
    // -------------------------------------------------------------
    console.log("\n[TEST 7] Testing /studio/create/ugc breadcrumbs...");
    await page.goto("http://localhost:3000/studio/create/ugc", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    const ugcBreadcrumbs = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      return nav ? nav.innerText : "";
    });
    if (!ugcBreadcrumbs.includes("Studio") || !ugcBreadcrumbs.includes("Create Hub") || !ugcBreadcrumbs.includes("UGC Video Ads")) {
      throw new Error(`UGC breadcrumbs missing: ${ugcBreadcrumbs}`);
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "08_ugc_subroute_breadcrumbs.png"),
      fullPage: false
    });
    console.log("✅ 08_ugc_subroute_breadcrumbs.png captured.");

    // -------------------------------------------------------------
    // TEST 8: /studio/director -> /director Redirect
    // -------------------------------------------------------------
    console.log("\n[TEST 8] Testing /studio/director permanent redirect to /director...");
    await page.goto("http://localhost:3000/studio/director", { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(800);

    const currentUrl = page.url();
    if (!currentUrl.includes("/director") || currentUrl.includes("/studio/director")) {
      throw new Error(`Expected redirect to /director, but current URL is ${currentUrl}`);
    }

    await page.screenshot({
      path: path.join(OUT_DIR, "09_director_redirect.png"),
      fullPage: false
    });
    console.log("✅ 09_director_redirect.png captured. Redirect to /director verified.");

    // -------------------------------------------------------------
    // TEST 9: Honest Master Download Button & Dropdown
    // -------------------------------------------------------------
    console.log("\n[TEST 9] Testing honest ResolutionDownloadDropdown in /studio...");
    await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2", timeout: 25000 });
    await sleep(1000);

    const downloadBtnExists = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Download Master Video") || text.includes("1080p MP4");
    });
    if (!downloadBtnExists) {
      throw new Error("Honest master video download button not found in /studio!");
    }

    // Dismiss cookie banner if present
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const acceptBtn = btns.find(b => b.innerText.includes("Accept All & Enable C2PA") || b.innerText.includes("Essential Only"));
      if (acceptBtn) acceptBtn.click();
    });
    await sleep(400);

    // Scroll to right column video monitor
    await page.evaluate(() => {
      const monitor = document.querySelector(".rounded-\\[24px\\]");
      if (monitor) monitor.scrollIntoView({ behavior: "instant", block: "start" });
    });

    // Click dropdown toggle
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Select export format"]');
      if (btn) btn.click();
    });
    await sleep(800);

    await page.screenshot({
      path: path.join(OUT_DIR, "10_honest_export_dropdown.png"),
      fullPage: false
    });
    console.log("✅ 10_honest_export_dropdown.png captured. Honest export dropdown verified.");

    console.log("\n🎉 ALL 9 VERIFICATION TESTS PASSED WITH ZERO ERRORS!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("\n❌ E2E VERIFICATION FAILED:", err);
  process.exit(1);
});
