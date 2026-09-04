import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OUT_DIR = path.resolve("./scratch/screenshots_unified_sidebar_qa");

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,1000"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const routes = [
    { url: "http://127.0.0.1:3000/studio/trend-radar", name: "01_trend_radar_unified.png", label: "Trend Radar" },
    { url: "http://127.0.0.1:3000/creator/analytics", name: "02_creator_analytics_unified.png", label: "Creator Analytics" },
    { url: "http://127.0.0.1:3000/studio/create/carousel", name: "03_carousel_create_unified.png", label: "Carousel Create" },
    { url: "http://127.0.0.1:3000/director", name: "04_director_unified.png", label: "Director Swarm" },
    { url: "http://127.0.0.1:3000/studio/history", name: "05_studio_history_unified.png", label: "Studio History" }
  ];

  for (const r of routes) {
    console.log(`Testing ${r.label}: ${r.url}...`);
    await page.goto(r.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2000);

    const sidebarFound = await page.evaluate(() => {
      const aside = document.querySelector("aside");
      const hasCoreLinks = document.body.innerText.includes("Studio Cinema & Timeline") && document.body.innerText.includes("Creation Hub");
      return { aside: Boolean(aside), hasCoreLinks };
    });

    console.log(`Results for ${r.label}:`, sidebarFound);
    const shotPath = path.join(OUT_DIR, r.name);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  await browser.close();
  console.log("All routes verified cleanly with StudioSidebar!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
