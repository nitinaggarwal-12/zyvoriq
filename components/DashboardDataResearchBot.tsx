"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Database, 
  GitBranch, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  X, 
  Search, 
  Code, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  Clock,
  Zap,
  Info
} from "lucide-react";
import { 
  DASHBOARD_LINEAGE_REGISTRY, 
  MetricLineageRecord, 
  queryDataLineage 
} from "@/lib/analytics/dataLineageRegistry";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  matchedRecord?: MetricLineageRecord;
  timestamp: string;
}

interface DashboardDataResearchBotProps {
  selectedMetricId?: string | null;
  onClearSelectedMetric?: () => void;
}

export function DashboardDataResearchBot({
  selectedMetricId,
  onClearSelectedMetric
}: DashboardDataResearchBotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: "👋 **Welcome to the Data Lineage & Research Inspector.**\n\nI am your live intelligence agent grounded on all telemetry, PostgreSQL schemas, and analytical models powering this dashboard.\n\nAsk me about any data point, calculation formula, sample size, or upstream table dependency!",
      timestamp: "Live"
    }
  ]);
  const [activeTab, setActiveTab] = useState<"chat" | "lineage_dag" | "sql_explorer">("chat");
  const [activeMetricRecord, setActiveMetricRecord] = useState<MetricLineageRecord | null>(
    DASHBOARD_LINEAGE_REGISTRY["cycle_time_avg"] || null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When a metric is selected from the parent dashboard, automatically inspect it
  useEffect(() => {
    if (selectedMetricId && DASHBOARD_LINEAGE_REGISTRY[selectedMetricId]) {
      const record = DASHBOARD_LINEAGE_REGISTRY[selectedMetricId];
      setActiveMetricRecord(record);
      setIsOpen(true);
      
      const userPrompt = `Inspect data lineage for ${record.metricName}`;
      const result = queryDataLineage(record.metricName);

      setMessages(prev => [
        ...prev,
        {
          id: `msg_user_${Date.now()}`,
          sender: "user",
          text: userPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        },
        {
          id: `msg_bot_${Date.now() + 1}`,
          sender: "bot",
          text: result.answerMarkdown,
          matchedRecord: record,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [selectedMetricId]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    setTimeout(() => {
      const result = queryDataLineage(text);
      if (result.matchedMetric) {
        setActiveMetricRecord(result.matchedMetric);
      }

      const botMsg: Message = {
        id: `msg_bot_${Date.now()}`,
        sender: "bot",
        text: result.answerMarkdown,
        matchedRecord: result.matchedMetric,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  const sampleQuestions = [
    "Where does the 84 sec cycle time come from?",
    "How is 99.4% Veritas Yield calculated?",
    "What is the sample size for Unit Cost ($0.82)?",
    "Show lineage for C2PA Verified Assets"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-2xl shadow-teal-500/30 hover:scale-105 transition-all"
        aria-label="Open Data Lineage Research Agent"
      >
        <Bot className="h-4 w-4" />
        <span>Ask Data Lineage Agent</span>
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "w-full h-[780px]"
          : "w-full h-[620px]"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 font-bold text-slate-950">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <span>Data Lineage & Research AI</span>
              <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-mono text-teal-300">
                Grounded RAG
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              End-to-End PostgreSQL &amp; Telemetry Provenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tab selector */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-[10px]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                activeTab === "chat" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Q&amp;A Chat
            </button>
            <button
              onClick={() => setActiveTab("lineage_dag")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                activeTab === "lineage_dag" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Lineage DAG
            </button>
            <button
              onClick={() => setActiveTab("sql_explorer")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                activeTab === "sql_explorer" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              SQL Query
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? "Collapse height" : "Expand height"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        
        {/* TAB 1: Chat Mode */}
        {activeTab === "chat" && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-teal-500 text-slate-950 font-medium"
                      : "bg-slate-950 border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>

                  {msg.matchedRecord && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-teal-400">
                        Hash: {msg.matchedRecord.verificationHash.slice(0, 16)}...
                      </span>
                      <button
                        onClick={() => {
                          setActiveMetricRecord(msg.matchedRecord!);
                          setActiveTab("lineage_dag");
                        }}
                        className="font-bold text-teal-300 hover:underline flex items-center gap-1"
                      >
                        <span>View DAG Trace</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className={`text-[9px] font-mono ${msg.sender === "user" ? "text-slate-800" : "text-slate-500"} text-right`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* TAB 2: Lineage DAG Mode */}
        {activeTab === "lineage_dag" && activeMetricRecord && (
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300 text-sm">{activeMetricRecord.metricName}</span>
                <span className="rounded bg-teal-500/20 px-2 py-0.5 text-xs font-mono font-bold text-teal-200">
                  {activeMetricRecord.currentDisplayValue}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{activeMetricRecord.businessDefinition}</p>
            </div>

            {/* Visual Node Flow */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                End-to-End Dependency Pipeline (Source ➔ Metric)
              </div>

              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-indigo-500 before:to-emerald-500">
                {activeMetricRecord.upstreamNodes.map((node, i) => (
                  <div key={node.id} className="relative rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <div className="absolute -left-[21px] top-3.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-teal-400" />
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">{node.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {node.system}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">{node.description}</div>
                  </div>
                ))}

                {/* Final Target Node */}
                <div className="relative rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3">
                  <div className="absolute -left-[21px] top-3.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-300">
                      🎯 {activeMetricRecord.metricName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {activeMetricRecord.currentDisplayValue}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    Sample: {activeMetricRecord.sampleSize.toLocaleString()} {activeMetricRecord.sampleUnit} ({activeMetricRecord.marginOfError})
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Hash Proof */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verification SHA-256:</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-300 truncate max-w-[200px]">
                {activeMetricRecord.verificationHash}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: SQL Explorer */}
        {activeTab === "sql_explorer" && activeMetricRecord && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                PostgreSQL Aggregation Query for: <span className="text-teal-400">{activeMetricRecord.metricName}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Engine: PostgreSQL 16 + Timescale
              </span>
            </div>

            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              <pre>{activeMetricRecord.sqlQuery}</pre>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-teal-400" />
                <span>Audit &amp; Sample Information</span>
              </div>
              <div>• <strong>Raw Source:</strong> <code className="text-teal-300">{activeMetricRecord.rawDataSource}</code></div>
              <div>• <strong>Sample Size:</strong> {activeMetricRecord.sampleSize.toLocaleString()} {activeMetricRecord.sampleUnit}</div>
              <div>• <strong>Confidence Interval:</strong> {(activeMetricRecord.confidenceScore * 100).toFixed(1)}% ({activeMetricRecord.marginOfError})</div>
              <div>• <strong>Refresh Cycle:</strong> {activeMetricRecord.refreshInterval}</div>
            </div>
          </div>
        )}

      </div>

      {/* Suggested Quick Questions */}
      {activeTab === "chat" && (
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask anything about formulas, tables, or sample sizes..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all disabled:opacity-40"
          aria-label="Send query to Data Lineage Agent"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
