"use client";

import React, { useState } from "react";
import {
  RedditStoryConfig,
  SAMPLE_REDDIT_STORIES,
  generateRedditStory
} from "../lib/reel/redditStoryEngine";

interface RedditStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStory: (story: RedditStoryConfig) => void;
}

export default function RedditStoryModal({
  isOpen,
  onClose,
  onApplyStory
}: RedditStoryModalProps) {
  const [topic, setTopic] = useState("");
  const [theme, setTheme] = useState<RedditStoryConfig["storyTheme"]>("scary_mystery");
  const [selectedStory, setSelectedStory] = useState<RedditStoryConfig | null>(SAMPLE_REDDIT_STORIES[0]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const generated = generateRedditStory(topic, theme);
    setSelectedStory(generated);
  };

  const handleSelectSample = (sample: RedditStoryConfig) => {
    setSelectedStory(sample);
    setTopic(sample.title);
    setTheme(sample.storyTheme);
  };

  const handleApply = () => {
    if (selectedStory) {
      onApplyStory(selectedStory);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Reddit & iMessage Chat Bubble Story Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  📱 Viral Tier 2
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate suspenseful text conversations with animated typing bubbles and ambient sound effects.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              Quick Load Sample Viral Threads
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_REDDIT_STORIES.map((story) => (
                <button
                  key={story.title}
                  onClick={() => handleSelectSample(story)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedStory?.title === story.title
                      ? "bg-cyan-500/10 border-cyan-500 text-white"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-400">{story.subreddit}</span>
                    <span className="text-[10px] text-zinc-400">🔥 {story.upvotes.toLocaleString()} upvotes</span>
                  </div>
                  <div className="font-semibold text-xs text-white truncate">{story.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generator Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Story Premise or Thread Topic
              </label>
              <input
                type="text"
                placeholder="e.g. My smart doorbell recorded something outside my window..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Theme & Vibe</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as RedditStoryConfig["storyTheme"])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="scary_mystery">👻 Scary / Mystery (r/nosleep)</option>
                <option value="aita_drama">🎭 Relationship Drama (r/AITA)</option>
                <option value="confession">🤫 Wild Confession</option>
                <option value="wholesome_story">💖 Wholesome Story</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
          >
            ⚡ Generate Animated Conversation Sequence
          </button>

          {/* Live iMessage Chat Bubble Preview Simulator */}
          {selectedStory && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300">{selectedStory.subreddit}</span>
                  <span className="text-[11px] text-zinc-500">by {selectedStory.author}</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  🌧️ Ambient: {selectedStory.ambientAudio.replace("_", " ")}
                </div>
              </div>

              {/* Chat Bubbles */}
              <div className="space-y-3 py-2">
                {selectedStory.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "me" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 px-2 mb-0.5">
                      {msg.senderName} ({msg.timestampSec}s)
                    </span>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-zinc-800 text-zinc-100 rounded-bl-xs border border-zinc-700/60"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedStory}
            onClick={handleApply}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedStory
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Apply Story Reel to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
