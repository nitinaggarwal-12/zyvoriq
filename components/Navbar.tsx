"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, FileText, Users, Edit3, PlayCircle, HelpCircle, X } from "lucide-react";

export function Navbar() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    const handleStepSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ step: number }>;
      if (customEvent.detail?.step) {
        setActiveStep(customEvent.detail.step);
      }
    };
    const handleOpenGuide = () => setShowGuideModal(true);
    window.addEventListener("zyvoriq-wizard-step-changed", handleStepSync);
    window.addEventListener("zyvoriq-open-guide-modal", handleOpenGuide);
    return () => {
      window.removeEventListener("zyvoriq-wizard-step-changed", handleStepSync);
      window.removeEventListener("zyvoriq-open-guide-modal", handleOpenGuide);
    };
  }, []);

  const selectStep = (step: number) => {
    setActiveStep(step);
    window.dispatchEvent(
      new CustomEvent("zyvoriq-set-wizard-step", { detail: { step } })
    );
  };

  const steps = [
    {
      num: 1,
      title: "Write Story & Music",
      subtitle: "Type 1 sentence or click Surprise Me",
      icon: FileText,
      activeGradient: "from-indigo-600 to-purple-600 border-indigo-400",
    },
    {
      num: 2,
      title: "Pick Cast & Outfits",
      subtitle: "1+ Avatars • Individual & Together Preview",
      icon: Users,
      activeGradient: "from-pink-600 to-purple-600 border-pink-400",
    },
    {
      num: 3,
      title: "Edit & Save 6 Shots",
      subtitle: "Edit scene text & Save Blueprint",
      icon: Edit3,
      activeGradient: "from-amber-600 to-orange-600 border-amber-400",
    },
    {
      num: 4,
      title: "Render & Save Video",
      subtitle: "Start 60s Generation & Download MP4",
      icon: PlayCircle,
      activeGradient: "from-emerald-600 to-teal-600 border-emerald-400",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-none bg-[#0a0f1d]/95 backdrop-blur-xl border-b border-indigo-500/25 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-none px-3 h-16 flex items-center justify-between gap-3">
          {/* Left: Google Stitch Studio Identity */}
          <button
            type="button"
            onClick={() => selectStep(1)}
            className="flex items-center gap-3 group shrink-0 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">
                  Zyvoriq Studio
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Google Stitch Single-Page UI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden xl:inline">
                Follow Steps 1 → 2 → 3 → 4 below • Zero extra pages
              </span>
            </div>
          </button>

          {/* Center: 4 Interactive Guided Step Pills */}
          <nav className="hidden md:flex items-center gap-2">
            {steps.map((s, idx) => {
              const IconComp = s.icon;
              const isActive = activeStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => selectStep(s.num)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2.5 border cursor-pointer ${
                      isActive
                        ? `bg-gradient-to-r ${s.activeGradient} text-white shadow-lg scale-[1.02]`
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive
                          ? "bg-white text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {s.num}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-extrabold leading-tight flex items-center gap-1">
                        <IconComp className="w-3 h-3" /> {s.title}
                      </span>
                      <span className="text-[10px] opacity-85 leading-tight hidden lg:inline">
                        {s.subtitle}
                      </span>
                    </div>
                  </button>
                  {idx < steps.length - 1 && (
                    <span className="text-slate-600 font-black text-xs select-none">
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right: Quick 30s Guide Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/40 text-teal-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Where to Click? (Guide)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#0f1629] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-black text-white">
                  🧭 Single-Page Google Stitch Studio — How Everything Works
                </h2>
                <p className="text-xs text-slate-400">
                  All old pages have been removed. Everything happens right here in 4 guided steps:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                onClick={() => {
                  selectStep(1);
                  setShowGuideModal(false);
                }}
                className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1 cursor-pointer hover:border-indigo-400"
              >
                <div className="font-black text-indigo-300">
                  STEP 1: Write Story &amp; Music
                </div>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>What to type:</strong> Type 1 sentence describing your video (or click <strong>&ldquo;🎲 Surprise Me&rdquo;</strong> for a brand-new story, cast &amp; song).<br />
                  • <strong>Where to click:</strong> Click <strong>&ldquo;Next: Step 2 (Pick Cast &amp; Outfits) →&rdquo;</strong>.
                </p>
              </div>

              <div
                onClick={() => {
                  selectStep(2);
                  setShowGuideModal(false);
                }}
                className="p-3.5 rounded-xl bg-pink-950/40 border border-pink-500/30 space-y-1 cursor-pointer hover:border-pink-400"
              >
                <div className="font-black text-pink-300">
                  STEP 2: Pick Cast, Faces &amp; Outfits
                </div>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>What to click:</strong> Select 1 or more avatars (`Solo`, `Duet`, `Trio`, `Quartet`) or click <strong>&ldquo;+ Create New Avatar&rdquo;</strong> (Prompt / Upload Photo / URL). Pick Scene 1 &amp; Scene 2 outfits.<br />
                  • <strong>Live Preview:</strong> Look at the Right Panel to see each person <strong>Individually</strong> and <strong>Together on Stage</strong>!
                </p>
              </div>

              <div
                onClick={() => {
                  selectStep(3);
                  setShowGuideModal(false);
                }}
                className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1 cursor-pointer hover:border-amber-400"
              >
                <div className="font-black text-amber-300">
                  STEP 3: Edit &amp; Save 6-Shot Storyboard
                </div>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>How to edit:</strong> Type inside any of the 6 Shot boxes (`Shot 1` to `Shot 6`) to edit the camera angle, action, or wardrobe.<br />
                  • <strong>How to save:</strong> Click <strong>&ldquo;💾 Save Project Blueprint&rdquo;</strong> to save your work at any time.
                </p>
              </div>

              <div
                onClick={() => {
                  selectStep(4);
                  setShowGuideModal(false);
                }}
                className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 cursor-pointer hover:border-emerald-400"
              >
                <div className="font-black text-emerald-300">
                  STEP 4: Start Generation &amp; Download MP4
                </div>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>How to start generation:</strong> Click the green <strong>&ldquo;🎬 START 60s VIDEO GENERATION&rdquo;</strong> button.<br />
                  • <strong>How to watch &amp; download:</strong> Watch your 60s reel on the right player and click <strong>&ldquo;⬇️ Download 60s Master MP4&rdquo;</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer"
              >
                Got It — Take Me to the Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
