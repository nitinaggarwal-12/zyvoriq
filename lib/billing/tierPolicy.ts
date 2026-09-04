export type PlanTier = "free" | "creator" | "pro" | "enterprise";

export interface TierQuotas {
  id: PlanTier;
  name: string;
  badge: string;
  priceMonthlyUsd: number;
  priceAnnualMonthlyUsd: number;
  monthlyAssetBundles: number;
  overagePerBundleUsd: number;
  // Veo 3.1 Chaining limits
  maxVeoCycles: number; // 1 cycle = 8s, 4 = 32s, 8 = 64s, 20 = 168s
  maxVeoDurationSeconds: number;
  // Concurrency limits to prevent GPU DoS / Token drain
  maxConcurrentRenders: number;
  // Lyria 3.0 Music capabilities
  lyriaTier: "standard" | "pro";
  maxLyriaDurationSeconds: number;
  lyriaStemSeparation: boolean;
  // Neural Voice & Emotional Dubbing
  voiceCasting: "standard_single" | "emotional_5_cast" | "enterprise_custom";
  // Persona & Brand Memory
  personaVaultLimit: number; // -1 = unlimited
  // Provenance & Output Quality
  watermark: boolean;
  c2paCryptographicSigning: boolean;
  honestMasterExport1080p: boolean;
  commercialRights: "personal_non_commercial" | "commercial_perpetual";
  storageQuotaGb: number;
  storageRetentionGraceDays: number;
  // Compliance & SLA
  biometricRetentionDays: number;
  slaGuarantee: string;
}

export const TIER_DEFINITIONS: Record<PlanTier, TierQuotas> = {
  free: {
    id: "free",
    name: "Free Community Sandbox",
    badge: "Sandbox",
    priceMonthlyUsd: 0,
    priceAnnualMonthlyUsd: 0,
    monthlyAssetBundles: 5,
    overagePerBundleUsd: 0,
    maxVeoCycles: 1, // Single 8s scene
    maxVeoDurationSeconds: 8,
    maxConcurrentRenders: 1,
    lyriaTier: "standard",
    maxLyriaDurationSeconds: 30,
    lyriaStemSeparation: false,
    voiceCasting: "standard_single",
    personaVaultLimit: 0,
    watermark: true,
    c2paCryptographicSigning: false,
    honestMasterExport1080p: false, // 720p watermarked
    commercialRights: "personal_non_commercial",
    storageQuotaGb: 2,
    storageRetentionGraceDays: 30,
    biometricRetentionDays: 30,
    slaGuarantee: "Best Effort Community"
  },
  creator: {
    id: "creator",
    name: "Creator Studio",
    badge: "Solo Creators & Podcasters",
    priceMonthlyUsd: 59,
    priceAnnualMonthlyUsd: 49,
    monthlyAssetBundles: 25,
    overagePerBundleUsd: 1.5,
    maxVeoCycles: 4, // Up to 32s multi-act
    maxVeoDurationSeconds: 32,
    maxConcurrentRenders: 1,
    lyriaTier: "standard",
    maxLyriaDurationSeconds: 120,
    lyriaStemSeparation: false,
    voiceCasting: "emotional_5_cast", // Charon, Aoede, Puck, Fenrir, Kore
    personaVaultLimit: 2,
    watermark: false,
    c2paCryptographicSigning: false,
    honestMasterExport1080p: true,
    commercialRights: "commercial_perpetual",
    storageQuotaGb: 25,
    storageRetentionGraceDays: 60,
    biometricRetentionDays: 90,
    slaGuarantee: "99.0% Uptime"
  },
  pro: {
    id: "pro",
    name: "Pro Studio",
    badge: "DevRel Teams & Media Boutiques",
    priceMonthlyUsd: 249,
    priceAnnualMonthlyUsd: 199,
    monthlyAssetBundles: 150,
    overagePerBundleUsd: 1.2,
    maxVeoCycles: 8, // Up to 64s continuous cinema
    maxVeoDurationSeconds: 64,
    maxConcurrentRenders: 2,
    lyriaTier: "pro",
    maxLyriaDurationSeconds: 180, // Full 3-minute multi-section song trees
    lyriaStemSeparation: true,
    voiceCasting: "emotional_5_cast",
    personaVaultLimit: 10,
    watermark: false,
    c2paCryptographicSigning: true, // Veritas zk-SNARK
    honestMasterExport1080p: true,
    commercialRights: "commercial_perpetual",
    storageQuotaGb: 200,
    storageRetentionGraceDays: 90,
    biometricRetentionDays: 90,
    slaGuarantee: "99.9% Uptime with Priority Render Queue"
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Agency Hub",
    badge: "Scale Marketing & Multi-Client Agencies",
    priceMonthlyUsd: 1800,
    priceAnnualMonthlyUsd: 1500,
    monthlyAssetBundles: 1000,
    overagePerBundleUsd: 0.9,
    maxVeoCycles: 20, // Full 168s cinematic longform
    maxVeoDurationSeconds: 168,
    maxConcurrentRenders: 5,
    lyriaTier: "pro",
    maxLyriaDurationSeconds: 180,
    lyriaStemSeparation: true,
    voiceCasting: "enterprise_custom",
    personaVaultLimit: -1, // Unlimited
    watermark: false,
    c2paCryptographicSigning: true,
    honestMasterExport1080p: true,
    commercialRights: "commercial_perpetual",
    storageQuotaGb: 2000,
    storageRetentionGraceDays: 180,
    biometricRetentionDays: 180,
    slaGuarantee: "99.99% Uptime with Dedicated Cloudtop VPC & 24/7 TAM"
  }
};

export interface DowngradeImpact {
  isDowngrade: boolean;
  excessPersonasCount: number;
  excessStorageGb: number;
  storageGraceDays: number;
  biometricPurgeNoticeDays: number;
  grandfatheredReelsProtected: boolean;
  perpetualCommercialRightsRetained: boolean;
  requiredActions: string[];
}

/**
 * Calculates the exact operational impact when a user schedules a tier downgrade.
 * Enforces the Grandfathering and Graceful Freeze invariants.
 */
export function calculateDowngradeImpact(
  currentTier: PlanTier,
  targetTier: PlanTier,
  currentUsage: {
    activePersonasCount: number;
    usedStorageGb: number;
  }
): DowngradeImpact {
  const tierRanks: Record<PlanTier, number> = {
    free: 0,
    creator: 1,
    pro: 2,
    enterprise: 3
  };

  const isDowngrade = tierRanks[targetTier] < tierRanks[currentTier];
  if (!isDowngrade) {
    return {
      isDowngrade: false,
      excessPersonasCount: 0,
      excessStorageGb: 0,
      storageGraceDays: 0,
      biometricPurgeNoticeDays: 0,
      grandfatheredReelsProtected: true,
      perpetualCommercialRightsRetained: true,
      requiredActions: []
    };
  }

  const targetLimits = TIER_DEFINITIONS[targetTier];
  const excessPersonas =
    targetLimits.personaVaultLimit === -1
      ? 0
      : Math.max(0, currentUsage.activePersonasCount - targetLimits.personaVaultLimit);

  const excessStorage = Math.max(0, currentUsage.usedStorageGb - targetLimits.storageQuotaGb);
  const requiredActions: string[] = [];

  if (excessPersonas > 0) {
    requiredActions.push(
      `Select ${targetLimits.personaVaultLimit} active personas. The remaining ${excessPersonas} will be frozen in read-only mode without deletion.`
    );
  }

  if (excessStorage > 0) {
    requiredActions.push(
      `You have ${excessStorage.toFixed(1)} GB above the ${targetLimits.storageQuotaGb} GB limit. Download your master video containers within the ${targetLimits.storageRetentionGraceDays}-day grace window.`
    );
  }

  requiredActions.push(
    `All ${targetLimits.biometricRetentionDays}-day biometric voice models will enter compliance freeze. You may export or purge them anytime.`
  );

  return {
    isDowngrade: true,
    excessPersonasCount: excessPersonas,
    excessStorageGb: excessStorage,
    storageGraceDays: targetLimits.storageRetentionGraceDays,
    biometricPurgeNoticeDays: targetLimits.biometricRetentionDays,
    grandfatheredReelsProtected: true, // Invariant: Existing work is never cropped or deleted
    perpetualCommercialRightsRetained: true, // Invariant: C2PA certificates remain permanently valid
    requiredActions
  };
}

/**
 * Resolves the effective Veo 3.1 cycle count according to plan tier and BYOK status.
 * Prevents GPU drain while rewarding users who bring their own API keys.
 */
export function resolveEffectiveVeoCycles(
  requestedCycles: number,
  tier: PlanTier,
  isBYOK: boolean
): {
  allowedCycles: number;
  durationSeconds: number;
  throttled: boolean;
  reason?: string;
} {
  const limits = TIER_DEFINITIONS[tier];
  // BYOK users on Free/Creator receive elevated duration caps because inference is self-funded
  const effectiveMax = isBYOK && tier === "free" ? 4 : isBYOK && tier === "creator" ? 8 : limits.maxVeoCycles;

  if (requestedCycles <= effectiveMax) {
    return {
      allowedCycles: requestedCycles,
      durationSeconds: requestedCycles * 8,
      throttled: false
    };
  }

  return {
    allowedCycles: effectiveMax,
    durationSeconds: effectiveMax * 8,
    throttled: true,
    reason: `Plan '${limits.name}' is capped at ${effectiveMax} Veo cycles (${effectiveMax * 8}s). Upgrade to expand timeline headroom.`
  };
}

/**
 * Validates concurrent render capacity to prevent denial-of-service / token drain attacks.
 */
export function checkConcurrentRenderCapacity(
  activeRenders: number,
  tier: PlanTier
): {
  allowed: boolean;
  maxAllowed: number;
  mustQueue: boolean;
  message?: string;
} {
  const limits = TIER_DEFINITIONS[tier];
  if (activeRenders < limits.maxConcurrentRenders) {
    return {
      allowed: true,
      maxAllowed: limits.maxConcurrentRenders,
      mustQueue: false
    };
  }

  return {
    allowed: false,
    maxAllowed: limits.maxConcurrentRenders,
    mustQueue: true,
    message: `Plan '${limits.name}' allows ${limits.maxConcurrentRenders} concurrent render(s). Your job has been queued.`
  };
}

/**
 * Verifies that commercial licensing rights granted during an active subscription are perpetual.
 */
export function isCommercialRightsPerpetual(planTierAtCreation: PlanTier): boolean {
  return planTierAtCreation !== "free";
}
