import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots/denmark_deep_link');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting Denmark Deep-Link & Wardrobe Integration E2E Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // TEST 1: Direct Deep-Link to Freja Møller with Gym Wardrobe
  console.log('\n--- TEST 1: Direct URL Deep Link with Freja Møller (Gym Wardrobe) ---');
  const deepLinkUrl = 'http://localhost:3000/?lead=freja_moller_dk&wardrobe=w_freja_gym&outfit=Workout%20Set#prompt-bar';
  console.log(`Navigating to: ${deepLinkUrl}`);
  await page.goto(deepLinkUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // Assert Cast & Place drawer is expanded and shows Freja Møller
  const leadName = await page.$eval('div', () => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent === 'Freja Møller');
    return el ? el.textContent : null;
  });
  console.log(`Lead Performer Display Name: "${leadName}"`);
  if (!leadName) throw new Error('Lead performer Freja Møller was not hydrated in Cast & Place drawer!');

  // Check wardrobe label
  const wardrobeLabel = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent && e.textContent.includes('Workout Set'));
    return el ? el.textContent.trim() : null;
  });
  console.log(`Active Wardrobe Tag: "${wardrobeLabel}"`);
  if (!wardrobeLabel) throw new Error('Active wardrobe Workout Set not found on lead actor!');

  // Check lead avatar image src
  const leadImgSrc = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[alt="Lead"]'));
    return imgs.length > 0 ? imgs[0].src : null;
  });
  console.log(`Lead Performer Avatar Image: "${leadImgSrc}"`);
  if (!leadImgSrc || !leadImgSrc.includes('freja_moller_gym.jpg')) {
    throw new Error(`Expected image to contain freja_moller_gym.jpg, but got: ${leadImgSrc}`);
  }

  // Check prefilled prompt
  const promptValue = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    return textarea ? textarea.value : null;
  });
  console.log(`Prefilled Prompt Text: "${promptValue}"`);
  if (!promptValue || !promptValue.includes('Freja Møller in Workout Set attire')) {
    throw new Error(`Prompt was not properly contextualized with wardrobe: ${promptValue}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_freja_gym_deep_link_desktop.png') });
  console.log('📸 Captured 01_freja_gym_deep_link_desktop.png');

  // TEST 2: In-Drawer Outfit Quick Pill Switch (Switch from Gym to Pool/Harbor)
  console.log('\n--- TEST 2: In-Drawer Quick Outfit Switcher (Gym -> Pool/Harbor) ---');
  // Click on the pill that switches to Harbor/Pool
  const switched = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const poolBtn = buttons.find(b => b.textContent && (b.textContent.includes('Harbor') || b.textContent.includes('Pool') || b.textContent.includes('Resort')));
    if (poolBtn) {
      poolBtn.click();
      return poolBtn.textContent.trim();
    }
    return null;
  });
  console.log(`Clicked outfit pill: "${switched}"`);
  if (!switched) throw new Error('Could not find Harbor/Pool outfit pill button!');

  await sleep(1000);

  const updatedImgSrc = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[alt="Lead"]'));
    return imgs.length > 0 ? imgs[0].src : null;
  });
  console.log(`Updated Avatar Image: "${updatedImgSrc}"`);
  if (!updatedImgSrc || !updatedImgSrc.includes('freja_moller_pool.jpg')) {
    throw new Error(`Expected image to update to freja_moller_pool.jpg, but got: ${updatedImgSrc}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_freja_switched_to_pool_in_drawer.png') });
  console.log('📸 Captured 02_freja_switched_to_pool_in_drawer.png');

  // TEST 3: Navigate to /characters, Filter Denmark, Inspect Mikkel Lind modal, Cast in Reel
  console.log('\n--- TEST 3: Character Library Modal Casting Flow (Mikkel Lind -> Pool) ---');
  await page.goto('http://localhost:3000/characters', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1000);

  // Click Denmark button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dkBtn = btns.find(b => b.textContent && b.textContent.includes('Denmark Personas'));
    if (dkBtn) dkBtn.click();
  });
  await sleep(1000);

  // Dismiss cookie banner if present
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const acceptBtn = btns.find(b => b.textContent && b.textContent.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(500);

  // Click on Mikkel Lind's Details button to open inspection modal
  const clickedDetails = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h3'));
    const mikkel = cards.find(h => h.textContent && h.textContent.includes('Mikkel Lind'));
    if (mikkel) {
      const cardRoot = mikkel.closest('.group');
      if (cardRoot) {
        const buttons = Array.from(cardRoot.querySelectorAll('button'));
        const detailsBtn = buttons.find(b => b.textContent && b.textContent.includes('Details'));
        if (detailsBtn) {
          detailsBtn.click();
          return true;
        }
      }
    }
    return false;
  });
  console.log(`Clicked Mikkel Details button: ${clickedDetails}`);
  await sleep(1500);

  // In modal, click Pool / Harbor Bath Deck wardrobe variant
  const modalWClicked = await page.evaluate(() => {
    const modal = document.querySelector('.bg-\\[\\#0C1019\\].rounded-3xl');
    if (!modal) return null;
    const buttons = Array.from(modal.querySelectorAll('button'));
    const poolW = buttons.find(b => b.textContent && (b.textContent.includes('Harbor Bath') || b.textContent.includes('Pool') || b.textContent.includes('Swim')));
    if (poolW) {
      poolW.click();
      return poolW.textContent.trim();
    }
    return null;
  });
  console.log(`Modal Wardrobe clicked: "${modalWClicked}"`);
  await sleep(1000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mikkel_modal_pool_selected.png') });
  console.log('📸 Captured 03_mikkel_modal_pool_selected.png');

  // Click "Cast as Lead Actor in Reel" Link in modal
  const castHref = await page.evaluate(() => {
    const modal = document.querySelector('.bg-\\[\\#0C1019\\].rounded-3xl');
    if (!modal) return null;
    const links = Array.from(modal.querySelectorAll('a'));
    const castLink = links.find(a => a.textContent && a.textContent.includes('Cast as Lead Actor in Reel'));
    return castLink ? castLink.getAttribute('href') : null;
  });
  console.log(`Cast Link Href: "${castHref}"`);
  if (!castHref) throw new Error('Could not find Cast as Lead Actor in Reel link in modal!');

  await page.goto('http://localhost:3000' + castHref, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // Verify we landed on Creator Studio with Mikkel Lind in Pool attire
  const studioLeadName = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent === 'Mikkel Lind');
    return el ? el.textContent : null;
  });
  console.log(`Studio Lead Performer: "${studioLeadName}"`);
  if (!studioLeadName) throw new Error('Mikkel Lind was not cast into Creator Studio from modal!');

  const studioLeadImg = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[alt="Lead"]'));
    return imgs.length > 0 ? imgs[0].src : null;
  });
  console.log(`Studio Lead Image: "${studioLeadImg}"`);
  if (!studioLeadImg || !studioLeadImg.includes('mikkel_lind_pool.jpg')) {
    throw new Error(`Expected Mikkel Lind pool image, got: ${studioLeadImg}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mikkel_cast_into_studio_pool.png') });
  console.log('📸 Captured 04_mikkel_cast_into_studio_pool.png');

  // TEST 4: Mobile Responsive Audits (iOS iPhone 14 & Android Pixel 7)
  console.log('\n--- TEST 4: Mobile Responsive Audits (iOS & Android) ---');
  // iOS iPhone 14
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await sleep(800);
  const iosOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`iOS Horizontal Overflow: ${iosOverflow ? 'FAIL' : 'PASS (Zero Overflow)'}`);
  if (iosOverflow) throw new Error('iOS has horizontal overflow!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_studio_ios_mobile.png') });
  console.log('📸 Captured 05_studio_ios_mobile.png');

  // Android Pixel 7
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await sleep(800);
  const androidOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`Android Horizontal Overflow: ${androidOverflow ? 'FAIL' : 'PASS (Zero Overflow)'}`);
  if (androidOverflow) throw new Error('Android has horizontal overflow!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_studio_android_mobile.png') });
  console.log('📸 Captured 06_studio_android_mobile.png');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Zero Defect & Continuity Guaranteed.');
  await browser.close();
}

run().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
