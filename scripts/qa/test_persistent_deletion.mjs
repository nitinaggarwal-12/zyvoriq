import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Persistent Reel Deletion QA Test ===");
  const targetDir = path.resolve(process.cwd(), "scratch/screenshots_reels_separation");
  await fs.mkdir(targetDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const baseUrl = process.env.TEST_URL || "https://zyvoriq.up.railway.app";
    console.log(`Navigating to ${baseUrl}/my-reels...`);
    await page.goto(`${baseUrl}/my-reels`, { waitUntil: "networkidle2", timeout: 45000 });
    
    // Wait for the reel tiles to render
    await page.waitForSelector('button[title="Delete Reel"]', { timeout: 15000 });
    await sleep(1000);

    // Take baseline screenshot
    await page.screenshot({ path: path.join(targetDir, "08_my_reels_before_delete.png"), fullPage: false });
    console.log("Captured 08_my_reels_before_delete.png");

    // Find all reel titles (rendered in h2 tags)
    const titlesBefore = await page.evaluate(() => {
      const titleEls = Array.from(document.querySelectorAll("h2"));
      return titleEls.map(el => el.textContent.trim()).filter(Boolean);
    });
    console.log("Titles before deletion:", titlesBefore.slice(0, 5));

    // Target the first reel to delete
    const targetTitle = titlesBefore[0];
    if (!targetTitle) {
      throw new Error("No reels found in library to test deletion!");
    }
    console.log(`Targeting reel for deletion: "${targetTitle}"`);

    // Click the delete button for the first reel
    const deleteBtns = await page.$$('button[title="Delete Reel"]');
    if (deleteBtns.length === 0) throw new Error("Delete button not found!");
    
    console.log(`Clicking Delete button on first reel...`);
    await deleteBtns[0].click();
    await sleep(800); // 800ms settling delay rule

    // Verify modal appeared
    const modalText = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      return modal ? modal.textContent : null;
    });
    console.log("Modal text found:", modalText?.slice(0, 100));
    if (!modalText || !modalText.includes("Are you sure you want to delete")) {
      throw new Error("Delete confirmation modal did not open!");
    }

    // Capture screenshot of modal
    await page.screenshot({ path: path.join(targetDir, "09_delete_confirmation_modal.png"), fullPage: false });
    console.log("Captured 09_delete_confirmation_modal.png");

    // Click the confirm delete button (handles both id and text)
    const clickedConfirm = await page.evaluate(() => {
      const byId = document.getElementById("confirm-delete-permanently-btn");
      if (byId) {
        byId.click();
        return true;
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find(b => (b.textContent.includes("Delete Permanently") || b.textContent.includes("Delete Reel")) && b.className.includes("bg-rose-600"));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    if (!clickedConfirm) throw new Error("Could not find confirm 'Delete Permanently' button in modal!");
    console.log("Confirmed deletion.");
    await sleep(1500);

    // Verify title is gone from DOM immediately
    const titlesAfterDelete = await page.evaluate(() => {
      const titleEls = Array.from(document.querySelectorAll("h2"));
      return titleEls.map(el => el.textContent.trim()).filter(Boolean);
    });
    console.log("Titles immediately after deletion:", titlesAfterDelete.slice(0, 5));
    if (titlesAfterDelete.includes(targetTitle)) {
      throw new Error(`Target reel "${targetTitle}" is still in DOM immediately after deletion!`);
    }

    // MANDATORY IDEMPOTENT RELOAD QUALITY GATE:
    console.log("Executing page.reload() to verify reel NEVER comes back...");
    await page.reload({ waitUntil: "networkidle2", timeout: 45000 });
    await sleep(2000);

    // Verify title is STILL gone after reload
    const titlesAfterReload = await page.evaluate(() => {
      const titleEls = Array.from(document.querySelectorAll("h2"));
      return titleEls.map(el => el.textContent.trim()).filter(Boolean);
    });
    console.log("Titles after full page reload:", titlesAfterReload.slice(0, 5));

    if (titlesAfterReload.includes(targetTitle)) {
      throw new Error(`REGRESSION: Deleted reel "${targetTitle}" came back after page reload!`);
    }

    console.log(`SUCCESS: Deleted reel "${targetTitle}" remained deleted after page reload!`);

    // Capture screenshot after reload confirming persistence
    await page.screenshot({ path: path.join(targetDir, "10_my_reels_after_reload_persisted.png"), fullPage: false });
    console.log("Captured 10_my_reels_after_reload_persisted.png");

    console.log("=== All Persistent Deletion QA Checks Passed! ===");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
