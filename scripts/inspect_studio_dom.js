const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000/studio', { waitUntil: 'networkidle2', timeout: 20000 });
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim().replace(/\n/g, ' '),
      testid: b.getAttribute('data-testid') || ''
    }));
  });

  console.log('=== BUTTONS FOUND ON /studio ===');
  console.log(JSON.stringify(buttons, null, 2));

  await browser.close();
}

run().catch(console.error);
