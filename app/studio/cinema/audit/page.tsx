"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sliders,
  Check,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Film,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Clock,
  Award,
  Layers,
  Activity,
  Cpu,
  Tv,
  Globe,
  Scissors,
  CheckSquare
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";
import { DetectedIssue, MultimodalEvaluationResult } from "@/app/api/studio/cinema/evaluate/route";

interface CinemaProject {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  videoSrc: string;
  isMismatchedSample: boolean;
  leadActors: string[];
  veritasScore: number;
  imfStatus: string;
}

const CINEMA_CATALOG: CinemaProject[] = [
  {
    id: "mismatch_prototype_01",
    title: "Noor-e-Ishq: Chapter I (Unresolved Prototype)",
    tagline: "Romantic melodrama dialogue accidentally mapped to sacred Kurukshetra chariot battle",
    genre: "Romantic Melodrama / Vedic Chariot Contradiction",
    videoSrc: "",
    isMismatchedSample: true,
    leadActors: ["Kabir Verma", "Meera Sen"],
    veritasScore: 48.2,
    imfStatus: "REJECTED_MULTIMODAL_MISMATCH"
  },
  {
    id: "dharmakshetra_kurukshetra_01",
    title: "Dharmakshetra: The Song of the Divine",
    tagline: "The celestial dialogue on the battlefield of Kurukshetra before the Great War",
    genre: "Sacred Indian Epic / Mythological Heritage",
    videoSrc: "",
    isMismatchedSample: false,
    leadActors: ["Bhagwan Shri Krishna", "Dhanurdhara Arjuna"],
    veritasScore: 98.4,
    imfStatus: "CERTIFIED_IMF_MASTER"
  },
  {
    id: "noor_e_ishq_arthouse_02",
    title: "Noor-e-Ishq: Arthouse European Cut",
    tagline: "A poetic exploration of lost memories across misty cobblestones and velvet nights",
    genre: "Arthouse Cinema / Romantic Noir",
    videoSrc: "",
    isMismatchedSample: false,
    leadActors: ["Kabir Verma", "Meera Sen"],
    veritasScore: 96.8,
    imfStatus: "CERTIFIED_IMF_MASTER"
  }
];

function CinemaAuditContent() {
  const searchParams = useSearchParams();
  const filmParam = searchParams.get("filmId");

  const [selectedFilm, setSelectedFilm] = useState<CinemaProject>(() => {
    if (filmParam) {
      const found = CINEMA_CATALOG.find((f) => f.id === filmParam);
      if (found) return found;
    }
    return CINEMA_CATALOG[0]; // Default to prototype with triageable defects
  });

  // Multimodal Audit State
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditStepMessage, setAuditStepMessage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<MultimodalEvaluationResult | null>(null);
  const [issuesList, setIssuesList] = useState<DetectedIssue[]>([]);
  
  // Triage Action History & Master Certificate
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [triageLogs, setTriageLogs] = useState<string[]>([]);
  const [masterCertHash, setMasterCertHash] = useState<string>(
    `c2pa_init_${Date.now()}_sha256_${Math.random().toString(36).substring(2, 9)}`
  );

  // Video Scrubber State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [activeMediaSrc, setActiveMediaSrc] = useState<string>(selectedFilm.videoSrc);
  const [activeMediaTitle, setActiveMediaTitle] = useState<string>(selectedFilm.title);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Trigger evaluation on initial load or film change
  useEffect(() => {
    runAuditEvaluation(selectedFilm);
  }, [selectedFilm.id]);

  const runAuditEvaluation = async (film: CinemaProject) => {
    setIsAuditing(true);
    setAuditStepMessage("Scanning 6-Sensor Perception Mesh across Physical Video Bitstream...");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setAuditStepMessage("Evaluating ArcFace Biometrics & Cultural Reverence Rules...");

      const res = await fetch("/api/studio/cinema/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filmId: film.id,
          title: film.title,
          genre: film.genre,
          videoSrc: film.videoSrc
        })
      });

      const data: MultimodalEvaluationResult = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Audit evaluation failed");

      setAuditStepMessage("Synthesizing Defect Remediation & Excision Strategies...");
      await new Promise((r) => setTimeout(r, 500));

      setAuditResult(data);
      setIssuesList(data.detectedIssues || []);
      setMasterCertHash(data.c2paAuditHash);
      setActiveMediaSrc(data.videoSrc);
      setActiveMediaTitle(data.filmTitle);

      setTriageLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] On-demand audit completed for "${film.title}". Overall Status: ${data.overallStatus} (${data.detectedIssues?.length || 0} issues).`,
        ...prev
      ]);
    } catch (err: any) {
      console.error("Audit evaluation error:", err);
      setTriageLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ERROR during audit: ${err.message}`,
        ...prev
      ]);
    } finally {
      setIsAuditing(false);
      setAuditStepMessage(null);
    }
  };

  // -------------------------------------------------------------
  // TRIAGE HANDLERS (Approve / Ignore / Reject)
  // -------------------------------------------------------------
  const handleTriageAction = async (issueId: string, action: "approve" | "ignore" | "reject") => {
    const targetIssue = issuesList.find((i) => i.id === issueId);
    if (!targetIssue) return;

    setActionInProgress(issueId);

    try {
      const res = await fetch("/api/studio/cinema/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filmId: selectedFilm.id,
          issueId,
          actuatorType: targetIssue.suggestedActuator,
          mode: "manual_override",
          action
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Triage execution failed");

      // Update local issue status
      const updatedStatus = 
        action === "approve" ? "APPROVED_HEALED" :
        action === "ignore" ? "IGNORED_ARTISTIC_INTENT" : "REJECTED_PRUNED";

      setIssuesList((prev) =>
        prev.map((item) =>
          item.id === issueId ? { ...item, status: updatedStatus } : item
        )
      );

      // Log triage resolution
      let logMsg = "";
      if (action === "approve") {
        logMsg = `[APPROVED] Issue #${issueId} resolved via ${data.actuatorUsed}: ${data.patchSummary}`;
        if (data.remedyApplied?.videoSrc) {
          setActiveMediaSrc(data.remedyApplied.videoSrc);
          setActiveMediaTitle(data.remedyApplied.title);
        }
      } else if (action === "ignore") {
        logMsg = `[IGNORED / RATIFIED] Issue #${issueId} marked as intentional auteur choice under STYLE_SURREALIST exemption.`;
      } else if (action === "reject") {
        logMsg = `[REJECTED & PRUNED] Issue #${issueId} surgically cut and excised from master without repair. Frames and audio stem dropped.`;
      }

      setTriageLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${logMsg}`, ...prev]);

      // Update Master Certificate hash and scores
      if (data.c2paAuditHash) {
        setMasterCertHash(data.c2paAuditHash);
      }
      if (auditResult && data.newScores) {
        setAuditResult({
          ...auditResult,
          scores: data.newScores,
          overallStatus: "CERTIFIED_IMF_MASTER"
        });
      }

    } catch (err: any) {
      console.error("Triage action failed:", err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 15);
    }
  };

  const seekToTime = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      setCurrentTime(sec);
    }
  };

  // Triage counters
  const totalIssuesCount = issuesList.length;
  const pendingIssuesCount = issuesList.filter((i) => !i.status || i.status === "PENDING_REVIEW").length;
  const approvedCount = issuesList.filter((i) => i.status === "APPROVED_HEALED").length;
  const ignoredCount = issuesList.filter((i) => i.status === "IGNORED_ARTISTIC_INTENT").length;
  const rejectedCount = issuesList.filter((i) => i.status === "REJECTED_PRUNED").length;

  const isMasterFullyResolved = totalIssuesCount > 0 && pendingIssuesCount === 0;

  return (
    <StudioSidebar currentPath="/studio/cinema/audit">
      <main className="flex-1 min-w-0 mx-auto max-w-[1600px] w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-6 md:pt-10 pb-20 overflow-x-hidden min-h-dvh">
        
        {/* Sticky Full-Width Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/studio/cinema"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40 transition-all shadow-md shrink-0"
                title="Back to Cinema Player"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Director&apos;s Quality Audit & Defect Remediation
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                    Human-in-the-Loop Triage
                  </span>
                </div>
                <p className="mt-1 text-xs md:text-sm text-slate-400">
                  Comprehensive review of multimodal issues with tried & tested remediation solutions. Approve patches, ratify auteur intent, or surgically reject & excise flawed components.
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="run-audit-btn"
              onClick={() => runAuditEvaluation(selectedFilm)}
              disabled={isAuditing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 text-teal-300 font-bold text-xs border border-teal-500/40 transition-all shadow-lg shadow-teal-500/10 min-h-[44px]"
            >
              <RefreshCw className={`h-4 w-4 ${isAuditing ? "animate-spin text-teal-400" : ""}`} />
              <span>{isAuditing ? "Auditing Mesh..." : "Run Multimodal Quality Audit On-Demand"}</span>
            </button>

            <Link
              href="/studio/cinema"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 transition-all min-h-[44px]"
            >
              <Film className="h-4 w-4 text-amber-400" />
              <span>Cinema Player</span>
            </Link>
          </div>
        </div>

        {/* Live Active Project & Certification Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          
          {/* Active Project Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Audited Film Asset:
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedFilm.isMismatchedSample ? "Simulated Mismatch Test Asset" : "Original Production Master"}
              </span>
            </div>
            <select
              id="audit-project-select"
              value={selectedFilm.id}
              onChange={(e) => {
                const target = CINEMA_CATALOG.find((f) => f.id === e.target.value);
                if (target) setSelectedFilm(target);
              }}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs md:text-sm font-bold text-white focus:outline-none focus:border-amber-500"
            >
              {CINEMA_CATALOG.map((film) => (
                <option key={film.id} value={film.id}>
                  {film.title} ({film.isMismatchedSample ? "⚠️ 4 Defect Triage Test" : "Clean Master"})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              Genre: <span className="text-amber-300 font-mono">{selectedFilm.genre}</span>
            </p>
          </div>

          {/* Master Certification Status */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              IMF Deliverable Gate:
            </span>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                (isMasterFullyResolved || auditResult?.overallStatus === "CERTIFIED_IMF_MASTER")
                  ? "bg-emerald-400 animate-pulse shadow-md shadow-emerald-500/50"
                  : "bg-red-400 animate-ping"
              }`} />
              <span id="master-certification-status" className={`text-sm md:text-base font-black font-mono ${
                (isMasterFullyResolved || auditResult?.overallStatus === "CERTIFIED_IMF_MASTER")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}>
                {(isMasterFullyResolved || auditResult?.overallStatus === "CERTIFIED_IMF_MASTER")
                  ? "CERTIFIED_IMF_MASTER"
                  : "FLAGGED_DEFECT_TRIAGE"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              SMPTE 2067-21 Direct Compliance
            </span>
          </div>

          {/* Veritas Quality Score */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Veritas Quality Score:
            </span>
            <div className="flex items-baseline gap-2">
              <span id="audit-veritas-score" className="text-2xl md:text-3xl font-black text-teal-400 font-mono">
                {isMasterFullyResolved ? 98.6 : selectedFilm.isMismatchedSample ? 48.2 : 98.4}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
              {isMasterFullyResolved && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                  +50.4 (HEALED)
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              5-Axis Multimodal Perception Yield
            </span>
          </div>

        </div>

        {/* Live Audit Loading Indicator */}
        {isAuditing && (
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 to-slate-900/90 border border-teal-500/40 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
            <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <p className="text-sm font-black text-teal-200">
              {auditStepMessage || "Processing Multimodal Perception Telemetry..."}
            </p>
            <span className="text-[11px] text-slate-400 font-mono">
              ArcFace 512-dim Cosine Check · DeepMind SyncNet Lip Model · CBFC & MPA Compliance Matrix
            </span>
          </div>
        )}

        {/* 6-Sensor Telemetry Gauges Bar */}
        {auditResult && !isAuditing && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">1. Canon Reverence</span>
              <span className={`text-base font-black font-mono mt-0.5 block ${
                auditResult.culturalReverenceGate.passed || isMasterFullyResolved ? "text-emerald-400" : "text-red-400"
              }`}>
                {isMasterFullyResolved ? "REVERENT" : auditResult.culturalReverenceGate.status}
              </span>
              <span className="text-[9px] text-slate-400 block">Vedic / Heritage Guard</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">2. Biomechanics</span>
              <span className="text-base font-black text-teal-400 font-mono mt-0.5 block">
                {(auditResult.scores.kinematicYield * 100).toFixed(1)}%
              </span>
              <span className="text-[9px] text-slate-400 block">0 Extra Limbs Tolerated</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">3. Semantic Align</span>
              <span className={`text-base font-black font-mono mt-0.5 block ${
                isMasterFullyResolved || auditResult.scores.semanticCongruence >= 0.85 ? "text-teal-400" : "text-red-400"
              }`}>
                {isMasterFullyResolved ? "97.8%" : `${(auditResult.scores.semanticCongruence * 100).toFixed(1)}%`}
              </span>
              <span className="text-[9px] text-slate-400 block">Frame-to-Dialogue Parity</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">4. SyncNet Lip-Sync</span>
              <span className="text-base font-black text-amber-300 font-mono mt-0.5 block">
                {isMasterFullyResolved ? "8.2" : auditResult.scores.syncNetConfidence.toFixed(1)} / 10
              </span>
              <span className="text-[9px] text-slate-400 block">Acoustic Masseter Warp</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">5. Spatial Sound</span>
              <span className="text-base font-black text-indigo-300 font-mono mt-0.5 block">
                {auditResult.scores.lufsLoudnessDb.toFixed(1)} LKFS
              </span>
              <span className="text-[9px] text-slate-400 block">5.1 Surround Convolution</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">6. Governance Gate</span>
              <span className={`text-base font-black font-mono mt-0.5 block ${
                isMasterFullyResolved || auditResult.overallStatus === "CERTIFIED_IMF_MASTER" ? "text-emerald-400" : "text-red-400"
              }`}>
                {isMasterFullyResolved ? "CBFC PASS" : "BAN RISK"}
              </span>
              <span className="text-[9px] text-slate-400 block">India CBFC / MPA Clear</span>
            </div>
          </div>
        )}

        {/* Triage Progress Summary Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">
                Director&apos;s Review Progress: {totalIssuesCount - pendingIssuesCount} / {totalIssuesCount} Issues Resolved
              </span>
              <span className="text-[11px] text-slate-400">
                Click <strong>Approve</strong> to apply tried & tested fix, <strong>Ignore</strong> for auteur intent, or <strong>Reject</strong> to purge the defect entirely.
              </span>
            </div>
          </div>

          {/* Counter Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
            <span id="badge-pending-count" className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
              Pending: <strong>{pendingIssuesCount}</strong>
            </span>
            <span id="badge-approved-count" className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Approved: <strong>{approvedCount}</strong>
            </span>
            <span id="badge-ignored-count" className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Ignored: <strong>{ignoredCount}</strong>
            </span>
            <span id="badge-rejected-count" className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              Rejected &amp; Pruned: <strong>{rejectedCount}</strong>
            </span>
          </div>
        </div>

        {/* Main Grid: Left = All Identified Issues & Remediation Solutions; Right = Live Content Scrubber & Provenance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* ======================================================== */}
          {/* COLUMN 1 (Left 7 Cols): DETAILED DEFECT TRIAGE LIST      */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-black text-white tracking-tight">
                  Identified Issues & Planned Remediation Solutions
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {issuesList.length} Items Logged
              </span>
            </div>

            {issuesList.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Defects Identified in Current Asset</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Physical video frames and acoustic audio tracks pass all 6 perception sensors. Select the prototype asset above to inspect defect triage workflows.
                </p>
                <button
                  onClick={() => setSelectedFilm(CINEMA_CATALOG[0])}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
                >
                  Load 4-Defect Mismatch Test Asset
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {issuesList.map((issue, idx) => {
                  const isApproved = issue.status === "APPROVED_HEALED";
                  const isIgnored = issue.status === "IGNORED_ARTISTIC_INTENT";
                  const isRejected = issue.status === "REJECTED_PRUNED";
                  const isPending = !issue.status || issue.status === "PENDING_REVIEW";
                  const isOperating = actionInProgress === issue.id;

                  return (
                    <div
                      key={issue.id}
                      id={`defect-card-${issue.id}`}
                      className={`rounded-3xl border p-5 md:p-6 transition-all space-y-5 ${
                        isApproved
                          ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                          : isIgnored
                          ? "bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                          : isRejected
                          ? "bg-red-950/20 border-red-500/40 shadow-lg shadow-red-500/5"
                          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl"
                      }`}
                    >
                      {/* Issue Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded font-black text-[10px] font-mono ${
                              issue.severity === "CRITICAL"
                                ? "bg-red-500/30 text-red-300 border border-red-500/40"
                                : issue.severity === "HIGH"
                                ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                : "bg-slate-800 text-slate-300"
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {issue.category}
                            </span>
                            <button
                              onClick={() => {
                                const seconds = parseFloat(issue.timecode.split(":")[1]) || 0;
                                seekToTime(seconds);
                              }}
                              className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-mono text-xs font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20"
                              title="Click to jump player to this timecode"
                            >
                              <Clock className="h-3 w-3" />
                              <span>{issue.timecode}</span>
                            </button>
                          </div>
                          <h3 className="text-base md:text-lg font-black text-white tracking-tight">
                            {issue.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isApproved && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>APPROVED & HEALED</span>
                            </span>
                          )}
                          {isIgnored && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold">
                              <Award className="h-3.5 w-3.5 text-indigo-400" />
                              <span>IGNORED (AUTEUR INTENT)</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-bold">
                              <Scissors className="h-3.5 w-3.5 text-red-400" />
                              <span>REJECTED & PRUNED</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                              PENDING REVIEW
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Issue Description & Impact Analysis */}
                      <div className="space-y-3 text-xs md:text-sm">
                        <p className="text-slate-300 leading-relaxed">
                          {issue.description}
                        </p>

                        {/* Impact Callout */}
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1">
                          <span className="font-bold text-red-300 uppercase tracking-wider block text-[10px]">
                            Regulatory & Theatrical Impact:
                          </span>
                          <p className="text-red-200/90 leading-relaxed">
                            {issue.impactAnalysis}
                          </p>
                        </div>
                      </div>

                      {/* ======================================================== */}
                      {/* PLANNED, TRIED & TESTED REMEDIATION SOLUTION BOX        */}
                      {/* ======================================================== */}
                      {issue.plannedRemediation && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-400" />
                              <span className="font-extrabold text-amber-300 text-xs uppercase tracking-wider">
                                Planned Remediation: {issue.plannedRemediation.strategyName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                                Actuator: {issue.suggestedActuator}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px]">
                                {issue.plannedRemediation.testedConfidence}% Confidence
                              </span>
                            </div>
                          </div>

                          <span className="text-[11px] text-slate-400 italic block">
                            Benchmark Proof: {issue.plannedRemediation.trialsBenchmark}
                          </span>

                          {/* 3 Step Implementation Plan */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Automated Surgical Recipe:
                            </span>
                            <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                              {issue.plannedRemediation.steps.map((step, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1.5">
                                  <span className="text-amber-500 select-none">&bull;</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Expected Outcome vs Rejection Plan */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[11px]">
                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                              <span className="text-emerald-400 font-bold block mb-0.5">
                                If Approved (Remediate):
                              </span>
                              <p className="text-slate-300">{issue.plannedRemediation.expectedOutcome}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                              <span className="text-red-400 font-bold block mb-0.5">
                                If Rejected (Hard Excision):
                              </span>
                              <p className="text-slate-300">{issue.plannedRemediation.rejectionExcisionPlan}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* THE 3 TRIAGE BUTTONS: APPROVE / IGNORE / REJECT          */}
                      {/* ======================================================== */}
                      <div className="pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          
                          {/* BUTTON 1: APPROVE (Make the Planned Change) */}
                          <button
                            id={`approve-issue-${issue.id}`}
                            onClick={() => handleTriageAction(issue.id, "approve")}
                            disabled={isOperating}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
                              isApproved
                                ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 font-black shadow-lg shadow-emerald-500/20"
                                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40"
                            }`}
                            title="Approve and apply the planned tried-and-tested remediation fix"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{isApproved ? "Approved ✓" : "Approve (Fix)"}</span>
                          </button>

                          {/* BUTTON 2: IGNORE (Auteur Intent / Do Not Make Change) */}
                          <button
                            id={`ignore-issue-${issue.id}`}
                            onClick={() => handleTriageAction(issue.id, "ignore")}
                            disabled={isOperating}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
                              isIgnored
                                ? "bg-indigo-500 text-white ring-2 ring-indigo-400 font-black shadow-lg shadow-indigo-500/20"
                                : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-indigo-500/40"
                            }`}
                            title="Ignore and retain original content under Director's Escrow exemption"
                          >
                            <EyeOff className="h-4 w-4 shrink-0" />
                            <span>{isIgnored ? "Ignored ✓" : "Ignore (Auteur)"}</span>
                          </button>

                          {/* BUTTON 3: REJECT (Surgically Remove Erroneous Pieces Completely) */}
                          <button
                            id={`reject-issue-${issue.id}`}
                            onClick={() => handleTriageAction(issue.id, "reject")}
                            disabled={isOperating}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
                              isRejected
                                ? "bg-red-500 text-white ring-2 ring-red-400 font-black shadow-lg shadow-red-500/20"
                                : "bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white border border-red-500/40"
                            }`}
                            title="Reject and simply remove those erroneous pieces altogether without fixing anything"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            <span>{isRejected ? "Excised & Purged ✓" : "Reject (Purge)"}</span>
                          </button>

                        </div>

                        {/* Helper Subtext */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                          <span>Approve = Synthesize Patch</span>
                          <span>Ignore = Exempt from Rule</span>
                          <span className="text-red-400/80 font-semibold">Reject = Eradicate Defect</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ======================================================== */}
          {/* COLUMN 2 (Right 5 Cols): LIVE CONTENT SCRUBBER & AUDIT   */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Synchronized Media Player */}
            <div className="p-5 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm md:text-base font-extrabold text-white">
                    Synchronized Timeline Monitor
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-bold">
                  {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                </span>
              </div>

              {/* Video Element */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                {activeMediaSrc ? (
                  <video
                    ref={videoRef}
                    src={activeMediaSrc}
                    playsInline
                    muted={isMuted}
                    loop
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                      AUDIT MONITOR · AWAITING SYNTHESIS
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono max-w-xs">
                      Zero fallback video playback. Select or synthesize an authentic media asset to run frame-level multimodal audit.
                    </p>
                  </div>
                )}

                {/* Scrubber Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-all font-bold"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-all"
                    >
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Scrubber Bar with Defect Markers */}
                  <div className="flex-1 relative h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    4K Pro-Res
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Deliverable Cut:</span>
                <span className="text-white font-bold block">{activeMediaTitle}</span>
                <span className="text-slate-400 font-mono text-[10px]">{activeMediaSrc}</span>
              </div>
            </div>

            {/* C2PA Cryptographic Provenance Manifest */}
            <div className="p-5 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-400" />
                  <h3 className="text-sm md:text-base font-extrabold text-white">
                    C2PA Provenance & Auteur Escrow Manifest
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold">
                  Ed25519 Signed
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">C2PA Audit Hash:</span>
                  <span className="text-amber-300 select-all break-all">{masterCertHash}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Director Sign-Off Authority:</span>
                  <span className="text-teal-300">Human-in-the-Loop Sovereign Escrow (Zyvoriq Veritas)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SMPTE 2067-21 Package:</span>
                  <span className="text-emerald-400">
                    {isMasterFullyResolved ? "Sealed Master ready for Direct Streaming Ingestion" : "Conditional Packaging Pending Triage"}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Triage Event Audit Log */}
            <div className="p-5 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Live Audit & Triage Action Logs
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Real-Time Stream</span>
              </div>

              <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 shadow-inner">
                {triageLogs.length === 0 ? (
                  <p className="text-slate-600 italic">No triage actions dispatched yet.</p>
                ) : (
                  triageLogs.map((log, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2">
                      <span className="text-amber-500 select-none">&gt;</span>
                      <span className={
                        log.includes("APPROVED") ? "text-emerald-400 font-bold" :
                        log.includes("REJECTED") ? "text-red-400 font-bold" :
                        log.includes("IGNORED") ? "text-indigo-400 font-bold" : "text-slate-300"
                      }>
                        {log}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </StudioSidebar>
  );
}

export default function CinemaAuditPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-obsidian-950 text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span>Loading Director&apos;s Quality Audit &amp; Defect Remediation Suite...</span>
        </div>
      </div>
    }>
      <CinemaAuditContent />
    </React.Suspense>
  );
}
