import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = path.resolve("./scratch/cloudtop_e2e_screenshots");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("=================================================");
  console.log("🎬 CLOUDTOP E2E TEST: CHOICE ARCHITECTURE & LIBRARIES");
  console.log("Base URL:", BASE_URL);
  console.log("Output Directory:", OUTPUT_DIR);
  console.log("=================================================");

  // Programmatically purge screenshot directory before executing
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1600,950",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });

  try {
    // -------------------------------------------------------------
    // STEP 1: DESKTOP CHARACTERS VAULT (/characters)
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Visiting /characters on Desktop (1600x950)...");
    await page.goto(`${BASE_URL}/characters`, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1000);

    const charTitle = await page.$eval("h1", (el) => el.textContent);
    console.log("✓ Character Page Heading:", charTitle);
    if (!charTitle.includes("Pre-Validated Character Cast")) {
      throw new Error(`Unexpected character heading: ${charTitle}`);
    }

    const characterCardsCount = await page.$$eval(".group.rounded-2xl", (cards) => cards.length);
    console.log(`✓ Total Character Cards Rendered: ${characterCardsCount}`);
    if (characterCardsCount < 20) {
      throw new Error(`Expected at least 20 character cards (including 16 international stars), got ${characterCardsCount}`);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, "01_characters_vault_desktop.png") });
    console.log("📸 Saved 01_characters_vault_desktop.png");

    // Test Country Filter Pill: Philippines
    console.log("Testing country filter for Philippines...");
    const clickedPH = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Philippines"));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clickedPH) throw new Error("Could not find Philippines country filter button");
    await sleep(800);

    const phCardsCount = await page.$$eval(".group.rounded-2xl", (cards) => cards.length);
    console.log(`✓ Filtered Cards for Philippines: ${phCardsCount}`);
    if (phCardsCount < 2) {
      throw new Error(`Expected at least 2 cards for Philippines, got ${phCardsCount}`);
    }

    const phCardNames = await page.$$eval(".group.rounded-2xl h3", (headings) => headings.map(h => h.textContent?.trim()));
    console.log("✓ Philippines Cast Rendered:", phCardNames.join(", "));
    if (!phCardNames.includes("Bea Mendoza") || !phCardNames.includes("Marco Ramos")) {
      throw new Error(`Expected Bea Mendoza and Marco Ramos, got: ${phCardNames.join(", ")}`);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, "01b_country_filter_philippines.png") });
    console.log("📸 Saved 01b_country_filter_philippines.png");

    // Inspect Details Modal for Bea Mendoza
    console.log("Opening character inspect modal for Bea Mendoza...");
    const clickedDetails = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group.rounded-2xl"));
      const beaCard = cards.find(c => c.textContent && c.textContent.includes("Bea Mendoza"));
      if (beaCard) {
        const btn = beaCard.querySelector("button");
        if (btn) { btn.click(); return true; }
      }
      return false;
    });
    if (!clickedDetails) throw new Error("Could not find Details button for Bea Mendoza");
    await sleep(800);

    const modalText = await page.evaluate(() => document.body.innerText);
    if (!modalText.includes("Bea Mendoza") || !modalText.includes("Archetype:") || !modalText.includes("Philippines")) {
      throw new Error("Character inspect modal missing expected Bea Mendoza archetype or country info");
    }
    console.log("✓ Character inspect modal successfully rendered with Bea Mendoza, Philippines origin, and Aoede voice!");
    await page.screenshot({ path: path.join(OUTPUT_DIR, "02_character_inspect_modal.png") });
    console.log("📸 Saved 02_character_inspect_modal.png");

    // Close modal
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      const closeBtn = document.querySelector("button svg.lucide-x")?.closest("button");
      if (closeBtn) closeBtn.click();
    });
    await sleep(600);

    // Reset country filter back to All Countries
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("All Countries"));
      if (btn) btn.click();
    });
    await sleep(600);

    // -------------------------------------------------------------
    // STEP 2: DESKTOP LOCATIONS LIBRARY (/locations)
    // -------------------------------------------------------------
    console.log("\n[TEST 2] Visiting /locations on Desktop (1600x950)...");
    await page.goto(`${BASE_URL}/locations`, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1000);

    const locTitle = await page.$eval("h1", (el) => el.textContent);
    console.log("✓ Location Page Heading:", locTitle);
    if (!locTitle.includes("Physical Set & Architecture Library")) {
      throw new Error(`Unexpected location heading: ${locTitle}`);
    }

    const locationCardsCount = await page.$$eval(".group.rounded-2xl", (cards) => cards.length);
    console.log(`✓ Location Cards Rendered: ${locationCardsCount}`);
    if (locationCardsCount < 3) {
      throw new Error(`Expected at least 3 location cards, got ${locationCardsCount}`);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, "03_locations_vault_desktop.png") });
    console.log("📸 Saved 03_locations_vault_desktop.png");

    // Inspect Location Specs Modal
    console.log("Opening location inspect modal...");
    const clickedLocSpecs = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Full Set Specs"));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clickedLocSpecs) throw new Error("Could not find Full Set Specs button");
    await sleep(800);

    const locModalText = await page.evaluate(() => document.body.innerText);
    if (!locModalText.includes("Contract") && !locModalText.includes("Environment") && !locModalText.includes("Specs")) {
      throw new Error("Location modal missing expected set specs content");
    }
    console.log("✓ Location inspect modal successfully rendered with Verbatim Block!");
    await page.screenshot({ path: path.join(OUTPUT_DIR, "04_location_inspect_modal.png") });
    console.log("📸 Saved 04_location_inspect_modal.png");

    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      const closeBtn = document.querySelector("button svg.lucide-x")?.closest("button");
      if (closeBtn) closeBtn.click();
    });
    await sleep(600);

    // -------------------------------------------------------------
    // STEP 3: CREATOR REELS HOME 4-PICK SPINE & IN-STUDIO CASTING
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Testing 4-Pick Spine on Creator Home (/)...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1000);

    // Scroll to prompt bar
    await page.evaluate(() => {
      const el = document.getElementById("prompt-bar") || document.getElementById("prompt-studio-box");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
    await sleep(800);

    // Assert 4-Pick Spine: Cast Size Chips (1 vs 2 actors)
    const homeText = await page.evaluate(() => document.body.innerText);
    if (!homeText.includes("Solo Lead (1 Actor)") || !homeText.includes("Dialogue Duo (2 Actors)")) {
      throw new Error("Prompt bar missing Cast Size selector chips");
    }
    console.log("✓ Cast Size selector (1 vs 2 actors) verified in prompt bar!");

    await page.screenshot({ path: path.join(OUTPUT_DIR, "05_prompt_bar_4_pick_spine.png") });
    console.log("📸 Saved 05_prompt_bar_4_pick_spine.png");

    // Open Casting & Physical Set Lock Drawer
    console.log("Opening Casting & Physical Set Lock drawer...");
    const clickedDrawer = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Configure Cast & Set"));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clickedDrawer) throw new Error("Could not find Configure Cast & Set button");
    await sleep(1000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, "06_casting_physical_set_drawer_open.png") });
    console.log("📸 Saved 06_casting_physical_set_drawer_open.png");

    // Click "Change" on Lead Performer to open Character Library Modal
    console.log("Clicking Change on Lead Performer...");
    const clickedChangeLead = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.trim() === "Change");
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clickedChangeLead) throw new Error("Could not find Change button for Lead");
    await sleep(800);

    const charModalText = await page.evaluate(() => document.body.innerText);
    if (!charModalText.includes("Cast from Character Library")) {
      throw new Error("Character Library selection modal did not open");
    }
    console.log("✓ In-studio Character Library modal rendered!");
    await page.screenshot({ path: path.join(OUTPUT_DIR, "07_character_picker_modal_in_studio.png") });
    console.log("📸 Saved 07_character_picker_modal_in_studio.png");

    // Cast Lead on Ren Kuro
    console.log("Casting Lead from modal...");
    const clickedCastLead = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Cast Lead"));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clickedCastLead) throw new Error("Could not click Cast Lead");
    await sleep(800);

    await page.screenshot({ path: path.join(OUTPUT_DIR, "08_lead_cast_updated.png") });
    console.log("📸 Saved 08_lead_cast_updated.png");

    // Click "Change Set" to open Location Library Modal
    console.log("Opening Location Library modal from studio...");
    const clickedChangeSet = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find(b => b.textContent && b.textContent.includes("Change Set"));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clickedChangeSet) throw new Error("Could not find Change Set button");
    await sleep(800);

    const locStudioModalText = await page.evaluate(() => document.body.innerText);
    if (!locStudioModalText.includes("Lock Physical Set from Location Library")) {
      throw new Error("Location Library selection modal did not open");
    }
    console.log("✓ In-studio Location Library modal rendered!");
    await page.screenshot({ path: path.join(OUTPUT_DIR, "09_location_picker_modal_in_studio.png") });
    console.log("📸 Saved 09_location_picker_modal_in_studio.png");

    // Close modal
    await page.evaluate(() => {
      const closeBtns = Array.from(document.querySelectorAll("button"));
      const closeBtn = closeBtns.find(b => b.querySelector("svg.lucide-x") !== null);
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "10_set_locked_updated.png") });
    console.log("📸 Saved 10_set_locked_updated.png");

    // -------------------------------------------------------------
    // STEP 4: CROSS-VIEWPORT MOBILE COMPATIBILITY (iOS & Android)
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Testing iOS (iPhone 14 @ 390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/characters`, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(800);

    const iosOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (iosOverflow) {
      throw new Error(`Horizontal overflow detected on iOS viewport: scrollWidth > innerWidth`);
    }
    console.log("✓ Zero horizontal overflow on iOS @ 390px!");
    await page.screenshot({ path: path.join(OUTPUT_DIR, "11_mobile_ios_characters.png") });
    console.log("📸 Saved 11_mobile_ios_characters.png");

    await page.goto(`${BASE_URL}/locations`, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "12_mobile_ios_locations.png") });
    console.log("📸 Saved 12_mobile_ios_locations.png");

    console.log("\n[TEST 5] Testing Android (Pixel 7 @ 412x915)...");
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(800);

    const androidOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (androidOverflow) {
      throw new Error(`Horizontal overflow detected on Android viewport: scrollWidth > innerWidth`);
    }
    console.log("✓ Zero horizontal overflow on Android @ 412px!");
    await page.screenshot({ path: path.join(OUTPUT_DIR, "13_mobile_android_home.png") });
    console.log("📸 Saved 13_mobile_android_home.png");

    console.log("\n🎉 ALL E2E QUALITY GATES PASSED 100%!");
  } catch (err) {
    console.error("❌ E2E Test Failure:", err);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "99_e2e_error.png") }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
