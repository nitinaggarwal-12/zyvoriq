"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Zap,
  ArrowLeft,
  Tv,
  Palette,
  Loader2,
  Lightbulb,
  Clapperboard,
  Flame,
  Smile,
  ShieldCheck,
  Heart
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

function AnimationCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [animeStyle, setAnimeStyle] = useState("pixar_3d");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setTopic(q);
    }
  }, [searchParams]);

  const handleSurprisePrompt = (mode: "kids" | "anime") => {
    if (mode === "kids") {
      const kidsIdeas = [
        "A Pixar 3D bedtime story about a curious little robot named Pip who wants to plant a glowing blue flower on the moon with his loyal mechanical puppy",
        "A gentle Studio Ghibli-style watercolor tale of a lost baby dragon finding a cozy bakery in a magical mountain village and helping bake star-bread",
        "A colorful 3D animated undersea adventure where a shy little clownfish discovers glowing coral caves and makes friends with a giant gentle turtle"
      ];
      setTopic(kidsIdeas[Math.floor(Math.random() * kidsIdeas.length)]);
      setAnimeStyle("pixar_3d");
    } else {
      const animeIdeas = [
        "Sensei Ren teaches Apprentice Aoi the forbidden technique of Mushin during a high-octane thunderstorm duel on a rain-slicked wooden dojo balcony with glowing sparks",
        "A cyberpunk mech pilot in Neo-Tokyo awakens ancient holographic runes inside an underground geothermal reactor",
        "An intense Shonen anime tournament clash where two rival warriors unleash golden aura dragon strikes that shatter the mountain arena"
      ];
      setTopic(animeIdeas[Math.floor(Math.random() * animeIdeas.length)]);
      setAnimeStyle("ufotable_cinematic");
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    router.push(`/studio?mode=video_reel&topic=${encodeURIComponent(topic)}&style=${animeStyle}&aspectRatio=${aspectRatio}`);
  };

  const [activeTab, setActiveTab] = useState<"video" | "storyboard" | "acoustics">("video");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <StudioSidebar>
      <main className="flex-1 max-w-7xl w-full max-w-full overflow-x-hidden mx-auto px-5 py-8 md:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/studio/create"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-pink-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Creation Hub
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 font-mono">
              <ShieldCheck className="w-3 h-3" /> KID-SAFE GUARDRAILS
            </span>
            <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] font-black text-pink-300 font-mono">
              🧸 PERSONA #1: PIXAR & 3D ANIMATION
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Kids & Family 3D Animation Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pixar 3D CGI bedtime fairytales, emotional character consistency, and child-safe neural synthesis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            id="tab-btn-video"
            type="button"
            onClick={() => setActiveTab("video")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "video" ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30" : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> 🎬 Master Video Preview
          </button>
          <button
            id="tab-btn-manuscript"
            type="button"
            onClick={() => setActiveTab("storyboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "storyboard" ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30" : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> 🎨 Storyboard & Characters
          </button>
          <button
            id="tab-btn-acoustics"
            type="button"
            onClick={() => setActiveTab("acoustics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "acoustics" ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30" : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> 🎵 Whimsical Acoustics
          </button>
        </div>

        {activeTab === "video" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-pink-500/30 bg-black/80 overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center">
              <video
                src="/assets/video/persona1_pixar_kids_reel.mp4"
                controls
                playsInline
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 rounded-full border border-pink-500/40 bg-black/70 px-3 py-1 text-[10px] font-mono font-bold text-pink-300 backdrop-blur-md">
                1080p60 · PIXAR 3D ENGINE · VERIFIED
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 font-mono">
                  Active Reel Telemetry
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Aspect Ratio</span>
                    <span className="font-mono text-white font-bold">16:9 Landscape</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Subsurface Glow</span>
                    <span className="font-mono text-emerald-400 font-bold">Enabled (0.84)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Voice Actor Matrix</span>
                    <span className="font-mono text-pink-300 font-bold">Pip Junior (Warm Kid)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Audio Ducking</span>
                    <span className="font-mono text-white font-bold">-16dB Bed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/assets/video/persona1_pixar_kids_reel.mp4"
                  download="persona1_pixar_kids_reel.mp4"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold py-2.5 text-xs transition shadow-lg shadow-pink-500/20"
                >
                  📥 Download MP4 Reel (3.2 MB)
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "storyboard" && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-pink-400">ACT 1: THE MOONLIT WORKSHOP</div>
              <p className="text-xs text-slate-300">Pip the Robot tightens his glowing blue heart gear and packs a starry watering can.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-pink-400">ACT 2: CRATER EXPLORATION</div>
              <p className="text-xs text-slate-300">Draco the baby pup dragon bounces across low-gravity moondust, sniffing alien crystals.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-pink-400">ACT 3: THE BLOOMING FLOWER</div>
              <p className="text-xs text-slate-300">The blue flower unfurls neon petals, illuminating the smiling duo against Earth’s reflection.</p>
            </div>
          </div>
        )}

        {activeTab === "acoustics" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-4">
            <h3 className="text-sm font-black text-pink-300 font-mono">Whimsical Orchestral Acoustic Bed</h3>
            <p className="text-xs text-slate-400">Pizzicato strings, celesta bells, and warm French horn melodies mixed with kid-safe dynamic EQ.</p>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-amber-400 w-3/4 animate-pulse" />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-pink-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-pink-400 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Animation Scene & Story Prompt
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSurprisePrompt("kids")}
                className="inline-flex items-center gap-1 text-xs font-bold text-pink-300 hover:text-pink-200 transition bg-pink-400/10 border border-pink-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Smile className="w-3.5 h-3.5 text-pink-300" /> 🧒 Kids & Pixar Idea
              </button>
              <button
                type="button"
                onClick={() => handleSurprisePrompt("anime")}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-purple-200 transition bg-purple-400/10 border border-purple-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-purple-300" /> ⚡ Action Anime Idea
              </button>
            </div>
          </div>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder="Describe your story or scene (e.g. 'A Pixar 3D bedtime story about a curious little robot who wants to plant a glowing blue flower on the moon with his puppy')..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-4 text-base md:text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Animation Aesthetic & Studio Style
            </label>
            <select
              value={animeStyle}
              onChange={(e) => setAnimeStyle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-pink-400"
            >
              <option value="pixar_3d">🧸 Pixar 3D (Subsurface Scattering, Soft Lights, Warm Silhouettes)</option>
              <option value="disney_fairytale">✨ Disney Classic Fairytale (Enchanted Glows & Watercolors)</option>
              <option value="ghibli_pastoral">🍃 Studio Ghibli (Hand-painted Pastoral Meadows & Cozy Magic)</option>
              <option value="ufotable_cinematic">⚔️ Ufotable Action (Demon Slayer Dynamic Spark Effects)</option>
              <option value="makoto_shinkai">🌌 Makoto Shinkai (Hyper-detailed Skies & Raindrops)</option>
              <option value="cyberpunk_anime">⚡ Cyberpunk Action (Neon Cel-Shaded High Octane)</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Character Seed & Cast Lock
            </label>
            <select
              defaultValue="pip_robot"
              className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-pink-400"
            >
              <option value="pip_robot">🤖 Pip the Robot (Curious Explorer with Blue Eyes)</option>
              <option value="luna_fairy">🧚 Luna Fairy (Golden Winged Pixie Companion)</option>
              <option value="draco_pup">🐲 Draco Pup (Friendly Baby Fire Dragon)</option>
              <option value="apprentice_aoi">⚡ Apprentice Aoi (Lightning Katana Prodigy)</option>
              <option value="custom_seed">✨ Dynamic / Custom Prompt Character</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Screen Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio("16:9")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                  aspectRatio === "16:9"
                    ? "border-pink-400 bg-pink-500/20 text-white shadow-md shadow-pink-500/20"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                }`}
              >
                <Tv className="w-4 h-4 text-pink-400" /> 16:9 Cinema
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("9:16")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                  aspectRatio === "9:16"
                    ? "border-pink-400 bg-pink-500/20 text-white shadow-md shadow-pink-500/20"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                }`}
              >
                <Clapperboard className="w-4 h-4 text-pink-400" /> 9:16 Reel
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 py-4 text-sm font-black text-obsidian-950 shadow-xl shadow-pink-500/25 hover:from-pink-400 hover:to-amber-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-obsidian-950" />
              <span>Synthesizing Animation Sequence...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Generate Animation Story</span>
            </>
          )}
        </button>
      </main>
    </StudioSidebar>
  );
}

export default function AnimationCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 text-slate-400 p-8">Loading Animation Studio...</div>}>
      <AnimationCreateContent />
    </Suspense>
  );
}
