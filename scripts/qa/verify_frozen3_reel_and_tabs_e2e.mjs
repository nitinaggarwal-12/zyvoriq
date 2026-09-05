/**
 * E2E Verification Suite for Frozen 3 Master Trailer
 * Tests:
 * 1. Page load at http://localhost:3000/studio/cinema/frozen3
 * 2. Master MP4 player viewport & video source verification
 * 3. 4K MP4 Reel download button presence
 * 4. Interactive tab navigation to Multimodal Frame Certification
 * 5. Assertion of 10 audited checkpoint cards and VQS 100.0/100 score
 * 6. Captures physical proof screenshots with Google Signed Chrome binary
 */

import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(process.cwd(), "scratch/screenshots_live_macos");

async function runE2E() {
  console.log("🚀 Starting Frozen 3 Master Trailer E2E Verification Suite...");
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--window-size=1600,1000"
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

    console.log("🌐 Navigating to http://localhost:3000/studio/cinema/frozen3 ...");
    await page.goto("http://localhost:3000/studio/cinema/frozen3", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // 1. Assert Title & Header
    console.log("🔍 Checking page title and headings...");
    const title = await page.title();
    console.log("   Page title: " + title);

    const hasHeading = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? h1.innerText : null;
    });
    console.log("   Main Heading: " + hasHeading);
    if (!hasHeading || !hasHeading.includes("Frozen III")) {
      throw new Error("Heading did not contain Frozen III. Found: " + hasHeading);
    }

    // 2. Assert Video Tag and MP4 source
    const videoSrc = await page.evaluate(() => {
      const video = document.querySelector("video");
      return video ? video.getAttribute("src") : null;
    });
    console.log("   Video player source: " + videoSrc);
    if (!videoSrc || !videoSrc.includes("frozen3_theatrical_trailer_master.mp4")) {
      throw new Error("Expected master MP4 reel source, got: " + videoSrc);
    }

    // 3. Assert Download Button
    const downloadHref = await page.evaluate(() => {
      const link = document.querySelector("a[download]");
      return link ? link.getAttribute("href") : null;
    });
    console.log("   Download button target: " + downloadHref);
    if (!downloadHref || !downloadHref.includes(".mp4")) {
      throw new Error("Download button not pointing to MP4 reel: " + downloadHref);
    }

    // Capture Viewport 1: Master Player
    const screenshot1 = path.join(OUTPUT_DIR, "frozen3_e2e_01_master_player.png");
    await page.screenshot({ path: screenshot1, fullPage: false });
    console.log("📸 Captured: " + screenshot1);

    // 4. Click Multimodal Frame Certification Tab
    console.log("👉 Switching to Multimodal Frame Certification Tab...");
    const tabClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const target = buttons.find((b) => b.innerText.includes("Multimodal Frame Certification"));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });

    if (!tabClicked) {
      throw new Error("Could not find Multimodal Frame Certification tab button!");
    }

    // Wait 1000ms for React state and DOM rendering
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Assert Multimodal Audit Metrics & 10 Checkpoints
    const auditData = await page.evaluate(() => {
      const vqsText = document.body.innerText.includes("100.0 / 100");
      const defectRateText = document.body.innerText.includes("0.00% Defect");
      const santaText = document.body.innerText.includes("Santa Verified");
      
      const frameImages = Array.from(document.querySelectorAll("img")).filter(img =>
        img.getAttribute("src") && img.getAttribute("src").includes("/cinema/frozen3/frames/")
      );

      return {
        vqsPassed: vqsText,
        defectRatePassed: defectRateText,
        santaPassed: santaText,
        frameCount: frameImages.length
      };
    });

    console.log("   Multimodal Audit Data:", auditData);
    if (!auditData.vqsPassed) throw new Error("VQS 100.0 / 100 badge not found!");
    if (!auditData.defectRatePassed) throw new Error("0.00% Defect Rate badge not found!");
    if (!auditData.santaPassed) throw new Error("Santa Verified badge not found!");
    if (auditData.frameCount !== 10) throw new Error("Expected 10 frame proof images, found " + auditData.frameCount);

    // Capture Viewport 2: Multimodal Certification Tab
    const screenshot2 = path.join(OUTPUT_DIR, "frozen3_e2e_02_multimodal_certification.png");
    await page.screenshot({ path: screenshot2, fullPage: false });
    console.log("📸 Captured: " + screenshot2);

    console.log("🎉 ALL E2E VERIFICATIONS PASSED WITH ZERO ERRORS!");
  } finally {
    await browser.close();
  }
}

runE2E().catch((err) => {
  console.error("❌ E2E Failed:", err);
  process.exit(1);
});
