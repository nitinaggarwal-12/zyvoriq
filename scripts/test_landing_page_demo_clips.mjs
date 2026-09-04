import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OUT_DIR = path.resolve("./scratch/screenshots_landing_demo_clips_qa");

async function run() {
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("Launching system Google Chrome for Landing Page Demo Clips QA...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,1000"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log("Navigating to http://127.0.0.1:3000/ ...");
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2000);

  const personas = [
    { idx: 0, id: "kids_pixar", name: "Kids & Family" },
    { idx: 1, id: "anime_shonen", name: "Anime & Manga" },
    { idx: 2, id: "viral_influencer", name: "Viral Influencer" },
    { idx: 3, id: "ugc_ecommerce", name: "E-Com UGC Ads" },
    { idx: 4, id: "cinema_noir", name: "A24 Cinema" },
    { idx: 5, id: "heritage_lore", name: "Heritage Lore" }
  ];

  const results = [];

  for (const p of personas) {
    console.log(`\nTesting Persona [${p.idx + 1}/6]: ${p.name}...`);

    // Click tab if not the first
    if (p.idx > 0) {
      await page.evaluate((index) => {
        const buttons = document.querySelectorAll("#reel-demo button");
        if (buttons[index]) buttons[index].click();
      }, p.idx);
      // Enforce settling delay
      await sleep(1500);
    } else {
      await sleep(1000);
    }

    // Inspect the video element
    const videoStats = await page.evaluate(async () => {
      const video = document.querySelector("#reel-demo video");
      if (!video) return { error: "No video element found in #reel-demo" };

      // Wait briefly to let playback advance
      const startSec = video.currentTime;
      await new Promise(r => setTimeout(r, 600));
      const endSec = video.currentTime;

      return {
        src: video.currentSrc,
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        muted: video.muted,
        hasAdvanced: endSec > startSec,
        startSec,
        endSec,
        videoError: video.error ? video.error.message : null
      };
    });

    console.log(`Video stats for ${p.name}:`, videoStats);
    results.push({ persona: p.name, ...videoStats });

    // Save screenshot
    const shotPath = path.join(OUT_DIR, `0${p.idx + 1}_demo_${p.id}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  // Test Mute / Unmute Button
  console.log("\nTesting Mute / Unmute Button...");
  const muteStateBefore = await page.evaluate(() => {
    const video = document.querySelector("#reel-demo video");
    return video?.muted;
  });

  await page.evaluate(() => {
    const muteBtn = document.querySelector("#reel-demo button[title*='Audio']");
    if (muteBtn) muteBtn.click();
  });
  await sleep(600);

  const muteStateAfter = await page.evaluate(() => {
    const video = document.querySelector("#reel-demo video");
    return video?.muted;
  });

  console.log(`Mute Toggle Test: Before = ${muteStateBefore} -> After = ${muteStateAfter}`);

  // Test "Customize in Studio" CTA Link
  console.log("\nTesting 'Customize in Studio' CTA Link...");
  const customizeHref = await page.evaluate(() => {
    const cta = Array.from(document.querySelectorAll("#reel-demo a")).find(a => a.innerText.includes("Customize in Studio"));
    return cta?.getAttribute("href");
  });
  console.log("Customize CTA Link:", customizeHref);

  await browser.close();

  console.log("\n================ SUMMARY REPORT ================");
  let allHealthy = true;
  for (const r of results) {
    const healthy = r.readyState >= 2 && r.videoWidth > 0 && r.hasAdvanced && !r.videoError;
    console.log(`${healthy ? "✅" : "❌"} [${r.persona}]: res=${r.videoWidth}x${r.videoHeight}, duration=${r.duration?.toFixed(1)}s, playing=${!r.paused}, advanced=${r.hasAdvanced}`);
    if (!healthy) allHealthy = false;
  }

  if (allHealthy) {
    console.log("\n🎉 ALL 6 DEMO CLIPS ARE 100% OPERATIONAL, DECODING & PLAYING!");
  } else {
    console.error("\n⚠️ ONE OR MORE DEMO CLIPS FAILED TO PLAY!");
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
