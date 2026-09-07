"use client";

import React from "react";
import Link from "next/link";
import { Lock, ShieldCheck, Globe, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-mono text-teal-400">
            <Lock className="w-3.5 h-3.5" />
            GDPR, CCPA & BIOMETRIC PRIVACY
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono">Privacy Policy & Biometric Data Disclaimer</h1>
          <p className="text-xs text-slate-400 font-mono">Last Updated: September 2026 · Zyvoriq Engine Core</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-6">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">1. Zero Biometric Storage (BIPA & GDPR Article 9)</h2>
            <p>
              Zyvoriq does not collect, scan, or retain biometric facial geometry or voiceprints from private end-users. All 3D character avatars and voice profiles featured in our library are synthetic procedural rigs or contracted professional cast assets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">2. Enterprise Cloud Privacy &amp; Data Processing</h2>
            <p>
              Your production briefs, private scripts, and custom media assets are processed on enterprise-grade infrastructure without being sold to third-party data brokers or used to train public foundation models without explicit organizational consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">3. Cookie Policy & Local Storage</h2>
            <p>
              We utilize essential technical session cookies and browser LocalStorage (`zyvoriq_cookie_consent`, API key vaults) strictly to maintain your authenticated creator session and editor preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">4. Rights Under GDPR & CCPA</h2>
            <p>
              You have the right to request export or complete deletion of your production history and media vaults at any time by contacting privacy@zyvoriq.ai.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
