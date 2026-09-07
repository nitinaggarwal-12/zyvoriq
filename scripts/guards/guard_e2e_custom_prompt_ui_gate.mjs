import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import assert from "assert";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ECustomPromptUIGate() {
  console.log("================================================================================");
  console.log("🎬 GUARD E2E: LIVE STUDIO UI CUSTOM PROMPT GENERATION QUALITY GATE");
  console.log("================================================================================");

  const screenshotDir = path.join(process.cwd(), "scratch", "cloudtop_e2e_screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}`;
    console.log(`[E2E] Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    await sleep(1500);

    // Enter custom prompt
    const customPrompt = "A lone astrophysicist on the Atacama desert plateau tracking an anomalous cosmic microwave signal at midnight under the Milky Way";
    console.log(`[E2E] Typing custom prompt: "${customPrompt}"...`);

    const promptInputSelector = 'input[placeholder*="scene prompt"], input[placeholder*="Vision"], input[placeholder*="Describe"], #hero-director input[type="text"]';
    await page.waitForSelector(promptInputSelector, { timeout: 10000 });

    // Click and clear input, then type
    await page.click(promptInputSelector);
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, promptInputSelector);

    await page.type(promptInputSelector, customPrompt, { delay: 10 });
    await sleep(500);

    // Find and click "Generate Reel" button
    console.log("[E2E] Clicking 'Generate Reel' button...");
    const generateBtnSelector = 'button:has-text("Generate Reel"), button:has-text("Synthesize"), #hero-director button:has-text("Generate")';
    
    // Direct DOM click to avoid overlay interception
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent && (b.textContent.includes("Generate Reel") || b.textContent.includes("Generate 4K")));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      throw new Error("Could not find 'Generate Reel' button in DOM!");
    }

    console.log("[E2E] Generation triggered. Waiting for real Gemini Flash Image & Screenplay synthesis (~8-15s)...");

    // Wait for generation to complete (check for completion status or reel badge)
    let completed = false;
    const maxWait = 40000;
    const pollStart = Date.now();

    while (Date.now() - pollStart < maxWait) {
      await sleep(1000);
      const state = await page.evaluate(() => {
        const text = document.body.innerText;
        const isGenerating = text.includes("Executing Gemini") || text.includes("Ingesting prompt") || text.includes("Synthesizing");
        const videoEl = document.querySelector("#hero-director video");
        const videoSrc = videoEl ? videoEl.getAttribute("src") : null;
        const posterSrc = videoEl ? videoEl.getAttribute("poster") : null;
        const titleEl = document.querySelector("#hero-director h3, #hero-director h2, #hero-director .text-xl, #hero-director .text-2xl");
        const title = titleEl ? titleEl.textContent : "";
        return { isGenerating, videoSrc, posterSrc, title, bodyText: text };
      });

      if (!state.isGenerating && (state.posterSrc?.includes("/assets/stills/generated/") || state.posterSrc?.startsWith("data:image/"))) {
        completed = true;
        console.log(`[E2E] Generation completed in ${((Date.now() - pollStart) / 1000).toFixed(1)}s!`);
        break;
      }
    }

    await sleep(1500); // 800ms+ settling delay

    const finalState = await page.evaluate(() => {
      const videoEl = document.querySelector("#hero-director video");
      const videoSrc = videoEl ? videoEl.getAttribute("src") : "";
      const posterSrc = videoEl ? videoEl.getAttribute("poster") : "";
      const bodyText = document.body.innerText;
      return { videoSrc, posterSrc, bodyText };
    });

    console.log(`[E2E] Final Video Src: "${finalState.videoSrc}"`);
    console.log(`[E2E] Final Poster Src: "${finalState.posterSrc.slice(0, 80)}..."`);

    // ASSERTIONS
    assert.notStrictEqual(
      finalState.videoSrc,
      "/assets/video/mumbai_penthouse_180s_master.mp4",
      "🚨 CRITICAL ERROR: UI is playing Mumbai family dinner video for custom prompt!"
    );
    console.log("✓ PASS: Video element is NOT playing Mumbai penthouse video.");

    assert(
      finalState.posterSrc.includes("/assets/stills/generated/") || finalState.posterSrc.startsWith("data:image/png;base64,"),
      `🚨 CRITICAL ERROR: Poster src is not a freshly generated still! Got: ${finalState.posterSrc}`
    );
    console.log("✓ PASS: Poster src is a freshly generated 4K still plate.");

    assert(
      !finalState.bodyText.includes("Bas karo, Shweta! Paneer khatam ho jayega!"),
      "🚨 CRITICAL ERROR: Mumbai dinner dialogue is present in screenplay EDL!"
    );
    console.log("✓ PASS: Mumbai dialogue not present in screenplay.");

    const screenshotPath = path.join(screenshotDir, "01_custom_prompt_live_generation.png");
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`[E2E] Screenshot captured: file://${screenshotPath}`);

    console.log("================================================================================");
    console.log("🎉 E2E CUSTOM PROMPT UI QUALITY GATE PASSED 100%!");
    console.log("================================================================================");

  } finally {
    await browser.close();
  }
}

runE2ECustomPromptUIGate().catch(err => {
  console.error("❌ E2E Quality gate failed:", err.message);
  process.exit(1);
});
