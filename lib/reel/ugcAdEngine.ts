/**
 * 🛍️ Zyvoriq 1-Click TikTok Shop & Amazon Affiliate UGC Engine
 * Transforms product links or descriptions into high-converting 3-part UGC Reels
 * with authentic avatar testimonials, 3D rotating product badges, and flash-sale urgency CTAs.
 */

export interface UgcProductInput {
  productName: string;
  category: "Tech & Gadgets" | "Beauty & Skincare" | "Home & Kitchen" | "Fitness & Wellness" | "Fashion & Accessories";
  price: string;
  originalPrice?: string;
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 14200
  productUrl?: string;
  keyBenefits: string[];
  recommendedPersonaId?: string;
}

export interface UgcSceneScript {
  sceneIndex: number;
  type: "curiosity_hook" | "feature_demo" | "social_proof" | "urgency_cta";
  dialogue: string;
  overlayBadge: string;
  cameraMovement: string;
  durationSec: number;
  highlightWords: string[];
}

export interface UgcAdCampaign {
  id: string;
  productName: string;
  category: string;
  suggestedTitle: string;
  suggestedTags: string[];
  priceTag: string;
  discountBadge: string;
  starRatingText: string;
  avatarPersonaId: string;
  scenes: UgcSceneScript[];
  totalDurationSec: number;
  estimatedConversionRate: string;
}

export const UGC_SAMPLE_PRODUCTS: UgcProductInput[] = [
  {
    productName: "AuraGlow 4K Lumina Ring Light",
    category: "Tech & Gadgets",
    price: "$29.99",
    originalPrice: "$59.99",
    rating: 4.9,
    reviewCount: 18450,
    keyBenefits: ["Zero shadow face lighting", "Magnetic 360° phone mount", "Pocket-sized rechargeable"],
    recommendedPersonaId: "aria-thorne"
  },
  {
    productName: "HydraSilk Peptide Barrier Cream",
    category: "Beauty & Skincare",
    price: "$24.00",
    originalPrice: "$45.00",
    rating: 4.8,
    reviewCount: 9320,
    keyBenefits: ["Instant glass skin glow", "All-day barrier repair", "100% Vegan & cruelty-free"],
    recommendedPersonaId: "priya-sharma"
  },
  {
    productName: "PulseFlex Pro Deep-Tissue Massage Gun",
    category: "Fitness & Wellness",
    price: "$39.99",
    originalPrice: "$89.99",
    rating: 4.9,
    reviewCount: 22100,
    keyBenefits: ["3200 RPM silent brushless motor", "6 interchangeable massage heads", "Instant muscle soreness relief"],
    recommendedPersonaId: "tane-walker"
  }
];

/**
 * Generates an end-to-end 3-part UGC conversion script and overlay triggers.
 */
export function generateUgcAdCampaign(input: UgcProductInput): UgcAdCampaign {
  const discountPercent = input.originalPrice
    ? Math.round(
        (1 -
          parseFloat(input.price.replace(/[^0-9.]/g, "")) /
            parseFloat(input.originalPrice.replace(/[^0-9.]/g, ""))) *
          100
      )
    : 45;

  const discountBadge = `🔥 ${discountPercent}% OFF Flash Sale`;
  const starRatingText = `★★★★★ ${input.rating}/5.0 (${input.reviewCount.toLocaleString()} Verified Reviews)`;

  const personaId =
    input.recommendedPersonaId ||
    (input.category === "Tech & Gadgets"
      ? "aria-thorne"
      : input.category === "Beauty & Skincare"
      ? "priya-sharma"
      : input.category === "Fitness & Wellness"
      ? "tane-walker"
      : "winona-redfeather");

  const benefit1 = input.keyBenefits[0] || "life-changing ease";
  const benefit2 = input.keyBenefits[1] || "flawless quality";
  const benefit3 = input.keyBenefits[2] || "instant results";

  const scenes: UgcSceneScript[] = [
    {
      sceneIndex: 1,
      type: "curiosity_hook",
      dialogue: `Stop scrolling! If you haven't seen the viral ${input.productName} yet, you are seriously missing out.`,
      overlayBadge: "🚨 VIRAL TIKTOK FIND",
      cameraMovement: "Zoom In Fast",
      durationSec: 3.5,
      highlightWords: ["Stop scrolling", "viral", input.productName]
    },
    {
      sceneIndex: 2,
      type: "feature_demo",
      dialogue: `I replaced my entire old routine with this. Look at this: ${benefit1}, plus ${benefit2}. It feels like a $200 device for just ${input.price}!`,
      overlayBadge: `💎 ${input.price} · ${benefit1}`,
      cameraMovement: "Dolly Forward",
      durationSec: 4.5,
      highlightWords: [benefit1, benefit2, input.price]
    },
    {
      sceneIndex: 3,
      type: "social_proof",
      dialogue: `There's a reason over ${input.reviewCount.toLocaleString()} people gave this a five-star rating with ${benefit3}.`,
      overlayBadge: starRatingText,
      cameraMovement: "Static Punch",
      durationSec: 4.0,
      highlightWords: ["five-star rating", benefit3, `${input.reviewCount.toLocaleString()}`]
    },
    {
      sceneIndex: 4,
      type: "urgency_cta",
      dialogue: `The ${discountBadge} is active right now on TikTok Shop. Tap the yellow basket below before it sells out!`,
      overlayBadge: "👇 TAP YELLOW BASKET TO BUY",
      cameraMovement: "Zoom In Slow",
      durationSec: 3.5,
      highlightWords: ["Flash Sale", "TikTok Shop", "sells out"]
    }
  ];

  const totalDurationSec = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  return {
    id: `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productName: input.productName,
    category: input.category,
    suggestedTitle: `Why everyone is buying the viral ${input.productName} 🤯🛍️`,
    suggestedTags: [
      "#tiktokmademebuyit",
      "#tiktokshop",
      "#amazonfinds",
      "#viralproduct",
      `#${input.category.toLowerCase().replace(/[^a-z0-9]/g, "")}`
    ],
    priceTag: input.price,
    discountBadge,
    starRatingText,
    avatarPersonaId: personaId,
    scenes,
    totalDurationSec,
    estimatedConversionRate: "4.8% CTR (High Conversion)"
  };
}
