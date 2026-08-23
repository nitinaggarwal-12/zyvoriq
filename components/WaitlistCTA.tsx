"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail, User } from "lucide-react";

export function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Chief Architect / CTO");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <section id="waitlist" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[350px] w-[700px] rounded-full bg-gradient-to-r from-teal-500/20 via-emerald-500/15 to-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative rounded-3xl border border-slate-800 bg-obsidian-900/90 p-8 md:p-14 lg:p-16 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/50 px-3.5 py-1 text-xs font-mono font-bold text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>EARLY ACCESS INVITATION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              What Would You Create if the Production Friction Disappeared?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Join the private preview of Zyvoriq. Be among the first to deploy autonomous lifecycle intelligence, Veritas claim-level auto-repair, and native multi-modal publishing.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                No Hallucination AI Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                QGV-001 Quality Standard
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-5">
            {submitted ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-8 text-center backdrop-blur-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">Priority Access Reserved</h3>
                <p className="mt-2 text-xs text-emerald-200">
                  We've reserved your position in the upcoming cohort for <strong>{email}</strong> ({role}). Check your inbox shortly for our blueprint walkthrough.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-800/90 bg-slate-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4"
              >
                <div>
                  <label htmlFor="access-role" className="block text-xs font-mono font-bold uppercase text-slate-400 mb-1.5">
                    Your Primary Role
                  </label>
                  <div className="relative">
                    <select
                      id="access-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-200 outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    >
                      <option>Chief Architect / CTO</option>
                      <option>Founder / CEO</option>
                      <option>Staff Engineer / Tech Lead</option>
                      <option>Developer Relations / Evangelist</option>
                      <option>Product Manager / Strategist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="access-email" className="block text-xs font-mono font-bold uppercase text-slate-400 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="access-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.io"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-teal-500/30 active:scale-[0.99]"
                >
                  <span>Request Priority Access</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <p className="text-center text-[10px] text-slate-500 font-mono">
                  Guaranteed privacy • Zero synthetic spam • Encrypted credentials
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
