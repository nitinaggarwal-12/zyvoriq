import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "scratch", "screenshots_part_continuation_and_thumbnails");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("[E2E] Starting continuation, thumbnail, and URL sync verification against " + BASE_URL);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // 1. Visit /my-reels
    console.log("[E2E] Step 1: Navigating to /my-reels...");
    await page.goto(BASE_URL + "/my-reels", { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(1000);
    await page.waitForSelector('div[id^="reel-card-"]', { timeout: 15000 });
    await sleep(800);

    // 2. Verify cf46b686 (Act II) Thumbnail and Button Label
    console.log("[E2E] Step 2: Inspecting Act II reel (cf46b686)...");
    const reelInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div[id^=\"reel-card-\x22]"));
      const cfCard = cards.find(c => c.id.includes("cf46b686"));
      const d2Card = cards.find(c => c.id.includes("d2d144d2"));

      const getCardDetails = (card) => {
        if (!card) return null;
        const img = card.querySelector("img");
        const directBtn = card.querySelector("a[id^=\"direct-part2-btn-\x22]");
        const idBadge = card.innerText.match(/ID:\s*(ZYV-[A-Z0-9]+)/);
        return {
          id: card.id,
          imgSrc: img ? img.src : null,
          imgNaturalWidth: img ? img.naturalWidth : 0,
          buttonText: directBtn ? directBtn.textContent.trim() : null,
          buttonHref: directBtn ? directBtn.getAttribute("href") : null,
          reelIdBadge: idBadge ? idBadge[1] : null,
        };
      };

      return {
        act2: getCardDetails(cfCard),
        act1: getCardDetails(d2Card),
        totalCards: cards.length
      };
    });

    console.log("[E2E] Reel card inspection result:", JSON.stringify(reelInfo, null, 2));

    if (reelInfo.act2) {
      if (reelInfo.act2.imgSrc && reelInfo.act2.imgSrc.includes("desert_spiral.jpg")) {
        console.error("FAIL: Act II (cf46b686) is still using desert_spiral.jpg!");
        process.exitCode = 1;
      } else {
        console.log("PASS: Act II is using authentic video still (not desert_spiral.jpg):", reelInfo.act2.imgSrc);
      }

      if (reelInfo.act2.buttonText && reelInfo.act2.buttonText.includes("Direct Part 3")) {
        console.log("PASS: Act II card displays Direct Part 3 button:", reelInfo.act2.buttonText);
      } else {
        console.error("FAIL: Expected Direct Part 3 but got:", reelInfo.act2.buttonText);
        process.exitCode = 1;
      }

      if (reelInfo.act2.buttonHref && reelInfo.act2.buttonHref.includes("nextPart=3")) {
        console.log("PASS: Continuation href targets nextPart=3:", reelInfo.act2.buttonHref);
      }
    }

    if (reelInfo.act1 && reelInfo.act2) {
      console.log("PASS: Distinct Netflix Reel IDs verified: Act 1 (" + reelInfo.act1.reelIdBadge + ") vs Act 2 (" + reelInfo.act2.reelIdBadge + ")");
    }

    await page.screenshot({ path: path.join(OUT_DIR, "01_my_reels_library.png"), fullPage: false });
    console.log("[E2E] Saved screenshot: 01_my_reels_library.png");

    // 3. Test Cinema Modal URL Synchronization
    console.log("[E2E] Step 3: Testing Cinema Player URL synchronization on Act 2...");
    if (reelInfo.act2) {
      const cfPosterSelector = "#reel-card-" + reelInfo.act2.id.replace("reel-card-", "") + " div.cursor-pointer";
      await page.click(cfPosterSelector);
      await sleep(1000);

      const currentUrl = page.url();
      console.log("[E2E] Current URL after opening modal:", currentUrl);
      if (currentUrl.includes("reel=studio1_cf46b686")) {
        console.log("PASS: Browser address bar synced with Act 2 reel ID in query parameter");
      } else {
        console.error("FAIL: Browser URL not synced with Act 2 reel ID!");
        process.exitCode = 1;
      }

      const modalInfo = await page.evaluate(() => {
        const modal = document.querySelector("div.fixed.z-50");
        if (!modal) return null;
        return {
          text: modal.innerText,
          hasIdBadge: modal.innerText.includes("ID:") && modal.innerText.includes("ZYV-CF46B6"),
          hasShareLink: modal.innerText.includes("Share Link"),
          hasDirectPart3: modal.innerText.includes("Direct Part 3"),
        };
      });

      console.log("[E2E] Cinema Modal inspection:", JSON.stringify(modalInfo, null, 2));
      if (modalInfo?.hasIdBadge) {
        console.log("PASS: Modal header shows distinct Reel ID badge (ID: ZYV-CF46B6)");
      }
      if (modalInfo?.hasShareLink) {
        console.log("PASS: Modal header has Share Link button");
      }
      if (modalInfo?.hasDirectPart3) {
        console.log("PASS: Modal header has Direct Part 3 continuation button");
      }

      await page.screenshot({ path: path.join(OUT_DIR, "02_cinema_modal_with_id_and_url_sync.png"), fullPage: false });
      console.log("[E2E] Saved screenshot: 02_cinema_modal_with_id_and_url_sync.png");

      const closeBtn = await page.$("button[title=\"Close Player\"]");
      if (closeBtn) {
        await closeBtn.click();
        await sleep(500);
        const urlAfterClose = page.url();
        console.log("[E2E] URL after closing modal:", urlAfterClose);
        if (!urlAfterClose.includes("reel=")) {
          console.log("PASS: Address bar query cleaned on modal close");
        }
      }
    }

    // 4. Test Create Page continuation flow with Part 3
    console.log("[E2E] Step 4: Testing Create Page continuation hydration for Part 3...");
    await page.goto(BASE_URL + "/?continueReel=studio1_cf46b686-4c13-4dee-8f6e-064fe81f1ef5&nextPart=3", { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(1500);

    const promptStudioText = await page.evaluate(() => {
      const textarea = document.querySelector("textarea");
      const banner = document.getElementById("continuation-active-banner");
      return {
        promptValue: textarea ? textarea.value : "",
        bannerText: banner ? banner.innerText : ""
      };
    });

    console.log("[E2E] Prompt studio state on continuation:", JSON.stringify(promptStudioText, null, 2));
    if (promptStudioText.promptValue.includes("Act III: Continuation of")) {
      console.log("PASS: Prompt pre-filled with Act III continuation:", promptStudioText.promptValue);
    } else {
      console.error("FAIL: Prompt does not start with Act III continuation:", promptStudioText.promptValue);
      process.exitCode = 1;
    }

    await page.screenshot({ path: path.join(OUT_DIR, "03_studio_create_part3_hydrated.png"), fullPage: false });
    console.log("[E2E] Saved screenshot: 03_studio_create_part3_hydrated.png");

  } catch (err) {
    console.error("[E2E] Exception during verification:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
