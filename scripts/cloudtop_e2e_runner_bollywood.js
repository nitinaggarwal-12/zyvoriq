const puppeteer = require('/usr/local/google/home/nitinagga/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const outputDir = '/tmp/cloudtop_bollywood_34s_screenshots';
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🚀 Launching Headless Chrome on Cloudtop (1600x1200)...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1600,1200'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 1 });

  const BASE_URL = 'https://zyvoriq.up.railway.app';
  console.log("🌐 Navigating to " + BASE_URL + "...");
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1500);

  // 1. Enter prompt
  console.log("✍️ Entering Bollywood romance prompt...");
  const promptText = "Bollywood romance music video with group singing and dancing, vibrant colorful traditional festive silk attire, palace courtyard with carved marble pillars and fountain, romantic duet between Arjun and Meera with energetic background chorus dancers, joyful choreography and celebration";
  
  await page.type("textarea", promptText, { delay: 5 });
  await sleep(500);

  // 2. Select 34s duration
  console.log("⏱️ Selecting 34s duration...");
  const duration34Clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn34 = buttons.find(b => b.textContent && b.textContent.includes('34s'));
    if (btn34) {
      btn34.click();
      return 'button_clicked';
    }
    const input = document.querySelector('#custom-duration-input');
    if (input) {
      input.value = '34';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return 'input_set';
    }
    return 'none';
  });
  console.log("   34s duration result: " + duration34Clicked);
  await sleep(600);

  // 3. Select Bollywood Romance genre
  console.log("🎭 Selecting Bollywood Romance genre...");
  const genreClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bBollywood = buttons.find(b => b.textContent && b.textContent.includes('Bollywood Romance'));
    if (bBollywood) {
      bBollywood.click();
      return true;
    }
    return false;
  });
  console.log("   Bollywood Romance genre selected: " + genreClicked);
  await sleep(800);

  // Screenshot 1: Configured Prompt & Controls
  const shot1 = path.join(outputDir, '01_desktop_prompt_and_duration_34s.png');
  await page.screenshot({ path: shot1 });
  console.log("📸 Saved " + shot1);

  // 4. Click Elaborate & Deconstruct
  console.log("✨ Clicking 'Elaborate & Deconstruct'...");
  let elaborateTreatment = null;
  page.on('response', async (res) => {
    if (res.url().includes('/api/studio1/elaborate') && res.status() === 200) {
      try {
        const body = await res.json();
        elaborateTreatment = body.treatment;
        console.log("📥 Received Elaborated Treatment from API! Title: " + elaborateTreatment?.title + ", Shots: " + elaborateTreatment?.shots?.length);
      } catch {}
    }
  });

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bElab = buttons.find(b => b.textContent && b.textContent.includes('Elaborate & Deconstruct'));
    if (bElab) bElab.click();
  });

  console.log("⏳ Waiting for Omni Director Pre-Flight Treatment Dossier to compile...");
  await page.waitForFunction(() => {
    return document.body.textContent && document.body.textContent.includes("Omni Director Pre-Flight Treatment");
  }, { timeout: 45000 });
  console.log("🎉 Omni Director Pre-Flight Treatment Dossier found on DOM!");
  await sleep(1500);

  // Scroll Dossier into view
  await page.evaluate(() => {
    const el = document.querySelector(".border-teal-500\\/40");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await sleep(800);

  // Screenshot 2: Treatment Dossier
  const shot2 = path.join(outputDir, '02_desktop_elaborate_treatment_dossier_34s.png');
  await page.screenshot({ path: shot2 });
  console.log("📸 Saved " + shot2);

  // Switch to Cast & Wardrobe tab
  console.log("👗 Inspecting Cast & Wardrobe tab...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const castTab = tabs.find(t => t.textContent && t.textContent.includes('Cast & Wardrobe'));
    if (castTab) castTab.click();
  });
  await sleep(800);
  const shot3 = path.join(outputDir, '03_desktop_cast_and_wardrobe_tab.png');
  await page.screenshot({ path: shot3 });
  console.log("📸 Saved " + shot3);

  // Switch to Acoustic Score tab
  console.log("🎵 Inspecting Acoustic Score tab...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const scoreTab = tabs.find(t => t.textContent && t.textContent.includes('Acoustic Bed'));
    if (scoreTab) scoreTab.click();
  });
  await sleep(800);
  const shot4 = path.join(outputDir, '04_desktop_acoustic_score_tab.png');
  await page.screenshot({ path: shot4 });
  console.log("📸 Saved " + shot4);

  // 5. Submit generation to live Railway production queue
  console.log("🚀 Submitting 34s Reel Generation to Railway Production Queue...");
  let createResponseData = null;
  const responsePromise = page.waitForResponse(
    res => res.url().includes('/api/studio1/productions') && (res.status() === 201 || res.status() === 200),
    { timeout: 35000 }
  );

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bApprove = buttons.find(b => b.textContent && (b.textContent.includes('Approve Treatment') || b.textContent.includes('Direct')));
    if (bApprove) bApprove.click();
  });

  try {
    const res = await responsePromise;
    createResponseData = await res.json();
    console.log("🎉 Production Enqueued Successfully! Payload:");
    console.log(JSON.stringify(createResponseData, null, 2));
  } catch (err) {
    console.warn("⚠️ API response wait warning: " + err.message);
  }

  await sleep(2500);
  const shot5 = path.join(outputDir, '05_desktop_production_enqueued_live.png');
  await page.screenshot({ path: shot5 });
  console.log("📸 Saved " + shot5);

  const prodId = createResponseData?.production?.id || createResponseData?.productionId;
  console.log("🎯 Target Production ID: " + prodId);

  fs.writeFileSync('/tmp/bollywood_34s_result.json', JSON.stringify({
    productionId: prodId,
    production: createResponseData?.production,
    elaborateTreatment: elaborateTreatment
  }, null, 2));

  await browser.close();
  console.log("🏁 Cloudtop Headless E2E Completed!");
})();
