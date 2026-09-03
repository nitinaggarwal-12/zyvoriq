import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runExhaustiveAudit() {
  console.log("🔍 Starting Exhaustive Deep Audit across Studio Pages & Features...");
  
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  const results = {
    pagesChecked: [],
    brokenLinks: [],
    tabSwitchFailures: [],
    personasChecked: [],
    missingPersonas: [],
    formControlsWorking: [],
    formControlsFailing: [],
    downloadsAndExports: [],
    consoleErrors: []
  };

  page.on("console", msg => {
    if (msg.type() === "error") {
      results.consoleErrors.push({ page: page.url(), text: msg.text() });
    }
  });

  page.on("pageerror", err => {
    results.consoleErrors.push({ page: page.url(), text: err.toString() });
  });

  // 1. Audit Master Studio (/studio)
  console.log("▶️ Auditing /studio...");
  const studioRes = await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2" });
  results.pagesChecked.push({ url: "/studio", status: studioRes.status() });

  // Test Tabs on /studio
  const tabs = ["Scenes", "Script", "B-Roll", "SFX & Emojis", "Retention Heatmap", "Audio & Subtitles", "Format", "Cover"];
  for (const tab of tabs) {
    try {
      const tabBtn = await page.$(`button:has-text('${tab}')`);
      if (tabBtn) {
        await tabBtn.click();
        await sleep(300);
        results.formControlsWorking.push(`/studio tab: ${tab}`);
      } else {
        results.tabSwitchFailures.push(`/studio tab missing: ${tab}`);
      }
    } catch (e) {
      results.tabSwitchFailures.push(`/studio tab error: ${tab} - ${e.message}`);
    }
  }

  // Test Surprise Button
  try {
    const surpriseBtn = await page.$("button:has-text('Surprise')");
    if (surpriseBtn) {
      await surpriseBtn.click();
      await sleep(200);
      results.formControlsWorking.push("/studio: Surprise Me generator");
    }
  } catch (e) {
    results.formControlsFailing.push(`/studio Surprise Me: ${e.message}`);
  }

  // 2. Audit 14 Personas Catalog (/studio/create)
  console.log("▶️ Auditing /studio/create (14 Personas Hub)...");
  const createRes = await page.goto("http://localhost:3000/studio/create", { waitUntil: "networkidle2" });
  results.pagesChecked.push({ url: "/studio/create", status: createRes.status() });

  const personaCards = await page.$$eval("a[href^='/studio/create/']", links => links.map(l => ({ href: l.getAttribute("href"), text: l.innerText.trim() })));
  console.log(`Found ${personaCards.length} persona links on /studio/create.`);
  results.personasChecked = personaCards;

  // Check routes for each persona
  const personaRoutes = [
    "/studio/create/animation",
    "/studio/create/comics",
    "/studio/create/reel",
    "/studio/create/ugc",
    "/studio/create/podcast",
    "/studio/create/story",
    "/studio/create/music",
    "/studio/create/carousel"
  ];

  for (const route of personaRoutes) {
    console.log(`Checking route ${route}...`);
    const rRes = await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle2" });
    results.pagesChecked.push({ url: route, status: rRes.status() });
    if (rRes.status() >= 400) {
      results.brokenLinks.push({ route, status: rRes.status() });
    }
  }

  // 3. Audit Books Studio (/studio/books) - Downloads & Exports
  console.log("▶️ Auditing /studio/books exports...");
  await page.goto("http://localhost:3000/studio/books", { waitUntil: "networkidle2" });
  
  // Test Book tabs
  const bookTabs = ["Chapter Prose Reader", "World Lore Bible & Cast", "Trope Blueprint & Archetypes"];
  for (const btab of bookTabs) {
    const btn = await page.$(`button:has-text('${btab}')`);
    if (btn) {
      await btn.click();
      await sleep(200);
      results.formControlsWorking.push(`/studio/books tab: ${btab}`);
    } else {
      results.tabSwitchFailures.push(`/studio/books tab: ${btab}`);
    }
  }

  // Test Export EPUB, Audio Tracklist, BookTok buttons
  const exportButtons = ["Export EPUB 3 Metadata", "Export Audio Tracklist", "Export BookTok Kit"];
  for (const eb of exportButtons) {
    const btn = await page.$(`button:has-text('${eb}')`);
    if (btn) {
      await btn.click();
      await sleep(200);
      results.downloadsAndExports.push(`/studio/books: ${eb} (Triggered clipboard copy)`);
    } else {
      results.downloadsAndExports.push(`/studio/books missing: ${eb}`);
    }
  }

  // 4. Audit Inspector (/studio/inspector)
  console.log("▶️ Auditing /studio/inspector...");
  const inspRes = await page.goto("http://localhost:3000/studio/inspector", { waitUntil: "networkidle2" });
  results.pagesChecked.push({ url: "/studio/inspector", status: inspRes.status() });

  // 5. Audit Library (/studio/library)
  console.log("▶️ Auditing /studio/library...");
  const libRes = await page.goto("http://localhost:3000/studio/library", { waitUntil: "networkidle2" });
  results.pagesChecked.push({ url: "/studio/library", status: libRes.status() });

  // 6. Audit Trend Radar (/studio/trend-radar)
  console.log("▶️ Auditing /studio/trend-radar...");
  const trendRes = await page.goto("http://localhost:3000/studio/trend-radar", { waitUntil: "networkidle2" });
  results.pagesChecked.push({ url: "/studio/trend-radar", status: trendRes.status() });

  // 7. Audit Avatars (/studio/avatars)
  console.log("▶️ Auditing /studio/avatars...");
  const avRes = await page.goto("http://localhost:3000/studio/avatars", { waitUntil: "networkidle2" });
  results.pagesChecked.push({ url: "/studio/avatars", status: avRes.status() });

  await browser.close();

  console.log("\n=================== AUDIT RESULTS ===================");
  console.log("PAGES CHECKED:", results.pagesChecked.length);
  console.log("BROKEN LINKS (4xx/5xx):", results.brokenLinks);
  console.log("CONSOLE ERRORS:", results.consoleErrors);
  console.log("PERSONA CARDS FOUND:", results.personasChecked.length);
  console.log("WORKING FORM CONTROLS:", results.formControlsWorking.length);
  console.log("FAILED CONTROLS:", results.formControlsFailing.length);
  console.log("DOWNLOADS & EXPORTS:", results.downloadsAndExports);
  console.log("=====================================================");

  fs.writeFileSync(
    path.join(process.cwd(), "scratch/exhaustive_audit_report.json"),
    JSON.stringify(results, null, 2)
  );
}

runExhaustiveAudit().catch(console.error);
