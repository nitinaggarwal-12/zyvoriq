"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  Film,
  BookOpen,
  Mic,
  Layers,
  Globe,
  Search,
  Filter,
  Check,
  ArrowRight,
  ExternalLink,
  Lock,
  User,
  Activity,
  FileText,
  AlertCircle,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { ModerationReport, AdminDecisionStatus, ComplianceRiskLevel, ContentModality, getAllModerationReports } from "@/lib/compliance/contentModeratorAgent";

export default function AdminContentModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>(() => {
    try {
      return getAllModerationReports();
    } catch {
      return [];
    }
  });
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    approvedWithWarning: 0,
    rejected: 0,
    avgScore: 100
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "warning" | "rejected">("all");
  const [modalityFilter, setModalityFilter] = useState<"all" | ContentModality>("all");
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  // Decision Form State
  const [decisionNotes, setDecisionNotes] = useState("");
  const [warningAdvisory, setWarningAdvisory] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionSuccessToast, setDecisionSuccessToast] = useState<string | null>(null);

  const fetchModerationData = async () => {
    try {
      const resp = await fetch("/api/admin/moderation");
      const data = await resp.json();
      if (data.reports) setReports(data.reports);
      if (data.metrics) setMetrics(data.metrics);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchModerationData();
    const interval = setInterval(fetchModerationData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenReport = (report: ModerationReport) => {
    setSelectedReport(report);
    setDecisionNotes(report.adminDecision.adminNotes || "");
    setWarningAdvisory(report.adminDecision.warningAdvisory || "");
  };

  const handleApplyDecision = async (status: AdminDecisionStatus) => {
    if (!selectedReport) return;
    setIsSubmittingDecision(true);

    try {
      const resp = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decide",
          reportId: selectedReport.id,
          status,
          adminName: "Nitin Aggarwal (Admin)",
          adminNotes: decisionNotes || (status === "APPROVED" ? "Verified compliant with platform IP and safety guidelines." : (status === "REJECTED" ? "Rejected due to regulatory claim violations." : "Approved with required disclaimer attachment.")),
          warningAdvisory: status === "APPROVED_WITH_WARNING" ? (warningAdvisory || "Mandatory disclaimer: All statements represent speculative fiction.") : undefined
        })
      });

      const data = await resp.json();
      if (data.success) {
        setDecisionSuccessToast(`Decision successfully applied: ${status.replace("_", " ")}`);
        fetchModerationData();
        setSelectedReport(null);
        setTimeout(() => setDecisionSuccessToast(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.creatorHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.creatorOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contentId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "pending" && r.adminDecision.status !== "PENDING_REVIEW") return false;
    if (statusFilter === "approved" && r.adminDecision.status !== "APPROVED") return false;
    if (statusFilter === "warning" && r.adminDecision.status !== "APPROVED_WITH_WARNING") return false;
    if (statusFilter === "rejected" && r.adminDecision.status !== "REJECTED") return false;

    if (modalityFilter !== "all" && r.modality !== modalityFilter) return false;

    return true;
  });

  const getModalityIcon = (mod: ContentModality) => {
    switch (mod) {
      case "video_reel": return <Film className="w-3.5 h-3.5 text-teal-400" />;
      case "book_chapter": return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case "audio_podcast": return <Mic className="w-3.5 h-3.5 text-cyan-400" />;
      case "carousel_deck": return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case "multilingual_dub": return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-teal-500 selection:text-black">
      
      {/* 1. STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#0b0f17]/95 backdrop-blur-md px-6 md:px-12 py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                Z
              </span>
              <span className="font-bold text-base tracking-tight text-white">
                Zyvoriq <span className="text-teal-400 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 ml-1">Content Moderator Agent</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/agreements"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Pre-Demo NDAs</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs font-mono hover:brightness-110 shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Return to Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ADMIN STAGE */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-8 space-y-8">
        
        {/* Success Toast */}
        {decisionSuccessToast && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{decisionSuccessToast}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="p-5 rounded-2xl border border-slate-800 bg-[#0d121d] shadow-xl">
            <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL EVALUATED ITEMS</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-white">{metrics.total}</strong>
              <span className="text-xs font-mono text-teal-400">100% Monitored</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 shadow-xl">
            <span className="text-xs font-mono text-amber-400 block mb-1">PENDING ADMIN DECISION</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-amber-300">{metrics.pending}</strong>
              <span className="text-xs font-mono text-amber-400">⚡ Needs Review</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-xl">
            <span className="text-xs font-mono text-emerald-400 block mb-1">APPROVED (CLEAN)</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-emerald-300">{metrics.approved}</strong>
              <span className="text-xs font-mono text-emerald-400">Released</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 shadow-xl">
            <span className="text-xs font-mono text-indigo-400 block mb-1">APPROVED W/ WARNING</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-indigo-300">{metrics.approvedWithWarning}</strong>
              <span className="text-xs font-mono text-indigo-400">Advisory Bound</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 shadow-xl">
            <span className="text-xs font-mono text-rose-400 block mb-1">REJECTED (BLOCKED)</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-black text-rose-300">{metrics.rejected}</strong>
              <span className="text-xs font-mono text-rose-400">Export Locked</span>
            </div>
          </div>

        </div>

        {/* MODERATION QUEUE & FILTER CONTROLS */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d121d] p-6 shadow-2xl space-y-5">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, creator, organization, or ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-400 font-mono"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === "all" ? "bg-teal-500/20 text-teal-300 border border-teal-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({reports.length})
              </button>

              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Pending ({metrics.pending})
              </button>

              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === "approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Approved ({metrics.approved})
              </button>

              <button
                onClick={() => setStatusFilter("warning")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === "warning" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Warnings ({metrics.approvedWithWarning})
              </button>

              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === "rejected" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Rejected ({metrics.rejected})
              </button>
            </div>

          </div>

          {/* Moderation Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 px-3">CONTENT ITEM &amp; CREATOR</th>
                  <th className="pb-3 px-3">MODALITY</th>
                  <th className="pb-3 px-3">COMPLIANCE SCORE</th>
                  <th className="pb-3 px-3">AI AGENT RECOMMENDATION</th>
                  <th className="pb-3 px-3">ADMIN DECISION</th>
                  <th className="pb-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-900/40 transition-colors">
                    
                    {/* Item & Creator */}
                    <td className="py-3.5 px-3">
                      <strong className="text-slate-100 font-bold text-sm block">{report.contentTitle}</strong>
                      <span className="text-slate-400 text-[11px] block">{report.creatorHandle} • {report.creatorOrg}</span>
                      <p className="text-slate-500 text-[11px] max-w-md truncate italic mt-0.5">{report.previewSnippet}</p>
                    </td>

                    {/* Modality */}
                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 capitalize">
                        {getModalityIcon(report.modality)}
                        <span>{report.modality.replace("_", " ")}</span>
                      </div>
                    </td>

                    {/* Score & Risk Badge */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${
                          report.overallComplianceScore >= 90 ? "text-emerald-400" : (report.overallComplianceScore >= 70 ? "text-amber-400" : "text-rose-400")
                        }`}>
                          {report.overallComplianceScore} / 100
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          report.riskLevel === "SAFE_GREEN"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : report.riskLevel === "MODERATE_WARNING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        }`}>
                          {report.riskLevel.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Recommendation */}
                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      {report.recommendedAction === "RECOMMEND_APPROVE" && (
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approve Clean</span>
                        </span>
                      )}
                      {report.recommendedAction === "RECOMMEND_WARNING" && (
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Warning Advisory</span>
                        </span>
                      )}
                      {report.recommendedAction === "RECOMMEND_REJECT" && (
                        <span className="text-rose-300 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Reject &amp; Block</span>
                        </span>
                      )}
                    </td>

                    {/* Admin Status */}
                    <td className="py-3.5 px-3">
                      {report.adminDecision.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>APPROVED</span>
                        </span>
                      )}
                      {report.adminDecision.status === "APPROVED_WITH_WARNING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3" />
                          <span>WARNING ATTACHED</span>
                        </span>
                      )}
                      {report.adminDecision.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>REJECTED</span>
                        </span>
                      )}
                      {report.adminDecision.status === "PENDING_REVIEW" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>PENDING DECISION</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenReport(report)}
                        className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Forensic Report</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* 3. FORENSIC REPORT & ADMIN DECISION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono text-[10px] font-bold">
                    FORENSIC COMPLIANCE REPORT
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedReport.id}</span>
                </div>
                <h2 className="text-xl font-black text-white">{selectedReport.contentTitle}</h2>
                <p className="text-xs font-mono text-slate-400">
                  Creator: {selectedReport.creatorHandle} ({selectedReport.creatorOrg}) • Modality: {selectedReport.modality.toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                ✕ Close
              </button>
            </div>

            {/* 1. "WHAT THE USER DID" FORENSIC ACTIVITY TRACKER */}
            <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-teal-300 font-mono flex items-center gap-1.5 uppercase">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Forensic Activity Trail (What User Did)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{selectedReport.userForensicActivity.length} Events Tracked</span>
              </div>

              <div className="space-y-2">
                {selectedReport.userForensicActivity.map((step) => (
                  <div key={step.stepIndex} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-teal-400 font-bold">Step {step.stepIndex}: {step.actionType.replace("_", " ").toUpperCase()}</span>
                      <span className="text-slate-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200">{step.description}</p>
                    <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-slate-400 overflow-x-auto">
                      Payload: {step.rawPayloadSnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 6-AXIS COMPLIANCE RADAR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>6-Axis AI Safety &amp; Policy Evaluation</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Score: {selectedReport.overallComplianceScore}/100</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedReport.complianceAxes.map((axis) => (
                  <div key={axis.axisId} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    axis.status === "PASS"
                      ? "bg-slate-950/80 border-slate-800"
                      : axis.status === "WARNING"
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-rose-950/20 border-rose-500/40"
                  }`}>
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-100 text-[11px]">{axis.name}</strong>
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        axis.status === "PASS" ? "text-emerald-400 bg-emerald-500/10" : (axis.status === "WARNING" ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10")
                      }`}>
                        {axis.score}/100 ({axis.status})
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-normal">{axis.details}</p>
                    {axis.flaggedExcerpts && (
                      <div className="p-1.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-[10px]">
                        Flagged: &quot;{axis.flaggedExcerpts.join("&quot;, &quot;")}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. ADMIN DECISION COCKPIT (Approve, Reject, Approve with Warning) */}
            <div className="p-5 rounded-2xl border border-teal-500/30 bg-[#090d16] space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Admin Governance Decision</span>
                  </h3>
                  <p className="text-xs text-slate-400">Choose your binding regulatory action on this content.</p>
                </div>
                <span className="text-xs font-mono text-slate-400">Deciding Officer: Nitin Aggarwal</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Admin Feedback &amp; Compliance Notes</label>
                  <textarea
                    rows={2}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Enter compliance justification or instructions for the creator..."
                    className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Mandatory Warning Advisory (if Approving with Warning)</label>
                  <input
                    type="text"
                    value={warningAdvisory}
                    onChange={(e) => setWarningAdvisory(e.target.value)}
                    placeholder="e.g. Mandatory Disclaimer: This material is for educational fiction only."
                    className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>

                {/* 3 Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  
                  {/* 1. APPROVE */}
                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={() => handleApplyDecision("APPROVED")}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs font-mono hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Approve (Clean Release)</span>
                  </button>

                  {/* 2. APPROVE WITH WARNING */}
                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={() => handleApplyDecision("APPROVED_WITH_WARNING")}
                    className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs font-mono shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-300" />
                    <span>Approve with Warning</span>
                  </button>

                  {/* 3. REJECT */}
                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={() => handleApplyDecision("REJECTED")}
                    className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs font-mono shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject (Block Export)</span>
                  </button>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}
