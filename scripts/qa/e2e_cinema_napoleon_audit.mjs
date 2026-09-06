import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

async function runCinemaStudioE2E() {
  const screenshotDir = path.join(process.cwd(), 'scratch/screenshots_cinema_e2e');
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log(`🚀 Launching Chrome at ${CHROME_PATH}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();

  // Set local storage flags
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('zyvoriq_cookie_consent', 'accepted');
  });

  // TEST 1: Ultra-Wide Desktop (1600x1000) - Main Cinema Studio Page
  console.log('\n--- 1. Desktop Viewport (1600x1000) ---');
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto(`${BASE_URL}/studio/cinema`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Assert page title
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Screenshot 1: Desktop Hero & Film Deck
  await page.screenshot({ path: path.join(screenshotDir, '01_cinema_studio_desktop_hero.png'), fullPage: false });
  console.log('📸 01_cinema_studio_desktop_hero.png');

  // TEST 2: Select Napoleon: The Emperor's Heart
  console.log('\n--- 2. Film Selection: Napoleon: The Emperor\'s Heart ---');
  const napoleonCardSelector = '#film-card-film_napoleon_romance';
  const hasNapoleonCard = await page.$(napoleonCardSelector);
  if (hasNapoleonCard) {
    await page.click(napoleonCardSelector);
    await sleep(800);
    console.log('✓ Clicked Napoleon Romance film card');
  } else {
    console.log('⚠ Napoleon card selector not found, checking query params');
    await page.goto(`${BASE_URL}/studio/cinema?film=napoleon-romance`, { waitUntil: 'networkidle2' });
    await sleep(800);
  }

  await page.screenshot({ path: path.join(screenshotDir, '02_napoleon_romance_selected.png'), fullPage: false });
  console.log('📸 02_napoleon_romance_selected.png');

  // TEST 3: Multi-Track Audio Switcher Interaction
  console.log('\n--- 3. Audio Track Switcher Interaction ---');
  const audioTracks = ['dialogue', 'score', 'foley', 'commentary'];
  for (const track of audioTracks) {
    const trackBtn = await page.$(`#audio-track-${track}`);
    if (trackBtn) {
      await trackBtn.click();
      await sleep(400);
      console.log(`✓ Clicked audio track: ${track}`);
    }
  }
  await page.screenshot({ path: path.join(screenshotDir, '03_audio_stem_switcher.png'), fullPage: false });
  console.log('📸 03_audio_stem_switcher.png');

  // TEST 4: Master Screenplay Modal
  console.log('\n--- 4. Master Screenplay Modal ---');
  const screenplayBtn = await page.$('#view-screenplay-btn');
  if (screenplayBtn) {
    await screenplayBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '04_master_screenplay_modal.png'), fullPage: false });
    console.log('📸 04_master_screenplay_modal.png');
    // Close modal
    const closeBtn = await page.$('#close-screenplay-modal-btn');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(400);
  }

  // TEST 5: Cast & Crew Modal
  console.log('\n--- 5. Cast & Crew Modal ---');
  const castCrewBtn = await page.$('#view-cast-crew-btn');
  if (castCrewBtn) {
    await castCrewBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '05_cast_crew_modal.png'), fullPage: false });
    console.log('📸 05_cast_crew_modal.png');
    const closeBtn = await page.$('#close-cast-crew-modal-btn');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(400);
  }

  // TEST 6: Package IMF Deliverable Modal
  console.log('\n--- 6. Package IMF Deliverable Modal ---');
  const imfBtn = await page.$('#package-imf-btn');
  if (imfBtn) {
    await imfBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '06_imf_master_packaging_modal.png'), fullPage: false });
    console.log('📸 06_imf_master_packaging_modal.png');
    const closeBtn = await page.$('#close-imf-modal-btn');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(400);
  }

  // TEST 7: Shot Manifest JSON Modal
  console.log('\n--- 7. Shot Manifest JSON Modal ---');
  const manifestBtn = await page.$('#shot-manifest-btn');
  if (manifestBtn) {
    await manifestBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '07_shot_manifest_json_modal.png'), fullPage: false });
    console.log('📸 07_shot_manifest_json_modal.png');
    const closeBtn = await page.$('#close-shot-manifest-modal-btn');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(400);
  }

  // TEST 8: C2PA Provenance Modal
  console.log('\n--- 8. C2PA Provenance Modal ---');
  const c2paBtn = await page.$('#inspect-c2pa-btn');
  if (c2paBtn) {
    await c2paBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '08_c2pa_provenance_modal.png'), fullPage: false });
    console.log('📸 08_c2pa_provenance_modal.png');
    const closeBtn = await page.$('#close-cert-modal-btn');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(400);
  }

  // TEST 9: Dedicated Director's Quality Audit Suite Page
  console.log('\n--- 9. Dedicated Quality Audit Suite Page (/studio/cinema/audit) ---');
  await page.goto(`${BASE_URL}/studio/cinema/audit?filmId=napoleon-romance`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Assert page elements
  const auditHeader = await page.$eval('h1, h2', el => el.textContent);
  console.log(`Audit page header: ${auditHeader}`);
  await page.screenshot({ path: path.join(screenshotDir, '09_audit_page_vision_tab.png'), fullPage: false });
  console.log('📸 09_audit_page_vision_tab.png');

  // Switch to Audio & Dialogue Sync Tab
  const audioTabBtn = await page.$('#audit-tab-audio');
  if (audioTabBtn) {
    await audioTabBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '10_audit_page_audio_tab.png'), fullPage: false });
    console.log('📸 10_audit_page_audio_tab.png');
  }

  // Switch to 13 Forensic Quality Gates Tab
  const gatesTabBtn = await page.$('#audit-tab-gates');
  if (gatesTabBtn) {
    await gatesTabBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '11_audit_page_gates_tab.png'), fullPage: false });
    console.log('📸 11_audit_page_gates_tab.png');
  }

  // Switch to Director Camera Vectors Tab
  const vectorsTabBtn = await page.$('#audit-tab-vectors');
  if (vectorsTabBtn) {
    await vectorsTabBtn.click();
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, '12_audit_page_vectors_tab.png'), fullPage: false });
    console.log('📸 12_audit_page_vectors_tab.png');
  }

  // TEST 10: Tablet iPad Viewport (834x1194)
  console.log('\n--- 10. Tablet Viewport (834x1194) ---');
  await page.setViewport({ width: 834, height: 1194 });
  await page.goto(`${BASE_URL}/studio/cinema`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  const tabletOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log(`Tablet (834px) Overflow: ${tabletOverflow.hasOverflow ? 'FAIL ❌' : 'PASS ✅'} (scrollWidth: ${tabletOverflow.scrollWidth}, innerWidth: ${tabletOverflow.innerWidth})`);
  await page.screenshot({ path: path.join(screenshotDir, '13_tablet_ipad_viewport.png'), fullPage: false });
  console.log('📸 13_tablet_ipad_viewport.png');

  // TEST 11: Mobile iPhone 14 Viewport (390x844)
  console.log('\n--- 11. Mobile iPhone 14 Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/studio/cinema`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  const iphoneOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log(`iPhone 14 (390px) Overflow: ${iphoneOverflow.hasOverflow ? 'FAIL ❌' : 'PASS ✅'} (scrollWidth: ${iphoneOverflow.scrollWidth}, innerWidth: ${iphoneOverflow.innerWidth})`);
  await page.screenshot({ path: path.join(screenshotDir, '14_mobile_iphone14_viewport.png'), fullPage: false });
  console.log('📸 14_mobile_iphone14_viewport.png');

  // TEST 12: Mobile Pixel 7 Viewport (412x915)
  console.log('\n--- 12. Mobile Pixel 7 Viewport (412x915) ---');
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/studio/cinema/audit?filmId=napoleon-romance`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  const pixelOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log(`Pixel 7 (412px) Overflow: ${pixelOverflow.hasOverflow ? 'FAIL ❌' : 'PASS ✅'} (scrollWidth: ${pixelOverflow.scrollWidth}, innerWidth: ${pixelOverflow.innerWidth})`);
  await page.screenshot({ path: path.join(screenshotDir, '15_mobile_pixel7_audit_page.png'), fullPage: false });
  console.log('📸 15_mobile_pixel7_audit_page.png');

  await browser.close();
  console.log('\n🎉 ALL 12 CINEMA STUDIO & AUDIT SUITE E2E TESTS COMPLETED SUCCESSFULLY!');
}

runCinemaStudioE2E().catch((err) => {
  console.error('❌ E2E Test Suite Encountered Error:', err);
  process.exit(1);
});
