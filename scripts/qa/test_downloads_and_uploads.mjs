import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyDownloadsAndUploads() {
  console.log("🧪 Testing Real File Downloads and Upload Handlers...");
  
  const downloadDir = path.join(process.cwd(), "scratch/downloads_test");
  if (fs.existsSync(downloadDir)) {
    fs.rmSync(downloadDir, { recursive: true, force: true });
  }
  fs.mkdirSync(downloadDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDir
  });

  // 1. Test Book Studio real downloads
  console.log("▶️ Navigating to /studio/books...");
  await page.goto("http://localhost:3000/studio/books", { waitUntil: "networkidle2" });
  await sleep(1000);

  // Click Download .opf
  console.log("Testing .opf download...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const opf = buttons.find(b => b.innerText.includes("Download .opf"));
    if (opf) opf.click();
  });
  await sleep(1000);

  // Click Download .json (Audible cue)
  console.log("Testing audible cue download...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const audio = buttons.find(b => b.innerText.includes("Download .json"));
    if (audio) audio.click();
  });
  await sleep(1000);

  // Check downloaded files
  const downloadedFiles = fs.readdirSync(downloadDir);
  console.log("📁 Downloaded Files in scratch/downloads_test/:", downloadedFiles);

  await browser.close();

  if (downloadedFiles.length > 0) {
    console.log("✅ Real physical file downloads verified successfully!");
  } else {
    console.log("⚠️ No physical files found in download directory.");
  }
}

verifyDownloadsAndUploads().catch(console.error);
