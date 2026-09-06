"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Lock, Globe, CheckCircle2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-mono text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            TERMS OF SERVICE & COMMERCIAL RIGHTS
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono">Terms of Service & Licensing</h1>
          <p className="text-xs text-slate-400 font-mono">Last Updated: September 2026 · Zyvoriq Engine Core</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-6">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">1. Commercial Ownership & IP Rights</h2>
            <p>
              You retain full commercial ownership of all video, audio, and transmedia publications created using the Zyvoriq platform, subject to underlying foundation model licenses. All human-curated editorial arrangements, timeline cuts, and prompt combinations are recognized as human-authored derivative works under US Copyright Office guidance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">2. C2PA Provenance & AI Transparency (EU AI Act Compliance)</h2>
            <p>
              In compliance with the European Union AI Act and global content transparency standards, all synthetic media generated via Zyvoriq embeds immutable cryptographic C2PA metadata and SynthID digital watermarks. You agree not to maliciously strip or tamper with embedded provenance certificates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">3. Acceptable Use Policy & Prohibited Conduct</h2>
            <p>You agree not to use the platform to generate:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Non-consensual deepfakes or unauthorized voice cloning of living private individuals (violating Tennessee ELVIS Act or Illinois BIPA).</li>
              <li>Defamatory statements attributing fraudulent or criminal acts to real entities.</li>
              <li>Unlicensed financial or medical advice presented without required regional disclosures.</li>
              <li>Hate speech, terrorist content, or sexually explicit material.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">4. Limitation of Liability</h2>
            <p>
              Zyvoriq provides AI generation tools on an "as is" and "as available" basis. While our Veritas QA engine applies multi-axis factuality and brand safety checks, users are ultimately responsible for conducting final human editorial review before publishing.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
