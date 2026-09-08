const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("================================================================================");
  console.log("🎬 RUNNING CLOUDTOP E2E: 34-SECOND BOLLYWOOD ROMANCE MUSIC VIDEO REEL");
  console.log("   Portal: https://zyvoriq.up.railway.app");
  console.log("   Host: nitinagga.c.googlers.com");
  console.log("================================================================================\n");

  const projectRoot = path.resolve(__dirname, '..');
  const localOutputDir = path.join(projectRoot, 'scratch', 'cloudtop_e2e_screenshots', 'bollywood_romance_34s');
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }

  const remoteScript = `
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

  console.log("🚀 Launching Headless Chrome on Cloudtop (1600x1000)...");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  const BASE_URL = 'https://zyvoriq.up.railway.app';
  console.log("🌐 Navigating to " + BASE_URL + "...");
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1500);

  // 1. Enter prompt
  console.log("✍️ Entering Bollywood romance prompt...");
  const promptSelector = 'textarea#creator-prompt-input, textarea';
  await page.waitForSelector(promptSelector, { timeout: 15000 });
  const promptText = "Bollywood romance music video with group singing and dancing, vibrant colorful traditional silk attire, palace courtyard in Rajasthan with carved marble pillars and fountain, romantic duet between Arjun and Meera with energetic background chorus dancers, joyful choreography and celebration";
  
  // Clear and type
  await page.$eval(promptSelector, (el, val) => {
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, promptText);
  await sleep(800);

  // 2. Select 34s duration
  console.log("⏱️ Selecting 34s duration...");
  const duration34Clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn34 = buttons.find(b => b.textContent && b.textContent.includes('34s'));
    if (btn34) {
      btn34.click();
      return true;
    }
    const input = document.querySelector('#custom-duration-input');
    if (input) {
      input.value = '34';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log("   34s duration selected: " + duration34Clicked);
  await sleep(800);

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

  // Screenshot 1: Prompt & Controls configured
  const shot1 = path.join(outputDir, '01_desktop_prompt_and_duration_34s.png');
  await page.screenshot({ path: shot1 });
  console.log("📸 Saved " + shot1);

  // 4. Click Elaborate & Deconstruct
  console.log("✨ Clicking 'Elaborate & Deconstruct'...");
  let elaborateResponseData = null;
  page.on('response', async (res) => {
    if (res.url().includes('/api/studio1/elaborate') && res.status() === 200) {
      try {
        elaborateResponseData = await res.json();
      } catch {}
    }
  });

  const elaborateClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bElab = buttons.find(b => b.textContent && b.textContent.includes('Elaborate & Deconstruct'));
    if (bElab) {
      bElab.click();
      return true;
    }
    return false;
  });
  console.log("   Elaborate clicked: " + elaborateClicked);

  // Wait for treatment dossier to render
  console.log("⏳ Waiting for Director Treatment Dossier to compile...");
  try {
    await page.waitForSelector('#director-treatment-dossier, [data-testid=\"director-treatment-dossier\"]', { timeout: 35000 });
  } catch {
    await page.waitForFunction(() => document.body.innerText.includes("Director's Treatment Dossier"), { timeout: 35000 });
  }
  await sleep(1500);

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
  await sleep(1000);
  const shot3 = path.join(outputDir, '03_desktop_cast_and_wardrobe_tab.png');
  await page.screenshot({ path: shot3 });
  console.log("📸 Saved " + shot3);

  // Switch to Acoustic Score tab
  console.log("🎵 Inspecting Acoustic Score tab...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const scoreTab = tabs.find(t => t.textContent && t.textContent.includes('Acoustic Score'));
    if (scoreTab) scoreTab.click();
  });
  await sleep(1000);
  const shot4 = path.join(outputDir, '04_desktop_acoustic_score_tab.png');
  await page.screenshot({ path: shot4 });
  console.log("📸 Saved " + shot4);

  // 5. Intercept POST /api/studio1/productions and click Direct Reel button
  console.log("🚀 Submitting 34s Reel Generation to Railway Production Queue...");
  let createResponseData = null;
  const responsePromise = page.waitForResponse(
    res => res.url().includes('/api/studio1/productions') && (res.status() === 201 || res.status() === 200),
    { timeout: 45000 }
  );

  const approveClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bApprove = buttons.find(b => b.textContent && (b.textContent.includes('Direct') || b.textContent.includes('Approve Treatment')));
    if (bApprove) {
      bApprove.click();
      return true;
    }
    const bGen = buttons.find(b => b.textContent && b.textContent.includes('Generate') && !b.disabled);
    if (bGen) {
      bGen.click();
      return true;
    }
    return false;
  });
  console.log("   Approve & Direct button clicked: " + approveClicked);

  try {
    const res = await responsePromise;
    createResponseData = await res.json();
    console.log("🎉 Production Enqueued Successfully!");
    console.log(JSON.stringify(createResponseData, null, 2));
  } catch (err) {
    console.warn("⚠️ API response wait timeout, checking page state: " + err.message);
  }

  await sleep(2000);
  const shot5 = path.join(outputDir, '05_desktop_production_enqueued_live.png');
  await page.screenshot({ path: shot5 });
  console.log("📸 Saved " + shot5);

  const prodId = createResponseData?.production?.id || createResponseData?.productionId;
  console.log("🎯 Target Production ID: " + prodId);

  fs.writeFileSync('/tmp/bollywood_34s_result.json', JSON.stringify({
    productionId: prodId,
    production: createResponseData?.production,
    elaborateTreatment: elaborateResponseData?.treatment
  }, null, 2));

  await browser.close();
  console.log("🏁 Cloudtop Headless E2E Completed!");
})();
\`;

  const tmpScriptPath = '/tmp/cloudtop_e2e_runner_bollywood.js';
  fs.writeFileSync(tmpScriptPath, remoteScript);

  console.log("📤 Transferring E2E runner script to Cloudtop...");
  execSync(\`scp -o BatchMode=yes \${tmpScriptPath} nitinagga.c.googlers.com:/tmp/cloudtop_e2e_runner_bollywood.js\`);

  console.log("⚡ Executing E2E Puppeteer flow on Cloudtop against live Railway...");
  const stdout = execSync(\`ssh -o BatchMode=yes nitinagga.c.googlers.com "node /tmp/cloudtop_e2e_runner_bollywood.js"\`, { encoding: 'utf8', maxBuffer: 16e6 });
  console.log(stdout);

  console.log("📥 Copying captured screenshots from Cloudtop to local workspace...");
  execSync(\`scp -o BatchMode=yes nitinagga.c.googlers.com:/tmp/cloudtop_bollywood_34s_screenshots/*.png \${localOutputDir}/\`);

  const resultJsonStr = execSync(\`ssh -o BatchMode=yes nitinagga.c.googlers.com "cat /tmp/bollywood_34s_result.json"\`, { encoding: 'utf8' });
  const resultData = JSON.parse(resultJsonStr);
  console.log("Result Data:", resultData);

  return resultData;
}

main().catch(err => {
  console.error("E2E Execution failed:", err);
  process.exit(1);
});
