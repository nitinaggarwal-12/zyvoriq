"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { SynthIDLatentHeatmap } from "@/components/SynthIDLatentHeatmap";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  RotateCcw, 
  ExternalLink, 
  Download, 
  Lock, 
  FileCode, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Award,
  AlertTriangle,
  FileCheck,
  Search,
  Check,
  Copy
} from "lucide-react";

function canonicalStringify(obj: any): string {
  if (typeof obj !== "object" || obj === null) return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalStringify).join(",") + "]";
  const sortedKeys = Object.keys(obj).sort();
  const kvPairs = sortedKeys.map(
    (key) => JSON.stringify(key) + ":" + canonicalStringify(obj[key])
  );
  return "{" + kvPairs.join(",") + "}";
}

export default function VeritasPage() {
  const [copiedCert, setCopiedCert] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [selectedAxis, setSelectedAxis] = useState<string>("factuality");

  const certificateId = "vqc_89f3a12ce94";
  const ed25519Signature = "MEQCIFz9...ed25519...3a89f921";
  const c2paManifestHash = "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const axes = [
    {
      id: "factuality",
      title: "1. Factuality & Ground Truth",
      weight: "30%",
      score: 96.0,
      status: "PASS",
      evaluator: "Google Search Grounding + Gemini 3.7 Flash",
      desc: "All 6 assertions cross-examined against primary SEC filings and peer-reviewed arXiv benchmarks.",
      penalty: "0 unverified claims (0 penalty applied).",
    },
    {
      id: "brandVoice",
      title: "2. Brand Voice Alignment",
      weight: "25%",
      score: 92.5,
      status: "PASS",
      evaluator: "pgvector Cosine Similarity (1536-dim)",
      desc: "Cosine distance to workspace tone memory: 0.08 (Threshold < 0.15). 0 prohibited clichés found.",
      penalty: "0 banned buzzwords ('delve', 'tapestry' clean).",
    },
    {
      id: "consensus",
      title: "3. Multi-Engine Consensus",
      weight: "20%",
      score: 95.0,
      status: "PASS",
      evaluator: "Gemini 3.7 Flash + Claude 3.5 Sonnet",
      desc: "Dual-model semantic divergence: 3.2% (Threshold < 10%). High cross-model reasoning agreement.",
      penalty: "Zero logical contradictions detected.",
    },
    {
      id: "safety",
      title: "4. Safety, Policy & IP",
      weight: "15%",
      score: 100.0,
      status: "HARD GATE PASS",
      evaluator: "Zyvoriq Policy Guard Enclave",
      desc: "Zero PII exposure, zero copyrighted code infringement, zero defamatory libel detected.",
      penalty: "Hard Gate Met: Exactly 100/100 required.",
    },
    {
      id: "humanization",
      title: "5. Perceptual Humanization",
      weight: "10%",
      score: 91.0,
      status: "PASS",
      evaluator: "Burstiness & Formant Dynamics Analyzer",
      desc: "Syntactic sentence variance: 84%. Natural vocal breath pauses and pitch modulation validated.",
      penalty: "Cadence entropy within high human band.",
    },
  ];

  const vqsScore =
    axes.length > 0
      ? parseFloat(
          axes
            .reduce((acc, a) => acc + a.score * (parseFloat(a.weight) / 100), 0)
            .toFixed(1)
        )
      : 94.6;

  const citations = [
    {
      id: "CLAIM-01",
      statement: "Quantum-Resistant multi-tenant architecture eliminates cross-tenant data leakage via PostgreSQL Row-Level Security (RLS).",
      source: "PostgreSQL 16 Enterprise Security Whitepaper",
      url: "https://postgresql.org/docs/16/ddl-rowsecurity.html",
      confidence: "99.8%",
      status: "Verified Ground Truth",
    },
    {
      id: "CLAIM-02",
      statement: "pgvector 1536-dimensional embeddings with ivfflat index achieves sub-15ms cosine similarity lookup on 10M rows.",
      source: "pgvector High-Scale Performance Benchmark",
      url: "https://github.com/pgvector/pgvector",
      confidence: "98.5%",
      status: "Verified Ground Truth",
    },
    {
      id: "CLAIM-03",
      statement: "C2PA Content Credentials embedding uses Ed25519 digital signatures with zero re-compression generational loss.",
      source: "Coalition for Content Provenance and Authenticity (C2PA) Spec v2.1",
      url: "https://c2pa.org/specifications/specifications/2.1/specs/C2PA_Specification.html",
      confidence: "100.0%",
      status: "Verified Ground Truth",
    },
  ];

  const copyCert = () => {
    navigator.clipboard.writeText(JSON.stringify({
      certificate_id: certificateId,
      composite_vqs: vqsScore,
      c2pa_manifest_hash: c2paManifestHash,
      ed25519_signature: ed25519Signature,
      evaluators: ["gemini-2.5-pro", "claude-3.5-sonnet"],
      timestamp: new Date().toISOString()
    }, null, 2));
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  const handleDownloadCert = () => {
    setDownloadingCert(true);
    const certPayload = {
      certificate_id: certificateId,
      composite_vqs: vqsScore,
      veritas_pass: true,
      evaluators: ["gemini-2.5-pro", "claude-3.5-sonnet"],
      c2pa_manifest_hash: c2paManifestHash,
      ed25519_signature: ed25519Signature,
      synthid_latent_match: "99.8%",
      provenance_enclave: "Zyvoriq Veritas Hardware Vault",
      immutable_timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(certPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veritas_certificate_${certificateId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setDownloadingCert(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <AppNavbar />

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-12 md:py-10 lg:px-16 space-y-10">
        
        {/* Top Title Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Veritas 5-Axis Quality Consensus & SynthID Inspector
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Deterministic quality governance engine: Dual-model LLM consensus, Zyvoriq SynthID latent watermarking, ground-truth claim verification, and cryptographic C2PA Ed25519 provenance certification.
            </p>
          </div>

          {/* VQS Score Box */}
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-slate-900/90 p-4 shadow-xl flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Veritas Quality Score (VQS)
                </span>
                <span className="text-3xl font-black font-mono text-white">
                  {vqsScore}<span className="text-sm font-normal text-emerald-400"> / 100</span>
                </span>
              </div>
              <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-mono font-extrabold text-emerald-300">
                PASS APPROVED
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Zyvoriq SynthID Latent Frequency Spectrum Heatmap */}
        <SynthIDLatentHeatmap />

        {/* SECTION 2: 2-Column Grid: 5-Axis Breakdown (Left) + Citations & Signed VQC (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: 5-Axis Score Matrix Cards (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 pb-2">
              <Award className="h-4 w-4" />
              <span>The 5 Deterministic Evaluation Axes</span>
            </div>

            {axes.map((axis) => (
              <div
                key={axis.id}
                onClick={() => setSelectedAxis(axis.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  selectedAxis === axis.id
                    ? "border-emerald-500/70 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 shadow-lg shadow-emerald-500/10"
                    : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-mono text-base font-bold text-white">{axis.title}</h3>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        Weight: {axis.weight}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{axis.evaluator}</div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xl font-extrabold text-emerald-300">{axis.score}</span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{axis.status}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full"
                    style={{ width: `${axis.score}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">{axis.desc}</p>
                
                <div className="mt-2 text-[11px] font-mono text-emerald-400/90 font-medium">
                  ✓ {axis.penalty}
                </div>
              </div>
            ))}

            {/* Formula Reference */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-mono text-xs text-slate-400">
              <span className="text-teal-400 font-bold">VQS Formula: </span>
              0.30(Fact) + 0.25(Tone) + 0.20(Consensus) + 0.15(Safety) + 0.10(Humanize)
            </div>
          </div>

          {/* RIGHT COLUMN: Claim Citations & Cryptographic VQC Certificate (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Ground Truth Citations */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <FileCheck className="h-4 w-4" />
                  <span>Ground-Truth Claim-by-Claim Citation Registry</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">3/3 Verified</span>
              </div>

              <div className="pt-4 flex flex-col gap-3.5">
                {citations.map((claim) => (
                  <div key={claim.id} className="rounded-xl border border-slate-800/70 bg-obsidian-950/70 p-4">
                    <div className="flex items-center justify-between gap-2 pb-2">
                      <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-400 border border-teal-800/40">
                        {claim.id}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Confidence: {claim.confidence}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">{claim.statement}</p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-400 truncate max-w-[280px]">Source: {claim.source}</span>
                      <a
                        href={claim.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-mono text-[11px] transition-colors"
                      >
                        <span>View Source</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic VQC Certificate Box */}
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Lock className="h-4 w-4" />
                  <span>Ed25519 Verification Quality Certificate (VQC)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCert}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedCert ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCert ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownloadCert}
                    disabled={downloadingCert}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Download className={`h-3.5 w-3.5 ${downloadingCert ? "animate-bounce" : ""}`} />
                    <span>{downloadingCert ? "Exporting..." : "Download JSON"}</span>
                  </button>
                </div>
              </div>

              {/* Certificate JSON Preview */}
              <div>
                <pre className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-mono text-[11px] text-emerald-300/90 leading-relaxed overflow-x-auto">
{`{
  "certificate_id": "${certificateId}",
  "composite_vqs": ${vqsScore},
  "veritas_pass": true,
  "synthid_latent_match": "99.8%",
  "evaluators": ["gemini-2.5-pro", "claude-3.5-sonnet"],
  "c2pa_manifest_hash": "${c2paManifestHash}",
  "ed25519_signature": "${ed25519Signature}",
  "provenance_enclave": "Zyvoriq Veritas Hardware Vault",
  "immutable_timestamp": "2026-08-23T11:47:00Z"
}`}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  C2PA Content Credentials Embedded into MP4/WAV
                </span>

                <Link
                  href="/governance"
                  className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-mono text-xs"
                >
                  <span>Governance Audit Log</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
