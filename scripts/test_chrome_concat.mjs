import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(chromePath)) {
  console.error("Chrome not found at:", chromePath);
  process.exit(1);
}

console.log("✅ Google Chrome exists and is ready for video stitching:", chromePath);
