"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Users,
  User,
  Video,
  Layers,
  Palette,
  Globe,
  Clock,
  Copy,
  Check,
  X,
  Wand2,
  Tv,
  Film,
  Camera,
  MessageSquare,
  Flame,
  LayoutGrid,
  ChevronRight
} from "lucide-react";

export interface GeneratedPromptResult {
  topicBrief: string;
  cinematicDirection: string;
  language: string;
  aspectRatio: string;
  duration: string;
  genre: string;
  framing: string;
}

interface PromptDirectorBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (result: GeneratedPromptResult) => void;
}

const FRAMING_OPTIONS = [
  {
    id: "shared_two_shot",
    label: "Shared Two-Shot (Same Frame)",
    badge: "2 in 1 Frame",
    desc: "Both characters visible together in a single continuous cinematic shot (e.g. couple on sofa).",
    icon: Users
  },
  {
    id: "solo_host",
    label: "Solo Presenter / Vlog",
    badge: "1 Host",
    desc: "Single host in dynamic medium/close-up with punch-in zooms.",
    icon: User
  },
  {
    id: "family_ensemble",
    label: "Family Ensemble (3+ People)",
    badge: "Full Group",
    desc: "Multiple family members interacting in living room or dinner table.",
    icon: LayoutGrid
  },
  {
    id: "multi_cam_cuts",
    label: "Rapid Multi-Cam Cuts",
    badge: "Cross-Cut",
    desc: "Shot-reverse-shot cross-cutting between characters for rapid comedic punchlines.",
    icon: Film
  },
  {
    id: "split_screen",
    label: "Split-Screen Dual Host",
    badge: "Side-by-Side",
    desc: "Vertical or horizontal split for podcast debates or reaction comedy.",
    icon: Tv
  }
];

const GENRE_THEMES = [
  {
    id: "domestic_comedy",
    label: "😂 Domestic Family Comedy & Banter",
    defaultPremise: "Husband frantically searching for his car keys while wife finds them in 2 seconds in plain sight, ending with him making tea for forgiveness.",
    culture: "Indian household, witty banter, relatable saas-bahu or couple dynamics."
  },
  {
    id: "ai_tech_satire",
    label: "🤖 Tech & AI Corporate Satire",
    defaultPremise: "Stand-up sketch roasting corporate AI buzzwords, endless Zoom alignments, and unaligned coffee machines.",
    culture: "Silicon Valley startup vibe, deadpan delivery, rapid buzzwords."
  },
  {
    id: "kaizen_martial",
    label: "⚔️ Samurai & Kaizen Philosophy",
    defaultPremise: "Sensei teaches student the concept of Mushin (Mind without Mind) during a night thunderstorm duel on a wooden dojo balcony.",
    culture: "Traditional Japanese aesthetic, stoic wisdom, intense visual contrast."
  },
  {
    id: "biohacking_habits",
    label: "🧬 Biohacking & Morning Routines",
    defaultPremise: "3 morning habits quietly wrecking dopamine sensitivity and how a 2-minute cold shock resets focus.",
    culture: "Modern neuroscience, high-performance executive lifestyle."
  },
  {
    id: "true_crime_noir",
    label: "🕵️ Noir Mystery & Crime Investigation",
    defaultPremise: "Late-night detective in 1940s rainy Chicago piecing together the last seen clues under flickering neon light.",
    culture: "Classic noir cinema, trenchcoats, atmospheric jazz saxophone."
  },
  {
    id: "cyberpunk_scifi",
    label: "🚀 Cyberpunk Neo-Tokyo Lore",
    defaultPremise: "Rooftop synth duel between two neural hackers overclocking their cyberware against holographic billboards.",
    culture: "Futuristic dystopian megacity, high-energy synth music."
  }
];

const SETTINGS_LOCATIONS = [
  { id: "living_room_sofa", label: "Modern Living Room (Sofa & Table)" },
  { id: "indian_kitchen", label: "Cozy Kitchen with Steaming Chai" },
  { id: "wooden_dojo", label: "Rain-Slicked Wooden Dojo Balcony" },
  { id: "cyberpunk_rooftop", label: "Neon Holographic Rooftop Skyline" },
  { id: "podcast_studio", label: "Dark Studio with Acoustic Foam & Neon Tubes" },
  { id: "coffee_shop", label: "Warm Sunlight Artisan Coffee Cafe" }
];

const LANGUAGE_OPTIONS = [
  { code: "hi", name: "Hindi / Hinglish (Relatable Indian Timing)", studioLang: "hi-IN" },
  { code: "en", name: "English (US Fast Social Pacing)", studioLang: "en-US" },
  { code: "ja", name: "Japanese (Dramatic Anime Stems)", studioLang: "ja-JP" },
  { code: "es", name: "Spanish (Warm & Expressive)", studioLang: "es-ES" }
];

const VISUAL_AESTHETICS = [
  { id: "photoreal_8k", label: "8K Photorealistic Cinema (Natural Bokeh)" },
  { id: "ufotable_anime", label: "Ufotable High-Octane Anime Style" },
  { id: "sitcom_bright", label: "Bright TV Sitcom Multi-Cam Studio" },
  { id: "cyberpunk_neon", label: "High-Contrast Cyberpunk Neon" },
  { id: "vintage_technicolor", label: "Vintage 1970s 35mm Technicolor" }
];

export function PromptDirectorBuilderModal({
  isOpen,
  onClose,
  onApplyPrompt
}: PromptDirectorBuilderModalProps) {
  const [framing, setFraming] = useState<string>("shared_two_shot");
  const [genre, setGenre] = useState<string>("domestic_comedy");
  const [customTopic, setCustomTopic] = useState<string>(GENRE_THEMES[0].defaultPremise);
  const [setting, setSetting] = useState<string>("living_room_sofa");
  const [language, setLanguage] = useState<string>("hi");
  const [visualAesthetic, setVisualAesthetic] = useState<string>("photoreal_8k");
  const [aspectRatio, setAspectRatio] = useState<string>("9:16");
  const [duration, setDuration] = useState<string>("30");
  const [copied, setCopied] = useState(false);

  const selectedTheme = GENRE_THEMES.find(g => g.id === genre) || GENRE_THEMES[0];
  const selectedFraming = FRAMING_OPTIONS.find(f => f.id === framing) || FRAMING_OPTIONS[0];
  const selectedLang = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];
  const selectedSetting = SETTINGS_LOCATIONS.find(s => s.id === setting) || SETTINGS_LOCATIONS[0];
  const selectedVisual = VISUAL_AESTHETICS.find(v => v.id === visualAesthetic) || VISUAL_AESTHETICS[0];

  const handleSelectGenre = (themeId: string) => {
    setGenre(themeId);
    const theme = GENRE_THEMES.find(g => g.id === themeId);
    if (theme) {
      setCustomTopic(theme.defaultPremise);
      if (themeId === "domestic_comedy") {
        setLanguage("hi");
        setSetting("living_room_sofa");
        setFraming("shared_two_shot");
      } else if (themeId === "kaizen_martial") {
        setSetting("wooden_dojo");
        setVisualAesthetic("ufotable_anime");
      } else if (themeId === "cyberpunk_scifi") {
        setSetting("cyberpunk_rooftop");
        setVisualAesthetic("cyberpunk_neon");
      }
    }
  };

  const synthesizedTopicBrief = useMemo(() => {
    return customTopic.trim() || selectedTheme.defaultPremise;
  }, [customTopic, selectedTheme]);

  const synthesizedCinematicDirection = useMemo(() => {
    const framingText =
      framing === "shared_two_shot"
        ? "Medium cinematic two-shot with both characters visible side-by-side in the same frame"
        : framing === "solo_host"
        ? "Dynamic medium close-up of solo presenter addressing camera"
        : framing === "family_ensemble"
        ? "Wide family ensemble shot with multiple characters interacting in the room"
        : framing === "multi_cam_cuts"
        ? "Multi-cam shot-reverse-shot cutting rapidly on comedic beats"
        : "Split-screen dual-view layout with synchronized reactions";

    const langText =
      language === "hi"
        ? "Natural conversational Hindi / Hinglish with authentic cultural comedic timing"
        : language === "ja"
        ? "Dramatic Japanese dialogue with rich vocal cadence"
        : "Crisp, punchy English social dialogue";

    return `${framingText}. Setting: ${selectedSetting.label}. Visual Style: ${selectedVisual.label}. Language & Dialogue: ${langText}. Aspect Ratio: ${aspectRatio}. Narrative Hook: \"${synthesizedTopicBrief}\". 8K resolution, color-graded, zero distortion, master production quality.`;
  }, [framing, selectedSetting, selectedVisual, language, aspectRatio, synthesizedTopicBrief]);

  const handleCopy = () => {
    navigator.clipboard.writeText(synthesizedCinematicDirection);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyPrompt({
      topicBrief: synthesizedTopicBrief,
      cinematicDirection: synthesizedCinematicDirection,
      language: selectedLang.studioLang,
      aspectRatio,
      duration,
      genre,
      framing
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-[28px] border border-white/10 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-obsidian-950 shadow-lg shadow-teal-500/20 font-black">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">AI Prompt Director & Character Framing Builder</h2>
                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-black text-teal-300 font-mono">
                  REAL-TIME SYNTHESIS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your characters, camera framing, language, and theme to generate production-ready prompts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-COLUMN BUILDER */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: INTERACTIVE CONTROLS (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. CHARACTER & CAMERA FRAMING */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> 1. Cast & Frame Composition
                </label>
                <span className="text-[11px] font-bold text-slate-400">{selectedFraming.badge}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FRAMING_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = framing === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFraming(opt.id)}
                      className={`text-left rounded-2xl border p-3 transition flex flex-col justify-between ${
                        isSelected
                          ? "border-teal-400 bg-teal-500/15 shadow-md shadow-teal-500/10"
                          : "border-white/10 bg-slate-900/60 hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-teal-300" : "text-slate-400"}`} />
                          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. GENRE & PRESET THEMES */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> 2. Story Genre & Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRE_THEMES.map((theme) => {
                  const isSelected = genre === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectGenre(theme.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold text-left transition flex items-center justify-between ${
                        isSelected
                          ? "border-teal-400 bg-teal-500/15 text-white shadow-sm"
                          : "border-white/10 bg-slate-900/60 text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. PREMISE OR CUSTOM TOPIC INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> 3. Story Premise / Dialogue Hook
              </label>
              <textarea
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white outline-none focus:border-teal-400 leading-relaxed"
                placeholder="Describe the specific joke, conflict, or story beats..."
              />
            </div>

            {/* 4. SETTING, LANGUAGE, AESTHETIC 3-WAY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Scene Setting</label>
                <select
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/90 p-2 text-xs text-slate-200 outline-none focus:border-teal-400"
                >
                  {SETTINGS_LOCATIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Language & Nuance</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/90 p-2 text-xs text-slate-200 outline-none focus:border-teal-400"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Visual Aesthetic</label>
                <select
                  value={visualAesthetic}
                  onChange={(e) => setVisualAesthetic(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/90 p-2 text-xs text-slate-200 outline-none focus:border-teal-400"
                >
                  {VISUAL_AESTHETICS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. DURATION & ASPECT RATIO */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/90 p-2 text-xs text-slate-200 outline-none focus:border-teal-400"
                >
                  <option value="9:16">9:16 (TikTok/Reels/Shorts)</option>
                  <option value="16:9">16:9 (YouTube Widescreen)</option>
                  <option value="1:1">1:1 (Square Feed)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Target Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/90 p-2 text-xs text-slate-200 outline-none focus:border-teal-400"
                >
                  <option value="15">15s (Ultra High Retention)</option>
                  <option value="30">30s (Standard Viral)</option>
                  <option value="60">60s (Deep Narrative)</option>
                  <option value="90">90s (Masterclass)</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE SYNTHESIZED DIRECTOR PROMPT (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs font-black uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Synthesized Director Prompt
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Prompt Preview Box */}
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Story / Dialogue Brief:</div>
                  <div className="mt-1 rounded-xl border border-white/5 bg-black/40 p-3 text-xs text-white leading-relaxed max-h-32 overflow-y-auto">
                    {synthesizedTopicBrief}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Engine Camera & Render Prompt:</div>
                  <div className="mt-1 rounded-xl border border-white/5 bg-black/40 p-3 text-[11px] font-mono text-teal-200/90 leading-relaxed max-h-40 overflow-y-auto">
                    {synthesizedCinematicDirection}
                  </div>
                </div>
              </div>
            </div>

            {/* PRIMARY ACTION BUTTONS */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 py-3 text-xs font-black text-obsidian-950 shadow-lg shadow-teal-500/20 hover:from-teal-300 hover:to-cyan-300 active:scale-[0.98] transition"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>✨ Apply Prompt to Studio & Build Plan</span>
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
