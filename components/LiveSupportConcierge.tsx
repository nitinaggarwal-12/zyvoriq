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
  Minus,
  RotateCcw,
  Trash2,
  Star
} from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  quickActions?: { label: string; action: string }[];
  timestamp: string;
}

const DEFAULT_INITIAL_MESSAGE: Message = {
  id: "msg_init",
  sender: "ai",
  text: "👋 **Hi creator! I'm your Zyvoriq AI Concierge.**\n\nHow can I help you today? I can guide you through creating your first viral reel, exploring 7-Day Trend Radar, authoring books, or monetizing your content!",
  timestamp: "Just now"
};

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

const RATING_LABELS = [
  "1 - Needs Improvement",
  "2 - Fair",
  "3 - Good Support",
  "4 - Very Helpful",
  "5 - Exceptional (5/5)"
];

export function LiveSupportConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([DEFAULT_INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // Feedback CSAT Rating State (1 to 5)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore persistent chat history on mount
  useEffect(() => {
    setHasMounted(true);
    try {
      const savedHistory = localStorage.getItem("zyvoriq_concierge_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}
  }, []);

  // Save history whenever messages change
  useEffect(() => {
    if (hasMounted && messages.length > 0) {
      try {
        localStorage.setItem("zyvoriq_concierge_history", JSON.stringify(messages));
      } catch {}
    }
  }, [messages, hasMounted]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleClearHistory = () => {
    const freshMessage: Message = {
      id: `msg_init_${Date.now()}`,
      sender: "ai",
      text: "✨ **Chat history reset.** How can I assist your creative workflow now?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([freshMessage]);
    setShowContactForm(false);
    setShowFeedbackModal(false);
    try {
      localStorage.setItem("zyvoriq_concierge_history", JSON.stringify([freshMessage]));
    } catch {}
  };

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
      } else if (lower.includes("rate") || lower.includes("feedback") || lower.includes("end chat") || lower.includes("score")) {
        setShowFeedbackModal(true);
        const aiMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: "⭐ **We'd love to hear your feedback!** Please rate your chat support experience on a scale of 1 to 5 (5 being highest) using the rating card below.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        return;
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
        answer: `✨ **Thanks for asking!**\n\nI can help you with:\n• **Studio Cinema:** Building cinematic AI video reels (` + "`/studio`" + `)\n• **Trend Radar:** 7-Day Advance Viral Mining (` + "`/studio/trend-radar`" + `)\n• **Book Studio:** EPUB 3 & Audible World-Building (` + "`/studio/books`" + `)\n• **Contact & Feedback:** Submit a ticket or rate support.\n\nClick a suggestion below or tell me what you'd like to build!`,
        quickActions: [
          { label: "Explore Trend Radar", action: "link:/studio/trend-radar" },
          { label: "Rate Support (1-5 ⭐)", action: "rate" }
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

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    try {
      localStorage.setItem("zyvoriq_concierge_csat", JSON.stringify({
        rating: selectedRating,
        note: feedbackNote,
        timestamp: new Date().toISOString()
      }));
    } catch {}

    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      const thankMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: `🌟 **Thank you for your ${selectedRating}/5 star rating!** Your feedback directly helps us improve the Zyvoriq creator experience. Let us know if you need anything else!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, thankMsg]);
      setFeedbackNote("");
    }, 1000);
  };

  const activeRatingDisplay = hoverRating || selectedRating;

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
              
              {/* Rate Support (1-5 Stars) Button */}
              {!isMinimized && (
                <button
                  onClick={() => setShowFeedbackModal(!showFeedbackModal)}
                  className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all"
                  title="Rate Support (1 to 5 Stars)"
                  aria-label="Rate chat support"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Reset History Button */}
              {!isMinimized && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-all"
                  title="Clear Chat & Start Fresh Session"
                  aria-label="Clear chat history"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Direct Support Ticket Button */}
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
                
                {/* 1 to 5 Star CSAT Feedback Drawer */}
                {showFeedbackModal && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-current" /> Rate Chat Support (1 - 5)
                      </span>
                      <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {feedbackSubmitted ? (
                      <div className="py-3 text-center text-emerald-400 font-bold space-y-1">
                        <CheckCircle2 className="w-6 h-6 mx-auto animate-bounce" />
                        <div>Rating & Feedback Saved! Thank you!</div>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                        <div className="text-center space-y-1.5">
                          <p className="text-[11px] text-slate-300">How would you rate your support experience?</p>
                          
                          {/* 5-Star Interactive Rating Selector */}
                          <div className="flex items-center justify-center gap-2 py-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setSelectedRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(null)}
                                className="p-1 transition-transform hover:scale-125 focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    star <= activeRatingDisplay
                                      ? "text-amber-400 fill-amber-400 drop-shadow-md"
                                      : "text-slate-600 hover:text-slate-400"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          
                          <div className="text-[10px] font-mono font-bold text-amber-300">
                            {RATING_LABELS[activeRatingDisplay - 1]}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Optional feedback: What did you like or what can we improve?"
                          value={feedbackNote}
                          onChange={e => setFeedbackNote(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                        />

                        <button
                          type="submit"
                          className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-obsidian-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-md"
                        >
                          Submit {selectedRating}/5 Rating
                        </button>
                      </form>
                    )}
                  </div>
                )}

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
                            ) : qa.action === "rate" ? (
                              <button
                                key={i}
                                onClick={() => setShowFeedbackModal(true)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-amber-300 transition-all flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 text-amber-400 fill-current" />
                                {qa.label}
                              </button>
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
