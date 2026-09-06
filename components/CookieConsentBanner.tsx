"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, X, Check, Lock, Sparkles, ExternalLink } from "lucide-react";

export function CookieConsentBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const consent = localStorage.getItem("zyvoriq_cookie_consent");
    const dismissed = sessionStorage.getItem("zyvoriq_cookie_dismissed");
    if (!consent && !dismissed) {
      // Show after 800ms settling delay
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("zyvoriq_cookie_consent", JSON.stringify({
      essential: true,
      analytics: true,
      aiProvenance: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("zyvoriq_cookie_consent", JSON.stringify({
      essential: true,
      analytics: false,
      aiProvenance: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("zyvoriq_cookie_dismissed", "true");
    setIsVisible(false);
  };

  if (!hasMounted || !isVisible) return null;

  return (
    <aside
      aria-label="Cookie and AI Transparency Consent"
      className="fixed bottom-20 md:bottom-6 right-3 md:right-6 left-3 md:left-auto z-[80] transition-all duration-300 pointer-events-none"
    >
      <div className="w-full md:w-[460px] max-w-full rounded-2xl border border-slate-700/80 bg-obsidian-950/98 p-4 md:p-5 backdrop-blur-2xl shadow-2xl shadow-black pointer-events-auto border-t-2 border-t-teal-500/80 space-y-3">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                <span>Privacy & AI Transparency</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold uppercase">
                  EU AI Act & C2PA
                </span>
              </h2>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Zyvoriq embeds <strong>C2PA cryptographic provenance</strong> in synthetic media. Compliant with GDPR, CCPA, and Illinois BIPA.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 shrink-0"
            aria-label="Close cookie consent banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Link href="/privacy" className="hover:text-teal-300 underline transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-teal-300 underline transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/veritas" className="hover:text-teal-300 underline transition-colors">C2PA</Link>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAcceptEssential}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Essential
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-[11px] font-bold text-obsidian-950 shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-95 cursor-pointer"
            >
              Accept All & C2PA
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
