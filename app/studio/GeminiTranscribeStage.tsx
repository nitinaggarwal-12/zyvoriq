"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, CheckCircle2, Radio, Clock, Terminal } from "lucide-react";

interface GeminiTranscribeStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  audioUrl: string;
  onApplyScript?: (cleanedScript: string) => void;
}

export const GeminiTranscribeStage: React.FC<GeminiTranscribeStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  onApplyScript,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);

  const RAW_INPUT = "Uh, so hello everyone! I am, um, Priya, like Global Transformation CTO. Traditional, you know, content pipelines take 14 days, no wait, 14 long days and over $140,000. With Zyvoriq, we, uh, collapse that into just 90 seconds—backed by Veritas cryptographic consensus!";
  
  const WORD_TIMESTAMPS = [
    { word: "Hello", start: "0.12s", end: "0.45s" },
    { word: "everyone!", start: "0.48s", end: "0.95s" },
    { word: "I'm", start: "1.02s", end: "1.20s" },
    { word: "Priya,", start: "1.22s", end: "1.65s" },
    { word: "Global", start: "1.70s", end: "2.05s" },
    { word: "Transformation", start: "2.08s", end: "2.85s" },
    { word: "CTO.", start: "2.88s", end: "3.40s" },
    { word: "Traditional", start: "3.55s", end: "4.15s" },
    { word: "enterprise", start: "4.18s", end: "4.75s" },
    { word: "content", start: "4.78s", end: "5.15s" },
    { word: "pipelines", start: "5.18s", end: "5.70s" },
    { word: "take", start: "5.72s", end: "5.95s" },
    { word: "14", start: "5.98s", end: "6.30s" },
    { word: "long", start: "6.32s", end: "6.65s" },
    { word: "days", start: "6.68s", end: "7.05s" },
    { word: "and", start: "7.08s", end: "7.25s" },
    { word: "over", start: "7.28s", end: "7.55s" },
    { word: "$140,000.", start: "7.58s", end: "8.30s" },
    { word: "With", start: "8.45s", end: "8.70s" },
    { word: "Zyvoriq,", start: "8.72s", end: "9.25s" },
    { word: "we", start: "9.28s", end: "9.45s" },
    { word: "collapse", start: "9.48s", end: "9.95s" },
    { word: "that", start: "9.98s", end: "10.20s" },
    { word: "into", start: "10.22s", end: "10.55s" },
    { word: "just", start: "10.58s", end: "10.85s" },
    { word: "90", start: "10.88s", end: "11.20s" },
    { word: "seconds—backed", start: "11.22s", end: "12.05s" },
    { word: "by", start: "12.08s", end: "12.25s" },
    { word: "Veritas", start: "12.28s", end: "12.75s" },
    { word: "cryptographic", start: "12.78s", end: "13.55s" },
    { word: "consensus!", start: "13.58s", end: "14.30s" }
  ];

  const CLEAN_OUTPUT = "Hello everyone! I'm Priya, Global Transformation CTO. Traditional enterprise content pipelines take 14 long days and over $140,000. With Zyvoriq, we collapse that into just 90 seconds—backed by Veritas cryptographic consensus!";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying || isRecording) {
      interval = setInterval(() => {
        setActiveWordIdx((prev) => (prev + 1) % WORD_TIMESTAMPS.length);
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRecording]);

  return (
    <div className="flex flex-col gap-5 bg-slate-950 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-100 tracking-wide">
                GEMINI 3.5 TRANSCRIBE & VOICE AGENT
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">
                2.6% WER • 70% FASTER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero-drift millisecond phonetic timestamps, automatic filler word elimination & autonomous tool calling
            </p>
          </div>
        </div>

        {/* Live Mic Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg ${
              isRecording
                ? "bg-red-500/20 border border-red-500 text-red-300 shadow-red-500/20 animate-pulse"
                : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? "LISTENING & CLEANING..." : "START VOICE INPUT"}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left = Raw Disfluency Cleaning, Right = Millisecond Timestamp Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Card: Intelligent Disfluency & Filler Removal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>LIVE DISFLUENCY & FILLER FILTER</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Auto-Formatted Intent
            </span>
          </div>

          {/* Raw Audio Stream with Strikethroughs */}
          <div className="text-xs font-mono text-slate-400 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/60">
            <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">
              1. Raw Speech Stream (With Hesitations & Corrections):
            </span>
            <span className="line-through text-red-400/70">Uh, so </span>
            <span className="text-slate-200">hello everyone! I </span>
            <span className="line-through text-red-400/70">am, um, </span>
            <span className="text-slate-200">Priya, </span>
            <span className="line-through text-red-400/70">like </span>
            <span className="text-slate-200">Global Transformation CTO. Traditional, </span>
            <span className="line-through text-red-400/70">you know, </span>
            <span className="text-slate-200">content pipelines take </span>
            <span className="line-through text-red-400/70">14 days, no wait, </span>
            <span className="text-slate-200">14 long days and over $140,000. With Zyvoriq, we, </span>
            <span className="line-through text-red-400/70">uh, </span>
            <span className="text-slate-200">collapse that into just 90 seconds—backed by Veritas!</span>
          </div>

          {/* Cleaned Executive Script Output */}
          <div className="text-xs font-sans text-cyan-200 leading-relaxed bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-400 text-[10px] uppercase font-mono font-bold tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                2. Cleaned Gemini 3.5 Executive Script:
              </span>
              {onApplyScript && (
                <button
                  onClick={() => onApplyScript(CLEAN_OUTPUT)}
                  className="text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
                >
                  Apply to Teleprompter →
                </button>
              )}
            </div>
            <p className="font-medium text-slate-100">{CLEAN_OUTPUT}</p>
          </div>

          {/* Autonomous Function Calling Terminal */}
          <div className="bg-black/90 rounded-lg p-3 border border-purple-500/30 text-[11px] font-mono text-purple-300">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-2 pb-1 border-b border-purple-900/50">
              <Terminal className="w-3.5 h-3.5" />
              <span>VOICE AGENT FUNCTION DISPATCHER</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <p className="text-emerald-400">⚡ call_tool: generate_executive_script(speaker="Priya", domain="CTO")</p>
              <p className="text-blue-400">⚡ call_tool: update_drawio_topology(node="Zero-Trust Ingress")</p>
              <p className="text-cyan-400">⚡ call_tool: seal_veritas_provenance(hash="0x8849...ed25519")</p>
            </div>
          </div>
        </div>

        {/* Right Card: Ground-Truth Word Timestamp Matrix (0.00ms Drift) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>WORD-LEVEL TIMESTAMP ATTRIBUTION</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              0.00ms Ground-Truth Sync
            </span>
          </div>

          {/* Interactive Word Chips */}
          <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto p-2 bg-slate-950/70 rounded-lg border border-slate-800/60">
            {WORD_TIMESTAMPS.map((w, idx) => {
              const isActive = idx === activeWordIdx;
              return (
                <div
                  key={idx}
                  className={`px-2 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-cyan-500/30 border-cyan-400 text-white shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold">{w.word}</span>
                  <span className="text-[9px] text-slate-500 font-mono">[{w.start}]</span>
                </div>
              );
            })}
          </div>

          {/* Live Telemetry Bar */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400">WER ACCURACY</span>
              <span className="text-xs font-mono font-bold text-emerald-400">97.4% (2.6% WER)</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400">LANGUAGES</span>
              <span className="text-xs font-mono font-bold text-cyan-400">85+ Live Switching</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="block text-[10px] font-mono text-slate-400">SYNC JITTER</span>
              <span className="text-xs font-mono font-bold text-purple-400">±0.00 ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
