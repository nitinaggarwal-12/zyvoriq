"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Bot, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  Save, 
  Play, 
  Square, 
  Sliders, 
  ScreenShare, 
  ShieldCheck, 
  Shirt, 
  MessageSquare,
  Zap,
  Layers,
  Award
} from "lucide-react";
import { 
  AvatarProfilePreference, 
  DEFAULT_AVATAR_PREFERENCE, 
  ATTIRE_PRESETS, 
  TONE_PRESETS, 
  COPILOT_SCREEN_MODES, 
  loadSavedAvatarPreference, 
  saveAvatarPreference 
} from "@/lib/profile/avatarPreferencesEngine";
import { GLOBAL_CHARACTERS, CharacterProfile } from "@/lib/tier6/characters";

const AVATAR_IMAGE_MAP: Record<string, string> = {
  elena: "/assets/avatars/avatar_elena_founder.jpg",
  priya: "/assets/avatars/avatar_priya_cto.jpg",
  marcus: "/assets/avatars/avatar_keynote_gesture.jpg",
  david: "/assets/avatars/avatar_executive_gravitas.jpg",
  celeste: "/assets/avatars/avatar_female_executive.jpg",
  maya: "/assets/avatars/avatar_maya_fireside.jpg",
  ren_aoi: "/assets/avatars/avatar_fireside_journey.jpg"
};

export function AvatarProfileCustomizer() {
  const [pref, setPref] = useState<AvatarProfilePreference>(DEFAULT_AVATAR_PREFERENCE);
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  useEffect(() => {
    setPref(loadSavedAvatarPreference());
  }, []);

  const handleSelectCharacter = (char: CharacterProfile) => {
    const matchedImg = AVATAR_IMAGE_MAP[char.id] || "/assets/avatars/avatar_elena_founder.jpg";
    setPref(prev => ({
      ...prev,
      avatarId: char.id,
      avatarName: char.name,
      avatarRole: char.role,
      avatarImage: matchedImg,
      audioVoiceName: `DeepMind Neural Voice (${char.name})`
    }));
  };

  const handlePlayAudition = () => {
    if (isPlayingAudition) {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setIsPlayingAudition(false);
      return;
    }

    setIsPlayingAudition(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `Greetings! I am ${pref.avatarName}, your preferred virtual support and screen-sharing copilot. I am dressed in ${pref.attireLabel}, communicating in a ${pref.toneLabel} tone. How can I assist your creative workflow today?`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pref.audioPitch;
      utterance.rate = pref.audioRate;
      utterance.onend = () => setIsPlayingAudition(false);
      utterance.onerror = () => setIsPlayingAudition(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudition(false), 3000);
    }
  };

  const handleSaveToProfile = () => {
    saveAvatarPreference(pref);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3500);
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Alert */}
      {savedSuccessToast && (
        <div className="fixed top-20 right-8 z-50 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 px-6 py-4 text-emerald-200 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="font-bold text-xs">Profile Avatar Saved Successfully!</div>
            <div className="text-[10px] text-emerald-300">
              {pref.avatarName} ({pref.attireLabel}) is now active in chat &amp; screen sharing.
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Choose Persona Base (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Bot className="h-4 w-4" />
              <span>1. Choose Persona Identity</span>
            </div>
            <p className="text-xs text-slate-400">
              Select the virtual human identity that will represent your live concierge, voice assistant, and screen-sharing copilot.
            </p>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {GLOBAL_CHARACTERS.map((char) => {
                const isSelected = pref.avatarId === char.id;
                const imgUrl = AVATAR_IMAGE_MAP[char.id];
                return (
                  <div
                    key={char.id}
                    onClick={() => handleSelectCharacter(char)}
                    className={`cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all duration-200 ${
                      isSelected
                        ? "border-teal-500 bg-teal-950/30 ring-2 ring-teal-500/30"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700 flex items-center justify-center">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={char.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{char.avatarEmoji}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{char.name}</span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />}
                      </div>
                      <div className="text-[10px] text-teal-300 truncate">{char.role}</div>
                      <div className="text-[9px] text-slate-400 truncate">{char.specialty}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Wardrobe Attire, Tone & Copilot Mode (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Wardrobe Attire Selector */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Shirt className="h-4 w-4" />
              <span>2. Choose Wardrobe &amp; Attire</span>
            </div>

            <div className="space-y-2">
              {ATTIRE_PRESETS.map((att) => {
                const isSelected = pref.attire === att.id;
                return (
                  <div
                    key={att.id}
                    onClick={() => setPref(prev => ({ ...prev, attire: att.id, attireLabel: att.label }))}
                    className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-950/30 ring-2 ring-teal-500/20"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xl">{att.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-xs text-white">{att.label}</div>
                      <div className="text-[10px] text-slate-400">{att.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversational Tone */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <MessageSquare className="h-4 w-4" />
              <span>3. Conversational Tone &amp; Style</span>
            </div>

            <div className="space-y-2">
              {TONE_PRESETS.map((t) => {
                const isSelected = pref.tone === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setPref(prev => ({ ...prev, tone: t.id, toneLabel: t.label }))}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/20"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{t.label}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Screen Share Copilot Mode */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <ScreenShare className="h-4 w-4" />
              <span>4. Screen Sharing Copilot Behavior</span>
            </div>

            <div className="space-y-2">
              {COPILOT_SCREEN_MODES.map((mode) => {
                const isSelected = pref.copilotScreenMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setPref(prev => ({ ...prev, copilotScreenMode: mode.id, copilotScreenModeLabel: mode.label }))}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{mode.label}</div>
                    <div className="text-[10px] text-slate-400">{mode.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Column 3: Live Preview Stage, Neural Voice Pitch & Save (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <Sparkles className="h-4 w-4" />
                <span>Live Avatar Preview Stage</span>
              </div>
              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-mono text-teal-300">
                Real-Time Render
              </span>
            </div>

            {/* Avatar Visual Preview Frame */}
            <div className="relative aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4">
              {pref.avatarImage ? (
                <Image
                  src={pref.avatarImage}
                  alt={pref.avatarName}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              ) : (
                <Bot className="h-24 w-24 text-teal-400" />
              )}

              {/* Holographic Overlay Badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                <div className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>{pref.avatarName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {pref.attire.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">{pref.avatarRole}</div>
                <div className="text-[10px] text-teal-400 font-mono">Tone: {pref.toneLabel}</div>
              </div>
            </div>

            {/* Neural Voice Settings */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-teal-400" /> Neural Speech Pacing
                </span>
                <button
                  onClick={handlePlayAudition}
                  className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-obsidian-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  {isPlayingAudition ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                  <span>{isPlayingAudition ? "Stop Audio" : "Test Spoken Voice"}</span>
                </button>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Vocal Pitch:</span>
                  <span className="text-teal-300">{pref.audioPitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={pref.audioPitch}
                  onChange={e => setPref(prev => ({ ...prev, audioPitch: parseFloat(e.target.value) }))}
                  className="w-full accent-teal-500 bg-slate-800 h-1 rounded"
                />
              </div>

              {/* Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Cadence Speed:</span>
                  <span className="text-teal-300">{pref.audioRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={pref.audioRate}
                  onChange={e => setPref(prev => ({ ...prev, audioRate: parseFloat(e.target.value) }))}
                  className="w-full accent-teal-500 bg-slate-800 h-1 rounded"
                />
              </div>
            </div>

            {/* Save to Profile Button */}
            <button
              onClick={handleSaveToProfile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-obsidian-950 font-bold text-xs shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Preferred Avatar &amp; Voice to Profile</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
