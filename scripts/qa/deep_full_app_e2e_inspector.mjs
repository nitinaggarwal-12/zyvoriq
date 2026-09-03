import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.join(process.cwd(), "scratch", "screenshots_full_app_audit");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ALL_PORTAL_ROUTES = [
  { name: "Landing / Home", path: "/" },
  { name: "Studio Cinema & Timeline", path: "/studio" },
  { name: "Content Inspector & QA", path: "/studio/inspector" },
  { name: "Creation Hub (14 Modes)", path: "/studio/create" },
  { name: "Original Book Studio", path: "/studio/books" },
  { name: "Avatars & 3D Cast", path: "/studio/avatars" },
  { name: "7-Day Trend Radar", path: "/studio/trend-radar" },
  { name: "Media Library", path: "/studio/library" },
  { name: "Creator Analytics", path: "/creator/analytics" },
  { name: "Persona 1: Kids & Family", path: "/studio/create/animation" },
  { name: "Persona 2: Anime & Manga", path: "/studio/create/comics" },
  { name: "Persona 3: Viral Influencer", path: "/studio/create/reel" },
  { name: "Persona 4: E-Com UGC Ads", path: "/studio/create/ugc" },
  { name: "Persona 5: Mature Cinema & Noir", path: "/studio/create/podcast" },
  { name: "Persona 6: Heritage & Mythology", path: "/studio/create/story" },
  { name: "Governance Portal", path: "/governance" },
  { name: "Benchmark Suite", path: "/governance/benchmarks" },
  { name: "Verification Tool", path: "/governance/verify" },
  { name: "Admin Agreements", path: "/admin/agreements" },
  { name: "Admin Moderation", path: "/admin/moderation" },
  { name: "NDA Signing", path: "/nda/sign" },
  { name: "Veritas Ledger", path: "/veritas" }
];

async function runDeepAudit() {
  console.log("🔍 Starting Exhaustive Full-App E2E Deep Crawler & Inspector...");

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--autoplay-policy=no-user-gesture-required"
    ]
  });

  const report = {
    totalRoutesChecked: 0,
    passedRoutes: 0,
    failedRoutes: 0,
    routeResults: [],
    consoleErrors: [],
    failedRequests: [],
    viewportOverflows: []
  };

  try {
    const page = await browser.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (!text.includes("favicon.ico") && !text.includes("Download is disallowed")) {
          report.consoleErrors.push({ url: page.url(), error: text });
        }
      }
    });

    page.on("pageerror", (err) => {
      report.consoleErrors.push({ url: page.url(), error: err.toString() });
    });

    page.on("response", (res) => {
      if (res.status() >= 400 && !res.url().includes("favicon.ico")) {
        report.failedRequests.push({
          pageUrl: page.url(),
          requestUrl: res.url(),
          status: res.status()
        });
      }
    });

    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("zyvoriq_cookie_consent", "accepted");
    });

    for (let i = 0; i < ALL_PORTAL_ROUTES.length; i++) {
      const route = ALL_PORTAL_ROUTES[i];
      report.totalRoutesChecked++;
      const fullUrl = "http://localhost:3000" + route.path;
      console.log("[" + (i + 1) + "/" + ALL_PORTAL_ROUTES.length + "] Testing Route: " + route.name + " (" + route.path + ")");

      const routeReport = {
        name: route.name,
        path: route.path,
        status: "PASS",
        httpStatus: 200,
        desktopOverflow: false,
        iosOverflow: false,
        videosFound: 0,
        videosPlaying: true,
        interactiveButtons: 0,
        errors: []
      };

      try {
        await page.setViewport({ width: 1600, height: 950 });
        const res = await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(600);

        if (res) {
          routeReport.httpStatus = res.status();
          if (res.status() >= 400) {
            routeReport.status = "FAIL";
            routeReport.errors.push("HTTP Status " + res.status());
          }
        }

        const desktopScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        if (desktopScroll) {
          routeReport.desktopOverflow = true;
          routeReport.status = "FAIL";
          routeReport.errors.push("Desktop horizontal overflow");
          report.viewportOverflows.push({ route: route.path, device: "Desktop 1600px" });
        }

        const videoStats = await page.evaluate(() => {
          const vids = Array.from(document.querySelectorAll("video"));
          return {
            count: vids.length,
            allHavePlaysInline: vids.every(v => v.hasAttribute("playsinline") || v.hasAttribute("playsInline")),
            sources: vids.map(v => v.getAttribute("src") || v.querySelector("source")?.getAttribute("src") || "")
          };
        });

        routeReport.videosFound = videoStats.count;
        if (videoStats.count > 0 && !videoStats.allHavePlaysInline) {
          routeReport.status = "FAIL";
          routeReport.errors.push("Video tag missing playsInline");
        }

        routeReport.interactiveButtons = await page.$$eval("button", btns => btns.length);

        const safeSlug = route.path.replace(/\//g, "_").replace(/^_/, "") || "root";
        const deskShot = path.join(SCREENSHOT_DIR, String(i + 1).padStart(2, "0") + "_" + safeSlug + "_desktop.png");
        await page.screenshot({ path: deskShot, fullPage: false });

        await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
        await sleep(500);

        const iosScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        if (iosScroll) {
          routeReport.iosOverflow = true;
          routeReport.status = "FAIL";
          routeReport.errors.push("iOS horizontal overflow");
          report.viewportOverflows.push({ route: route.path, device: "iOS iPhone 14 390px" });
        }

        const mobShot = path.join(SCREENSHOT_DIR, String(i + 1).padStart(2, "0") + "_" + safeSlug + "_mobile.png");
        await page.screenshot({ path: mobShot, fullPage: false });

        if (routeReport.status === "PASS") {
          report.passedRoutes++;
          console.log("  ✅ " + route.name + " passed (Desktop + iOS OK, " + routeReport.interactiveButtons + " buttons, " + routeReport.videosFound + " videos)");
        } else {
          report.failedRoutes++;
          console.log("  ❌ " + route.name + " FAILED: " + routeReport.errors.join(", "));
        }
      } catch (err) {
        routeReport.status = "FAIL";
        routeReport.errors.push(err.message);
        report.failedRoutes++;
        console.error("  ❌ Error testing " + route.name + ":", err.message);
      }

      report.routeResults.push(routeReport);
    }

    await browser.close();

    console.log("================================================================================");
    console.log("                       DEEP FULL-APP AUDIT SUMMARY REPORT                       ");
    console.log("================================================================================");
    console.log("Total Routes Audited: " + report.totalRoutesChecked);
    console.log("Passed Routes:        " + report.passedRoutes + " / " + report.totalRoutesChecked + " (" + ((report.passedRoutes / report.totalRoutesChecked) * 100).toFixed(1) + "%)");
    console.log("Failed Routes:        " + report.failedRoutes);
    console.log("Console Errors:       " + report.consoleErrors.length);
    console.log("Failed HTTP Requests: " + report.failedRequests.length);
    console.log("Viewport Overflows:   " + report.viewportOverflows.length);

    console.log("--- Detailed Route Matrix ---");
    console.table(report.routeResults.map(r => ({
      Route: r.path,
      Name: r.name,
      Status: r.status,
      HTTP: r.httpStatus,
      Buttons: r.interactiveButtons,
      Videos: r.videosFound,
      Errors: r.errors.length > 0 ? r.errors.join("; ") : "None"
    })));

    fs.writeFileSync(
      path.join(process.cwd(), "scratch", "deep_audit_results.json"),
      JSON.stringify(report, null, 2)
    );
    console.log("Full JSON report saved to scratch/deep_audit_results.json");
    console.log("Screenshots saved to scratch/screenshots_full_app_audit/");
  } catch (fatalErr) {
    console.error("Fatal crawler crash:", fatalErr);
    await browser.close();
    process.exit(1);
  }
}

runDeepAudit().catch(console.error);
