/**
 * 🛡️ Zyvoriq "Demonetization Armor" & Auto-Censor Engine (Tier 3)
 * Scans video scripts for risky keywords, swearing, or algorithmic shadowban triggers
 * in the critical first 7 seconds, automatically inserting comedic 1000Hz TV BLEEP sound effects
 * and animated censor pixelation bars to protect creator monetization.
 */

export interface FlaggedCensorItem {
  id: string;
  word: string;
  severity: "high_risk_demonetize" | "shadowban_risk" | "mild_warning";
  timestampSec: number;
  replacementText: string;
  censorType: "tv_bleep_1000hz" | "record_scratch" | "quack_sound" | "glitch_static";
  isFirst7Seconds: boolean;
}

export interface DemonetizationScanResult {
  isSafeForMonetization: boolean;
  overallSafetyScore: number; // 0 to 100 (e.g. 98% = Green Armor)
  flaggedItems: FlaggedCensorItem[];
  censoredMasterScript: string;
}

export const RISKY_TRIGGER_WORDS: Record<string, { severity: FlaggedCensorItem["severity"]; replacement: string }> = {
  kill: { severity: "high_risk_demonetize", replacement: "unalive" },
  killing: { severity: "high_risk_demonetize", replacement: "stopping" },
  die: { severity: "high_risk_demonetize", replacement: "pass" },
  death: { severity: "high_risk_demonetize", replacement: "end" },
  blood: { severity: "shadowban_risk", replacement: "red" },
  scam: { severity: "shadowban_risk", replacement: "trap" },
  hate: { severity: "mild_warning", replacement: "dislike" },
  stupid: { severity: "mild_warning", replacement: "foolish" },
  insane: { severity: "mild_warning", replacement: "wild" }
};

/**
 * Scans a script text and produces a safety assessment and auto-censor mappings.
 */
export function scanDemonetizationArmor(scriptText: string): DemonetizationScanResult {
  const words = scriptText.split(/\s+/);
  const flaggedItems: FlaggedCensorItem[] = [];
  let currentSec = 0;
  const censoredWords: string[] = [];

  words.forEach((word, idx) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    currentSec = Math.round((idx / 2.5) * 10) / 10;
    const isFirst7Seconds = currentSec <= 7.0;

    if (RISKY_TRIGGER_WORDS[cleanWord]) {
      const entry = RISKY_TRIGGER_WORDS[cleanWord];
      flaggedItems.push({
        id: `censor_${idx}_${cleanWord}`,
        word: cleanWord,
        severity: entry.severity,
        timestampSec: currentSec,
        replacementText: entry.replacement,
        censorType: "tv_bleep_1000hz",
        isFirst7Seconds
      });
      censoredWords.push(`[BLEEP: ${entry.replacement}]`);
    } else {
      censoredWords.push(word);
    }
  });

  const highRiskCount = flaggedItems.filter((f) => f.severity === "high_risk_demonetize").length;
  const safetyScore = Math.max(50, 100 - highRiskCount * 20 - flaggedItems.length * 5);

  return {
    isSafeForMonetization: highRiskCount === 0,
    overallSafetyScore: safetyScore,
    flaggedItems,
    censoredMasterScript: censoredWords.join(" ")
  };
}
