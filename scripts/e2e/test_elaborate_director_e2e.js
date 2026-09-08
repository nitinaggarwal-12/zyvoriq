
const puppeteer = require("/usr/local/google/home/nitinagga/node_modules/puppeteer");
const fs = require("fs");
const path = require("path");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const outputDir = "/tmp/cloudtop_elaborate_screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🚀 Launching Headless Chrome on Cloudtop...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1600,1200"
    ]
  });

  const page = await browser.newPage();
  const BASE_URL = "https://zyvoriq.up.railway.app";

  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 1 });
  console.log("📸 Navigating to Creator Home at " + BASE_URL + "...");
  await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 35000 });
  await sleep(1500);

  // Type in prompt
  console.log("📝 Entering prompt...");
  await page.type("textarea", "Yash Chopra romance: Duet dance between violinist hero and flowing chiffon saree heroine in Swiss Alps, Mohabbatein aesthetic, Lyria Bollywood strings, 2.39:1", { delay: 10 });
  await sleep(500);

  // Click Elaborate & Deconstruct
  console.log("👉 Clicking Elaborate & Deconstruct...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.textContent && b.textContent.includes("Elaborate & Deconstruct"));
    if (btn) btn.click();
  });

  console.log("⏳ Waiting for Omni Director Pre-Flight Treatment Dossier to compile...");
  await page.waitForFunction(() => {
    return document.body.textContent && document.body.textContent.includes("Omni Director Pre-Flight Treatment");
  }, { timeout: 45000 });
  console.log("🎉 Omni Director Pre-Flight Treatment Dossier found!");
  await sleep(1500);

  // Scroll Dossier into view
  await page.evaluate(() => {
    const el = document.querySelector(".border-teal-500\\/40");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await sleep(800);

  const dossierShot = path.join(outputDir, "02_desktop_elaborate_treatment_dossier.png");
  await page.screenshot({ path: dossierShot, fullPage: false });
  console.log("✅ Captured 02_desktop_elaborate_treatment_dossier.png (" + fs.statSync(dossierShot).size + " bytes)");

  // Click Cast & Wardrobe tab
  console.log("👉 Switching to Cast & Wardrobe tab...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const castBtn = btns.find(b => b.textContent && b.textContent.includes("Cast & Wardrobe"));
    if (castBtn) castBtn.click();
  });
  await sleep(800);
  const castShot = path.join(outputDir, "03_desktop_cast_wardrobe_tab.png");
  await page.screenshot({ path: castShot, fullPage: false });
  console.log("✅ Captured 03_desktop_cast_wardrobe_tab.png (" + fs.statSync(castShot).size + " bytes)");

  // Click Acoustic Bed & Color Grade tab
  console.log("👉 Switching to Acoustic Bed & Color Grade tab...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const scoreBtn = btns.find(b => b.textContent && b.textContent.includes("Acoustic Bed"));
    if (scoreBtn) scoreBtn.click();
  });
  await sleep(800);
  const scoreShot = path.join(outputDir, "04_desktop_acoustic_score_tab.png");
  await page.screenshot({ path: scoreShot, fullPage: false });
  console.log("✅ Captured 04_desktop_acoustic_score_tab.png (" + fs.statSync(scoreShot).size + " bytes)");

  // --- MOBILE VIEWPORT TEST (390x844 iPhone 14) ---
  console.log("📱 Switching to iPhone 14 Viewport (390x844)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sleep(1000);

  // Scroll Dossier into view on mobile
  await page.evaluate(() => {
    const el = document.querySelector(".border-teal-500\\/40");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await sleep(800);

  const isOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log("📱 Mobile Horizontal Overflow Check: " + (!isOverflow ? "PASS (Zero Overflow)" : "FAIL"));

  const mobileShot = path.join(outputDir, "05_mobile_iphone14_creator_home.png");
  await page.screenshot({ path: mobileShot, fullPage: false });
  console.log("✅ Captured 05_mobile_iphone14_creator_home.png (" + fs.statSync(mobileShot).size + " bytes)");

  await browser.close();
  console.log("🎉 Scrolled Captures Complete!");
})();
