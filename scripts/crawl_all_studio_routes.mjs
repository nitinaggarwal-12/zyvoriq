import puppeteer from 'puppeteer';

const ROUTES_TO_TEST = [
  '/',
  '/studio',
  '/studio/create',
  '/studio/create/reel',
  '/studio/create/animation',
  '/studio/create/comics',
  '/studio/create/ugc',
  '/studio/create/podcast',
  '/studio/create/story',
  '/studio/create/carousel',
  '/studio/create/music',
  '/studio/library',
  '/studio/avatars',
  '/studio/books',
  '/studio/inspector',
  '/studio/trend-radar',
  '/studio/history',
  '/studio/zoom-screenshare',
  '/studio/categories',
  '/director',
  '/veritas',
  '/dashboard'
];

(async () => {
  console.log(`Starting crawl of ${ROUTES_TO_TEST.length} platform routes...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  let failed = 0;

  for (const route of ROUTES_TO_TEST) {
    try {
      const res = await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const status = res ? res.status() : 200;
      if (status >= 400) {
        console.error(`❌ FAILED: ${route} returned status ${status}`);
        failed++;
      } else {
        console.log(`✅ OK (${status}): ${route}`);
      }
    } catch (err) {
      console.error(`❌ ERROR loading ${route}:`, err.message);
      failed++;
    }
  }

  await browser.close();
  console.log(`Crawl completed. Total routes: ${ROUTES_TO_TEST.length}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
})();
