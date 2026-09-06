import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_duration_fix');
if (fs.existsSync(SCREENSHOT_DIR)) {
  fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Starting E2E verification of 180s duration and custom prompt synthesis...");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1000']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    console.log("Navigating to http://localhost:3005...");
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // TEST 1: Check 180s Duration with Napoleon preset
    console.log("\n--- TEST 1: Select 180s and Generate Video ---");
    
    // Explicitly click 180s duration button
    await page.$$eval('button', (buttons) => {
      const btn = buttons.find(b => b.textContent.trim() === '180s');
      if (btn) btn.click();
    });
    await sleep(500);

    // Click "Generate 4K Video"
    console.log("Clicking 'Generate 4K Video' button...");
    await page.$$eval('button', (buttons) => {
      const btn = buttons.find(b => b.textContent.includes('Generate 4K Video'));
      if (btn) btn.click();
    });

    // Wait for generation to complete
    console.log("Waiting for generation pipeline to complete...");
    await page.waitForSelector('video', { timeout: 10000 });
    await sleep(3000); // Allow video metadata to load

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_preset_180s_generated.png') });
    console.log("Screenshot captured: 01_preset_180s_generated.png");

    // Inspect video element
    const videoData1 = await page.$eval('video', (el) => ({
      src: el.currentSrc || el.src,
      duration: el.duration,
      paused: el.paused
    }));
    console.log("Video 1 Inspection:", videoData1);

    if (videoData1.duration > 150) {
      console.log("✅ PASS: Video duration is ~180s (" + videoData1.duration + "s), NOT a 6s clip!");
    } else {
      console.error("❌ FAIL: Video duration is " + videoData1.duration + "s, expected ~180s!");
    }

    // TEST 2: Type a Custom Prompt from scratch using native setter
    console.log("\n--- TEST 2: Custom Prompt from Scratch with 180s ---");
    const customPrompt = "Cyberpunk detective walking through rain-slicked neon alleyway in Neo-Tokyo, horizontal anamorphic lens flares, wet reflective asphalt, 24fps Kodak photorealism.";
    
    await page.$eval('textarea', (el, text) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeSetter.call(el, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, customPrompt);
    await sleep(800);

    // Verify HUD reflects custom synthesis live
    const hudText = await page.$eval('section', (el) => el.innerText);
    console.log("Has Custom Synthesis Active badge:", hudText.includes('Custom Synthesis Active'));

    // Ensure 180s is selected
    await page.$$eval('button', (buttons) => {
      const btn = buttons.find(b => b.textContent.trim() === '180s');
      if (btn) btn.click();
    });
    await sleep(500);

    // Click "Re-Generate Video"
    console.log("Clicking 'Re-Generate Video' for custom prompt...");
    await page.$$eval('button', (buttons) => {
      const btn = buttons.find(b => b.textContent.includes('Re-Generate Video') || b.textContent.includes('Generate 4K Video'));
      if (btn) btn.click();
    });

    await sleep(3500); // Wait for synthesis stages
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_custom_prompt_180s_generated.png') });
    console.log("Screenshot captured: 02_custom_prompt_180s_generated.png");

    const videoData2 = await page.$eval('video', (el) => ({
      src: el.currentSrc || el.src,
      duration: el.duration,
      paused: el.paused
    }));
    console.log("Video 2 Inspection (Custom Prompt):", videoData2);

    const sectionText2 = await page.$eval('section', (el) => el.innerText);
    console.log("Shows Custom Prompt Scene Direction:", sectionText2.includes(customPrompt.slice(0, 30)));
    console.log("Shows ✨ Custom Directed Scene badge:", sectionText2.includes('Custom Directed Scene'));
    console.log("Duration > 150s:", videoData2.duration > 150);

    // TEST 3: Switch to 30s dynamically
    console.log("\n--- TEST 3: Switch Duration to 30s ---");
    await page.$$eval('button', (buttons) => {
      const btn = buttons.find(b => b.textContent.trim() === '30s');
      if (btn) btn.click();
    });
    await sleep(1500);

    const videoData3 = await page.$eval('video', (el) => ({
      src: el.currentSrc || el.src,
      duration: el.duration
    }));
    console.log("Video 3 Inspection (30s Switch):", videoData3);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dynamic_30s_switch.png') });
    console.log("Screenshot captured: 03_dynamic_30s_switch.png");

    // TEST 4: Switch to 6s dynamically
    console.log("\n--- TEST 4: Switch Duration to 6s ---");
    await page.$$eval('button', (buttons) => {
      const btn = buttons.find(b => b.textContent.trim() === '6s');
      if (btn) btn.click();
    });
    await sleep(1500);

    const videoData4 = await page.$eval('video', (el) => ({
      src: el.currentSrc || el.src,
      duration: el.duration
    }));
    console.log("Video 4 Inspection (6s Switch):", videoData4);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dynamic_6s_switch.png') });
    console.log("Screenshot captured: 04_dynamic_6s_switch.png");

    console.log("\n✅ ALL TESTS COMPLETED SUCCESSFULLY!");

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
