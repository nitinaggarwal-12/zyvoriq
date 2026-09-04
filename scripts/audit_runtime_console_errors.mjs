import puppeteer from "puppeteer";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const routes = [
    "/",
    "/studio",
    "/studio/create",
    "/studio/library",
    "/studio/avatars",
    "/studio/books",
    "/studio/inspector",
    "/studio/trend-radar",
    "/creator/analytics",
    "/director",
    "/studio/history",
    "/veritas"
  ];

  const errors = [];

  page.on("pageerror", (err) => {
    errors.push({ type: "pageerror", message: err.message, stack: err.stack });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      // Filter out favicon or known browser noise
      if (!msg.text().includes("favicon") && !msg.text().includes("404")) {
        errors.push({ type: "console.error", text: msg.text() });
      }
    }
  });

  console.log("Auditing 12 key pages for runtime JS errors...");

  for (const r of routes) {
    const startErrors = errors.length;
    await page.goto(`http://127.0.0.1:3000${r}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(1500);
    const newErrors = errors.slice(startErrors);
    console.log(`Route [${r}]: ${newErrors.length === 0 ? "✅ ZERO ERRORS" : `⚠️ ${newErrors.length} ERRORS`}`);
    if (newErrors.length > 0) {
      console.log(newErrors);
    }
  }

  await browser.close();
  console.log("\nTotal runtime exceptions across 12 pages:", errors.length);
}

run().catch((e) => {
  console.error("Audit script failed:", e);
  process.exit(1);
});
