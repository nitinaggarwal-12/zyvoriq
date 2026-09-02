"use client";

import React, { useState } from "react";
import {
  UgcProductInput,
  UgcAdCampaign,
  UGC_SAMPLE_PRODUCTS,
  generateUgcAdCampaign
} from "../lib/reel/ugcAdEngine";

interface UgcAdGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCampaign: (campaign: UgcAdCampaign) => void;
}

export default function UgcAdGeneratorModal({
  isOpen,
  onClose,
  onApplyCampaign
}: UgcAdGeneratorModalProps) {
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<UgcProductInput["category"]>("Tech & Gadgets");
  const [price, setPrice] = useState("$29.99");
  const [originalPrice, setOriginalPrice] = useState("$59.99");
  const [keyBenefits, setKeyBenefits] = useState("Zero shadow lighting\nMagnetic phone mount\nPocket rechargeable");
  const [generatedCampaign, setGeneratedCampaign] = useState<UgcAdCampaign | null>(null);

  if (!isOpen) return null;

  const handleSelectSample = (sample: UgcProductInput) => {
    setProductName(sample.productName);
    setCategory(sample.category);
    setPrice(sample.price);
    setOriginalPrice(sample.originalPrice || "");
    setKeyBenefits(sample.keyBenefits.join("\n"));
  };

  const handleGenerate = () => {
    const input: UgcProductInput = {
      productName: productName.trim() || "Viral Smart Desk Lamp",
      category,
      price: price.trim() || "$29.99",
      originalPrice: originalPrice.trim() || "$59.99",
      rating: 4.9,
      reviewCount: 14200,
      productUrl: productUrl.trim(),
      keyBenefits: keyBenefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean)
    };

    const campaign = generateUgcAdCampaign(input);
    setGeneratedCampaign(campaign);
  };

  const handleApply = () => {
    if (generatedCampaign) {
      onApplyCampaign(generatedCampaign);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-amber-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  TikTok Shop & Amazon UGC Product Ad Factory
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  💰 Viral Tier 1
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Paste any product URL or name to generate high-converting 3-part UGC testimonial reels.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Quick Loader */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              Quick Load Sample Viral Products
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {UGC_SAMPLE_PRODUCTS.map((sample) => (
                <button
                  key={sample.productName}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 text-left transition-all"
                >
                  <div className="font-semibold text-xs text-white truncate">{sample.productName}</div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                    <span>{sample.category}</span>
                    <span className="text-amber-400 font-bold">{sample.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Product Name / Title
              </label>
              <input
                type="text"
                placeholder="e.g. AuraGlow 4K Lumina Ring Light"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UgcProductInput["category"])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Tech & Gadgets">Tech & Gadgets</option>
                <option value="Beauty & Skincare">Beauty & Skincare</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Fitness & Wellness">Fitness & Wellness</option>
                <option value="Fashion & Accessories">Fashion & Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Sale Price / Original Price
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="$29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="$59.99 (Reg)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Key Benefits (1 per line)
              </label>
              <textarea
                rows={2}
                placeholder="Instant glow&#10;5-minute routine&#10;Vegan & natural"
                value={keyBenefits}
                onChange={(e) => setKeyBenefits(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>⚡ Generate 3-Part Viral UGC Script & Badges</span>
          </button>

          {/* Generated Campaign Preview */}
          {generatedCampaign && (
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-amber-500/40 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{generatedCampaign.suggestedTitle}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-400 font-semibold">{generatedCampaign.discountBadge}</span>
                    <span className="text-[11px] text-zinc-400">{generatedCampaign.starRatingText}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    {generatedCampaign.estimatedConversionRate}
                  </span>
                </div>
              </div>

              {/* Scene Breakdown */}
              <div className="space-y-2">
                {generatedCampaign.scenes.map((scene) => (
                  <div
                    key={scene.sceneIndex}
                    className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs flex items-start gap-3"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      Scene {scene.sceneIndex}
                    </span>
                    <div className="flex-1">
                      <p className="text-zinc-200">{scene.dialogue}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                        <span className="text-amber-400 font-semibold">🏷️ {scene.overlayBadge}</span>
                        <span>· 🎥 {scene.cameraMovement}</span>
                        <span>· ⏱️ {scene.durationSec}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!generatedCampaign}
            onClick={handleApply}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
              generatedCampaign
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Apply UGC Script to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
