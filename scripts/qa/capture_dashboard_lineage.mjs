import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  console.log('Navigating to Dashboard...');
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss cookie banner if present
  await page.evaluate(() => {
    const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Capture Overview Dashboard with Embedded Lineage Bot
  const overviewPath = path.join(SCREENSHOT_DIR, '20_live_dashboard_lineage_hub.png');
  await page.screenshot({ path: overviewPath, fullPage: false });
  console.log(`Saved screenshot: ${overviewPath}`);

  // Click on Veritas Yield KPI card to inspect lineage
  console.log('Clicking Veritas Yield KPI card...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div')).filter(d => d.textContent?.includes('First-Pass Veritas Quality Yield'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Switch to Lineage DAG tab
  console.log('Switching to Lineage DAG tab...');
  await page.evaluate(() => {
    const dagBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Lineage DAG'));
    if (dagBtn) dagBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const dagPath = path.join(SCREENSHOT_DIR, '21_live_dashboard_lineage_dag_tab.png');
  await page.screenshot({ path: dagPath, fullPage: false });
  console.log(`Saved screenshot: ${dagPath}`);

  // Switch to SQL Query tab
  console.log('Switching to SQL Query tab...');
  await page.evaluate(() => {
    const sqlBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('SQL Query'));
    if (sqlBtn) sqlBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const sqlPath = path.join(SCREENSHOT_DIR, '22_live_dashboard_lineage_sql_query_tab.png');
  await page.screenshot({ path: sqlPath, fullPage: false });
  console.log(`Saved screenshot: ${sqlPath}`);

  // Switch back to Q&A Chat and ask a question
  console.log('Asking Q&A research question...');
  await page.evaluate(() => {
    const chatBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Q&A Chat'));
    if (chatBtn) chatBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Ask anything about formulas"]');
    if (input) {
      input.value = 'Where does the 84 sec cycle time come from?';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const sendBtn = document.querySelector('button[aria-label="Send query to Data Lineage Agent"]');
    if (sendBtn) sendBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const chatPath = path.join(SCREENSHOT_DIR, '23_live_dashboard_lineage_qa_chat.png');
  await page.screenshot({ path: chatPath, fullPage: false });
  console.log(`Saved screenshot: ${chatPath}`);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
