"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Copy, 
  ExternalLink, 
  Plus, 
  Trash2,
  Cpu,
  BarChart3
} from "lucide-react";

export default function GovernancePage() {
  const [apiKeyCreated, setApiKeyCreated] = useState(false);

  const auditLogs = [
    {
      id: "LOG-9841",
      timestamp: "2026-08-23T11:45:12Z",
      agent: "Agent 9 (Omnichannel Publisher)",
      action: "C2PA Manifest Injected into Master MP4",
      hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      status: "VERIFIED",
    },
    {
      id: "LOG-9840",
      timestamp: "2026-08-23T11:44:58Z",
      agent: "Agent 7 (Veritas Consensus)",
      action: "Issued Cryptographic VQC Certificate (VQS 94.6)",
      hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      status: "PASSED",
    },
    {
      id: "LOG-9839",
      timestamp: "2026-08-23T11:44:10Z",
      agent: "Agent 2 (Research Grounding)",
      action: "Cross-examined 6 claims via Google Grounding API",
      hash: "sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      status: "ANCHORED",
    },
    {
      id: "LOG-9838",
      timestamp: "2026-08-23T11:43:00Z",
      agent: "Agent 1 (Director DAG)",
      action: "Dispatched Parallel Swarm Run #8492",
      hash: "sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
      status: "INITIATED",
    },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <AppNavbar />

      <main className="mx-auto max-w-8xl px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Enterprise Governance &amp; Provenance Enclave
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Cryptographic provenance audit logs, Ed25519 hardware key rotation, tenant Row-Level Security (RLS) policies, and token usage spending controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setApiKeyCreated(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-teal-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate API Key</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* LEFT: Immutable Audit Log (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <FileText className="h-4 w-4" />
                  <span>Immutable Cryptographic Audit Trail (PostgreSQL RLS)</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">Hardware Sealed</span>
              </div>

              <div className="pt-4 flex flex-col gap-3.5">
                {auditLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-800/70 bg-obsidian-950/80 p-4">
                    <div className="flex items-center justify-between pb-1 text-xs">
                      <span className="font-mono font-bold text-white">{log.agent}</span>
                      <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1">{log.action}</div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                      <span className="text-slate-500 truncate max-w-[360px]">{log.hash}</span>
                      <span className="text-emerald-400 font-bold">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: C2PA Key Enclave & Quota Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Key Enclave */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Key className="h-4 w-4" />
                  <span>Ed25519 Hardware Signing Enclave</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">Active</span>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 text-xs font-mono text-slate-300">
                  <div className="text-slate-400 pb-1">Public Key Fingerprint (C2PA Root):</div>
                  <div className="text-emerald-300 break-all font-bold">
                    ed25519:pub:89a2f9104c81b740c5984ef2a1c098bb
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 text-xs font-mono text-slate-300">
                  <div className="text-slate-400 pb-1">Monthly Spending Quota:</div>
                  <div className="text-white font-bold text-sm">$4,250.00 / $10,000.00 USD</div>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: "42.5%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3">
                Compliance &amp; Export Center
              </div>
              <div className="flex flex-col gap-2">
                <button className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-950 p-3 text-xs text-slate-200 hover:border-teal-500/50 hover:text-white transition-colors">
                  <span>Export Cryptographic SOC-2 Audit CSV</span>
                  <Download className="h-4 w-4 text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-950 p-3 text-xs text-slate-200 hover:border-teal-500/50 hover:text-white transition-colors">
                  <span>Download C2PA Manifest JUMBF Box</span>
                  <Download className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
