import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const ARTIFACT_DIR =
  process.env.ARTIFACT_DIR ||
  "/Users/nitinagga/.gemini/jetski/brain/1e2b42aa-a0af-4af0-9646-0f552b315c42";

async function ensureServerRunning() {
  try {
    const res = await fetch(`${BASE_URL}/api/library`);
    if (res.ok) return;
  } catch {
    // Server not running yet; spawn detached Next.js production server
  }
  const out = fs.openSync("/tmp/zyvoriq_3000.log", "a");
  const child = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", "3000"], {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", out, out],
  });
  child.unref();

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`${BASE_URL}/api/library`);
      if (res.ok) return;
    } catch {
      // keep polling
    }
  }
  throw new Error(`Failed to auto-start Next.js server at ${BASE_URL}`);
}

async function main() {
  await ensureServerRunning();
  const userBefore = path.join(
    ARTIFACT_DIR,
    ".user_uploaded/media_1793104050630.png"
  );
  const targetBefore = path.join(ARTIFACT_DIR, "before_zyvoriq_studio.png");
  if (fs.existsSync(userBefore)) {
    fs.copyFileSync(userBefore, targetBefore);
  }
  const stitchBefore = path.join(
    ARTIFACT_DIR,
    ".user_uploaded/media_1793146017019.png"
  );
  const targetStitchBefore = path.join(
    ARTIFACT_DIR,
    "before_zyvoriq_google_stitch_redesign.png"
  );
  if (fs.existsSync(stitchBefore)) {
    fs.copyFileSync(stitchBefore, targetStitchBefore);
  }

  // 1. Verify API endpoints first
  const libRes = await fetch(`${BASE_URL}/api/library`);
  const libJson = await libRes.json();
  const mi10Lib = (libJson.items || []).find(
    (it) =>
      it.canonicalId === "ZYV-REEL-MI10-300S" ||
      (it.title || "").includes("Mission: Impossible 10")
  );
  if (!mi10Lib) {
    throw new Error(
      "Mission: Impossible 10 (ZYV-REEL-MI10-300S) missing from /api/library"
    );
  }

  // Verify Deep Research API endpoint
  const drRes = await fetch(
    `${BASE_URL}/api/swarm/deep-research?reelId=ZYV-REEL-MI10-300S`
  );
  if (!drRes.ok) {
    throw new Error(`/api/swarm/deep-research returned ${drRes.status}`);
  }
  const drJson = await drRes.json();
  const bible = drJson.deepResearchBible;
  if (
    !bible ||
    bible.screenplay?.acts?.length !== 10 ||
    bible.charactersAndLeads?.length < 4 ||
    bible.productionCrew?.length < 8 ||
    bible.vfxBreakdown?.perActVfxSpecs?.length !== 10 ||
    bible.lightingPlot?.perActLightingSpecs?.length !== 10 ||
    bible.soundEffectsAndMix?.perActSoundSpecs?.length !== 10 ||
    bible.fiveDimensionScorecard?.overallScore < 98
  ) {
    throw new Error(
      `Deep Research Production Bible validation failed: ${JSON.stringify(
        bible?.fiveDimensionScorecard
      )}`
    );
  }

  const entRes = await fetch(`${BASE_URL}/api/entity/ZYV-REEL-MI10-300S`);
  if (!entRes.ok) {
    throw new Error(`/api/entity/ZYV-REEL-MI10-300S returned ${entRes.status}`);
  }
  const entJson = await entRes.json();
  if (
    entJson.entity?.durationSeconds !== 300 ||
    (entJson.entity?.acts || []).length !== 10 ||
    !entJson.entity?.deepResearchBible
  ) {
    throw new Error(
      `Expected 300s, 10 acts, and deepResearchBible in /api/entity/ZYV-REEL-MI10-300S`
    );
  }

  const synthRes = await fetch(`${BASE_URL}/api/swarm/synthesize-from-prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Create a 5 min Mission Impossible 10 action movie with 10 acts",
      durationSeconds: 300,
    }),
  });
  const synthJson = await synthRes.json();
  if (
    synthJson.durationSeconds !== 300 ||
    (synthJson.segments || []).length !== 10 ||
    !synthJson.deepResearchBible
  ) {
    throw new Error(
      `Expected 300s, 10 segments, and deepResearchBible from synthesize-from-prompt`
    );
  }

  // 1b. Verify custom prompt synthesis via Vertex AI ADC (studioFastMode + quick_edit + immediate /api/entity/[id] lookup)
  const customSynthRes = await fetch(
    `${BASE_URL}/api/swarm/synthesize-from-prompt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:
          "A 60s sci-fi orbital ring heist around Saturn with Commander Kira Solis and Dr. Ravi Thorne",
        studioFastMode: true,
        durationSeconds: 60,
      }),
    }
  );
  if (!customSynthRes.ok) {
    throw new Error(
      `Custom studioFastMode synthesize-from-prompt failed with ${customSynthRes.status}`
    );
  }
  const customSynthJson = await customSynthRes.json();
  if (
    !customSynthJson.ok ||
    !customSynthJson.canonicalId ||
    customSynthJson.canonicalId === "ZYV-REEL-MI10-300S" ||
    ![2, 6].includes((customSynthJson.segments || []).length) ||
    !customSynthJson.deepResearchBible
  ) {
    throw new Error(
      `Custom studioFastMode returned invalid payload: ${JSON.stringify({
        ok: customSynthJson.ok,
        canonicalId: customSynthJson.canonicalId,
        segLen: (customSynthJson.segments || []).length,
      })}`
    );
  }
  const leadNames = (
    customSynthJson.deepResearchBible.charactersAndLeads || []
  ).map((c) => c.name);
  if (leadNames.some((n) => /elena rostova|marcus sterling/i.test(n))) {
    throw new Error(
      `Custom DeepResearchBible leaked hardcoded Elena Rostova / Marcus Sterling: ${JSON.stringify(
        leadNames
      )}`
    );
  }

  const customEntRes = await fetch(
    `${BASE_URL}/api/entity/${encodeURIComponent(customSynthJson.canonicalId)}`
  );
  if (!customEntRes.ok) {
    throw new Error(
      `Immediate /api/entity/${customSynthJson.canonicalId} returned ${customEntRes.status}`
    );
  }
  const customEntJson = await customEntRes.json();
  if (customEntJson.entity?.canonicalId !== customSynthJson.canonicalId) {
    throw new Error(
      `Expected /api/entity/${customSynthJson.canonicalId} to resolve exact canonicalId, got ${customEntJson.entity?.canonicalId}`
    );
  }

  const quickEditRes = await fetch(
    `${BASE_URL}/api/swarm/synthesize-from-prompt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "quick_edit",
        action: "punchier",
        scope: "hook",
        text: "Two astronauts dock with a malfunctioning orbital ring.",
        title: "Saturn Orbital Heist",
      }),
    }
  );
  if (!quickEditRes.ok) {
    throw new Error(`quick_edit returned HTTP ${quickEditRes.status}`);
  }
  const quickEditJson = await quickEditRes.json();
  if (!quickEditJson.ok || !quickEditJson.rewrittenText) {
    throw new Error(
      `quick_edit returned invalid payload: ${JSON.stringify(quickEditJson)}`
    );
  }

  // 2. Launch Headless Google-Signed Chrome at 1600x1000 (Rule 59 isolated profile)
  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const isolatedProfileDir = "/Users/nitinagga/.gemini/chrome_profile_e2e_gates";
  fs.mkdirSync(isolatedProfileDir, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: fs.existsSync(macChrome) ? macChrome : undefined,
    userDataDir: isolatedProfileDir,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--password-store=basic",
      "--use-mock-keychain",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

    // Load /swarm-MUI
    await page.goto(`${BASE_URL}/swarm-MUI`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Audit DOM geometry & Google Stitch clean landing state + uncropped video state + Deep Research Bible
    const studioAudit = await page.evaluate(() => {
      const video = document.querySelector("video");
      const videoStyle = video ? window.getComputedStyle(video) : null;
      const canonicalBadge = document.querySelector(
        '[data-testid="active-reel-canonical-id-badge"]'
      );
      const newReelBtn = document.querySelector(
        '[data-testid="header-new-reel-btn"]'
      );
      const fullscreenBtn = document.querySelector(
        '[data-testid="enter-uncropped-fullscreen-btn"]'
      );
      const fitModeBtn = document.querySelector(
        '[data-testid="toggle-video-fit-mode-btn"]'
      );
      const durationBadge = document.querySelector(
        '[data-testid="active-reel-duration-badge"]'
      );
      const actCards = document.querySelectorAll(
        '[data-testid^="storyboard-act-card-"]'
      );
      const fiveTrack = document.querySelector(
        '[data-testid="canva-invideo-5track-timeline"]'
      );
      const vault = document.querySelector(
        '[data-testid="my-generated-reels-vault"]'
      );
      const deepResearchPanel = document.querySelector(
        '[data-testid="deep-research-production-bible"]'
      );
      const scorecard5d = document.querySelector(
        '[data-testid="deep-research-5d-scorecard"]'
      );
      const rightResearchSummary = document.querySelector(
        '[data-testid="right-inspector-deep-research-summary"]'
      );
      const rootEl = document.querySelector(
        '[data-testid="zyvoriq-studio-root"]'
      );
      const rootBg = rootEl
        ? window.getComputedStyle(rootEl).backgroundColor
        : "";
      const briefTextarea = document.querySelector(
        '#studio-brief-textarea, [data-testid="stitch-brief-textarea"]'
      );
      const stitchTopBar = document.querySelector(
        '[data-testid="google-stitch-top-bar"]'
      );
      const stitchCreateComposer = document.querySelector(
        '[data-testid="google-stitch-create-composer"]'
      );
      const stitchParamMatrix = document.querySelector(
        '[data-testid="stitch-structured-parameter-matrix"]'
      );
      const stitchCanvasModeBar = document.querySelector(
        '[data-testid="google-stitch-canvas-mode-bar"]'
      );
      const leftRailFooter = document.querySelector(
        '[data-testid="left-rail-footer-bar"]'
      );
      const leftRailFooterClipped = leftRailFooter
        ? leftRailFooter.scrollWidth > leftRailFooter.clientWidth + 1
        : true;
      const bodyText = document.body.innerText || "";
      const hasHardcodedDemoChipsInCreate = bodyText.includes(
        "1-Click Verified 5-Min"
      );

      return {
        canonicalText: canonicalBadge?.textContent?.trim() || "",
        hasNewReelBtn: Boolean(newReelBtn),
        hasFullscreenBtn: Boolean(fullscreenBtn),
        fitModeText: fitModeBtn?.textContent?.trim() || "",
        durationBadgeText: durationBadge?.textContent?.trim() || "",
        actCardsCount: actCards.length,
        hasFiveTrack: Boolean(fiveTrack),
        hasVault: Boolean(vault),
        hasDeepResearchPanel: Boolean(deepResearchPanel),
        hasScorecard5d: Boolean(scorecard5d),
        hasRightResearchSummary: Boolean(rightResearchSummary),
        videoObjectFit: videoStyle?.objectFit || "",
        rootBg,
        briefInputValue: briefTextarea ? briefTextarea.value : "MISSING",
        hasStitchTopBar: Boolean(stitchTopBar),
        hasStitchCreateComposer: Boolean(stitchCreateComposer),
        hasStitchParamMatrix: Boolean(stitchParamMatrix),
        hasStitchCanvasModeBar: Boolean(stitchCanvasModeBar),
        hasLeftRailFooter: Boolean(leftRailFooter),
        leftRailFooterClipped,
        hasHardcodedDemoChipsInCreate,
      };
    });

    console.log("Studio Audit:", JSON.stringify(studioAudit, null, 2));

    if (!studioAudit.canonicalText.includes("ZYV-REEL-MI10-300S")) {
      throw new Error(
        `Expected active canonical ID ZYV-REEL-MI10-300S, got ${studioAudit.canonicalText}`
      );
    }
    if (studioAudit.videoObjectFit !== "contain") {
      throw new Error(
        `Expected video object-fit: contain (uncropped), got ${studioAudit.videoObjectFit}`
      );
    }
    if (
      studioAudit.actCardsCount !== 10 ||
      !studioAudit.hasDeepResearchPanel ||
      !studioAudit.hasScorecard5d ||
      !studioAudit.hasRightResearchSummary
    ) {
      throw new Error(
        `Expected 10 act cards & Deep Research Bible panel, got ${JSON.stringify(
          studioAudit
        )}`
      );
    }
    if (
      studioAudit.briefInputValue !== "" ||
      !studioAudit.hasStitchTopBar ||
      !studioAudit.hasStitchCreateComposer ||
      !studioAudit.hasStitchParamMatrix ||
      !studioAudit.hasStitchCanvasModeBar ||
      !studioAudit.hasLeftRailFooter ||
      studioAudit.leftRailFooterClipped ||
      studioAudit.hasHardcodedDemoChipsInCreate
    ) {
      throw new Error(
        `Google Stitch Studio clean UX check failed: ${JSON.stringify(
          studioAudit
        )}`
      );
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "after_zyvoriq_mi10_300s_studio.png"),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(
        ARTIFACT_DIR,
        "after_zyvoriq_google_stitch_redesign.png"
      ),
      fullPage: false,
    });

    // Scroll Deep Research Bible into view in /swarm-MUI and capture screenshot
    const bibleBoxAudit = await page.evaluate(() => {
      const el = document.querySelector(
        '[data-testid="deep-research-production-bible"]'
      );
      if (el) {
        const scroller = el.closest(".overflow-y-auto");
        if (scroller) {
          const elRect = el.getBoundingClientRect();
          const scrollerRect = scroller.getBoundingClientRect();
          scroller.scrollTop += elRect.top - scrollerRect.top - 12;
        } else {
          el.scrollIntoView({ behavior: "instant", block: "start" });
        }
      }
      const dimCards = Array.from(
        document.querySelectorAll('[data-testid^="scorecard-dim-"]')
      );
      const clippedDims = dimCards.filter((card) => {
        const p = card.querySelector("p");
        const span = card.querySelector("span:last-child");
        const pClipped = p ? p.scrollHeight > p.clientHeight + 2 : false;
        const sClipped = span ? span.scrollWidth > span.clientWidth + 2 : false;
        return pClipped || sClipped;
      });
      return {
        dimCardCount: dimCards.length,
        clippedDimsCount: clippedDims.length,
      };
    });
    if (bibleBoxAudit.dimCardCount !== 5 || bibleBoxAudit.clippedDimsCount !== 0) {
      throw new Error(
        `Expected 5 unclipped 5D scorecard cards, got ${JSON.stringify(bibleBoxAudit)}`
      );
    }
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "after_zyvoriq_deep_research_bible.png"),
      fullPage: false,
    });

    // Click Camera & VFX tab
    await page.click('[data-testid="left-rail-tab-camera_vfx"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "after_zyvoriq_camera_vfx_rig.png"),
      fullPage: false,
    });

    // Click Library tab
    await page.click('[data-testid="left-rail-tab-library"]');
    await new Promise((r) => setTimeout(r, 600));
    const hasMi10Card = await page.$(
      '[data-testid="library-card-ZYV-REEL-MI10-300S"]'
    );
    if (!hasMi10Card) {
      throw new Error(
        "Library card library-card-ZYV-REEL-MI10-300S not found in DOM"
      );
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "after_zyvoriq_library_canonical_ids.png"),
      fullPage: false,
    });

    // Click + New Reel button to open Director Wizard Modal
    await page.click('[data-testid="header-new-reel-btn"]');
    await new Promise((r) => setTimeout(r, 600));
    const hasModal = await page.$('[data-testid="new-reel-director-modal"]');
    if (!hasModal) {
      throw new Error("New Reel Director Modal did not open");
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "after_zyvoriq_new_reel_modal.png"),
      fullPage: false,
    });

    // Visit /entity/ZYV-REEL-MI10-300S
    await page.goto(`${BASE_URL}/entity/ZYV-REEL-MI10-300S`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    await new Promise((r) => setTimeout(r, 1200));
    const entityAudit = await page.evaluate(() => {
      const root = document.querySelector(
        '[data-testid="canonical-entity-inspector-page"]'
      );
      const video = document.querySelector(
        '[data-testid="entity-master-video-player"], [data-testid="entity-uncropped-video-player"]'
      );
      const actCards = document.querySelectorAll(
        '[data-testid^="entity-act-card-"]'
      );
      const biblePanel = document.querySelector(
        '[data-testid="deep-research-production-bible"]'
      );
      return {
        hasRoot: Boolean(root),
        videoFit: video ? window.getComputedStyle(video).objectFit : "",
        actCardsCount: actCards.length,
        hasBiblePanel: Boolean(biblePanel),
      };
    });
    console.log("Entity Inspector Audit:", JSON.stringify(entityAudit, null, 2));
    if (
      !entityAudit.hasRoot ||
      entityAudit.videoFit !== "contain" ||
      entityAudit.actCardsCount !== 10 ||
      !entityAudit.hasBiblePanel
    ) {
      throw new Error(
        `Entity Inspector check failed: ${JSON.stringify(entityAudit)}`
      );
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "after_zyvoriq_entity_inspector.png"),
      fullPage: false,
    });

    console.log("ALL ZYVORIQ GATES + DEEP RESEARCH BIBLE PASSED 100%");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
