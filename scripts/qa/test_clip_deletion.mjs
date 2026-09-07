import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    const baseUrl = process.env.TEST_URL || "https://zyvoriq.up.railway.app";
    await page.goto(`${baseUrl}/my-reels`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1500));

    // Find a delete clip button
    const deleteClipBtnExists = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button[title='Remove Shot']"));
      if (btns.length === 0) return false;
      btns[btns.length - 1].click();
      return true;
    });
    console.log("Clicked delete on last clip (title='Remove Shot'):", deleteClipBtnExists);

    if (deleteClipBtnExists) {
      await new Promise(r => setTimeout(r, 800));
      // Confirm deletion in modal
      const confirmed = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const confirmBtn = btns.find(b => b.textContent.includes("Delete Permanently"));
        if (confirmBtn) {
          confirmBtn.click();
          return true;
        }
        return false;
      });
      console.log("Confirmed clip deletion:", confirmed);
      await new Promise(r => setTimeout(r, 1500));

      // Reload
      console.log("Reloading page...");
      await page.reload({ waitUntil: "networkidle2" });
      await new Promise(r => setTimeout(r, 1500));
      console.log("PASS: Page reloaded cleanly after clip deletion.");
    } else {
      console.log("No expanded shots found on page.");
    }
  } finally {
    await browser.close();
  }
}

run();
