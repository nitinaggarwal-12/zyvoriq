import puppeteer from "puppeteer";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  const devices = [
    { name: "iPhone 14", width: 390, height: 844 },
    { name: "Pixel 7", width: 412, height: 915 }
  ];

  const testRoutes = ["/", "/studio", "/studio/create", "/studio/library", "/studio/trend-radar"];

  let allPassed = true;

  for (const d of devices) {
    await page.setViewport({ width: d.width, height: d.height, isMobile: true, hasTouch: true });
    for (const r of testRoutes) {
      await page.goto(`http://127.0.0.1:3000${r}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await sleep(1000);

      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });

      console.log(`[${d.name}] Route ${r}: scrollWidth=${overflow.scrollWidth} vs innerWidth=${overflow.innerWidth} -> ${overflow.hasOverflow ? "❌ OVERFLOW" : "✅ OK"}`);
      if (overflow.hasOverflow) allPassed = false;
    }
  }

  await browser.close();
  console.log("\nMobile Zero-Overflow Result:", allPassed ? "ALL PASSED" : "FAILED");
}

run().catch((e) => {
  console.error("Mobile test error:", e);
  process.exit(1);
});
