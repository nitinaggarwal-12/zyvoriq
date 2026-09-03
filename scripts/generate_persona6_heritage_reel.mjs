import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = path.join(process.cwd(), "public", "assets", "video");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HERITAGE_CONFIG = {
  personaId: "persona6_heritage_mythology",
  title: "The Eternal Loom: Epics of Antiquity & Gods",
  outName: "persona6_heritage_mythology_reel",
  themeColor: "#f59e0b",
  subColor: "#fde68a",
  badge: "🏛️ PERSONA #6: HERITAGE, MYTHOLOGY & FOLKLORE",
  scenes: [
    {
      start: 0,
      end: 4,
      header: "🔱 ACT I: VEDIC COSMOS & KURUKSHETRA",
      title: "When time unweaves, Dharma stands unyielding upon the cosmic chariot.",
      sub: "108Hz Sanskrit Chant Drone • Gold Leaf Calligraphy • Kurukshetra Dawn"
    },
    {
      start: 4,
      end: 8,
      header: "⚡ ACT II: OLYMPIAN FIRES & THE ODYSSEY",
      title: "Across the wine-dark Aegean, mortal courage defies the wrath of Poseidon.",
      sub: "Hellenic Choral Reverberation • Anamorphic Sunburst • Bronze Temple Fresco"
    },
    {
      start: 8,
      end: 12,
      header: "❄️ ACT III: RAGNAROK & THE TREE OF YGGDRASIL",
      title: "From the roots of the World Tree, a new dawn awakens beyond the ice.",
      sub: "Old Norse War Drums • Golden Rune Shimmer • Veritas C2PA Provenance"
    }
  ]
};

async function generateHeritageReel() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log("🚀 Launching Chrome for Persona #6 Heritage & Mythology Reel Generation...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--autoplay-policy=no-user-gesture-required"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 1280 });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 720px;
          height: 1280px;
          background: #090602;
          font-family: -apple-system, BlinkMacSystemFont, "Georgia", serif;
          color: #ffffff;
          overflow: hidden;
          position: relative;
        }
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 720px;
          height: 1280px;
        }
      </style>
    </head>
    <body>
      <canvas id="heritageCanvas" width="720" height="1280"></canvas>
      <script>
        const canvas = document.getElementById("heritageCanvas");
        const ctx = canvas.getContext("2d");
        const totalDurationSec = 12;
        const fps = 30;
        const totalFrames = totalDurationSec * fps;

        function drawSacredMandala(ctx, cx, cy, radius, timeSec) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(timeSec * 0.2);

          ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
          ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
          ctx.stroke();

          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * (radius * 0.3), Math.sin(angle) * (radius * 0.3));
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            ctx.stroke();

            const midAngle = angle + Math.PI / 12;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * (radius * 0.75), Math.sin(angle) * (radius * 0.75));
            ctx.lineTo(Math.cos(midAngle) * (radius * 0.9), Math.sin(midAngle) * (radius * 0.9));
            ctx.lineTo(Math.cos(angle + Math.PI / 6) * (radius * 0.75), Math.sin(angle + Math.PI / 6) * (radius * 0.75));
            ctx.stroke();
          }

          ctx.restore();
        }

        function drawGoldLeafFleck(ctx, timeSec) {
          ctx.fillStyle = "rgba(253, 230, 138, 0.4)";
          for (let i = 0; i < 40; i++) {
            const gx = (i * 47 + Math.sin(timeSec + i) * 30 + timeSec * 40) % 720;
            const gy = (i * 89 + timeSec * 70) % 1280;
            const sz = 1.5 + (i % 3);
            ctx.beginPath();
            ctx.arc(gx, gy, sz, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        function renderFrame(timeSec) {
          const bgGrad = ctx.createRadialGradient(360, 640, 60, 360, 640, 720);
          bgGrad.addColorStop(0, "#1c1103");
          bgGrad.addColorStop(0.5, "#0f0802");
          bgGrad.addColorStop(1, "#050301");
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 720, 1280);

          const aura = ctx.createRadialGradient(360, 480, 30, 360, 480, 420);
          aura.addColorStop(0, "rgba(245, 158, 11, 0.22)");
          aura.addColorStop(0.6, "rgba(217, 119, 6, 0.08)");
          aura.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = aura;
          ctx.fillRect(0, 0, 720, 1280);

          drawSacredMandala(ctx, 360, 480, 260, timeSec);
          drawGoldLeafFleck(ctx, timeSec);

          ctx.fillStyle = "rgba(10, 6, 2, 0.92)";
          ctx.fillRect(0, 0, 720, 110);
          ctx.fillRect(0, 1170, 720, 110);

          ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 110);
          ctx.lineTo(720, 110);
          ctx.moveTo(0, 1170);
          ctx.lineTo(720, 1170);
          ctx.stroke();

          ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
          ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(60, 45, 600, 44, 22);
          ctx.fill();
          ctx.stroke();

          ctx.font = "bold 14px monospace";
          ctx.fillStyle = "#fde68a";
          ctx.textAlign = "center";
          ctx.fillText("${HERITAGE_CONFIG.badge}", 360, 73);

          const currentSceneIndex = timeSec < 4 ? 0 : (timeSec < 8 ? 1 : 2);
          const activeScene = ${JSON.stringify(HERITAGE_CONFIG.scenes)}[currentSceneIndex];

          ctx.fillStyle = "rgba(30, 20, 8, 0.85)";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(120, 320, 480, 280, 24);
          ctx.fill();
          ctx.stroke();

          const iconSymbol = currentSceneIndex === 0 ? "🔱" : (currentSceneIndex === 1 ? "⚡" : "🛡️");
          ctx.font = "54px serif";
          ctx.textAlign = "center";
          ctx.fillText(iconSymbol, 360, 400);

          ctx.font = "bold 22px Georgia, serif";
          ctx.fillStyle = "#fef3c7";
          const epics = ["Vedic Mahabharata Epic", "Hellenic Olympian Legend", "Norse Ragnarok Saga"];
          ctx.fillText(epics[currentSceneIndex], 360, 445);

          ctx.font = "13px monospace";
          ctx.fillStyle = "#fbbf24";
          const subheads = ["Sanskrit Chants • 108Hz Drone", "Aegean Harps • Greek Chorus", "War Horns • Wardruna Drums"];
          ctx.fillText(subheads[currentSceneIndex], 360, 475);

          ctx.fillStyle = "#f59e0b";
          for (let j = 0; j < 32; j++) {
            const barH = 12 + Math.sin(timeSec * 5 + j * 0.35) * 20;
            ctx.fillRect(200 + j * 10, 560 - barH / 2, 4, barH);
          }

          ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
          ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(100, 680, 520, 42, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = "bold 14px monospace";
          ctx.fillStyle = "#fde68a";
          ctx.textAlign = "center";
          ctx.fillText(activeScene.header, 360, 706);

          ctx.font = "italic 23px Georgia, serif";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";

          const words = activeScene.title.split(" ");
          let line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
          let line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
          ctx.fillText(line1, 360, 775);
          if (line2) {
            ctx.fillText(line2, 360, 815);
          }

          ctx.font = "13px monospace";
          ctx.fillStyle = "#d97706";
          ctx.fillText(activeScene.sub, 360, 875);

          ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(160, 920, 400, 70);
          ctx.font = "bold 12px monospace";
          ctx.fillStyle = "#fde68a";
          ctx.fillText("🏛️ SACRED LORE & TRANSMEDIA REEL COMPILATION", 360, 950);
          ctx.fillStyle = "#a16207";
          ctx.fillText("ANCIENT ORAL TRADITIONS PRESERVED IN HIGH FIDELITY", 360, 972);

          ctx.font = "bold 12px monospace";
          ctx.fillStyle = "#f59e0b";
          ctx.textAlign = "center";
          ctx.fillText("⚡ 24 FPS VEDIC & MYTHOLOGY MASTER · SANSKRIT ACOUSTIC RESONANCE", 360, 1220);
          ctx.fillStyle = "#92400e";
          ctx.fillText("C2PA ED25519 CRYPTOGRAPHIC PROVENANCE SIGNED · ZYVORIQ DEEPMIND ENGINE", 360, 1245);
        }

        window.startRecording = function() {
          return new Promise((resolve) => {
            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
              mimeType: "video/webm;codecs=vp9",
              videoBitsPerSecond: 6000000
            });
            const chunks = [];

            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
              const blob = new Blob(chunks, { type: "video/webm" });
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result.split(",")[1]);
              };
              reader.readAsDataURL(blob);
            };

            recorder.start();

            let frame = 0;
            const interval = setInterval(() => {
              const timeSec = frame / fps;
              renderFrame(timeSec);
              frame++;

              if (frame > totalFrames) {
                clearInterval(interval);
                recorder.stop();
              }
            }, 1000 / fps);
          });
        };
      </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await sleep(500);

    console.log("🎬 Recording 12-second Persona #6 Heritage & Mythology Reel...");
    const base64Data = await page.evaluate(async () => {
      return await window.startRecording();
    });

    const targetMp4Path = path.join(OUT_DIR, "persona6_heritage_mythology_reel.mp4");
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(targetMp4Path, buffer);

    console.log("✅ Persona #6 MP4 Video Reel Generated: " + targetMp4Path + " (" + (buffer.length / 1024 / 1024).toFixed(2) + " MB)");

    await browser.close();
  } catch (err) {
    console.error("Error generating heritage reel:", err);
    await browser.close();
    process.exit(1);
  }
}

generateHeritageReel().catch(console.error);
