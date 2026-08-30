"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  FileText, 
  CheckCircle2, 
  Download, 
  Plus, 
  RefreshCw
} from "lucide-react";

export default function GovernancePage() {
  const [apiKeyCreated, setApiKeyCreated] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([
    {
      id: "LOG-vqc_89f3a12ce94",
      timestamp: "Today",
      agent: "Agent 9 (Omnichannel Publisher)",
      action: "C2PA Manifest Injected & Ed25519 Signed",
      hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      status: "SEALED",
    },
    {
      id: "LOG-run_8492_quantum",
      timestamp: "Today",
      agent: "Agent 1 (Director Swarm DAG)",
      action: "Ingested Concept Prompt: Synthesize a multimodal technical launch package...",
      hash: "sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
      status: "RECORDED",
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleCopyHash = (hash: string, id: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(hash);
      setCopiedHashId(id);
      setTimeout(() => setCopiedHashId(null), 2000);
    }
  };

  const handleExportCSV = () => {
    const sanitizeCell = (val: string) => {
      const str = String(val || "").replace(/"/g, '""');
      // Prevent CSV formula injection (=, +, -, @, \t, \r)
      if (/^[=+\-@\t\r]/.test(str)) {
        return `"'${str}"`;
      }
      return `"${str}"`;
    };

    const headers = ["ID", "Timestamp", "Agent", "Action", "Hash", "Status"];
    const rows = logs.map((l) =>
      [
        sanitizeCell(l.id),
        sanitizeCell(l.timestamp),
        sanitizeCell(l.agent),
        sanitizeCell(l.action),
        sanitizeCell(l.hash),
        sanitizeCell(l.status)
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zyvoriq_soc2_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/governance/logs");
      if (res.ok) {
        const data = await res.json();
        if (data.auditTrail && data.auditTrail.length > 0) {
          setLogs(data.auditTrail);
        }
      }
    } catch (e) {
      console.error("Failed to load live logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <AppNavbar />

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
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
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Logs</span>
            </button>

            <button
              onClick={() => setApiKeyCreated(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-teal-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{apiKeyCreated ? "Key Created" : "Generate API Key"}</span>
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
                  <span>Immutable Cryptographic Audit Trail (PostgreSQL RLS / dev.db)</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">{logs.length} Logged Entries</span>
              </div>

              <div className="pt-4 flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-800/70 bg-obsidian-950/80 p-4">
                    <div className="flex items-center justify-between pb-1 text-xs">
                      <span className="font-mono font-bold text-white">{log.agent}</span>
                      <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1">{log.action}</div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => handleCopyHash(log.hash, log.id)}
                        className="text-slate-500 hover:text-amber-300 transition-colors truncate max-w-[360px] text-left flex items-center gap-1.5 group cursor-pointer"
                        title="Click to copy hash"
                      >
                        <span className="truncate">{log.hash}</span>
                        <span className="text-amber-400 font-bold text-[9px] shrink-0">
                          {copiedHashId === log.id ? "✓ Copied" : "📋"}
                        </span>
                      </button>
                      <span className="text-emerald-400 font-bold shrink-0">{log.status}</span>
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
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-950 p-3 text-xs text-slate-200 hover:border-teal-500/50 hover:text-white transition-colors cursor-pointer"
                >
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
