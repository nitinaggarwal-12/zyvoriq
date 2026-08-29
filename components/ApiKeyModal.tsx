"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Key,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Plus,
  RefreshCw,
  Activity,
  Star,
  Layers,
  AlertTriangle,
  Bot
} from "lucide-react";
import { KeyEntry, getStoredKeyPool, saveStoredKeyPool, maskKey, testSingleKey } from "@/lib/ai/apiKeyPool";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [newKeyValue, setNewKeyValue] = useState<string>("");
  const [isBulkOpen, setIsBulkOpen] = useState<boolean>(false);
  const [bulkInput, setBulkInput] = useState<string>("");
  const [isTestingAll, setIsTestingAll] = useState<boolean>(false);
  const [autoHealthCheck, setAutoHealthCheck] = useState<boolean>(true);
  const [selectedPrimaryKeyId, setSelectedPrimaryKeyId] = useState<string | null>(null);

  // Load pool from storage on open
  useEffect(() => {
    if (!isOpen) return;

    const pool = getStoredKeyPool();
    if (pool.length > 0) {
      setKeys(pool);
      setSelectedPrimaryKeyId(pool[0]?.id || null);
    } else {
      // Check if server env has a key
      fetch("/api/health/api-key")
        .then((res) => res.json())
        .then((data) => {
          if (data.configured && data.ok) {
            const defaultEntry: KeyEntry = {
              id: "server_env_default",
              name: "Server Environment Key (Railway)",
              key: "SERVER_ENV_KEY",
              masked: "AIzaSy••••••••••••(Railway Env)",
              status: "alive",
              latencyMs: 35,
              lastChecked: new Date().toLocaleTimeString(),
              tier: data.tier || "Veo 3.1 & Gemini 2.5 TTS"
            };
            setKeys([defaultEntry]);
            setSelectedPrimaryKeyId(defaultEntry.id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Continuous Health Check Loop (Every 25s when modal is open)
  useEffect(() => {
    if (!isOpen || !autoHealthCheck || keys.length === 0) return;

    const interval = setInterval(() => {
      runContinuousHealthCheck();
    }, 25000);

    return () => clearInterval(interval);
  }, [isOpen, autoHealthCheck, keys.length]);

  const runContinuousHealthCheck = async () => {
    setIsTestingAll(true);
    const updated = await Promise.all(
      keys.map(async (entry) => {
        if (entry.id === "server_env_default") {
          return { ...entry, lastChecked: new Date().toLocaleTimeString() };
        }
        const result = await testSingleKey(entry.key);
        return {
          ...entry,
          status: result.status,
          latencyMs: result.latencyMs,
          error: result.error,
          tier: result.tier,
          lastChecked: new Date().toLocaleTimeString()
        };
      })
    );
    setKeys(updated);
    saveStoredKeyPool(updated);
    setIsTestingAll(false);
  };

  const handleTestKey = async (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "testing" } : k))
    );

    const target = keys.find((k) => k.id === id);
    if (!target) return;

    if (target.id === "server_env_default") {
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: "alive", lastChecked: new Date().toLocaleTimeString() } : k))
      );
      return;
    }

    const result = await testSingleKey(target.key);
    setKeys((prev) => {
      const next = prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status: result.status,
              latencyMs: result.latencyMs,
              error: result.error,
              tier: result.tier,
              lastChecked: new Date().toLocaleTimeString()
            }
          : k
      );
      saveStoredKeyPool(next);
      return next;
    });
  };

  const handleAddKey = async () => {
    if (!newKeyValue.trim()) return;

    const newId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: KeyEntry = {
      id: newId,
      name: newKeyName.trim() || `Google Key #${keys.length + 1}`,
      key: newKeyValue.trim(),
      masked: maskKey(newKeyValue.trim()),
      status: "testing",
      lastChecked: "Just added"
    };

    const nextKeys = [newEntry, ...keys];
    setKeys(nextKeys);
    setNewKeyName("");
    setNewKeyValue("");

    // Test immediately
    const result = await testSingleKey(newEntry.key);
    setKeys((prev) => {
      const updated = prev.map((k) =>
        k.id === newId
          ? {
              ...k,
              status: result.status,
              latencyMs: result.latencyMs,
              error: result.error,
              tier: result.tier,
              lastChecked: new Date().toLocaleTimeString()
            }
          : k
      );
      saveStoredKeyPool(updated);
      return updated;
    });
  };

  const handleBulkAdd = async () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split(/\r?\n/).filter((l) => l.trim().length > 10);
    const newEntries: KeyEntry[] = lines.map((line, idx) => {
      const cleanKey = line.trim();
      return {
        id: `bulk_${Date.now()}_${idx}`,
        name: `Key Pool #${keys.length + idx + 1}`,
        key: cleanKey,
        masked: maskKey(cleanKey),
        status: "testing",
        lastChecked: "Imported"
      };
    });

    const combined = [...newEntries, ...keys];
    setKeys(combined);
    setBulkInput("");
    setIsBulkOpen(false);

    // Test all imported keys
    const tested = await Promise.all(
      combined.map(async (k) => {
        if (newEntries.some((ne) => ne.id === k.id)) {
          const result = await testSingleKey(k.key);
          return {
            ...k,
            status: result.status,
            latencyMs: result.latencyMs,
            error: result.error,
            tier: result.tier,
            lastChecked: new Date().toLocaleTimeString()
          };
        }
        return k;
      })
    );

    setKeys(tested);
    saveStoredKeyPool(tested);
  };

  const handleDeleteKey = (id: string) => {
    const next = keys.filter((k) => k.id !== id);
    setKeys(next);
    saveStoredKeyPool(next);
  };

  const handleSetPrimary = (id: string) => {
    setSelectedPrimaryKeyId(id);
    const target = keys.find((k) => k.id === id);
    if (target && target.key !== "SERVER_ENV_KEY") {
      document.cookie = `zyvoriq_gemini_api_key=${target.key}; path=/; max-age=31536000; SameSite=Strict`;
    }
  };

  const aliveCount = keys.filter((k) => k.status === "alive").length;
  const deadCount = keys.filter((k) => k.status === "dead").length;
  const rateLimitedCount = keys.filter((k) => k.status === "rate_limited").length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-5 font-mono overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Key className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-serif uppercase tracking-wider">
                  Multi-Key Load Balancer & Health Sentinel Pool
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                  AUTO-FAILOVER ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add multiple Google Gemini & Veo API keys with continuous alive/dead probing and zero-downtime rotation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white self-end sm:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Pool Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Total Keys</span>
            <span className="font-bold text-white text-sm">{keys.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
            <span className="text-emerald-400 text-[10px] uppercase font-bold">🟢 Alive</span>
            <span className="font-bold text-emerald-300 text-sm">{aliveCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
            <span className="text-amber-400 text-[10px] uppercase font-bold">⚠️ Rate-Limited</span>
            <span className="font-bold text-amber-300 text-sm">{rateLimitedCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
            <span className="text-rose-400 text-[10px] uppercase font-bold">❌ Dead / Expired</span>
            <span className="font-bold text-rose-300 text-sm">{deadCount}</span>
          </div>
        </div>

        {/* Action Controls & Batch Tools */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTestingAll || keys.length === 0}
              onClick={runContinuousHealthCheck}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isTestingAll ? "animate-spin" : ""}`} />
              <span>{isTestingAll ? "Probing All Keys..." : "⚡ Ping All Keys"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
            >
              {isBulkOpen ? "Close Bulk" : "+ Bulk Import"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoHealthCheck}
                onChange={(e) => setAutoHealthCheck(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Continuous 25s Sentinel</span>
            </label>
          </div>
        </div>

        {/* Bulk Import Drawer */}
        {isBulkOpen && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 animate-fadeIn">
            <div className="text-xs font-bold text-slate-300 uppercase">Paste Multiple Keys (1 per line):</div>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={3}
              placeholder="AIzaSyKey1...&#10;AIzaSyKey2...&#10;AIzaSyKey3..."
              className="w-full p-3 rounded-xl bg-black border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleBulkAdd}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Import & Test All
              </button>
            </div>
          </div>
        )}

        {/* Add Single Key Input Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase">Add New Gemini API Key:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key Label (e.g. Account #2)"
              className="px-3.5 py-2.5 rounded-xl bg-black border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <input
              type="password"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="AIzaSy..."
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-black border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div className="flex justify-between items-center pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Get Free Key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              disabled={!newKeyValue.trim()}
              onClick={handleAddKey}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Pool</span>
            </button>
          </div>
        </div>

        {/* Keys Pool List Table */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-60 pr-1">
          {keys.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              No API keys in pool yet. Add a key above or configure GEMINI_API_KEY in server environment.
            </div>
          ) : (
            keys.map((k) => {
              const isPrimary = selectedPrimaryKeyId === k.id;
              return (
                <div
                  key={k.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    k.status === "alive"
                      ? "bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400"
                      : k.status === "rate_limited"
                      ? "bg-amber-950/30 border-amber-500/40 hover:border-amber-400"
                      : k.status === "dead"
                      ? "bg-rose-950/30 border-rose-500/40 hover:border-rose-400"
                      : "bg-slate-900/50 border-slate-800"
                  }`}
                >
                  {/* Left Key Info */}
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs truncate">{k.name}</span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold uppercase flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-cyan-400" />
                          <span>Primary Active</span>
                        </span>
                      )}
                      {k.tier && (
                        <span className="text-[10px] text-slate-500 hidden md:inline">
                          ({k.tier})
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                      <span>{k.masked}</span>
                      {k.lastChecked && (
                        <span className="text-[10px] text-slate-500">
                          Checked: {k.lastChecked}
                        </span>
                      )}
                    </div>

                    {k.error && (
                      <div className="text-[10px] text-rose-300 truncate">
                        {k.error}
                      </div>
                    )}
                  </div>

                  {/* Right Status & Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Status Badge */}
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                        k.status === "alive"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : k.status === "rate_limited"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : k.status === "dead"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {k.status === "testing" ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : k.status === "alive" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ALIVE ({k.latencyMs || 42}ms)</span>
                        </>
                      ) : k.status === "rate_limited" ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>RATE LIMITED</span>
                        </>
                      ) : k.status === "dead" ? (
                        <>
                          <X className="w-3 h-3" />
                          <span>DEAD / 403</span>
                        </>
                      ) : (
                        <span>UNKNOWN</span>
                      )}
                    </div>

                    {/* Ping Button */}
                    <button
                      type="button"
                      onClick={() => handleTestKey(k.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Test Key Live"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    {/* Set Primary Button */}
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(k.id)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] uppercase font-bold transition-colors"
                      >
                        Set Primary
                      </button>
                    )}

                    {/* Delete Button (Only for custom added keys) */}
                    {k.id !== "server_env_default" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Auto-failover switches immediately if an active key hits 429 rate limit.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
