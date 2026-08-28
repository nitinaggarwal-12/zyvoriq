"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Upload,
  Sparkles,
  Play,
  Pause,
  CheckCircle,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Zap,
  Volume2,
  Lock
} from "lucide-react";

export function VoiceCloneVault() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasSample, setHasSample] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [cloneReady, setCloneReady] = useState(false);
  const [isPlayingClone, setIsPlayingClone] = useState(false);
  const [voiceName, setVoiceName] = useState("My Executive Neural Twin");
  const [formantF1, setFormantF1] = useState(520); // Hz
  const [formantF2, setFormantF2] = useState(1480); // Hz
  const [breathiness, setBreathiness] = useState(12); // %
  const [vocalWarmth, setVocalWarmth] = useState(78); // %

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording Timer simulation
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            setIsRecording(false);
            setHasSample(true);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setRecordingSeconds(0);
      setHasSample(false);
      setCloneReady(false);
      setIsRecording(true);
    } else {
      setIsRecording(false);
      if (recordingSeconds >= 3) {
        setHasSample(true);
      }
    }
  };

  const handleSimulateUpload = () => {
    setRecordingSeconds(30);
    setHasSample(true);
    setCloneReady(false);
  };

  const handleSynthesizeClone = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setCloneReady(true);
    }, 1400);
  };

  const handlePlayPreview = () => {
    if (isPlayingClone) {
      setIsPlayingClone(false);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      return;
    }

    setIsPlayingClone(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `This is a high-fidelity demonstration of ${voiceName}, cloned with DeepMind neural vocal tract modeling. Zero cloud egress. Encrypted and signed with C2PA Ed25519.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingClone(false);
      utterance.onerror = () => setIsPlayingClone(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingClone(false), 4000);
    }
  };

  return (
    <div className="rounded-3xl border border-teal-500/30 bg-slate-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-serif">
                30-Second Neural Voice Clone Vault
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                DeepMind Vocal Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Record or upload 30s of speech · 5-Band formant extraction · Zero 3rd-party egress
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted in Local Enclave</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Capture & Waveform (7 Cols) + Formant Tuning (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Audio Recording & Waveform Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Audio Sample Capture
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {recordingSeconds < 10 ? `0:0${recordingSeconds}` : `0:${recordingSeconds}`} / 0:30s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleRecord}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    isRecording
                      ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30"
                      : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20"
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? "Stop Recording" : "🔴 Record 30s"}</span>
                </button>

                <button
                  onClick={handleSimulateUpload}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .WAV</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Audio Waveform */}
            <div className="h-28 bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-1">
              {Array.from({ length: 48 }).map((_, idx) => {
                const isPast = (idx / 48) * 30 <= recordingSeconds;
                const baseHeight = ((idx * 17) % 65) + 20;
                const dynamicHeight = isRecording ? ((Math.sin(idx + recordingSeconds) + 1) * 35) + 15 : baseHeight;
                return (
                  <div
                    key={idx}
                    style={{ height: isPast ? `${dynamicHeight}%` : "12%" }}
                    className={`flex-1 rounded-full transition-all duration-100 ${
                      isPast
                        ? isRecording
                          ? "bg-gradient-to-t from-rose-500 to-amber-400"
                          : "bg-gradient-to-t from-teal-500 to-emerald-400"
                        : "bg-slate-800"
                    }`}
                  />
                );
              })}
            </div>

            {/* Status & Extraction Trigger */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                {hasSample ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 30s Audio Buffer Ready
                  </span>
                ) : (
                  <span className="text-slate-500">Awaiting audio sample...</span>
                )}
              </div>

              <button
                onClick={handleSynthesizeClone}
                disabled={!hasSample || isSynthesizing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isSynthesizing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting 512-dim Embedding...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>⚡ Clone Neural Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Formant Synthesis & Output Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-400" /> Formant Resonance & Warmth
              </label>
              <span className="text-[10px] font-mono text-slate-500">5-Band Acoustic Tract</span>
            </div>

            {/* Voice Name Input */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Custom Voice Label
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* F1 Formant Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">F1 Throat Cavity Resonance</span>
                <span className="text-teal-400 font-bold">{formantF1} Hz</span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                value={formantF1}
                onChange={(e) => setFormantF1(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* F2 Formant Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">F2 Oral Tract Articulation</span>
                <span className="text-teal-400 font-bold">{formantF2} Hz</span>
              </div>
              <input
                type="range"
                min="900"
                max="2400"
                value={formantF2}
                onChange={(e) => setFormantF2(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Vocal Warmth Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Vocal Warmth / Bass Response</span>
                <span className="text-amber-400 font-bold">{vocalWarmth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={vocalWarmth}
                onChange={(e) => setVocalWarmth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Instant Playback Button */}
            <div className="pt-2">
              <button
                onClick={handlePlayPreview}
                disabled={!cloneReady}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  cloneReady
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isPlayingClone ? "animate-spin" : ""}`} />
                <span>{isPlayingClone ? "Playing Cloned Voice..." : cloneReady ? "🔊 Test Cloned Voice Speech" : "Complete 30s Sample to Test"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
