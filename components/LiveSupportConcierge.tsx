"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  TrendingUp,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Zap,
  Mail,
  CheckCircle2,
  ChevronDown,
  Minimize2,
  Maximize2,
  Minus
} from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  quickActions?: { label: string; action: string }[];
  timestamp: string;
}

const KNOWLEDGE_BASE: Record<string, { answer: string; quickActions?: { label: string; action: string }[] }> = {
  onboarding: {
    answer: "🚀 **Welcome to Zyvoriq! Here is how to create your first reel in 3 steps:**\n\n1. **Enter a Topic:** Head to **Studio Cinema** (`/studio`) or **Create** (`/studio/create`) and type a topic or select one from the **7-Day Trend Radar**.\n2. **Choose Character & Voice:** Select from our 14 Cast Avatars (e.g. Priya, Marcus, Ren).\n3. **Click 'Build Production Plan':** Zyvoriq generates hooks, 4 Veo scenes, and neural audio. You can then trim clips and export with 1 click!",
    quickActions: [
      { label: "Go to Studio Cinema", action: "link:/studio" },
      { label: "Explore Trend Radar", action: "link:/studio/trend-radar" }
    ]
  },
  trend_radar: {
    answer: "🔮 **7-Day Predictive Trend Radar** scours upstream data sources 7 days before topics peak on social algorithms:\n\n• **Sources:** ArXiv cs.AI papers, Stanford HAI, GitHub Stars (>500/24h), LinkedIn Pulse, and TikTok Search Vacuums.\n• **VOI Score (0-100):** Ranks virality probability based on search acceleration and low competitor saturation.\n• **1-Click Transpiler:** Transpiles raw research into 60s Reel scripts, 8-slide LinkedIn Carousels, and 2-Host Podcasts!",
    quickActions: [
      { label: "Open Trend Radar", action: "link:/studio/trend-radar" }
    ]
  },
  book_studio: {
    answer: "📚 **Original Book & Transmedia Studio** enables authors to build 100k+ word lore bibles and publish across formats:\n\n• **Stylometric Engines:** Write in the prose cadence of Tolkien, George R.R. Martin, or Frank Herbert.\n• **Omni-Modal Publishing:** Export valid Kindle EPUB 3 packages, 6\"x9\" paperback print layouts, and full-cast Audible audiobooks with -18dB score ducking.\n• **#BookTok Campaign:** Auto-generates 15 promotional AI Veo video prompts to market your book!",
    quickActions: [
      { label: "Open Book Studio", action: "link:/studio/books" }
    ]
  },
  monetization: {
    answer: "💰 **Monetization & Audio Armor Guide:**\n\n1. **Creator Rewards & AdSense:** Zyvoriq videos use non-destructive human timeline editing and C2PA provenance, qualifying for YouTube Partner Program & TikTok Creator Rewards.\n2. **Demonetization Armor:** Our Audio Armor engine automatically swaps sensitive/banned keywords with clean algorithmic synonyms to protect your account from shadowbans.\n3. **Commercial Rights:** You retain 100% commercial ownership of all exported reels, books, and audio tracks.",
    quickActions: [
      { label: "Check Veritas QA", action: "link:/veritas" },
      { label: "View Terms & Rights", action: "link:/terms" }
    ]
  },
  copyright: {
    answer: "🛡️ **Copyright, Veritas & Safety:**\n\n• **Public Domain Mythologies:** All stories are grounded in public domain mythologies (Vedic, Greek, Norse) and licensed procedural characters—eliminating trademark risk.\n• **C2PA Open Standards:** Exports embed tamper-evident cryptographic metadata meeting EU AI Act transparency rules.\n• **Zero Biometric Harvesting:** We do not collect private face or voice biometrics (100% BIPA & GDPR compliant).",
    quickActions: [
      { label: "Open Veritas QA Hub", action: "link:/veritas" }
    ]
  }
};

const SUGGESTED_CHIPS = [
  { label: "🚀 How do I create my first reel?", key: "onboarding" },
  { label: "🔮 How does 7-Day Trend Radar work?", key: "trend_radar" },
  { label: "📚 How do I write a book & EPUB?", key: "book_studio" },
  { label: "💰 How do I monetize without bans?", key: "monetization" },
  { label: "🛡️ How does copyright armor protect me?", key: "copyright" }
];

export function LiveSupportConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_init",
      sender: "ai",
      text: "👋 **Hi creator! I'm your Zyvoriq AI Concierge.**\n\nHow can I help you today? I can guide you through creating your first viral reel, exploring 7-Day Trend Radar, authoring books, or monetizing your content!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

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
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedKey = "";

      if (lower.includes("onboard") || lower.includes("start") || lower.includes("first reel") || lower.includes("create")) {
        matchedKey = "onboarding";
      } else if (lower.includes("trend") || lower.includes("radar") || lower.includes("predict") || lower.includes("viral")) {
        matchedKey = "trend_radar";
      } else if (lower.includes("book") || lower.includes("epub") || lower.includes("audible") || lower.includes("novel")) {
        matchedKey = "book_studio";
      } else if (lower.includes("monetiz") || lower.includes("money") || lower.includes("earn") || lower.includes("ban") || lower.includes("armor")) {
        matchedKey = "monetization";
      } else if (lower.includes("copyright") || lower.includes("legal") || lower.includes("veritas") || lower.includes("c2pa")) {
        matchedKey = "copyright";
      } else if (lower.includes("contact") || lower.includes("support") || lower.includes("human") || lower.includes("ticket")) {
        setShowContactForm(true);
        const aiMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: "📬 **Opening the Direct Support Ticket Form below.** You can send our engineering and creator support team a direct message.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      const response = matchedKey ? KNOWLEDGE_BASE[matchedKey] : {
        answer: `✨ **Thanks for asking!**\n\nI can help you with:\n• **Studio Cinema:** Building cinematic AI video reels (` + "`/studio`" + `)\n• **Trend Radar:** 7-Day Advance Viral Mining (` + "`/studio/trend-radar`" + `)\n• **Book Studio:** EPUB 3 & Audible World-Building (` + "`/studio/books`" + `)\n• **Contact:** Submit a direct support ticket.\n\nClick a suggestion below or tell me what you'd like to build!`,
        quickActions: [
          { label: "Explore Trend Radar", action: "link:/studio/trend-radar" },
          { label: "Submit Support Ticket", action: "contact" }
        ]
      };

      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: response.answer,
        quickActions: response.quickActions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setShowContactForm(false);
      setContactSent(false);
      const confirmMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: `✅ **Support ticket submitted successfully!** Our support team has received your message and will respond to **${contactEmail || "your email"}** within 4 hours.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, confirmMsg]);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1200);
  };

  return (
    <aside
      aria-label="Live AI Support Concierge and Help"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
    >
      {/* Floating Chat Modal */}
      {isOpen && (
        <section
          aria-label="Live Chat Concierge Window"
          className={`mb-3 rounded-3xl border border-slate-700/80 bg-obsidian-950/95 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden border-t-2 border-t-teal-400 transition-all duration-300 ${
            isMinimized
              ? "h-[60px] w-[320px]"
              : isMaximized
              ? "w-[92vw] max-w-[720px] h-[720px] max-h-[88vh]"
              : "w-[360px] sm:w-[420px] h-[560px] max-h-[80vh]"
          }`}
        >
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-bold text-obsidian-950">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border-2 border-obsidian-950 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Zyvoriq Concierge</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">Live</span>
                </div>
                {!isMinimized && <div className="text-[10px] text-slate-400">Creator Onboarding & Support</div>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs"
                title="Direct Support Ticket"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
              
              {/* Maximize / Restore Toggle */}
              {!isMinimized && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  title={isMaximized ? "Restore size" : "Maximize view"}
                  aria-label={isMaximized ? "Restore view" : "Maximize view"}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Minimize Toggle */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title={isMinimized ? "Expand chat" : "Minimize to bar"}
                aria-label={isMinimized ? "Expand chat" : "Minimize to bar"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                  setIsMaximized(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                aria-label="Close Chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                
                {/* Direct Contact Form Drawer */}
                {showContactForm && (
                  <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Submit Direct Support Ticket
                      </span>
                      <button onClick={() => setShowContactForm(false)} className="text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {contactSent ? (
                      <div className="py-4 text-center text-emerald-400 font-bold space-y-1">
                        <CheckCircle2 className="w-6 h-6 mx-auto animate-bounce" />
                        <div>Ticket Dispatched to Support Team!</div>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Your Email"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                        />
                        <textarea
                          required
                          rows={2}
                          placeholder="How can we help?"
                          value={contactMessage}
                          onChange={e => setContactMessage(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 resize-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-1.5 rounded-lg bg-teal-500 text-obsidian-950 font-bold text-xs hover:bg-teal-400 transition-all"
                        >
                          Send Ticket to Engineering
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Messages */}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.sender === "ai" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed space-y-2.5 ${
                        m.sender === "user"
                          ? "bg-teal-500 text-obsidian-950 font-medium rounded-br-none"
                          : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-md whitespace-pre-line"
                      }`}
                    >
                      <p>{m.text}</p>
                      
                      {m.quickActions && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.quickActions.map((qa, i) => (
                            qa.action.startsWith("link:") ? (
                              <Link
                                key={i}
                                href={qa.action.replace("link:", "")}
                                onClick={() => setIsOpen(false)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-teal-300 transition-all flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3 text-teal-400" />
                                {qa.label}
                              </Link>
                            ) : (
                              <button
                                key={i}
                                onClick={() => setShowContactForm(true)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-amber-300 transition-all flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3 text-amber-400" />
                                {qa.label}
                              </button>
                            )
                          ))}
                        </div>
                      )}

                      <div className={`text-[9px] font-mono text-right ${m.sender === "user" ? "text-obsidian-900" : "text-slate-500"}`}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <span>Concierge is drafting guidance...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions Chips */}
              <div className="p-2 border-t border-slate-800/80 bg-slate-950/80 flex gap-1.5 overflow-x-auto no-scrollbar">
                {SUGGESTED_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.label)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask anything or request creator help..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-obsidian-950 transition-all disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </section>
      )}

      {/* Floating Launcher Trigger Pill (When closed) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-obsidian-950 font-bold text-xs shadow-2xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
          aria-label="Toggle live AI support concierge"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 fill-current" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white animate-ping" />
          </div>
          <span>AI Concierge & Help</span>
        </button>
      )}
    </aside>
  );
}
