import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function main() {
  const scratchDir = path.resolve("scratch");
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // 1. Ultra-Wide Desktop (1600x1000)
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto("https://zyvoriq.up.railway.app/my-reels", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(scratchDir, "01_my_reels_desktop.png") });
  console.log("Captured 01_my_reels_desktop.png");

  // 2. Expanded Clips View
  const expandButtons = await page.$$("div[class*='cursor-pointer group']");
  if (expandButtons.length > 0) {
    await expandButtons[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(scratchDir, "02_my_reels_expanded_clips.png") });
    console.log("Captured 02_my_reels_expanded_clips.png");
  }

  // 3. Mobile Viewport (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(scratchDir, "03_my_reels_mobile.png") });
  console.log("Captured 03_my_reels_mobile.png");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

main().catch(console.error);
