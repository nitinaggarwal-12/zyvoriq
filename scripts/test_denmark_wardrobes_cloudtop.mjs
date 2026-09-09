import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve(process.cwd(), "scratch/cloudtop_e2e_screenshots");

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("🚀 Running Cloudtop E2E Verification: Denmark Personas & Location Wardrobes...");

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });

  try {
    const page = await browser.newPage();

    // 1. Ultra-Wide Desktop Viewport
    await page.setViewport({ width: 1600, height: 950 });
    const targetUrl = "http://localhost:3000/characters";
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_characters_overview_desktop.png"), fullPage: false });
    console.log("📸 [1/11] Captured 01_characters_overview_desktop.png");

    // 2. Click "Denmark Personas" taste tab
    console.log("Selecting taste: Denmark Personas...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const denmarkBtn = buttons.find(b => b.textContent?.includes("Denmark Personas"));
      if (denmarkBtn) denmarkBtn.click();
      else throw new Error("Could not find Denmark Personas tab");
    });
    await sleep(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_denmark_personas_taste.png"), fullPage: false });
    console.log("📸 [2/11] Captured 02_denmark_personas_taste.png");

    // Assert DOM elements: Soren, Freja, Mikkel
    const characterNames = await page.$$eval("h3", els => els.map(e => e.textContent?.trim()));
    console.log("Visible Danish Characters:", characterNames);
    if (!characterNames.some(n => n?.includes("Soren Lindberg"))) throw new Error("Soren Lindberg not found in DOM");
    if (!characterNames.some(n => n?.includes("Freja Møller"))) throw new Error("Freja Møller not found in DOM");
    if (!characterNames.some(n => n?.includes("Mikkel Lind"))) throw new Error("Mikkel Lind not found in DOM");

    // 3. Switch Freja Moller to Gym outfit
    console.log("Switching Freja Møller to Gym wardrobe...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const frejaCard = cards.find(c => c.textContent?.includes("Freja Møller"));
      if (!frejaCard) throw new Error("Freja card not found");
      const gymBtn = Array.from(frejaCard.querySelectorAll("button")).find(b => b.textContent?.includes("Gym"));
      if (!gymBtn) throw new Error("Freja Gym button not found");
      gymBtn.click();
    });
    await sleep(800);

    const frejaGymSrc = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const frejaCard = cards.find(c => c.textContent?.includes("Freja Møller"));
      return frejaCard?.querySelector("img")?.src || "";
    });
    console.log("Freja Gym Image src:", frejaGymSrc);
    if (!frejaGymSrc.includes("freja_moller_gym.jpg")) {
      throw new Error(`Expected freja_moller_gym.jpg but got ${frejaGymSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_freja_gym_wardrobe.png"), fullPage: false });
    console.log("📸 [3/11] Captured 03_freja_gym_wardrobe.png");

    // 4. Switch Freja Moller to Market outfit
    console.log("Switching Freja Møller to Market wardrobe...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const frejaCard = cards.find(c => c.textContent?.includes("Freja Møller"));
      const marketBtn = Array.from(frejaCard.querySelectorAll("button")).find(b => b.textContent?.includes("Market"));
      if (!marketBtn) throw new Error("Freja Market button not found");
      marketBtn.click();
    });
    await sleep(800);

    const frejaMarketSrc = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const frejaCard = cards.find(c => c.textContent?.includes("Freja Møller"));
      return frejaCard?.querySelector("img")?.src || "";
    });
    console.log("Freja Market Image src:", frejaMarketSrc);
    if (!frejaMarketSrc.includes("freja_moller_market.jpg")) {
      throw new Error(`Expected freja_moller_market.jpg but got ${frejaMarketSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_freja_market_wardrobe.png"), fullPage: false });
    console.log("📸 [4/11] Captured 04_freja_market_wardrobe.png");

    // 5. Switch Soren Lindberg to Office outfit
    console.log("Switching Soren Lindberg to Office wardrobe...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const sorenCard = cards.find(c => c.textContent?.includes("Soren Lindberg"));
      if (!sorenCard) throw new Error("Soren card not found");
      const officeBtn = Array.from(sorenCard.querySelectorAll("button")).find(b => b.textContent?.includes("Office"));
      if (!officeBtn) throw new Error("Soren Office button not found");
      officeBtn.click();
    });
    await sleep(800);

    const sorenOfficeSrc = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const sorenCard = cards.find(c => c.textContent?.includes("Soren Lindberg"));
      return sorenCard?.querySelector("img")?.src || "";
    });
    console.log("Soren Office Image src:", sorenOfficeSrc);
    if (!sorenOfficeSrc.includes("soren_lindberg_office.jpg")) {
      throw new Error(`Expected soren_lindberg_office.jpg but got ${sorenOfficeSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_soren_office_wardrobe.png"), fullPage: false });
    console.log("📸 [5/11] Captured 05_soren_office_wardrobe.png");

    // 6. Switch Soren Lindberg to Home (Hygge) outfit
    console.log("Switching Soren Lindberg to Home wardrobe...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const sorenCard = cards.find(c => c.textContent?.includes("Soren Lindberg"));
      const homeBtn = Array.from(sorenCard.querySelectorAll("button")).find(b => b.textContent?.includes("Home"));
      if (!homeBtn) throw new Error("Soren Home button not found");
      homeBtn.click();
    });
    await sleep(800);

    const sorenHomeSrc = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const sorenCard = cards.find(c => c.textContent?.includes("Soren Lindberg"));
      return sorenCard?.querySelector("img")?.src || "";
    });
    console.log("Soren Home Image src:", sorenHomeSrc);
    if (!sorenHomeSrc.includes("soren_lindberg_home.jpg")) {
      throw new Error(`Expected soren_lindberg_home.jpg but got ${sorenHomeSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_soren_home_wardrobe.png"), fullPage: false });
    console.log("📸 [6/11] Captured 06_soren_home_wardrobe.png");

    // 7. Switch Mikkel Lind to Pool outfit
    console.log("Switching Mikkel Lind to Pool wardrobe...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const mikkelCard = cards.find(c => c.textContent?.includes("Mikkel Lind"));
      if (!mikkelCard) throw new Error("Mikkel card not found");
      const poolBtn = Array.from(mikkelCard.querySelectorAll("button")).find(b => b.textContent?.includes("Pool"));
      if (!poolBtn) throw new Error("Mikkel Pool button not found");
      poolBtn.click();
    });
    await sleep(800);

    const mikkelPoolSrc = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const mikkelCard = cards.find(c => c.textContent?.includes("Mikkel Lind"));
      return mikkelCard?.querySelector("img")?.src || "";
    });
    console.log("Mikkel Pool Image src:", mikkelPoolSrc);
    if (!mikkelPoolSrc.includes("mikkel_lind_pool.jpg")) {
      throw new Error(`Expected mikkel_lind_pool.jpg but got ${mikkelPoolSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_mikkel_pool_wardrobe.png"), fullPage: false });
    console.log("📸 [7/11] Captured 07_mikkel_pool_wardrobe.png");

    // 8. Switch Mikkel Lind to Gym outfit
    console.log("Switching Mikkel Lind to Gym wardrobe...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const mikkelCard = cards.find(c => c.textContent?.includes("Mikkel Lind"));
      const gymBtn = Array.from(mikkelCard.querySelectorAll("button")).find(b => b.textContent?.includes("Gym"));
      if (!gymBtn) throw new Error("Mikkel Gym button not found");
      gymBtn.click();
    });
    await sleep(800);

    const mikkelGymSrc = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const mikkelCard = cards.find(c => c.textContent?.includes("Mikkel Lind"));
      return mikkelCard?.querySelector("img")?.src || "";
    });
    console.log("Mikkel Gym Image src:", mikkelGymSrc);
    if (!mikkelGymSrc.includes("mikkel_lind_gym.jpg")) {
      throw new Error(`Expected mikkel_lind_gym.jpg but got ${mikkelGymSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_mikkel_gym_wardrobe.png"), fullPage: false });
    console.log("📸 [8/11] Captured 08_mikkel_gym_wardrobe.png");

    // 9. Inspect Freja Moller Modal & Click Hygge Outfit
    console.log("Opening Freja Møller inspection modal...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.group"));
      const frejaCard = cards.find(c => c.textContent?.includes("Freja Møller"));
      const detailsBtn = Array.from(frejaCard.querySelectorAll("button")).find(b => b.textContent?.includes("Details"));
      if (!detailsBtn) throw new Error("Details button not found");
      detailsBtn.click();
    });
    await sleep(800);

    // In modal, click Hygge outfit row
    console.log("Clicking Hygge outfit in modal...");
    await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) throw new Error("Modal not open");
      const rows = Array.from(modal.querySelectorAll("button"));
      const hyggeRow = rows.find(r => r.textContent?.includes("Hygge"));
      if (!hyggeRow) throw new Error("Hygge row not found in modal");
      hyggeRow.click();
    });
    await sleep(800);

    const modalImgSrc = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      return modal?.querySelector("img")?.src || "";
    });
    console.log("Modal active image src:", modalImgSrc);
    if (!modalImgSrc.includes("freja_moller_home.jpg")) {
      throw new Error(`Expected modal image to be freja_moller_home.jpg but got ${modalImgSrc}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_freja_modal_hygge_wardrobe.png"), fullPage: false });
    console.log("📸 [9/11] Captured 09_freja_modal_hygge_wardrobe.png");

    // Close modal
    await page.keyboard.press("Escape");
    await sleep(500);

    // 10. iOS Mobile Viewport (iPhone 14: 390 x 844)
    console.log("Testing iOS Mobile Viewport (390 x 844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    const iosOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log(`iOS Zero Horizontal Overflow: ${iosOverflow ? "PASS" : "FAIL"}`);
    if (!iosOverflow) throw new Error("iOS Horizontal overflow detected!");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_denmark_ios_mobile.png"), fullPage: false });
    console.log("📸 [10/11] Captured 10_denmark_ios_mobile.png");

    // 11. Android Mobile Viewport (Pixel 7: 412 x 915)
    console.log("Testing Android Mobile Viewport (412 x 915)...");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(800);
    const androidOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log(`Android Zero Horizontal Overflow: ${androidOverflow ? "PASS" : "FAIL"}`);
    if (!androidOverflow) throw new Error("Android Horizontal overflow detected!");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_denmark_android_mobile.png"), fullPage: false });
    console.log("📸 [11/11] Captured 11_denmark_android_mobile.png");

    console.log("✅ ALL 11 E2E TESTS PASSED PERFECTLY ON CLOUDTOP!");
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error("❌ Test run failed:", err);
  process.exit(1);
});
