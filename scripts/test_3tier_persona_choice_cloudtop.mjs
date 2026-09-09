import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots/3tier_choice');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting 3-Tier Persona Choice Architecture & Continuity Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log('\n--- TEST 1: Open Creator Studio & Expand Cast & Set Drawer ---');
  await page.goto('http://localhost:3000/#prompt-bar', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // Expand Cast & Set Drawer if not open
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const configBtn = btns.find(b => b.textContent && (b.textContent.includes('Configure Cast') || b.textContent.includes('Casting & Physical Set')));
    if (configBtn) configBtn.click();
  });
  await sleep(800);

  // Verify all 3 Tier Mode Buttons exist
  const modes = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return {
      hasAuto: buttons.some(b => b.textContent && b.textContent.includes('Omni Auto-Cast')),
      hasLibrary: buttons.some(b => b.textContent && b.textContent.includes('Curated Library')),
      hasCustom: buttons.some(b => b.textContent && b.textContent.includes('Enter Custom Details'))
    };
  });
  console.log('3-Tier Mode Selector Presence:', JSON.stringify(modes));
  if (!modes.hasAuto || !modes.hasLibrary || !modes.hasCustom) {
    throw new Error('3-Tier Mode Selector buttons not all found!');
  }

  // TEST TIER 1: Omni Auto-Cast Mode (Zero forced personas)
  console.log('\n--- TEST 2: Switch to Omni Auto-Cast (Default) Mode ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const autoBtn = buttons.find(b => b.textContent && b.textContent.includes('Omni Auto-Cast'));
    if (autoBtn) autoBtn.click();
  });
  await sleep(800);

  const autoAssuranceText = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent && e.textContent.includes('Autonomous Pre-Flight Cast'));
    return el ? el.textContent.trim() : null;
  });
  console.log(`Auto-Cast Assurance Tag: "${autoAssuranceText}"`);
  if (!autoAssuranceText) throw new Error('Omni Auto-Cast assurance card not rendered!');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_omni_auto_cast_default_mode.png') });
  console.log('📸 Captured 01_omni_auto_cast_default_mode.png');

  // TEST TIER 3: Custom Details Mode (Enter Custom Actor & Set)
  console.log('\n--- TEST 3: Switch to Custom Details Mode & Enter Custom Specifications ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const customBtn = buttons.find(b => b.textContent && b.textContent.includes('Enter Custom Details'));
    if (customBtn) customBtn.click();
  });
  await sleep(800);

  // Fill in Custom fields
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Astrid Vane'));
    if (nameInput) {
      nameInput.value = 'Astrid Vane';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const archetypeInput = inputs.find(i => i.placeholder && i.placeholder.includes('Danish architect'));
    if (archetypeInput) {
      archetypeInput.value = '31yo Danish biochemist, ash-blonde hair, hazel eyes, sharp cheekbones';
      archetypeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const wardrobeInput = inputs.find(i => i.placeholder && i.placeholder.includes('Charcoal wool coat'));
    if (wardrobeInput) {
      wardrobeInput.value = 'Minimalist black merino turtleneck and slate trench coat';
      wardrobeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const locationInput = inputs.find(i => i.placeholder && i.placeholder.includes('Copenhagen harbour'));
    if (locationInput) {
      locationInput.value = 'Subterranean harbor botanical lab with glowing blue algae tubes and mist';
      locationInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await sleep(800);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_custom_performer_and_set_details.png') });
  console.log('📸 Captured 02_custom_performer_and_set_details.png');

  // TEST TIER 2: Return to Curated Library Mode
  console.log('\n--- TEST 4: Return to Curated Library Mode ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const libBtn = buttons.find(b => b.textContent && b.textContent.includes('Curated Library'));
    if (libBtn) libBtn.click();
  });
  await sleep(800);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_curated_library_mode_active.png') });
  console.log('📸 Captured 03_curated_library_mode_active.png');

  console.log('\n🎉 ALL 3-TIER CHOICE ARCHITECTURE TESTS PASSED SUCCESSFULLY!');
  await browser.close();
}

run().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
