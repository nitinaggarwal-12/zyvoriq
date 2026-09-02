/**
 * ZYVORIQ POSTGRESQL PREDICTIVE ANALYTICS & FORECASTING ENGINE
 * Powered by pgvector, TimescaleDB Time-Series, and In-Database ML.
 */

export interface TrendForecastPoint {
  dayOffset: number; // +1, +2, ... +7
  dateLabel: string;
  historicalVolume?: number;
  predictedVolume: number;
  lowerConfidenceBound: number;
  upperConfidenceBound: number;
  accelerationVelocity: number; // % day-over-day
}

export interface PlatformArbitrageSignal {
  id: string;
  topic: string;
  category: string;
  voiScore: number; // 0 to 100
  arbitrageType: "high_demand_zero_supply" | "cross_platform_lag" | "niche_breakout";
  sourceLeadingPlatform: "Reddit" | "TikTok" | "ArXiv" | "Google Trends";
  targetUnderservedPlatform: "YouTube Shorts" | "LinkedIn PDF" | "Executive Podcast";
  predicted7dVolume: string;
  monetizationYieldEstimated: string;
  recommendedAction: string;
}

export interface RetentionForecastModel {
  hookType: string;
  second1Retention: number;
  second3Retention: number;
  second15Retention: number;
  completionRateEstimated: number;
  churnRiskFactor: "LOW" | "MODERATE" | "HIGH";
  suggestedPatternInterrupt: string;
}

export const PLATFORM_ARBITRAGE_SIGNALS: PlatformArbitrageSignal[] = [
  {
    id: "arb_001",
    topic: "Quantum-Resistant PostgreSQL & Ed25519 C2PA Verification",
    category: "Developer Tech & Cybersecurity",
    voiScore: 98.4,
    arbitrageType: "high_demand_zero_supply",
    sourceLeadingPlatform: "Reddit",
    targetUnderservedPlatform: "YouTube Shorts",
    predicted7dVolume: "3.4M Views",
    monetizationYieldEstimated: "$4,200",
    recommendedAction: "Deploy 60s Reel with Curiosity Gap Hook and technical Draw.io SVG architecture overlay."
  },
  {
    id: "arb_002",
    topic: "Dark Academia EPUB 3 Audible Ducking with -18dB Stems",
    category: "Fiction & Transmedia Authoring",
    voiScore: 94.2,
    arbitrageType: "cross_platform_lag",
    sourceLeadingPlatform: "TikTok",
    targetUnderservedPlatform: "Executive Podcast",
    predicted7dVolume: "1.8M Views",
    monetizationYieldEstimated: "$2,850",
    recommendedAction: "Publish Fireside 2-host podcast debate discussing the #BookTok viral lore structure."
  },
  {
    id: "arb_003",
    topic: "EU AI Act Compliance & BIPA Biometric Armor for Creators",
    category: "Legal Tech & Governance",
    voiScore: 91.8,
    arbitrageType: "niche_breakout",
    sourceLeadingPlatform: "Google Trends",
    targetUnderservedPlatform: "LinkedIn PDF",
    predicted7dVolume: "850k Impressions",
    monetizationYieldEstimated: "$6,100 (Enterprise Inbound)",
    recommendedAction: "Generate 8-slide high-density executive carousel with visual BIPA penalty table."
  }
];

export const TIME_SERIES_7D_FORECAST: TrendForecastPoint[] = [
  { dayOffset: 0, dateLabel: "Today", historicalVolume: 120000, predictedVolume: 120000, lowerConfidenceBound: 115000, upperConfidenceBound: 125000, accelerationVelocity: 14.2 },
  { dayOffset: 1, dateLabel: "+1 Day", predictedVolume: 240000, lowerConfidenceBound: 220000, upperConfidenceBound: 260000, accelerationVelocity: 100.0 },
  { dayOffset: 2, dateLabel: "+2 Days", predictedVolume: 490000, lowerConfidenceBound: 440000, upperConfidenceBound: 540000, accelerationVelocity: 104.1 },
  { dayOffset: 3, dateLabel: "+3 Days", predictedVolume: 980000, lowerConfidenceBound: 880000, upperConfidenceBound: 1080000, accelerationVelocity: 100.0 },
  { dayOffset: 4, dateLabel: "+4 Days", predictedVolume: 1650000, lowerConfidenceBound: 1450000, upperConfidenceBound: 1850000, accelerationVelocity: 68.3 },
  { dayOffset: 5, dateLabel: "+5 Days", predictedVolume: 2400000, lowerConfidenceBound: 2100000, upperConfidenceBound: 2700000, accelerationVelocity: 45.4 },
  { dayOffset: 6, dateLabel: "+6 Days", predictedVolume: 3100000, lowerConfidenceBound: 2700000, upperConfidenceBound: 3500000, accelerationVelocity: 29.1 },
  { dayOffset: 7, dateLabel: "+7 Days (Peak)", predictedVolume: 3450000, lowerConfidenceBound: 2950000, upperConfidenceBound: 3950000, accelerationVelocity: 11.2 }
];

export const HOOK_RETENTION_PREDICTIONS: RetentionForecastModel[] = [
  {
    hookType: "Hook A: Curiosity Gap ('The real reason you struggle with...')",
    second1Retention: 98.4,
    second3Retention: 89.2,
    second15Retention: 74.5,
    completionRateEstimated: 58.2,
    churnRiskFactor: "LOW",
    suggestedPatternInterrupt: "Insert B-Roll cutaway or meme SFX at second 4.5 to prevent drop-off."
  },
  {
    hookType: "Hook B: Negative Warning ('Stop ignoring this immediately if...')",
    second1Retention: 99.1,
    second3Retention: 94.0,
    second15Retention: 68.0,
    completionRateEstimated: 51.4,
    churnRiskFactor: "MODERATE",
    suggestedPatternInterrupt: "Transition into concrete tactical takeaway by second 8.0."
  },
  {
    hookType: "Hook C: Shocking Stat ('93% of top creators completely misunderstand...')",
    second1Retention: 96.8,
    second3Retention: 91.2,
    second15Retention: 78.4,
    completionRateEstimated: 64.0,
    churnRiskFactor: "LOW",
    suggestedPatternInterrupt: "Highlight data source citation badge in bottom third."
  }
];
