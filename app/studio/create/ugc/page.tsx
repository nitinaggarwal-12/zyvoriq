"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  Zap,
  ArrowLeft,
  Users,
  Clock,
  Palette,
  Loader2,
  Lightbulb,
  Smartphone,
  ShieldCheck,
  Split,
  Star,
  Tag,
  Truck,
  CheckCircle2,
  Volume2,
  Layers,
  Play,
  Flame,
  MousePointerClick,
  Percent,
  TrendingUp,
  RefreshCw,
  Gift,
  BadgeCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

type AdFramework = "problem_solution" | "before_after" | "unboxing_asmr" | "tiktok_shop_review" | "three_hook_split";
type CreatorPersona = "emma_skincare" | "alex_tech" | "maya_fitness" | "david_home";
type DiscountBadge = "50_off" | "buy1_get1" | "flash_sale" | "free_shipping" | "none";
type CtaButtonType = "shop_now" | "claim_offer" | "link_in_bio" | "tiktok_shop" | "try_risk_free";

interface HookVariation {
  id: string;
  type: string;
  hookText: string;
  retentionScore: string;
}

function UgcCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core Form State
  const [productName, setProductName] = useState("AuraGlow Serum");
  const [productCategory, setProductCategory] = useState("Beauty & Skincare");
  const [adFramework, setAdFramework] = useState<AdFramework>("problem_solution");
  const [creatorPersona, setCreatorPersona] = useState<CreatorPersona>("emma_skincare");
  const [discountBadge, setDiscountBadge] = useState<DiscountBadge>("50_off");
  const [ctaButton, setCtaButton] = useState<CtaButtonType>("claim_offer");
  const [starRating, setStarRating] = useState<number>(5);
  const [showTrustBadges, setShowTrustBadges] = useState(true);
  const [showStarOverlay, setShowStarOverlay] = useState(true);
  const [voiceCadence, setVoiceCadence] = useState<"1.1x" | "1.15x" | "1.25x">("1.15x");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [bgMusic, setBgMusic] = useState<"upbeat_pop" | "lofi_bounce" | "aesthetic_chill" | "none">("upbeat_pop");
  const [painPoint, setPainPoint] = useState("Waking up with dry, flaky skin that ruins makeup application");
  const [solutionValue, setSolutionValue] = useState("Instant 24-hour dewy hydration with 5% pure botanical peptides");
  const [activeHookIndex, setActiveHookIndex] = useState(0);
  const [beforeAfterSplit, setBeforeAfterSplit] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const HOOK_VARIATIONS: Record<AdFramework, HookVariation[]> = {
    problem_solution: [
      { id: "h1", type: "🛑 The 'Callout' Hook", hookText: "Stop using regular moisturizers if your skin still flakes by 2 PM...", retentionScore: "94% 3s Hold" },
      { id: "h2", type: "😱 The 'Mistake' Hook", hookText: "I was making the #1 mistake with my morning routine until my dermatologist told me this...", retentionScore: "91% 3s Hold" },
      { id: "h3", type: "🔥 The 'Viral Secret' Hook", hookText: "This $28 bottle sold out 4 times and here is the exact reason why everyone is obsessing over it...", retentionScore: "96% 3s Hold" }
    ],
    before_after: [
      { id: "h4", type: "✨ Day 1 vs Day 14", hookText: "Look at my skin on Day 1 versus Day 14. Zero filter, just raw bathroom lighting...", retentionScore: "98% 3s Hold" },
      { id: "h5", type: "🤯 Shock Proof", hookText: "If you think your skin can't transform in two weeks, watch this side-by-side wipe...", retentionScore: "95% 3s Hold" },
      { id: "h6", type: "🎯 The Before Reality", hookText: "I was insecure about redness for 3 years until I started applying this twice a day...", retentionScore: "92% 3s Hold" }
    ],
    unboxing_asmr: [
      { id: "h7", type: "📦 Tactile Unboxing", hookText: "My package finally arrived! Let's unbox this and test if the texture lives up to the hype...", retentionScore: "89% 3s Hold" },
      { id: "h8", type: "🎧 Satisfying ASMR", hookText: "Listen to this pump sound and look at that golden glass dropper consistency...", retentionScore: "93% 3s Hold" },
      { id: "h9", type: "🎁 Premium Feel", hookText: "For under $30, the weighted frosted glass bottle feels like a $120 luxury serum...", retentionScore: "88% 3s Hold" }
    ],
    tiktok_shop_review: [
      { id: "h10", type: "🛒 Yellow Cart Alert", hookText: "Do NOT buy this from Amazon—tap the TikTok Shop flash sale badge right here for 50% off...", retentionScore: "97% 3s Hold" },
      { id: "h11", type: "👀 Honest Review", hookText: "TikTok made me buy it 30 days ago, and here is my 100% honest unfiltered review...", retentionScore: "94% 3s Hold" },
      { id: "h12", type: "⚡ Flash Deal Warning", hookText: "This voucher code expires in 4 hours so grab it before the warehouse runs out again...", retentionScore: "96% 3s Hold" }
    ],
    three_hook_split: [
      { id: "h13", type: "🧪 Curiosity Angle", hookText: "Why is everyone in New York switching away from 10-step skincare to just this single step?", retentionScore: "92% 3s Hold" },
      { id: "h14", type: "💰 Price Comparison", hookText: "Stop spending $90 on luxury department store creams when the exact active ingredient is here...", retentionScore: "95% 3s Hold" },
      { id: "h15", type: "👥 Social Proof", hookText: "Over 45,000 5-star reviews on Shopify—let's test if it actually works on sensitive skin...", retentionScore: "93% 3s Hold" }
    ]
  };

  const activeHooks = HOOK_VARIATIONS[adFramework] || HOOK_VARIATIONS.problem_solution;
  const currentHook = activeHooks[activeHookIndex] || activeHooks[0];

  useEffect(() => {
    const q = searchParams.get("q");
    const fw = searchParams.get("framework") as AdFramework;
    if (q) setProductName(q);
    if (fw && HOOK_VARIATIONS[fw]) setAdFramework(fw);
  }, [searchParams]);

  const handleFrameworkPreset = (fw: AdFramework) => {
    setAdFramework(fw);
    setActiveHookIndex(0);
    if (fw === "problem_solution") {
      setProductName("AuraGlow Peptide Serum");
      setProductCategory("Beauty & Skincare");
      setPainPoint("Waking up with dull, dehydrated skin that flakes after foundation");
      setSolutionValue("Instant 24-hr glass skin radiance with 5% botanical peptide complex");
      setCtaButton("claim_offer");
      setDiscountBadge("50_off");
    } else if (fw === "before_after") {
      setProductName("UltraLuxe Hair Growth Oil");
      setProductCategory("Hair & Scalp Health");
      setPainPoint("Thinning hairline and shedding when brushing hair every morning");
      setSolutionValue("Visibly thicker, fuller roots in 21 days with rosemary biotin extract");
      setCtaButton("try_risk_free");
      setDiscountBadge("buy1_get1");
    } else if (fw === "unboxing_asmr") {
      setProductName("PulseWave Smart Espresso Scale");
      setProductCategory("Home & Kitchen Gadgets");
      setPainPoint("Inconsistent bitter coffee espresso shots that ruin mornings");
      setSolutionValue("0.1g ultra-precision auto-timer with matte obsidian water-resistant casing");
      setCtaButton("shop_now");
      setDiscountBadge("free_shipping");
    } else if (fw === "tiktok_shop_review") {
      setProductName("ThermaRest Neck Stretcher");
      setProductCategory("Wellness & Ergonomics");
      setPainPoint("Severe neck tension and tension headaches after 8 hours at desk");
      setSolutionValue("Acupressure cervical traction restores natural curve in 10 mins/day");
      setCtaButton("tiktok_shop");
      setDiscountBadge("flash_sale");
    } else {
      setProductName("TitanGrip MagSafe Wallet & Stand");
      setProductCategory("Everyday Carry & Tech");
      setPainPoint("Bulky leather wallets stretching out pockets and losing cards");
      setSolutionValue("Holds 6 cards with aerospace aluminum RFID shielding & 360 adjustable stand");
      setCtaButton("shop_now");
      setDiscountBadge("50_off");
    }
  };

  const handleGenerate = async () => {
    if (!productName.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/tier6/create-act", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `UGC Ad - ${productName}`,
          prompt: `High-converting UGC video ad for ${productName} (${productCategory}). Framework: ${adFramework}. Hook: "${currentHook.hookText}". Pain point: "${painPoint}". Solution: "${solutionValue}". Creator: ${creatorPersona}. Badge: ${discountBadge}. CTA: ${ctaButton}. 5-Star verified rating overlay.`,
          aspectRatio,
          duration: 30,
          format: "ugc_video_ad",
          ugcMetadata: {
            productName,
            productCategory,
            adFramework,
            creatorPersona,
            discountBadge,
            ctaButton,
            starRating,
            currentHook: currentHook.hookText,
            voiceCadence,
            bgMusic
          },
          destinationMode: "new_series"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate UGC ad generation");
      }

      const jobId = data.jobId || data.track?.id;
      if (jobId) {
        router.push(`/studio/production/${jobId}`);
      } else {
        router.push(`/studio?mode=ugc&product=${encodeURIComponent(productName)}&framework=${adFramework}`);
      }
    } catch (err: any) {
      // Graceful fallback to studio workspace
      router.push(`/studio?mode=ugc&product=${encodeURIComponent(productName)}&framework=${adFramework}`);
    }
  };

  return (
    <StudioSidebar>
      <main className="w-full max-w-[1500px] mx-auto px-5 py-6 md:px-8 space-y-6">
        {/* Header Breadcrumb & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/studio/create"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Creation Hub
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono font-bold text-amber-300">Persona #4: UGC Video Ads</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black text-amber-300 font-mono">
              <Sparkles className="w-3 h-3" /> DTC AD ENGINE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 font-mono">
              <ShieldCheck className="w-3 h-3" /> HIGH RETENTION HOOK MATRIX
            </span>
          </div>
        </div>

        {/* Hero Title & Framework Tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 shadow-md shadow-amber-500/10">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI UGC Video Ad Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Generate high-retention TikTok, Instagram Reel & Meta video ads with problem-solution hooks, star ratings, and CTA badges.
              </p>
            </div>
          </div>

          {/* 5 High-Converting UGC Framework Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
            {[
              { id: "problem_solution", label: "Problem → Solution", icon: Flame, desc: "PAS Hook & Agitation" },
              { id: "before_after", label: "Before vs After", icon: Split, desc: "Interactive Result Wipe" },
              { id: "unboxing_asmr", label: "Tactile Unboxing", icon: Gift, desc: "ASMR Texture & First Look" },
              { id: "tiktok_shop_review", label: "TikTok Shop Review", icon: Tag, desc: "Yellow Cart & Flash Deal" },
              { id: "three_hook_split", label: "3-Hook A/B Sprint", icon: Layers, desc: "Multi-Angle Variation" }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = adFramework === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFrameworkPreset(item.id as AdFramework)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all min-h-[72px] ${
                    isActive
                      ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                      : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Comprehensive UGC Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Product Details & Angles */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> 1. Product & Value Proposition
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DTC & E-Com Engine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. AuraGlow Serum, Lumina Sleep Mask..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-base md:text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category / Niche</label>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="e.g. Beauty, Tech Gadgets, Fitness..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-base md:text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Problem Pain Point */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Customer Pain Point / Frustration</span>
                  <span className="text-[10px] text-red-400 font-normal">Agitation Hook</span>
                </label>
                <textarea
                  rows={2}
                  value={painPoint}
                  onChange={(e) => setPainPoint(e.target.value)}
                  placeholder="What frustrating problem makes people desperately want this solution?"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-base md:text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Solution Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Product Solution & Key Result</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Immediate Relief</span>
                </label>
                <textarea
                  rows={2}
                  value={solutionValue}
                  onChange={(e) => setSolutionValue(e.target.value)}
                  placeholder="How does the product solve this in seconds/days?"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-base md:text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* 2. Hook Variation Selector (A/B Testing Engine) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> 2. 3-Second Viral Hook Selector
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Predicted Retention Score</span>
              </div>

              <div className="space-y-2.5">
                {activeHooks.map((h, idx) => {
                  const isSelected = activeHookIndex === idx;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setActiveHookIndex(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                          : "border-white/10 bg-black/30 text-slate-400 hover:border-white/20 hover:bg-black/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{h.type}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {h.retentionScore}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                        "{h.hookText}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. AI Creator Persona & Conversion Overlays */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> 3. AI Creator Cast & Badges
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Avatar & Social Proof</span>
              </div>

              {/* Creator Cast */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">AI Talking-Head Creator</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "emma_skincare", name: "Emma", role: "Skincare / Lifestyle", tone: "Warm & Friendly" },
                    { id: "alex_tech", name: "Alex", role: "Gadgets & Gear", tone: "Fast & Enthusiastic" },
                    { id: "maya_fitness", name: "Maya", role: "Wellness & Health", tone: "Energetic Coach" },
                    { id: "david_home", name: "David", role: "Home & Everyday", tone: "Relatable & Calm" }
                  ].map((creator) => {
                    const isSelected = creatorPersona === creator.id;
                    return (
                      <button
                        key={creator.id}
                        type="button"
                        onClick={() => setCreatorPersona(creator.id as CreatorPersona)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/15 text-white"
                            : "border-white/10 bg-black/30 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-200">{creator.name}</div>
                        <div className="text-[10px] text-amber-400">{creator.role}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{creator.tone}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount Promo Badge & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Discount / Offer Sticker</label>
                  <select
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value as DiscountBadge)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-base md:text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="50_off">🔥 50% OFF TODAY ONLY</option>
                    <option value="buy1_get1">🎁 BUY 1 GET 1 FREE</option>
                    <option value="flash_sale">⚡ TIKTOK SHOP FLASH SALE</option>
                    <option value="free_shipping">🚚 FREE 2-DAY SHIPPING</option>
                    <option value="none">No Discount Sticker</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Primary CTA Button</label>
                  <select
                    value={ctaButton}
                    onChange={(e) => setCtaButton(e.target.value as CtaButtonType)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-base md:text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="claim_offer">👉 Claim 50% Off Offer</option>
                    <option value="shop_now">🛍️ Shop Now Before Sold Out</option>
                    <option value="tiktok_shop">🛒 Tap Yellow Cart Below</option>
                    <option value="link_in_bio">🔗 Tap Link In Bio</option>
                    <option value="try_risk_free">🛡️ Try 30 Days Risk-Free</option>
                  </select>
                </div>
              </div>

              {/* Toggle Badges: Star Rating & Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={showStarOverlay}
                    onChange={(e) => setShowStarOverlay(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span>Show 5.0 Star Rating & Verified Review Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTrustBadges}
                    onChange={(e) => setShowTrustBadges(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span>Show 30-Day Money-Back Guarantee Badge</span>
                </label>
              </div>
            </div>

            {/* 4. Audio Engine & Pacing */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5" /> 4. Audio Cadence & Background Track
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Neural Voice Matrix</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Voiceover Cadence (Speed)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1.1x", "1.15x", "1.25x"] as const).map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setVoiceCadence(speed)}
                        className={`py-2 rounded-xl border text-xs font-bold transition ${
                          voiceCadence === speed
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-white/10 bg-black/30 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Background Music Style</label>
                  <select
                    value={bgMusic}
                    onChange={(e) => setBgMusic(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-base md:text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="upbeat_pop">🎵 Upbeat Commercial Pop (High Energy)</option>
                    <option value="lofi_bounce">🎧 Lo-Fi Trap Bounce (Casual Viral)</option>
                    <option value="aesthetic_chill">✨ Aesthetic Chillwave (Beauty/Wellness)</option>
                    <option value="none">🔇 Voice Only (Zero BGM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generation CTA Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !productName.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer min-h-[52px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Synthesizing UGC Ad Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" /> Generate Persona #4 UGC Video Ad
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Interactive 9:16 UGC Ad Simulator (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" /> Live 9:16 Ad Simulator
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Mobile Viewport Fidelity</span>
            </div>

            {/* 9:16 Phone Mockup Container */}
            <div className="relative mx-auto w-full max-w-[340px] aspect-[9/16] rounded-3xl border-4 border-white/15 bg-gradient-to-b from-slate-900 via-obsidian-950 to-black overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col justify-between p-4 select-none">
              <video
                src="/assets/video/persona4_ugc_ecommerce_reel.mp4"
                controls
                playsInline
                autoPlay
                muted
                loop
                className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
              />
              {/* Top Creator Header Overlay */}
              <div className="space-y-2 z-10">
                <div className="flex items-center justify-between bg-black/60 backdrop-blur-md rounded-xl p-2 border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xs font-black text-slate-950">
                      {creatorPersona === "emma_skincare" ? "E" : creatorPersona === "alex_tech" ? "A" : creatorPersona === "maya_fitness" ? "M" : "D"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white leading-none">
                          {creatorPersona === "emma_skincare" ? "@emma.glows" : creatorPersona === "alex_tech" ? "@alex_tech_reviews" : creatorPersona === "maya_fitness" ? "@maya_moves" : "@david_home"}
                        </span>
                        <BadgeCheck className="w-3 h-3 text-sky-400" />
                      </div>
                      <span className="text-[9px] text-slate-400">Sponsored Ad</span>
                    </div>
                  </div>

                  {discountBadge !== "none" && (
                    <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                      {discountBadge === "50_off" ? "50% OFF" : discountBadge === "buy1_get1" ? "BOGO FREE" : discountBadge === "flash_sale" ? "FLASH SALE" : "FREE SHIP"}
                    </span>
                  )}
                </div>

                {/* 5-Star Rating Badge */}
                {showStarOverlay && (
                  <div className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/30">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-amber-300 font-mono">4.9/5.0</span>
                    <span className="text-[9px] text-slate-400">(4.8k reviews)</span>
                  </div>
                )}
              </div>

              {/* Center Dynamic Visual Simulation */}
              <div className="my-auto text-center space-y-3 py-4 z-10">
                {adFramework === "before_after" ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-36 rounded-xl border border-white/20 overflow-hidden bg-slate-800 flex items-center justify-center">
                      <div
                        className="absolute inset-y-0 left-0 bg-red-950/80 flex items-center justify-center text-xs font-black text-red-200"
                        style={{ width: `${beforeAfterSplit}%` }}
                      >
                        <span className="text-[11px] font-mono">BEFORE</span>
                      </div>
                      <div
                        className="absolute inset-y-0 right-0 bg-emerald-950/80 flex items-center justify-center text-xs font-black text-emerald-200"
                        style={{ width: `${100 - beforeAfterSplit}%` }}
                      >
                        <span className="text-[11px] font-mono">AFTER (DAY 14)</span>
                      </div>
                      <div
                        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
                        style={{ left: `${beforeAfterSplit}%` }}
                      >
                        <div className="w-5 h-5 rounded-full bg-white text-slate-950 text-[8px] font-black flex items-center justify-center">
                          ↔
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={beforeAfterSplit}
                      onChange={(e) => setBeforeAfterSplit(Number(e.target.value))}
                      className="w-full accent-amber-400 h-1 bg-white/20 rounded-lg cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/10">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div className="text-xs font-black text-white px-3 leading-snug">
                      {productName}
                    </div>
                  </div>
                )}

                {/* Subtitle Kinetic Overlay Hook */}
                <div className="bg-black/80 backdrop-blur-md rounded-xl p-2.5 border border-amber-500/30 shadow-lg">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-tight block">
                    {currentHook.hookText}
                  </span>
                </div>
              </div>

              {/* Bottom Conversion & CTA Overlay */}
              <div className="space-y-2 z-10">
                {showTrustBadges && (
                  <div className="flex items-center justify-center gap-3 text-[9px] text-slate-300 font-mono">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 30-Day Money Back
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-amber-400" /> Fast Shipping
                    </span>
                  </div>
                )}

                {/* Pulsing CTA Action Button */}
                <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 animate-bounce">
                  <MousePointerClick className="w-4 h-4" />
                  <span>
                    {ctaButton === "claim_offer"
                      ? "Claim 50% Off Offer"
                      : ctaButton === "tiktok_shop"
                      ? "Shop TikTok Deal"
                      : ctaButton === "try_risk_free"
                      ? "Try Risk-Free"
                      : ctaButton === "link_in_bio"
                      ? "Tap Link In Bio"
                      : "Shop Now"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Export Tips */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> High-Performance UGC Guidelines:
              </div>
              <p>• 3s Hook retention determines 80% of ad algorithmic distribution.</p>
              <p>• High-contrast yellow/gold overlays boost click-through rate by up to 34%.</p>
              <p>• Always test 3 distinct hook variations with the same middle product demonstration.</p>
            </div>
          </div>
        </div>
      </main>
    </StudioSidebar>
  );
}

export default function UgcCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      }
    >
      <UgcCreateContent />
    </Suspense>
  );
}
