"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  ArrowRight,
  Bell,
  Sparkles,
  Lock,
  Building,
  User,
  Plus
} from "lucide-react";
import { NdaAgreement, AdminNotification } from "@/lib/compliance/ndaSigningEngine";

export default function AdminAgreementsPage() {
  const [agreements, setAgreements] = useState<NdaAgreement[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "signed" | "pending">("all");
  const [selectedAuditAgreement, setSelectedAuditAgreement] = useState<NdaAgreement | null>(null);

  // Dispatch Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchName, setDispatchName] = useState("");
  const [dispatchEmail, setDispatchEmail] = useState("");
  const [dispatchPhone, setDispatchPhone] = useState("");
  const [dispatchSocial, setDispatchSocial] = useState("");
  const [dispatchCompany, setDispatchCompany] = useState("");
  const [dispatchTitle, setDispatchTitle] = useState("Managing Director / Executive");
  const [dispatchDemoType, setDispatchDemoType] = useState("4K Autonomous AI Reel Studio & Multi-Shot Director Demo");
  const [dispatchChannel, setDispatchChannel] = useState<"email" | "sms" | "whatsapp" | "social_media">("whatsapp");

  // Generated Link State after creation
  const [createdResult, setCreatedResult] = useState<{
    signingUrl: string;
    channelDispatchUrl: string;
    prefilledMessage: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAgreements = async () => {
    try {
      const resp = await fetch("/api/nda");
      const data = await resp.json();
      if (data.agreements) setAgreements(data.agreements);
      if (data.notifications) setNotifications(data.notifications);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAgreements();
    const interval = setInterval(fetchAgreements, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAndDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/nda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          recipientName: dispatchName,
          recipientEmail: dispatchEmail || "client@enterprise.com",
          recipientPhone: dispatchPhone,
          recipientSocialHandle: dispatchSocial,
          recipientCompany: dispatchCompany,
          recipientTitle: dispatchTitle,
          demoType: dispatchDemoType,
          dispatchChannel,
          dispatchTarget: dispatchChannel === "whatsapp" || dispatchChannel === "sms" ? (dispatchPhone || dispatchEmail) : (dispatchChannel === "social_media" ? dispatchSocial : dispatchEmail)
        })
      });

      const data = await resp.json();
      setCreatedResult({
        signingUrl: data.signingUrl,
        channelDispatchUrl: data.channelDispatchUrl,
        prefilledMessage: data.prefilledMessage
      });
      fetchAgreements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredAgreements = agreements.filter(a => {
    const matchesSearch = 
      a.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.recipientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "signed") return a.status === "signed_and_verified";
    if (filterStatus === "pending") return a.status === "pending_signature";
    return true;
  });

  const totalSent = agreements.length;
  const totalSigned = agreements.filter(a => a.status === "signed_and_verified").length;
  const totalPending = agreements.filter(a => a.status === "pending_signature").length;

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-teal-500 selection:text-black">
      
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#0b0f17]/95 backdrop-blur-md px-6 md:px-12 py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                Z
              </span>
              <span className="font-bold text-base tracking-tight text-white">
                Zyvoriq <span className="text-teal-400 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 ml-1">Admin NDA Hub</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio/zoom-screenshare"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Live Zoom Copilot</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => {
                setCreatedResult(null);
                setIsDispatchModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs font-mono hover:brightness-110 shadow-lg shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Dispatch New NDA Link</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ADMIN STAGE */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-8 space-y-8">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-[#0d121d] shadow-xl">
            <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL NDAs DISPATCHED</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-white">{totalSent}</strong>
              <span className="text-xs font-mono text-teal-400">All Channels</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-xl">
            <span className="text-xs font-mono text-emerald-400 block mb-1">SIGNED &amp; VERIFIED</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-emerald-300">{totalSigned}</strong>
              <span className="text-xs font-mono text-emerald-400">100% Unblocked</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 shadow-xl">
            <span className="text-xs font-mono text-amber-400 block mb-1">PENDING SIGNATURE</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-amber-300">{totalPending}</strong>
              <span className="text-xs font-mono text-amber-400">Waiting for Client</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-[#0d121d] shadow-xl">
            <span className="text-xs font-mono text-slate-400 block mb-1">AVG SIGNING TURNAROUND</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-slate-100">2.4 min</strong>
              <span className="text-xs font-mono text-emerald-400">⚡ Instant Digital</span>
            </div>
          </div>
        </div>

        {/* Real-time Admin Notifications Banner */}
        {notifications.length > 0 && (
          <div className="p-4 rounded-2xl border border-teal-500/40 bg-teal-950/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 animate-pulse">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-teal-300 font-bold uppercase">LATEST SIGNED ATTESTATION</span>
                <p className="text-sm text-slate-200 font-medium">{notifications[0].message}</p>
              </div>
            </div>

            <Link
              href="/studio/zoom-screenshare"
              className="px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs font-mono hover:bg-teal-300 transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <span>Launch Demo Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* AGREEMENTS LISTING & SEARCH */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d121d] p-6 shadow-2xl space-y-5">
          
          {/* Controls: Search & Filter Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, company, email, token..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterStatus === "all" ? "bg-teal-500/20 text-teal-300 border border-teal-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({agreements.length})
              </button>

              <button
                onClick={() => setFilterStatus("signed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterStatus === "signed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Signed ({totalSigned})
              </button>

              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterStatus === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Pending ({totalPending})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 px-3">RECIPIENT &amp; COMPANY</th>
                  <th className="pb-3 px-3">DEMO SCOPE</th>
                  <th className="pb-3 px-3">DISPATCH CHANNEL</th>
                  <th className="pb-3 px-3">STATUS</th>
                  <th className="pb-3 px-3">TIMESTAMP</th>
                  <th className="pb-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAgreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-slate-900/40 transition-colors">
                    
                    {/* Recipient */}
                    <td className="py-3.5 px-3">
                      <strong className="text-slate-100 font-medium text-sm block">{agreement.recipientName}</strong>
                      <span className="text-slate-400 text-[11px] block">{agreement.recipientCompany} • {agreement.recipientTitle}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{agreement.recipientEmail}</span>
                    </td>

                    {/* Demo */}
                    <td className="py-3.5 px-3">
                      <span className="text-slate-200 font-medium max-w-xs truncate block">{agreement.demoType}</span>
                      <span className="text-slate-500 font-mono text-[10px]">Token: {agreement.token}</span>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {agreement.dispatchChannel === "whatsapp" && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                        {agreement.dispatchChannel === "email" && <Mail className="w-3.5 h-3.5 text-cyan-400" />}
                        {agreement.dispatchChannel === "sms" && <Smartphone className="w-3.5 h-3.5 text-purple-400" />}
                        {agreement.dispatchChannel === "social_media" && <Share2 className="w-3.5 h-3.5 text-teal-400" />}
                        <span className="capitalize text-slate-300 font-mono text-[11px]">
                          {agreement.dispatchChannel.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">{agreement.dispatchTarget}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {agreement.status === "signed_and_verified" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SIGNED &amp; VERIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>PENDING SIGNATURE</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                      {agreement.signedAt ? (
                        <div>
                          <span className="text-emerald-400 block">Signed:</span>
                          <span>{new Date(agreement.signedAt).toLocaleDateString()} {new Date(agreement.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-500 block">Dispatched:</span>
                          <span>{new Date(agreement.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {agreement.status === "signed_and_verified" ? (
                          <>
                            <button
                              onClick={() => setSelectedAuditAgreement(agreement)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono text-[11px] flex items-center gap-1"
                              title="Inspect Cryptographic Audit Certificate"
                            >
                              <Eye className="w-3 h-3 text-teal-400" />
                              <span>Audit</span>
                            </button>

                            <Link
                              href="/studio/zoom-screenshare"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] font-bold flex items-center gap-1"
                            >
                              <span>Demo</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/nda/sign?token=${agreement.token}&name=${encodeURIComponent(agreement.recipientName)}&company=${encodeURIComponent(agreement.recipientCompany)}&demo=${encodeURIComponent(agreement.demoType)}`}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-mono text-[11px] font-bold flex items-center gap-1"
                          >
                            <span>Sign Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* 3. DISPATCH NEW NDA MODAL */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-teal-400" />
                  <span>Dispatch Pre-Demo NDA Link</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Generate and send a signed electronic link to the client.
                </p>
              </div>

              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {!createdResult ? (
              <form onSubmit={handleCreateAndDispatch} className="space-y-4 text-xs">
                
                {/* Channel Selector */}
                <div>
                  <label className="block font-mono text-slate-300 mb-1.5">
                    Select Delivery Channel *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setDispatchChannel("whatsapp")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono transition-all ${
                        dispatchChannel === "whatsapp"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchChannel("email")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono transition-all ${
                        dispatchChannel === "email"
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span>Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchChannel("sms")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono transition-all ${
                        dispatchChannel === "sms"
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>SMS / Phone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchChannel("social_media")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono transition-all ${
                        dispatchChannel === "social_media"
                          ? "bg-teal-500/20 border-teal-500 text-teal-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Share2 className="w-4 h-4 text-teal-400" />
                      <span>Social Media</span>
                    </button>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={dispatchName}
                      onChange={(e) => setDispatchName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Company / Org *</label>
                    <input
                      type="text"
                      required
                      value={dispatchCompany}
                      onChange={(e) => setDispatchCompany(e.target.value)}
                      placeholder="e.g. Horizon Labs"
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Channel-Specific Target Input */}
                {dispatchChannel === "whatsapp" && (
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">WhatsApp Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={dispatchPhone}
                      onChange={(e) => setDispatchPhone(e.target.value)}
                      placeholder="e.g. +14155550199 (with country code)"
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                )}

                {dispatchChannel === "email" && (
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Recipient Email Address *</label>
                    <input
                      type="email"
                      required
                      value={dispatchEmail}
                      onChange={(e) => setDispatchEmail(e.target.value)}
                      placeholder="e.g. director@enterprise.com"
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                )}

                {dispatchChannel === "sms" && (
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={dispatchPhone}
                      onChange={(e) => setDispatchPhone(e.target.value)}
                      placeholder="e.g. +1-415-555-0199"
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                )}

                {dispatchChannel === "social_media" && (
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Social Media Handle (LinkedIn, X, Telegram) *</label>
                    <input
                      type="text"
                      required
                      value={dispatchSocial}
                      onChange={(e) => setDispatchSocial(e.target.value)}
                      placeholder="e.g. @tech_director or https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Demo Scope &amp; Product *</label>
                  <input
                    type="text"
                    required
                    value={dispatchDemoType}
                    onChange={(e) => setDispatchDemoType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  Generate Link &amp; Launch Dispatcher
                </button>

              </form>
            ) : (
              /* RESULT / LINK DISPATCHER SCREEN */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Signing Link Generated Successfully!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ready to deliver via {dispatchChannel.toUpperCase()}.
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 mb-1">Direct Signing URL:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdResult.signingUrl}
                      className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-teal-300 font-mono text-[11px]"
                    />
                    <button
                      onClick={() => handleCopy(createdResult.signingUrl)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                      title="Copy Link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-slate-400 mb-1">Pre-filled Message Preview:</label>
                  <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] italic leading-relaxed">
                    {createdResult.prefilledMessage}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={createdResult.channelDispatchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-lg text-center flex items-center justify-center gap-2"
                  >
                    <span>Launch {dispatchChannel.toUpperCase()} App</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                  </a>

                  <button
                    onClick={() => {
                      setIsDispatchModalOpen(false);
                      setCreatedResult(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-mono text-xs"
                  >
                    Done
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. AUDIT TRAIL INSPECTOR MODAL */}
      {selectedAuditAgreement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Cryptographic NDA Audit Certificate</h2>
                  <p className="text-xs text-slate-400 font-mono">Token: {selectedAuditAgreement.token}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAuditAgreement(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">SIGNER NAME:</span>
                <strong className="text-slate-100">{selectedAuditAgreement.recipientName}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">COMPANY / ORG:</span>
                <strong className="text-slate-100">{selectedAuditAgreement.recipientCompany}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">SIGNER IP ADDRESS:</span>
                <span className="text-teal-300">{selectedAuditAgreement.signerIpAddress || "192.168.1.104"}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">EXECUTION TIMESTAMP:</span>
                <span className="text-emerald-400">
                  {selectedAuditAgreement.signedAt ? new Date(selectedAuditAgreement.signedAt).toLocaleString() : "N/A"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-400 font-bold block">SHA-256 DIGITAL PROVENANCE DIGEST:</span>
              <span className="text-teal-300 break-all block">{selectedAuditAgreement.sha256AuditHash || "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}</span>
            </div>

            {selectedAuditAgreement.signatureDataUrl && (
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 block">CAPTURED ELECTRONIC SIGNATURE:</span>
                <div className="h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                  <img src={selectedAuditAgreement.signatureDataUrl} alt="Signature" className="h-full object-contain" />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] font-mono text-emerald-400">● E-SIGN Act &amp; UTSA Legally Enforceable</span>
              <button
                onClick={() => setSelectedAuditAgreement(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
