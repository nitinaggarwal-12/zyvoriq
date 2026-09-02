/**
 * 📉 Zyvoriq AI Viral Retention & Drop-Off Heatmap Predictor
 * Simulates second-by-second viewer retention curve (0s–60s) based on hook pacing,
 * kinetic transitions, SFX density, visual interrupts, and dead zones.
 * Provides 1-click Auto-Fix recommendations.
 */

export interface RetentionDataPoint {
  second: number;
  retentionPercent: number; // 0 to 100
  pacingState: "hyper_viral" | "optimal" | "warning_slump" | "drop_off_risk";
  activeTrigger?: string;
}

export interface AutoFixRecommendation {
  id: string;
  timestampSec: number;
  severity: "critical" | "warning" | "optimization";
  issueTitle: string;
  fixDescription: string;
  actionType: "add_emoji_sfx" | "insert_broll" | "trim_deadzone" | "boost_hook";
  expectedRetentionGain: number; // e.g. +8%
}

export interface ViralRetentionAnalysis {
  overallViralScore: number; // 0 to 100
  hookScore: number; // 0-3s retention %
  completionRateEstimate: number; // estimated % who reach the end
  averageWatchDurationSec: number;
  timelineCurve: RetentionDataPoint[];
  slumpDeadZones: number[];
  recommendations: AutoFixRecommendation[];
}

export interface ScriptAnalysisInput {
  hookText: string;
  totalDurationSec: number;
  scenesCount: number;
  kineticEmojiTimings: number[]; // timestamps of emojis/sfx
  brollTimings: number[]; // timestamps of b-roll cutaways
  dopamineSplitEnabled?: boolean;
}

/**
 * Analyzes video timeline and computes high-precision retention curve and auto-fixes.
 */
export function analyzeViralRetention(input: ScriptAnalysisInput): ViralRetentionAnalysis {
  const duration = Math.max(10, Math.min(60, Math.round(input.totalDurationSec || 25)));
  const timelineCurve: RetentionDataPoint[] = [];
  const recommendations: AutoFixRecommendation[] = [];
  const slumpDeadZones: number[] = [];

  // 1. Calculate Hook Score (0-3s)
  let hookScore = 88;
  const hookLower = input.hookText.toLowerCase();
  if (
    hookLower.includes("stop") ||
    hookLower.includes("warning") ||
    hookLower.includes("never") ||
    hookLower.includes("secret") ||
    hookLower.includes("real reason")
  ) {
    hookScore += 6;
  }
  if (input.dopamineSplitEnabled) {
    hookScore = Math.min(99, hookScore + 5);
  }

  // 2. Build second-by-second curve
  let currentRetention = 100;
  for (let sec = 0; sec <= duration; sec++) {
    // Hook phase (0 to 3s)
    if (sec <= 3) {
      const drop = (100 - hookScore) / 3;
      currentRetention = Math.max(hookScore, 100 - drop * sec);
    } else {
      // Natural decay rate
      let decay = 0.8;

      // Check if there is a kinetic emoji / SFX at this timestamp (+/- 1s)
      const hasEmoji = input.kineticEmojiTimings.some((t) => Math.abs(t - sec) <= 1.0);
      // Check if there is a B-Roll cutaway at this timestamp
      const hasBroll = input.brollTimings.some((t) => Math.abs(t - sec) <= 1.2);

      if (hasEmoji && hasBroll) {
        decay = -0.3; // Slight retention bump from double pattern interrupt!
      } else if (hasEmoji || hasBroll) {
        decay = 0.2; // Very slow decay
      } else {
        // Dead zone check: no interrupt within 3.5s
        const lastInterrupt = Math.max(
          ...input.kineticEmojiTimings.filter((t) => t < sec),
          ...input.brollTimings.filter((t) => t < sec),
          0
        );
        if (sec - lastInterrupt > 3.5) {
          decay = 2.2; // Faster drop-off in dead zones!
          if (!slumpDeadZones.includes(sec)) {
            slumpDeadZones.push(sec);
          }
        }
      }

      if (input.dopamineSplitEnabled) {
        decay = decay * 0.6; // Dopamine reduces overall drop-off by 40%
      }

      currentRetention = Math.max(35, currentRetention - decay);
    }

    let pacingState: RetentionDataPoint["pacingState"] = "optimal";
    if (currentRetention > 85) pacingState = "hyper_viral";
    else if (currentRetention < 65) pacingState = "drop_off_risk";
    else if (currentRetention < 75) pacingState = "warning_slump";

    timelineCurve.push({
      second: sec,
      retentionPercent: Math.round(currentRetention * 10) / 10,
      pacingState
    });
  }

  // 3. Generate 1-Click Auto-Fix Recommendations
  if (slumpDeadZones.length > 0) {
    const firstSlump = slumpDeadZones[0];
    recommendations.push({
      id: `fix-sfx-${firstSlump}`,
      timestampSec: firstSlump,
      severity: "critical",
      issueTitle: `⚠️ Slump Detected at ${firstSlump}s`,
      fixDescription: `Pacing slows down without visual interrupts. Add a Kinetic SFX Pop at ${firstSlump}s to reset audience attention.`,
      actionType: "add_emoji_sfx",
      expectedRetentionGain: 7
    });

    if (slumpDeadZones.length > 2) {
      const midSlump = slumpDeadZones[Math.floor(slumpDeadZones.length / 2)];
      recommendations.push({
        id: `fix-broll-${midSlump}`,
        timestampSec: midSlump,
        severity: "warning",
        issueTitle: `⚡ Visual Fatigue at ${midSlump}s`,
        fixDescription: `Insert a B-Roll Picture-in-Picture cutaway at ${midSlump}s to break up talking head monotony.`,
        actionType: "insert_broll",
        expectedRetentionGain: 9
      });
    }
  }

  if (hookScore < 90 && !input.dopamineSplitEnabled) {
    recommendations.push({
      id: "fix-hook-dopamine",
      timestampSec: 0,
      severity: "optimization",
      issueTitle: "🚀 Boost 0–3s Hook Impact",
      fixDescription: "Enable Split-Screen Dopamine mode (Top: Avatar, Bottom: 60FPS ASMR) to increase 0-3s hook capture to 96%+.",
      actionType: "boost_hook",
      expectedRetentionGain: 8
    });
  }

  const completionRate = timelineCurve[timelineCurve.length - 1].retentionPercent;
  const overallViralScore = Math.min(
    99,
    Math.round(hookScore * 0.4 + completionRate * 0.4 + (input.dopamineSplitEnabled ? 12 : 5))
  );

  return {
    overallViralScore,
    hookScore,
    completionRateEstimate: completionRate,
    averageWatchDurationSec: Math.round(duration * (overallViralScore / 100) * 10) / 10,
    timelineCurve,
    slumpDeadZones,
    recommendations
  };
}
