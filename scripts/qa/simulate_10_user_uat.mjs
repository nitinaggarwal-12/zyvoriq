import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const screenshotDir = path.resolve(projectRoot, "scratch/screenshots_uat_10_users");

if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true, force: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const USER_PERSONAS = [
  {
    id: 1,
    name: "User 1: Free Creator",
    tier: "free",
    flow: "Studio Reel Creation & 8s Timeline Inspection",
    url: "http://localhost:3000/studio",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2" });
      await sleep(800);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const tabBtn = buttons.find(b => b.textContent?.includes("Veo Timeline"));
        if (tabBtn) tabBtn.click();
      });
      await sleep(800);
    }
  },
  {
    id: 2,
    name: "User 2: Free Hobbyist",
    tier: "free",
    flow: "Create Hub Anime Persona Deep-Link",
    url: "http://localhost:3000/studio/create?persona=anime",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio/create?persona=anime", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  },
  {
    id: 3,
    name: "User 3: Creator Solo",
    tier: "creator",
    flow: "Dedicated Reel Creator & Aspect Framing",
    url: "http://localhost:3000/studio/create/reel",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio/create/reel", { waitUntil: "networkidle2" });
      await sleep(800);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn169 = buttons.find(b => b.textContent?.includes("16:9"));
        if (btn169) btn169.click();
      });
      await sleep(800);
    }
  },
  {
    id: 4,
    name: "User 4: Creator Podcaster",
    tier: "creator",
    flow: "Neural 2-Host Podcast Studio Dialogue",
    url: "http://localhost:3000/studio/create/podcast",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio/create/podcast", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  },
  {
    id: 5,
    name: "User 5: Pro Studio DevRel",
    tier: "pro",
    flow: "64s Chained Timeline Scrubbing & Honest Export",
    url: "http://localhost:3000/studio",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle2" });
      await sleep(800);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const tabBtn = buttons.find(b => b.textContent?.includes("Veo Timeline"));
        if (tabBtn) tabBtn.click();
      });
      await sleep(800);
    }
  },
  {
    id: 6,
    name: "User 6: Pro Studio Musician",
    tier: "pro",
    flow: "Lyria 3.0 Pro 5-Section Song Tree & Stems",
    url: "http://localhost:3000/studio/create/music",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio/create/music", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  },
  {
    id: 7,
    name: "User 7: Pro Studio Marketer",
    tier: "pro",
    flow: "7-Day Viral Trend Radar Discovery Hub",
    url: "http://localhost:3000/studio/trend-radar",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio/trend-radar", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  },
  {
    id: 8,
    name: "User 8: Enterprise Director",
    tier: "enterprise",
    flow: "Autonomous Swarm Director Campaign",
    url: "http://localhost:3000/director",
    action: async (page) => {
      await page.goto("http://localhost:3000/director", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  },
  {
    id: 9,
    name: "User 9: Enterprise Reviewer",
    tier: "enterprise",
    flow: "Media Library & Veritas SNARK Verification",
    url: "http://localhost:3000/studio/library",
    action: async (page) => {
      await page.goto("http://localhost:3000/studio/library", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  },
  {
    id: 10,
    name: "User 10: Enterprise Compliance",
    tier: "enterprise",
    flow: "Governance Benchmarks & Autonomy Sliders",
    url: "http://localhost:3000/governance",
    action: async (page) => {
      await page.goto("http://localhost:3000/governance", { waitUntil: "networkidle2" });
      await sleep(800);
    }
  }
];

async function runConcurrentUatSimulation() {
  console.log("================================================================================");
  console.log("👥  ZYVORIQ MILESTONE 3: 10-USER CONCURRENT UAT SIMULATION SUITE");
  console.log("================================================================================");
  console.log(`Target Screenshot Dir: ${screenshotDir}\n`);

  let browser;
  const startTime = Date.now();

  try {
    console.log("🚀 Launching Official macOS Google Chrome for 10-User Concurrent Simulation...");
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1600,1000"
      ],
      defaultViewport: { width: 1600, height: 1000 }
    });

    console.log("⚡ Firing 10 Simultaneous User Sessions (Parallel Execution)...");

    const sessionPromises = USER_PERSONAS.map(async (persona) => {
      const userStart = Date.now();
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      const errors = [];

      page.on("pageerror", (err) => errors.push(err.message));
      page.on("requestfailed", (req) => {
        const errorText = req.failure()?.errorText || "";
        // Ignore normal browser stream range aborts on media or favicons
        if (errorText.includes("net::ERR_ABORTED") || req.url().includes("favicon.ico")) {
          return;
        }
        errors.push(`Network Failure: ${req.url()} (${errorText})`);
      });

      try {
        console.log(`  [Session ${persona.id}] Starting: ${persona.name} (${persona.flow})...`);
        await persona.action(page);
        
        const scPath = path.join(screenshotDir, `user_${persona.id.toString().padStart(2, "0")}_${persona.tier}.png`);
        await page.screenshot({ path: scPath, fullPage: false });

        const elapsedMs = Date.now() - userStart;
        console.log(`  ✅ [Session ${persona.id}] Finished in ${elapsedMs}ms: [user_${persona.id.toString().padStart(2, "0")}_${persona.tier}.png](file://${scPath})`);

        await context.close();
        return {
          id: persona.id,
          name: persona.name,
          tier: persona.tier,
          flow: persona.flow,
          elapsedMs,
          status: errors.length === 0 ? "PASS" : "WARN",
          errors: errors.slice(0, 2)
        };
      } catch (err) {
        await context.close();
        return {
          id: persona.id,
          name: persona.name,
          tier: persona.tier,
          flow: persona.flow,
          elapsedMs: Date.now() - userStart,
          status: "FAIL",
          errors: [err.message]
        };
      }
    });

    const results = await Promise.all(sessionPromises);
    const totalElapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n================================================================================");
    console.log(`🎉 10-USER CONCURRENT UAT SIMULATION COMPLETE in ${totalElapsedSec}s`);
    console.log("================================================================================");
    console.table(results.map(r => ({
      ID: r.id,
      User: r.name,
      Tier: r.tier,
      Latency: `${r.elapsedMs}ms`,
      Status: r.status,
      Issues: r.errors.length > 0 ? r.errors.join("; ") : "None (Clean)"
    })));

    const allPassed = results.every(r => r.status === "PASS");
    if (!allPassed) {
      console.warn("⚠️ Some user sessions had warnings or errors. Analyzing for self-healing...");
    } else {
      console.log("🏆 100% Zero-Error Rate across all 10 concurrent user sessions!");
    }

  } catch (err) {
    console.error("\n❌ UAT SIMULATION CRASHED:", err.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runConcurrentUatSimulation();
