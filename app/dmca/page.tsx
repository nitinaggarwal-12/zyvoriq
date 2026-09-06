"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-mono text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            DMCA & COPYRIGHT SAFE HARBOR
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono">DMCA Notice & Takedown Policy</h1>
          <p className="text-xs text-slate-400 font-mono">17 U.S.C. § 512(c) Safe Harbor Compliance · Zyvoriq Legal</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-6">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">1. Copyright Safe Harbor Compliance</h2>
            <p>
              Zyvoriq respects intellectual property rights and adheres to the Digital Millennium Copyright Act (DMCA). If you believe in good faith that any content hosted or generated on our platform infringes your copyright, you may submit a formal takedown notice to our designated agent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">2. Filing a Takedown Notice</h2>
            <p>To submit a valid notice, please provide:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the specific URL or production ID on Zyvoriq containing the infringing material.</li>
              <li>Your full legal name, email address, physical address, and telephone number.</li>
              <li>A statement of good faith belief that the disputed use is not authorized by the copyright owner or law.</li>
              <li>A physical or electronic signature under penalty of perjury.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">3. Designated DMCA Agent Contact</h2>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
              <div><strong>DMCA Compliance Agent</strong></div>
              <div>Zyvoriq Inc. Legal & Intellectual Property Operations</div>
              <div>Email: dmca-agent@zyvoriq.ai</div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
