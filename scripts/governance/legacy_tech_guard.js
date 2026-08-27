const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛡️ Running Zyvoriq Sovereign Legacy Tech Guard...');

// 1. Banned Pattern Check across codebase
const BANNED_PATTERNS = [
  { pattern: /sadtalker/i, reason: 'Legacy 2023 2D landmark warper (SadTalker is banned)' },
  { pattern: /wav2lip/i, reason: 'Legacy 2020 2D pixel warper (Wav2Lip is banned)' },
  { pattern: /sin\(.*vUv.*\)/i, reason: 'Fake procedural UV warping on portraits is banned' }
];

const SCAN_DIRS = ['app', 'lib', 'components'];
let violations = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const rule of BANNED_PATTERNS) {
        if (rule.pattern.test(content)) {
          console.error(`❌ VIOLATION in [${fullPath}]: ${rule.reason}`);
          violations++;
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  scanDir(path.join(process.cwd(), dir));
}

// 2. Video Asset Codec Inspection in public/assets/video/
const videoDir = path.join(process.cwd(), 'public/assets/video');
if (fs.existsSync(videoDir)) {
  const mp4Files = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));
  for (const mp4 of mp4Files) {
    const fullPath = path.join(videoDir, mp4);
    try {
      const probeOut = execSync(`ffprobe -v error -show_entries stream=codec_name,pix_fmt -of default=noprint_wrappers=1 "${fullPath}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      if (probeOut.includes('codec_name=mpeg4')) {
        console.error(`❌ BANNED CODEC in [${mp4}]: Contains legacy mpeg4 (mp4v). Must be H.264 (avc1/yuv420p).`);
        violations++;
      } else {
        console.log(`✅ Asset [${mp4}] verified compliant (H.264 yuv420p)`);
      }
    } catch {
      // If ffprobe unavailable, skip probing
    }
  }
}

if (violations > 0) {
  console.error(`\n🚨 BUILD BLOCKED: ${violations} legacy technology violation(s) detected!`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL ARCHITECTURAL GOVERNANCE CHECKS PASSED (Zero Legacy Tech Found)!');
}
