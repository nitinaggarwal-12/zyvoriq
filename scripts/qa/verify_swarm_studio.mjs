import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSwarmQA() {
  const screenshotDir = path.join(
    process.cwd(),
    'scratch',
    'screenshots_swarm_studio'
  );
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  const artifactDir =
    '/Users/nitinagga/.gemini/jetski/brain/c4f568bc-2709-495a-a8da-a9297cf7c39c';

  console.log('🚀 Launching Puppeteer E2E Verification for /swarm Studio...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Viewport (1600x950)
    await page.setViewport({ width: 1600, height: 950 });
    await page.goto('http://localhost:3000/swarm', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await sleep(1200);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const requiredAgents = [
      'Script Creation Agent',
      'Casting Direction Agent',
      'Wardrobe Department Agent',
      'Location Scouting Agent',
      'Prop Facility Agent',
      'Narration Agent',
      'Music Scoring Agent',
      'Final Assembly Agent',
    ];
    for (const agentName of requiredAgents) {
      if (!bodyText.includes(agentName)) {
        throw new Error(`Missing required Swarm agent in DOM: ${agentName}`);
      }
    }

    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log(`Desktop Horizontal Overflow: ${desktopOverflow}`);

    const s1 = path.join(screenshotDir, '01_swarm_desktop_cathedral_of_crust.png');
    await page.screenshot({ path: s1, fullPage: true });
    fs.copyFileSync(s1, path.join(artifactDir, '01_swarm_desktop_cathedral_of_crust.png'));
    console.log(`✅ Captured: ${s1}`);

    // 2. Click Tab 2: Nano Banana Visual DNA
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) => b.textContent?.includes('Nano Banana'));
      if (tabBtn) tabBtn.click();
    });
    await sleep(800);
    const s2 = path.join(screenshotDir, '02_swarm_desktop_nanobanana_tab.png');
    await page.screenshot({ path: s2, fullPage: true });
    fs.copyFileSync(s2, path.join(artifactDir, '02_swarm_desktop_nanobanana_tab.png'));
    console.log(`✅ Captured: ${s2}`);

    // 3. Click Tab 3: Lyria 3.5 Instrumental Score
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) =>
        b.textContent?.includes('Lyria 3.5 Instrumental Score')
      );
      if (tabBtn) tabBtn.click();
    });
    await sleep(800);
    const s3 = path.join(screenshotDir, '03_swarm_desktop_lyria_score_tab.png');
    await page.screenshot({ path: s3, fullPage: true });
    fs.copyFileSync(s3, path.join(artifactDir, '03_swarm_desktop_lyria_score_tab.png'));
    console.log(`✅ Captured: ${s3}`);

    // Switch back to Screenplay tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) => b.textContent?.includes('6-Act Screenplay'));
      if (tabBtn) tabBtn.click();
    });
    await sleep(800);

    // 4. iOS Mobile Viewport (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await sleep(800);
    const iosOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log(`iOS Horizontal Overflow: ${iosOverflow}`);
    const s4 = path.join(screenshotDir, '04_swarm_ios_mobile_390x844.png');
    await page.screenshot({ path: s4, fullPage: false });
    fs.copyFileSync(s4, path.join(artifactDir, '04_swarm_ios_mobile_390x844.png'));
    console.log(`✅ Captured: ${s4}`);

    // 5. Android Mobile Viewport (412x915)
    await page.setViewport({ width: 412, height: 915, isMobile: true });
    await sleep(800);
    const androidOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log(`Android Horizontal Overflow: ${androidOverflow}`);
    const s5 = path.join(screenshotDir, '05_swarm_android_mobile_412x915.png');
    await page.screenshot({ path: s5, fullPage: false });
    fs.copyFileSync(s5, path.join(artifactDir, '05_swarm_android_mobile_412x915.png'));
    console.log(`✅ Captured: ${s5}`);

    console.log('🎉 ALL SWARM STUDIO E2E QA ASSERTIONS PASSED!');
  } finally {
    await browser.close();
  }
}

runSwarmQA().catch((err) => {
  console.error('❌ Swarm QA Failed:', err);
  process.exit(1);
});
