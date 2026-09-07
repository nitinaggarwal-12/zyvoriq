import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    console.log("Navigating to http://localhost:3333/ ...");
    await page.goto("http://localhost:3333/", { waitUntil: "networkidle2", timeout: 30000 });

    // Wait 1.5s for initial React hydration
    await new Promise((r) => setTimeout(r, 1500));

    const inputState = await page.evaluate(() => {
      const input = document.querySelector("#omni-prompt-input");
      const sendBtn = document.querySelector("#omni-send-btn");
      return {
        hasInput: !!input,
        inputValue: input ? input.value : null,
        inputPlaceholder: input ? input.placeholder : null,
        sendBtnDisabled: sendBtn ? sendBtn.disabled : null,
        sendBtnText: sendBtn ? sendBtn.innerText.trim() : null
      };
    });

    console.log("Landing page input state:", JSON.stringify(inputState, null, 2));

    const outPath = "scratch/cloudtop_e2e_screenshots/04_fresh_clean_landing_page.png";
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot to ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
