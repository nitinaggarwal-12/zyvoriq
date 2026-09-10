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
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[80] transition-all duration-300 pointer-events-none max-w-[calc(100vw-24px)]"
    >
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:py-2 rounded-full border border-teal-500/30 bg-[#0A0D14]/95 backdrop-blur-xl shadow-xl shadow-black/80 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-full bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <ShieldCheck className="w-3 h-3" />
          </div>
          <span className="font-semibold text-white text-[11px] sm:text-xs">
            C2PA &amp; SynthID
          </span>
          <span className="hidden xl:inline text-[10px] text-slate-400">
            • AI transparency compliant
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/privacy"
            className="text-[10px] text-slate-400 hover:text-teal-300 underline transition-colors px-1"
          >
            Privacy
          </Link>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-2.5 py-1 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-300 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            Accept All &amp; C2PA
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close cookie consent banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
