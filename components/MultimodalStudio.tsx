"use client";

import React, { useState } from "react";
import { Captions, Clapperboard, Languages, Mic2, Sparkles, WandSparkles, Image as ImageIcon, Share2 } from "lucide-react";

const STEPS = [
  { id: "hook", icon: WandSparkles, title: "Hook", kicker: "Win the first 2 seconds", body: "Generate multiple opening angles tuned to curiosity, tension, surprise, authority or emotion—then pick the one that best fits your audience." },
  { id: "script", icon: Sparkles, title: "Script", kicker: "Keep the pace moving", body: "Shape a concise reel script with beats, pattern interrupts, payoff and CTA instead of a generic paragraph chopped into scenes." },
  { id: "scenes", icon: Clapperboard, title: "Scenes", kicker: "Direct every moment", body: "Create a shot plan with talking-head moments, b-roll, cutaways, overlays, transitions and visual prompts sized for vertical video." },
  { id: "voice", icon: Mic2, title: "Voice & sound", kicker: "Make it feel human", body: "Set narration energy, pacing, pauses and sound direction so the output matches the creator or brand instead of sounding synthetic." },
  { id: "captions", icon: Captions, title: "Captions", kicker: "Designed for silent viewing", body: "Create timed subtitles with phrase-level emphasis, line breaks and safe-zone placement for fast mobile comprehension." },
  { id: "variants", icon: Share2, title: "Variants", kicker: "One concept, many cuts", body: "Create alternate hooks, lengths, captions and platform variants for Instagram Reels, YouTube Shorts and other short-form channels." },
  { id: "localize", icon: Languages, title: "Localize", kicker: "Adapt, don't just translate", body: "Rewrite voice, slang, pacing and cultural references for different languages and audiences while preserving the core idea." },
  { id: "cover", icon: ImageIcon, title: "Cover", kicker: "Earn the tap", body: "Generate cover-frame direction, headline options and composition guidance that still looks native inside a creator feed." },
];

export function MultimodalStudio() {
  const [active, setActive] = useState(STEPS[0]);
  const Icon = active.icon;

  return (
    <section id="multimodal" className="mx-auto max-w-[1500px] px-6 py-20 md:px-10 lg:py-28">
      <div className="max-w-3xl">
        <div className="text-sm font-bold text-pink-300">FROM BRIEF TO PUBLISHABLE REEL</div>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Everything a strong short-form post needs.</h2>
        <p className="mt-5 text-lg leading-8 text-slate-400">Zyvoriq is not a one-click video wrapper. It helps shape the creative decisions that determine whether a Reel feels native, relevant and worth watching.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const selected = step.id === active.id;
            return (
              <button key={step.id} onClick={() => setActive(step)} className={`rounded-2xl border p-4 text-left transition ${selected ? "border-pink-300/35 bg-pink-300/10" : "border-white/8 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                <StepIcon className={`h-5 w-5 ${selected ? "text-pink-200" : "text-slate-500"}`} />
                <div className="mt-3 text-sm font-bold text-white">{step.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{step.kicker}</div>
              </button>
            );
          })}
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-7 sm:p-10">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-pink-400/10 blur-3xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.07] text-pink-200"><Icon className="h-5 w-5" /></div>
          <div className="relative mt-7 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{active.kicker}</div>
          <h3 className="relative mt-2 text-3xl font-black tracking-[-0.03em] text-white">{active.title}</h3>
          <p className="relative mt-5 max-w-2xl text-base leading-8 text-slate-300">{active.body}</p>
          <div className="relative mt-8 rounded-2xl border border-white/8 bg-black/20 p-5">
            <div className="text-xs font-bold text-slate-500">CREATIVE PRINCIPLE</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">Every stage stays editable. Generate options, compare them, keep what feels right, and preserve a consistent creator or brand voice across the final cut.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
