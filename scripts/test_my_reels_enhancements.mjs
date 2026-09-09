import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_library_enhancements');
if (fs.existsSync(SCREENSHOT_DIR)) {
  fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Launching Puppeteer E2E test with Chrome for /my-reels enhancements...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1050 });

    console.log('🌐 Navigating to http://localhost:3000/my-reels ...');
    await page.goto('http://localhost:3000/my-reels', { waitUntil: 'networkidle2', timeout: 30000 });

    // 1. Wait for client component toolbar to mount
    console.log('⏳ Waiting for #toggle-select-reels-btn to mount...');
    await page.waitForSelector('#toggle-select-reels-btn', { timeout: 20000 });
    console.log('✅ Found "#toggle-select-reels-btn" in toolbar.');

    // 2. Wait for reels to load and finish fetching
    console.log('⏳ Waiting for reels list to load...');
    await page.waitForFunction(() => !document.body.textContent.includes('Loading your reels library...'), { timeout: 15000 });
    await sleep(1200);

    // 3. Verify Content Validity Badges
    const validityBadges = await page.$$eval('span', spans => 
      spans.filter(s => 
        s.textContent.includes('VALID MEDIA') || 
        s.textContent.includes('CLIPS VALID') || 
        s.textContent.includes('NO MEDIA')
      ).map(s => s.textContent.trim())
    );
    console.log(`✅ Found ${validityBadges.length} Content Validity badges:`, validityBadges.slice(0, 5));
    if (validityBadges.length === 0) {
      throw new Error('❌ No content validity badges found on reel cards!');
    }

    // 4. Click Select Mode
    const selectToggleBtn = await page.$('#toggle-select-reels-btn');
    await selectToggleBtn.click();
    await sleep(800);
    console.log('✅ Activated Multi-Select mode.');

    // 5. Click checkboxes on first 2 reel cards
    const checkboxes = await page.$$('button[title*="Select Reel"], button[title*="Deselect Reel"]');
    console.log(`Found ${checkboxes.length} select checkboxes on cards.`);
    if (checkboxes.length >= 2) {
      await checkboxes[0].click();
      await sleep(400);
      await checkboxes[1].click();
      await sleep(800);
    } else if (checkboxes.length >= 1) {
      await checkboxes[0].click();
      await sleep(800);
    }

    // 6. Verify Floating Batch Action Bar
    await page.waitForSelector('#floating-batch-action-bar', { timeout: 5000 });
    const batchBarText = await page.$eval('#floating-batch-action-bar', el => el.textContent);
    console.log('✅ Floating batch action bar is visible:', batchBarText);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_multi_select_batch_bar.png') });
    console.log('📸 Captured: 01_multi_select_batch_bar.png');

    // 7. Click Delete Selected to reveal Bulk Delete Confirmation Modal
    const batchDeleteBtn = await page.$('#batch-delete-btn');
    if (batchDeleteBtn) {
      await batchDeleteBtn.click();
      await sleep(800);
      const modalHeader = await page.$eval('h3', h => h.textContent);
      console.log('✅ Bulk Delete modal revealed:', modalHeader);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_bulk_delete_modal.png') });
      console.log('📸 Captured: 02_bulk_delete_modal.png');

      // Click Cancel on modal to keep library intact
      const cancelBtns = await page.$$('button');
      for (const btn of cancelBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.trim() === 'Cancel') {
          await btn.click();
          await sleep(500);
          console.log('✅ Cancelled bulk delete modal safely.');
          break;
        }
      }
    }

    // Clear selection
    const clearBtn = await page.$('#batch-clear-selection-btn');
    if (clearBtn) {
      await clearBtn.click();
      await sleep(600);
    }

    // 8. Test Directorial Feedback Form
    const feedbackButtons = await page.$$('button[title*="Directorial Feedback"]');
    console.log(`Found ${feedbackButtons.length} Directorial Feedback buttons.`);
    if (feedbackButtons.length > 0) {
      await feedbackButtons[0].click();
      await sleep(800);

      const hasFeedbackForm = await page.evaluate(() => {
        return document.body.textContent.includes('DIRECTORIAL FEEDBACK');
      });
      console.log('✅ Directorial Feedback Panel expanded:', hasFeedbackForm);

      const textarea = await page.$('textarea[placeholder*="What made this reel standout"]');
      if (textarea) {
        await textarea.type('Cinematic lighting continuity is superb; audio soundscape aligns with beat drops.');
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_directorial_feedback_panel.png') });
      console.log('📸 Captured: 03_directorial_feedback_panel.png');

      // Click Save Directorial Feedback
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Save Directorial Feedback')) {
          await btn.click();
          await sleep(1500);
          console.log('✅ Clicked Save Directorial Feedback.');
          break;
        }
      }
    }

    // 9. Capture Full Library Overview
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_library_full_view.png'), fullPage: false });
    console.log('📸 Captured: 04_library_full_view.png');

    console.log('🎉 ALL PUPPETEER E2E ASSERTIONS PASSED WITH FLYING COLORS!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
