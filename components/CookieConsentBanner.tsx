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
    if (!consent) {
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

  if (!hasMounted || !isVisible) return null;

  return (
    <aside
      aria-label="Cookie and AI Transparency Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 transition-all duration-300 pointer-events-none"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700/80 bg-obsidian-950/95 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-black/80 pointer-events-auto border-t-2 border-t-teal-500/80 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Privacy, Cookie Consent & AI Transparency Disclosure</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold uppercase">
                  EU AI Act & C2PA Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Zyvoriq uses essential session cookies and embeds <strong>C2PA cryptographic provenance metadata</strong> in all synthetic media outputs. We do not sell your personal data or store unauthorized biometric identifiers (in full compliance with GDPR, CCPA, and Illinois BIPA).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 self-start sm:self-auto"
            aria-label="Close cookie consent banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <Link href="/privacy" className="hover:text-teal-300 underline transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-teal-300 underline transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/veritas" className="hover:text-teal-300 underline transition-colors">C2PA Verification</Link>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleAcceptEssential}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/80 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-xs font-bold text-obsidian-950 shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-95"
            >
              Accept All & Enable C2PA
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
