"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Terminal, 
  Layers, 
  Globe, 
  Database, 
  Boxes, 
  FileCode, 
  Hand,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export function SparkArchitecturePanel() {
  const [activeTab, setActiveTab] = useState<"diagram" | "bulletPoints" | "flow">("diagram");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black text-white font-mono">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400">Spark</span> works — under the hood
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Runs in Google secure and governed Cloud</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-obsidian-950 p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab("diagram")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "diagram" ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab("flow")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "flow" ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Agent Harness
          </button>
          <button
            onClick={() => setActiveTab("bulletPoints")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "bulletPoints" ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Core Capabilities
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-6">
        {activeTab === "diagram" && (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left: Interactive Architecture Visualizer */}
            <div className="flex-1 rounded-2xl border border-slate-800 bg-obsidian-950/90 p-5 relative overflow-hidden flex flex-col gap-4">
              
              {/* Human In The Loop Layer */}
              <div 
                onMouseEnter={() => setHoveredNode("hitl")}
                onMouseLeave={() => setHoveredNode(null)}
                className={`rounded-xl border p-3.5 transition-all flex items-center justify-between cursor-pointer ${
                  hoveredNode === "hitl"
                    ? "border-blue-400 bg-blue-950/80 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400"
                    : "border-blue-600/60 bg-blue-600/80 text-white hover:bg-blue-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Hand className="h-5 w-5 text-white" />
                  <span className="font-mono text-sm font-bold text-white">Human in the loop</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/40 text-blue-200">
                  L1/L2/L3 Policy Gate
                </span>
              </div>

              {/* Vertical Bidirectional Arrow */}
              <div className="flex items-center justify-center -my-2">
                <span className="font-mono text-xs text-blue-400">↕</span>
              </div>

              {/* Long-Running Agent Container */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4.5 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-indigo-400" />
                    <span>Long-running agent</span>
                  </span>
                  <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/40">
                    Veo 3.1 &amp; Gemini Core
                  </span>
                </div>

                {/* 3 Blocks Pipeline: Plugins -> Agent Harness -> Secure Sandbox */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Block 1: Plugins / Skills */}
                  <div
                    onMouseEnter={() => setHoveredNode("plugins")}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                      hoveredNode === "plugins"
                        ? "border-blue-400 bg-blue-950/80 shadow-md shadow-blue-500/20"
                        : "border-blue-600/70 bg-blue-600 text-white"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                      <Boxes className="h-4 w-4" />
                      <span>Plugins / Skills</span>
                    </div>
                    <div className="text-[10px] opacity-90 mt-2">
                      9 Foundation Swarms &amp; Tools
                    </div>
                  </div>

                  {/* Block 2: Agent Harness */}
                  <div
                    onMouseEnter={() => setHoveredNode("harness")}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                      hoveredNode === "harness"
                        ? "border-blue-400 bg-blue-950/80 shadow-md shadow-blue-500/20"
                        : "border-blue-600/70 bg-blue-600 text-white"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                      <Terminal className="h-4 w-4" />
                      <span>Agent harness</span>
                    </div>
                    <div className="text-[10px] opacity-90 mt-2">
                      DAG Scheduler &amp; State Machine
                    </div>
                  </div>

                  {/* Block 3: Secure Sandbox */}
                  <div
                    onMouseEnter={() => setHoveredNode("sandbox")}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                      hoveredNode === "sandbox"
                        ? "border-blue-400 bg-blue-950/80 shadow-md shadow-blue-500/20"
                        : "border-blue-600/70 bg-blue-600 text-white"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                      <Lock className="h-4 w-4" />
                      <span>Secure sandbox</span>
                    </div>
                    <div className="text-[10px] opacity-90 mt-2">
                      Isolated Execution Enclave
                    </div>
                  </div>

                </div>

                {/* Memory Layer (Bottom of Agent) */}
                <div
                  onMouseEnter={() => setHoveredNode("memory")}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`rounded-xl border p-2.5 transition-all flex items-center justify-between cursor-pointer ${
                    hoveredNode === "memory"
                      ? "border-purple-400 bg-purple-950/80 text-white shadow-md shadow-purple-500/20"
                      : "border-slate-700 bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                    <Database className="h-3.5 w-3.5 text-purple-400" />
                    <span>Memory (1536-dim Vector Persona Store)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">dev.db</span>
                </div>

              </div>

            </div>

            {/* Right: Connectors & External Systems */}
            <div className="w-full lg:w-72 rounded-2xl border border-slate-800 bg-obsidian-950/90 p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Globe className="h-4 w-4 text-teal-400" />
                  <span>Secure Enterprise Integrations</span>
                </div>

                <div className="mt-3 flex flex-col gap-2.5 text-xs font-mono">
                  
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 flex items-center justify-between">
                    <span className="text-slate-300">Internet Access</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Secure Egress</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 flex items-center justify-between">
                    <span className="text-slate-300">Enterprise Data &amp; Systems</span>
                    <span className="text-[10px] text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">Zero Leakage</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 flex items-center justify-between">
                    <span className="text-slate-300">Apps / Tools</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded">SDK Bridge</span>
                  </div>

                  {/* BYO-MCP Connector Box */}
                  <div className="rounded-xl border border-teal-500/40 bg-gradient-to-r from-teal-950/60 to-slate-900 p-3 flex flex-col gap-1.5">
                    <div className="font-bold text-teal-300 flex items-center justify-between">
                      <span>BYO-MCP Connectors</span>
                      <span className="text-[9px] bg-teal-900/60 text-teal-200 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ServiceNow • Salesforce • Jira • SharePoint
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 text-right">
                Proprietary &amp; Confidential • Page 7
              </div>
            </div>

          </div>
        )}

        {/* Bullet Points View */}
        {activeTab === "bulletPoints" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {[
              {
                title: "Optimized Agent Harness",
                desc: "Delivers guaranteed quality results with Veritas 5-Axis mathematical verification and deterministic consensus.",
                badge: "Quality Gate"
              },
              {
                title: "Autonomous Multi-Step Workflows",
                desc: "Executes long-running multi-agent DAG pipelines and routine enterprise tasks inside an isolated, secure sandbox environment.",
                badge: "Secure Sandbox"
              },
              {
                title: "Seamless BYO-MCP Connectors",
                desc: "Connects natively to ServiceNow, Salesforce, Jira, and SharePoint for cross-app intelligence and instant metadata extraction.",
                badge: "Model Context Protocol"
              },
              {
                title: "Proactive Enterprise Learning",
                desc: "Learns your unique enterprise context, vocabulary, and executive presentation style using 1536-dimensional vector memory.",
                badge: "Vector Memory"
              }
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">• {item.title}</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-2 font-sans text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flow View */}
        {activeTab === "flow" && (
          <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 text-xs font-mono space-y-3">
            <div className="text-slate-400 uppercase text-[11px] font-bold">Execution Lifecycle Flow</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-blue-400 font-bold">1. Human Dispatch</div>
                <div className="text-[11px] text-slate-400 mt-1">Select L1/L2/L3 autonomy and provide brief.</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-teal-400 font-bold">2. Agent Harness</div>
                <div className="text-[11px] text-slate-400 mt-1">Compile into 4 DAG streams and dispatch swarms.</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-indigo-400 font-bold">3. Secure Sandbox</div>
                <div className="text-[11px] text-slate-400 mt-1">Execute tools, MCP connectors, and Python enclaves.</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-bold">4. Veritas Consensus</div>
                <div className="text-[11px] text-slate-400 mt-1">Seal Ed25519 provenance and publish output.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
