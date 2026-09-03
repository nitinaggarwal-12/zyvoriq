"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Sparkles, X, ShieldAlert, ArrowRight, Check } from "lucide-react";

interface CreatorComplianceNotificationBannerProps {
  contentTitle?: string;
  warningAdvisory?: string;
  onApplyRemediation?: () => void;
}

export function CreatorComplianceNotificationBanner({
  contentTitle = "Autonomous AI Video Infrastructure",
  warningAdvisory = "Mandatory Speculative Fiction Disclaimer Required for Global Broadcast",
  onApplyRemediation
}: CreatorComplianceNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHealed, setIsHealed] = useState(false);

  if (!isVisible) return null;

  const handleRemediate = () => {
    setIsHealed(true);
    if (onApplyRemediation) onApplyRemediation();
    setTimeout(() => setIsVisible(false), 4000);
  };

  return (
    <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 my-3">
      <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isHealed
          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
          : "bg-amber-950/40 border-amber-500/50 text-amber-200"
      }`}>
        <div className="flex items-start md:items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isHealed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400 animate-pulse"
          }`}>
            {isHealed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                isHealed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}>
                {isHealed ? "COMPLIANCE REMEDIATED" : "ADMIN GOVERNANCE ADVISORY"}
              </span>
              <span className="text-xs text-slate-300 font-semibold">{contentTitle}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {isHealed
                ? "✓ Disclaimer and C2PA Provenance attestation successfully attached to project timeline. Ready for 4K broadcast!"
                : warningAdvisory}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          {!isHealed ? (
            <button
              type="button"
              onClick={handleRemediate}
              className="w-full md:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs font-mono hover:brightness-110 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Auto-Fix &amp; Re-Submit</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Project Timeline Healed</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs"
            title="Dismiss Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
