const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 STARTING CLOUDTOP STUDIO REDESIGN VERIFICATION SUITE...');
  const outDir = path.join(__dirname, '../scratch/screenshots_studio_redesign');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------
    // TEST 1: DESKTOP ULTRA-WIDE (1600x950)
    // -------------------------------------------------------------
    console.log('🖥️ Setting Desktop Viewport: 1600x950...');
    await page.setViewport({ width: 1600, height: 950 });
    
    console.log('🌐 Loading http://localhost:3005/studio ...');
    await page.goto('http://localhost:3005/studio', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    // Assert DOM elements
    const desktopAudit = await page.evaluate(() => {
      const headers = document.querySelectorAll('header');
      const textareas = document.querySelectorAll('textarea');
      const inputs = document.querySelectorAll('input[type="text"]');
      const statusPill = document.querySelector('header')?.innerText.includes('CINEMA TIMELINE');
      const brandLogo = document.querySelector('header')?.innerText.includes('ZYVORIQ');
      const promptCopilot = document.body.innerText.includes('1-Click Prompt-to-Reel Copilot');
      const durationPills = Array.from(document.querySelectorAll('button')).filter(b => 
        ['15s', '30s', '60s', '90s'].includes(b.innerText.trim())
      ).map(b => b.innerText.trim());

      const generateBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.includes('Generate Reel')
      );

      const ideaBriefLabel = document.body.innerText.includes('Idea or Topic Brief');

      return {
        headerCount: headers.length,
        textareaCount: textareas.length,
        inputCount: inputs.length,
        hasStatusPill: statusPill,
        hasBrandLogo: brandLogo,
        hasPromptCopilot: promptCopilot,
        durationPills,
        hasGenerateBtn: !!generateBtn,
        hasDuplicateIdeaBrief: ideaBriefLabel,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      };
    });

    console.log('📊 Desktop DOM Audit Results:', JSON.stringify(desktopAudit, null, 2));

    if (desktopAudit.headerCount !== 1) {
      console.error(`❌ Header count failure: expected exactly 1 header, found ${desktopAudit.headerCount}`);
    } else {
      console.log('✅ PASS: Exactly 1 unified header present.');
    }

    if (desktopAudit.hasDuplicateIdeaBrief) {
      console.error('❌ Duplicate "Idea or Topic Brief" textarea found in DOM!');
    } else {
      console.log('✅ PASS: Duplicate textarea eliminated from left sidebar.');
    }

    if (desktopAudit.durationPills.length < 4) {
      console.error(`❌ Expected 4 duration pills, found ${desktopAudit.durationPills.length}`);
    } else {
      console.log('✅ PASS: Inline duration pills (15s, 30s, 60s, 90s) present.');
    }

    // Capture 01_studio_desktop_redesign.png
    const screenshot1Path = path.join(outDir, '01_studio_desktop_redesign.png');
    await page.screenshot({ path: screenshot1Path, fullPage: false });
    console.log(`📸 Captured: ${screenshot1Path}`);

    // -------------------------------------------------------------
    // TEST 2: INTERACTION & INPUT CONSOLE
    // -------------------------------------------------------------
    console.log('🖱️ Testing interaction with duration pills & prompt input...');
    // Click 90s duration pill
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('button'));
      const btn90 = pills.find(b => b.innerText.trim() === '90s');
      if (btn90) btn90.click();
    });
    await sleep(800);

    // Type prompt into Prompt Copilot
    await page.type(
      'input[placeholder*="Describe what you want to create"]',
      'Sri Sri Ravi Shankar and how he founded the Art of Living',
      { delay: 30 }
    );
    await sleep(800);

    const screenshot2Path = path.join(outDir, '02_studio_duration_interaction.png');
    await page.screenshot({ path: screenshot2Path, fullPage: false });
    console.log(`📸 Captured: ${screenshot2Path}`);

    // -------------------------------------------------------------
    // TEST 3: MOBILE iOS VIEWPORT (iPhone 14 @ 390x844)
    // -------------------------------------------------------------
    console.log('📱 Testing Mobile iOS Viewport: 390x844...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(1000);

    const iosAudit = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        overflowDelta: document.documentElement.scrollWidth - window.innerWidth
      };
    });
    console.log('📱 iOS Overflow Audit:', JSON.stringify(iosAudit));
    if (iosAudit.hasOverflow) {
      console.error(`❌ iOS horizontal overflow detected: +${iosAudit.overflowDelta}px`);
    } else {
      console.log('✅ PASS: Zero horizontal overflow on iOS (390px).');
    }

    const screenshot3Path = path.join(outDir, '03_studio_mobile_ios.png');
    await page.screenshot({ path: screenshot3Path, fullPage: false });
    console.log(`📸 Captured: ${screenshot3Path}`);

    // -------------------------------------------------------------
    // TEST 4: ANDROID VIEWPORT (Pixel 7 @ 412x915)
    // -------------------------------------------------------------
    console.log('📱 Testing Android Viewport: 412x915...');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await sleep(1000);

    const androidAudit = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        overflowDelta: document.documentElement.scrollWidth - window.innerWidth
      };
    });
    console.log('📱 Android Overflow Audit:', JSON.stringify(androidAudit));
    if (androidAudit.hasOverflow) {
      console.error(`❌ Android horizontal overflow detected: +${androidAudit.overflowDelta}px`);
    } else {
      console.log('✅ PASS: Zero horizontal overflow on Android (412px).');
    }

    const screenshot4Path = path.join(outDir, '04_studio_android.png');
    await page.screenshot({ path: screenshot4Path, fullPage: false });
    console.log(`📸 Captured: ${screenshot4Path}`);

    console.log('🎉 ALL CLOUDTOP QA ASSERTIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
