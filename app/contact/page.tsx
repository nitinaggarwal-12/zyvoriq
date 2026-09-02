"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  HelpCircle,
  FileText,
  Lock,
  ArrowRight,
  Headphones,
  Globe
} from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general_support",
    tier: "pro_creator",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      <AppNavbar />

      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-obsidian-950 text-teal-400">
                <Mail className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                Creator & Enterprise Support Operations
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Technical Escalations · Enterprise Custom Model Integration · DMCA Compliance · 24/7 SLA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <main className="flex-1 mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Contact Form (7 cols) */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Submit a Support or Enterprise Request</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Our core engineering and compliance operations team monitors tickets 24/7 with guaranteed &lt; 4h turnaround.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono">Support Ticket Successfully Dispatched</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you <strong>{formData.name}</strong>. Ticket ID <strong>#ZYV-{(Math.random() * 90000 + 10000).toFixed(0)}</strong> has been opened. We have dispatched confirmation to <strong>{formData.email}</strong>.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 font-mono">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Elena Vane"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 font-mono">Work or Creator Email</label>
                      <input
                        type="email"
                        required
                        placeholder="elena@studio.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 font-mono">Inquiry Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-400 text-xs"
                      >
                        <option value="general_support">🛠️ Technical Support & Bug Report</option>
                        <option value="enterprise_api">🏢 Enterprise Dedicated Deployment & API</option>
                        <option value="custom_voice_avatar">🎙️ Custom Voice Clone / 3D Avatar Rigging</option>
                        <option value="dmca_compliance">⚖️ Legal, DMCA & C2PA Compliance</option>
                        <option value="monetization_partnership">💰 Creator Partnership & Monetization</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-300 font-mono">Creator Scale</label>
                      <select
                        value={formData.tier}
                        onChange={e => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-400 text-xs"
                      >
                        <option value="solo_creator">Solo Creator / Author (&lt; 100k views)</option>
                        <option value="pro_creator">Pro Studio / Agency (100k - 5M views)</option>
                        <option value="enterprise">Enterprise Brand / Media Network (5M+ views)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 font-mono">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Custom Veo 3.1 Model Integration or Transmedia Publishing inquiry"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 font-mono">Message Details</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please describe your requirements, error logs, or project details..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 font-bold text-sm text-obsidian-950 shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Dispatch Ticket to Operations Team
                  </button>

                </form>
              )}

            </div>
          </section>

          {/* Right Column: Direct Channels & SLA Matrix (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Response Time SLAs
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Enterprise Tier</span>
                    <span className="font-mono text-emerald-400">&lt; 1 Hour Response</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Dedicated Slack connect channel with solution architects.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Pro Creator Studio Tier</span>
                    <span className="font-mono text-teal-400">&lt; 4 Hours Response</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Direct engineering ticket escalation and model assistance.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>Legal & DMCA Inquiries</span>
                    <span className="font-mono text-amber-400">&lt; 24 Hours Response</span>
                  </div>
                  <p className="text-[11px] text-slate-400">17 U.S.C. § 512(c) safe harbor compliance review.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Global Direct Inboxes
              </h3>

              <div className="space-y-2 font-mono text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Technical Support:</span>
                  <span className="text-teal-400">support@zyvoriq.ai</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Enterprise Licensing:</span>
                  <span className="text-cyan-400">enterprise@zyvoriq.ai</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">DMCA & Legal:</span>
                  <span className="text-amber-400">legal@zyvoriq.ai</span>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
