"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Instagram,
  Youtube,
  Linkedin,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Globe,
  Radio,
  Hash,
  Send
} from "lucide-react";
import {
  SocialPlatformId,
  DEFAULT_CONNECTED_ACCOUNTS,
  generatePlatformMetadata,
  calculatePeakPostTime,
  PublishResult
} from "@/lib/reel/socialPublishing";

interface SocialPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  productionId: string;
  videoUrl?: string;
}

export function SocialPublishModal({
  isOpen,
  onClose,
  topic,
  productionId,
  videoUrl
}: SocialPublishModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformId>("instagram_reels");
  const [metadata, setMetadata] = useState(() => generatePlatformMetadata(topic, "instagram_reels"));
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState(calculatePeakPostTime().slice(0, 16));
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMetadata(generatePlatformMetadata(topic, selectedPlatform));
    setPublishResult(null);
    setError("");
  }, [selectedPlatform, topic]);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/reels/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          productionId: productionId || "prod_active_demo",
          title: metadata.title,
          caption: metadata.caption,
          hashtags: metadata.hashtags,
          isScheduled,
          scheduledTime: isScheduled ? new Date(scheduleTime).toISOString() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish");
      }

      setPublishResult(data.result);
    } catch (err: any) {
      setError(err?.message || "Publishing failed");
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlatformIcon = (id: SocialPlatformId) => {
    switch (id) {
      case "instagram_reels": return <Instagram className="h-4 w-4 text-pink-400" />;
      case "youtube_shorts": return <Youtube className="h-4 w-4 text-red-500" />;
      case "tiktok": return <Radio className="h-4 w-4 text-teal-400" />;
      case "linkedin_video": return <Linkedin className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0f15] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                1-Click Multi-Platform Publishing Hub
              </h2>
              <p className="text-xs text-slate-400">
                Direct OAuth dispatch to YouTube Shorts, Instagram Reels, TikTok & LinkedIn.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5">
          {/* Platform Selector Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Channel</label>
            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {DEFAULT_CONNECTED_ACCOUNTS.map(acc => {
                const isSelected = selectedPlatform === acc.platform;
                return (
                  <button
                    key={acc.platform}
                    onClick={() => setSelectedPlatform(acc.platform)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      {getPlatformIcon(acc.platform)}
                      <span className="h-2 w-2 rounded-full bg-emerald-400" title="OAuth Connected" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-white">{acc.name}</span>
                    <span className="text-[10px] text-slate-500 truncate w-full">{acc.handle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Caption */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400">Video Headline / Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-white outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">Post Caption & Description</label>
              <textarea
                rows={3}
                value={metadata.caption}
                onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-slate-200 outline-none focus:border-pink-500 resize-none"
              />
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400">AI Viral Hashtags</label>
                <button
                  onClick={() => setMetadata(generatePlatformMetadata(topic, selectedPlatform))}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-400 hover:underline"
                >
                  <Sparkles className="h-3 w-3" /> Refresh Hashtags
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {metadata.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
                  >
                    <Hash className="h-2.5 w-2.5 text-pink-400" />
                    {tag.replace("#", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule vs Immediate Dispatch Toggle */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-bold text-white">Auto-Schedule for Peak Engagement</span>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`rounded-full px-3 py-1 text-xs font-black transition ${
                  isScheduled ? "bg-teal-400 text-slate-950" : "bg-white/10 text-slate-400"
                }`}
              >
                {isScheduled ? "SCHEDULED" : "PUBLISH NOW"}
              </button>
            </div>

            {isScheduled && (
              <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3">
                <Clock className="h-4 w-4 text-slate-500" />
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-slate-200 outline-none"
                />
                <span className="text-[10px] text-teal-300 font-bold">Recommended Peak Slot</span>
              </div>
            )}
          </div>

          {/* Success / Error Message Banner */}
          {publishResult && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {publishResult.status === "SCHEDULED"
                    ? `Scheduled for ${new Date(publishResult.scheduledFor!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "Published Successfully!"}
                </span>
              </div>
              {publishResult.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200 hover:underline"
                >
                  View Post <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/5 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-pink-500/25 transition hover:bg-pink-400 disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isPublishing
              ? "Dispatching OAuth…"
              : isScheduled
              ? "Confirm & Schedule Post"
              : `1-Click Publish to ${DEFAULT_CONNECTED_ACCOUNTS.find(a => a.platform === selectedPlatform)?.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}
