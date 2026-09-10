import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/cloudtop_e2e_screenshots');

async function run() {
  console.log('🚀 Running Cloudtop E2E Sleek Layout Verification...');

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    // 1. DESKTOP VIEWPORT (1600x950) - TAB 1: INSTAGRAM / TIKTOK MODE
    console.log('\n📱 Testing Mode 1: Instagram / TikTok (9:16 Vertical) on Desktop (1600x950)...');
    await page.setViewport({ width: 1600, height: 950 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));

    // Dismiss transparency banner if present
    try {
      const bannerClose = await page.$('button[aria-label="Close"]');
      if (bannerClose) {
        await bannerClose.click();
      } else {
        const allButtons = await page.$$('button');
        for (const btn of allButtons) {
          const txt = await page.evaluate(el => el.textContent, btn);
          if (txt && (txt.includes('Accept All') || txt.includes('Essential'))) {
            await page.evaluate(el => el.click(), btn);
            break;
          }
        }
      }
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log('Banner dismiss notice:', e.message);
    }

    // Assert DOM elements
    const headlineText = await page.$eval('h1', el => el.textContent);
    console.log(`Headline 1: "${headlineText}"`);
    if (!headlineText.includes('actually keep the same face')) {
      throw new Error(`Unexpected headline for Mode 1: ${headlineText}`);
    }

    // Assert prompt bar is present
    const promptBarExists = await page.$('#prompt-bar');
    if (!promptBarExists) throw new Error('FAIL: #prompt-bar not found in DOM');

    // Assert Consolidated Header Navigation Links
    const headerNavText = await page.$eval('header nav', el => el.textContent);
    console.log('Header Nav Text:', headerNavText);
    if (!headerNavText.includes('Showcase') || !headerNavText.includes('Assets') || !headerNavText.includes('Studio') || !headerNavText.includes('Why Unbroken') || !headerNavText.includes('Pricing')) {
      throw new Error(`FAIL: Missing consolidated nav item in header: ${headerNavText}`);
    }

    // Capture dedicated header screenshot
    const headerEl = await page.$('header');
    if (headerEl) {
      await headerEl.screenshot({ path: path.join(SCREENSHOT_DIR, '00_consolidated_header_desktop.png') });
      console.log('📸 Captured 00_consolidated_header_desktop.png');
    }

    // Assert video element is playing or visible
    const videoExists = await page.$('video');
    if (!videoExists) throw new Error('FAIL: video player not found in DOM');

    // Assert Zero overflow
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Horizontal overflow (Desktop Mode 1): ${hasHorizontalOverflow}`);
    if (hasHorizontalOverflow) throw new Error('FAIL: Detected horizontal overflow in Mode 1');

    // Assert Left and Right Card Dimensions (Equal Size Quality Gate)
    const leftBox1 = await page.$eval('#prompt-bar', el => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    });
    const rightBox1 = await page.$eval('#monitor-card', el => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    });
    console.log('Mode 1 Dimensions -> Left (#prompt-bar):', leftBox1, 'Right (#monitor-card):', rightBox1);
    if (Math.abs(leftBox1.w - rightBox1.w) > 4) {
      throw new Error(`FAIL: Width mismatch in Mode 1: Left=${leftBox1.w}px, Right=${rightBox1.w}px`);
    }
    if (Math.abs(leftBox1.h - rightBox1.h) > 4) {
      throw new Error(`FAIL: Height mismatch in Mode 1: Left=${leftBox1.h}px, Right=${rightBox1.h}px`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_instagram_tiktok_mode_desktop.png'), fullPage: false });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_instagram_tiktok_mode_fullpage.png'), fullPage: true });
    console.log('📸 Captured 01_instagram_tiktok_mode_desktop.png & fullpage');

    // 2. DESKTOP VIEWPORT (1600x950) - TAB 2: YOUTUBE / 180s CINEMA MODE
    console.log('\n🎬 Testing Mode 2: YouTube / 180s Cinema (2.39:1 Anamorphic) on Desktop (1600x950)...');
    
    // Find and click the YouTube / Cinema tab button
    const buttons = await page.$$('button');
    let cinemaBtnFound = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('YouTube') || text.includes('Cinema') || text.includes('180s Master'))) {
        console.log(`Clicking cinema button: "${text.trim()}"...`);
        await page.evaluate(el => el.click(), btn);
        cinemaBtnFound = true;
        break;
      }
    }
    if (!cinemaBtnFound) throw new Error('FAIL: YouTube / Cinema tab button not found');

    // Wait 800ms for settling animation
    await new Promise(r => setTimeout(r, 1000));

    const cinemaHeadline = await page.$eval('h1', el => el.textContent);
    console.log(`Headline 2: "${cinemaHeadline}"`);
    if (!cinemaHeadline.includes('commands the big screen')) {
      throw new Error(`Unexpected headline for Mode 2: ${cinemaHeadline}`);
    }

    // Assert 5 acts scrubber is visible
    const actButtons = await page.$$eval('button', btns => btns.filter(b => b.textContent?.includes('Act ')).map(b => b.textContent?.trim()));
    console.log(`Found Act buttons: ${actButtons.join(', ')}`);
    if (actButtons.length < 5) {
      throw new Error(`FAIL: Expected 5 act scrubber buttons, found ${actButtons.length}`);
    }

    // Assert Left and Right Card Dimensions (Equal Size Quality Gate)
    const leftBox2 = await page.$eval('#prompt-bar', el => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    });
    const rightBox2 = await page.$eval('#monitor-card', el => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    });
    console.log('Mode 2 Dimensions -> Left (#prompt-bar):', leftBox2, 'Right (#monitor-card):', rightBox2);
    if (Math.abs(leftBox2.w - rightBox2.w) > 4) {
      throw new Error(`FAIL: Width mismatch in Mode 2: Left=${leftBox2.w}px, Right=${rightBox2.w}px`);
    }
    if (Math.abs(leftBox2.h - rightBox2.h) > 4) {
      throw new Error(`FAIL: Height mismatch in Mode 2: Left=${leftBox2.h}px, Right=${rightBox2.h}px`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_youtube_cinema_mode_desktop.png'), fullPage: false });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_youtube_cinema_mode_fullpage.png'), fullPage: true });
    console.log('📸 Captured 02_youtube_cinema_mode_desktop.png & fullpage');

    // 3. MOBILE VIEWPORT (iPhone 14 @ 390x844) - TAB 1
    console.log('\n📱 Testing Mobile Viewport (iPhone 14 @ 390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    // Switch back to Instagram / TikTok
    for (const btn of await page.$$('button')) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Instagram') || text.includes('9:16 Vertical'))) {
        await page.evaluate(el => el.click(), btn);
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    const mobileOverflow1 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Mobile overflow (iPhone 14 Mode 1): ${mobileOverflow1}`);
    if (mobileOverflow1) throw new Error('FAIL: Horizontal overflow detected on iPhone 14');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_instagram_tiktok_mobile.png'), fullPage: false });
    console.log('📸 Captured 03_instagram_tiktok_mobile.png');

    // 4. ANDROID VIEWPORT (Pixel 7 @ 412x915) - TAB 2
    console.log('\n📱 Testing Android Viewport (Pixel 7 @ 412x915)...');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    
    for (const btn of await page.$$('button')) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('YouTube') || text.includes('Cinema') || text.includes('180s Master'))) {
        await page.evaluate(el => el.click(), btn);
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    const mobileOverflow2 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Mobile overflow (Pixel 7 Mode 2): ${mobileOverflow2}`);
    if (mobileOverflow2) throw new Error('FAIL: Horizontal overflow detected on Pixel 7');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_youtube_cinema_mobile.png'), fullPage: false });
    console.log('📸 Captured 04_youtube_cinema_mobile.png');

    console.log('\n🎉 ALL CLOUDTOP QA VERIFICATIONS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Cloudtop E2E failed:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

run();
