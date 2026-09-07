import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    page.on("console", msg => console.log("BROWSER CONSOLE:", msg.text()));
    const baseUrl = process.env.TEST_URL || "https://zyvoriq.up.railway.app";
    await page.goto(`${baseUrl}/my-reels`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1000));

    // Find the exact card for "Napoleon: The Emperor's Heart"
    const clicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div.rounded-2xl.border"));
      const card = cards.find(c => c.querySelector("h2")?.textContent.trim() === "Napoleon: The Emperor's Heart");
      if (!card) return false;
      const deleteBtn = card.querySelector('button[title="Delete Reel"]');
      if (!deleteBtn) return false;
      deleteBtn.click();
      return true;
    });
    console.log("Clicked delete on Napoleon card:", clicked);
    await new Promise(r => setTimeout(r, 800));

    // Confirm permanent deletion
    const confirmed = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const confirmBtn = btns.find(b => b.textContent.includes("Delete Permanently"));
      if (confirmBtn) {
        confirmBtn.click();
        return true;
      }
      return false;
    });
    console.log("Clicked Delete Permanently button:", confirmed);
    await new Promise(r => setTimeout(r, 1500));

    const storageAfter = await page.evaluate(() => localStorage.getItem("zyvoriq_deleted_reels"));
    console.log("localStorage after deletion:", storageAfter);

    const titlesImmediatelyAfter = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h2"))
        .map(el => el.textContent.trim())
        .filter(t => t === "Napoleon: The Emperor's Heart");
    });
    console.log("Exact Napoleon title immediately after deletion:", titlesImmediatelyAfter);

    // Now reload
    console.log("Reloading page...");
    await page.reload({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    const storageAfterReload = await page.evaluate(() => localStorage.getItem("zyvoriq_deleted_reels"));
    console.log("localStorage after reload:", storageAfterReload);

    const titlesAfterReload = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h2"))
        .map(el => el.textContent.trim())
        .filter(t => t === "Napoleon: The Emperor's Heart");
    });
    console.log("Exact Napoleon title after reload:", titlesAfterReload);

    if (titlesAfterReload.length > 0) {
      console.error("FAIL: Napoleon: The Emperor's Heart is still present!");
      process.exit(1);
    } else {
      console.log("PASS: Napoleon: The Emperor's Heart is permanently deleted and did not return!");
    }
  } finally {
    await browser.close();
  }
}

run();
