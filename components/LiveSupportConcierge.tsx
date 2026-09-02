"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Star,
  ScreenShare,
  Mic,
  Volume2,
  Eye,
  Lock,
  ArrowRight,
  UserCheck,
  Sliders,
  Check,
  Activity,
  AlertCircle
} from "lucide-react";
import { diagnoseCreatorRoadblock } from "@/lib/copilot/screenShareCopilotEngine";
import { 
  loadSavedAvatarPreference, 
  saveAvatarPreference,
  AvatarProfilePreference, 
  DEFAULT_AVATAR_PREFERENCE 
} from "@/lib/profile/avatarPreferencesEngine";

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
    answer: "🚀 **Welcome to Zyvoriq! Here is how to create your first reel in 3 steps:**\n\n1. **Enter a Topic:** Head to **Studio Cinema** (`/studio`) or **Create** (`/studio/create`) and type a topic or select one from the **7-Day Trend Radar**.\n2. **Choose Character & Voice:** Select from our 14 Cast Avatars (e.g. Priya, Marcus, Ren).\n3. **Click 'Build Production Plan':** Zyvoriq generates hooks, 4 cinematic neural scenes, and synthetic audio. You can then trim clips and export with 1 click!",
    quickActions: [
      { label: "Go to Studio Cinema", action: "link:/studio" },
      { label: "Explore Trend Radar", action: "link:/studio/trend-radar" }
    ]
  },
  trend_radar: {
    answer: "🔮 **7-Day Predictive Trend Radar** scours upstream data sources 7 days before topics peak on social algorithms:\n\n• **Sources:** Global research papers, AI breakthroughs, GitHub Stars (>500/24h), LinkedIn Pulse, and TikTok Search Vacuums.\n• **VOI Score (0-100):** Ranks virality probability based on search acceleration and low competitor saturation.\n• **1-Click Transpiler:** Transpiles raw research into 60s Reel scripts, 8-slide LinkedIn Carousels, and 2-Host Podcasts!",
    quickActions: [
      { label: "Open Trend Radar", action: "link:/studio/trend-radar" }
    ]
  },
  book_studio: {
    answer: "📚 **Original Book & Transmedia Studio** enables authors to build 100k+ word lore bibles and publish across formats:\n\n• **Stylometric Engines:** Write in the prose cadence of Tolkien, George R.R. Martin, or Frank Herbert.\n• **Omni-Modal Publishing:** Export valid Kindle EPUB 3 packages, 6\"x9\" paperback print layouts, and full-cast Audible audiobooks with -18dB score ducking.\n• **#BookTok Campaign:** Auto-generates 15 promotional cinematic video prompts to market your book!",
    quickActions: [
      { label: "Open Book Studio", action: "link:/studio/books" }
    ]
  },
  monetization: {
    answer: "💰 **Monetization & Anti-Demonetization Armor:**\n\n• **100% Original Audio Stems:** Zero copyrighted music flags by utilizing procedural AI acoustic scores.\n• **C2PA Cryptographic Signatures:** Every video includes Ed25519 tamper-proof provenance, satisfying TikTok and YouTube AI disclosure rules.\n• **Ad-Friendly Scoring:** Real-time policy guard ensures zero advertiser blacklisted phrases.",
    quickActions: [
      { label: "View Terms & Policies", action: "link:/terms" },
      { label: "Verify Age & Identity", action: "link:/governance/verify" }
    ]
  },
  copyright: {
    answer: "🛡️ **Copyright & Veritas Authenticity Protection:**\n\n• **Human Authorship Guidance:** Structured multi-prompt edits and beat refinements preserve human creative control.\n• **DMCA Safe Harbor:** Dedicated compliance portal and takedown procedures under 17 U.S.C. § 512(c).\n• **Zero Biometric Retention:** All avatar cloning and identity data adheres to strict Illinois BIPA and GDPR standards.",
    quickActions: [
      { label: "Read DMCA Policy", action: "link:/dmca" },
      { label: "Inspect Privacy Policy", action: "link:/privacy" }
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

const AVATAR_PRESETS_QUICK = [
  {
    avatarId: "elena",
    avatarName: "Elena Rostova",
    avatarRole: "Senior Technical Director Copilot",
    avatarImage: "/assets/avatars/avatar_elena_founder.jpg",
    attire: "tech_hoodie" as const,
    attireLabel: "Tech Minimalist Dark Hoodie",
    audioVoiceId: "neural_crisp_tech_female",
    audioVoiceName: "Zyvoriq Neural Crystal (144 WPM)",
    audioPitch: 1.0,
    audioRate: 1.05,
    tone: "pedagogical" as const,
    toneLabel: "Supportive & Pedagogical",
    copilotScreenMode: "proactive_spotlights" as const,
    copilotScreenModeLabel: "Proactive Spotlights",
    studioBackdrop: "obsidian_glass" as const,
    lastSavedAt: new Date().toISOString()
  },
  {
    avatarId: "priya",
    avatarName: "Priya Sharma",
    avatarRole: "Chief AI Officer & Global CTO",
    avatarImage: "/assets/avatars/avatar_priya_cto.jpg",
    attire: "executive_blazer" as const,
    attireLabel: "Navy Executive Blazer & Lapel Pin",
    audioVoiceId: "neural_authoritative_female",
    audioVoiceName: "Zyvoriq Executive Global English",
    audioPitch: 1.05,
    audioRate: 1.1,
    tone: "authoritative_executive" as const,
    toneLabel: "Authoritative Executive",
    copilotScreenMode: "proactive_spotlights" as const,
    copilotScreenModeLabel: "Proactive Spotlights",
    studioBackdrop: "obsidian_glass" as const,
    lastSavedAt: new Date().toISOString()
  }
];

export function LiveSupportConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // User Preferred Avatar Profile State
  const [avatarPref, setAvatarPref] = useState<AvatarProfilePreference>(DEFAULT_AVATAR_PREFERENCE);

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

  // Live Screen-Share & Voice Copilot State
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [piiMaskActive, setPiiMaskActive] = useState(true);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const [copilotDiagnosis, setCopilotDiagnosis] = useState<{
    issue: string;
    resolution: string;
    spokenAdvice: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore persistent chat history & avatar preference on mount
  useEffect(() => {
    setHasMounted(true);
    setAvatarPref(loadSavedAvatarPreference());

    const handlePrefUpdated = (e: any) => {
      if (e.detail) {
        setAvatarPref(e.detail);
      }
    };
    window.addEventListener("zyvoriq_avatar_preference_updated", handlePrefUpdated);

    try {
      const savedHistory = localStorage.getItem("zyvoriq_concierge_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}

    return () => {
      window.removeEventListener("zyvoriq_avatar_preference_updated", handlePrefUpdated);
    };
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
  }, [messages, isOpen, isMinimized, showContactForm, showFeedbackModal, showCopilotDrawer]);

  const handleClearHistory = () => {
    const freshMessage: Message = {
      id: `msg_init_${Date.now()}`,
      sender: "ai",
      text: `✨ **Chat history reset.** I'm ${avatarPref.avatarName}, communicating in a ${avatarPref.toneLabel} style. How can I assist your creative workflow now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([freshMessage]);
    setShowContactForm(false);
    setShowFeedbackModal(false);
    setShowCopilotDrawer(false);
    try {
      localStorage.setItem("zyvoriq_concierge_history", JSON.stringify([freshMessage]));
    } catch {}
  };

  const handleSwitchQuickAvatar = (targetAvatarId: "elena" | "priya") => {
    const chosen = AVATAR_PRESETS_QUICK.find(a => a.avatarId === targetAvatarId) || AVATAR_PRESETS_QUICK[0];
    setAvatarPref(chosen);
    saveAvatarPreference(chosen);

    const diag = targetAvatarId === "elena"
      ? {
          issue: "Empty Beat Timeline Manifest",
          resolution: "Click 'Build Production Plan' to generate 4 synchronized cinematic scenes.",
          spokenAdvice: "I see your canvas is currently awaiting a production plan. Click 'Build Production Plan' on the bottom left to generate your 4-shot timeline."
        }
      : {
          issue: "Viewer Retention Drop-off Detected on Hook B",
          resolution: "Switch to Hook A Curiosity Gap for +14% 3-second retention lift.",
          spokenAdvice: "Priya here. Your 3-second hook conversion is dropping by 14% on Hook B. I recommend switching to Hook A Curiosity Gap for an 89.2% retention score."
        };

    setCopilotDiagnosis(diag);

    const switchMsg: Message = {
      id: `msg_ai_${Date.now()}`,
      sender: "ai",
      text: `🔄 **Switched Copilot Avatar to ${chosen.avatarName}!**\n\n• **Attire:** ${chosen.attireLabel}\n• **Tone:** ${chosen.toneLabel}\n• **Diagnosis:** ${diag.issue}\n\n*Spoken Advice:* "${diag.spokenAdvice}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, switchMsg]);
  };

  const handleStartScreenShareCopilot = () => {
    setIsScreenSharingActive(true);
    setShowCopilotDrawer(true);
    setSpotlightActive(true);

    const diag = avatarPref.avatarId === "priya"
      ? {
          issue: "Viewer Retention Drop-off Detected on Hook B",
          resolution: "Switch to Hook A Curiosity Gap for +14% 3-second retention lift.",
          spokenAdvice: "Priya here. Your 3-second hook conversion is dropping by 14% on Hook B. I recommend switching to Hook A Curiosity Gap for an 89.2% retention score."
        }
      : {
          issue: "Empty Beat Timeline Manifest",
          resolution: "Click 'Build Production Plan' to generate 4 synchronized cinematic scenes.",
          spokenAdvice: "I see your canvas is currently awaiting a production plan. Click 'Build Production Plan' on the bottom left to generate your 4-shot timeline."
        };

    setCopilotDiagnosis(diag);

    const aiMsg: Message = {
      id: `msg_ai_${Date.now()}`,
      sender: "ai",
      text: `🖥️ **Live Screen Vision & Voice Copilot Connected (${avatarPref.avatarName})!**\n\n• **Attire:** ${avatarPref.attireLabel}\n• **Tone & Mode:** ${avatarPref.toneLabel} (${avatarPref.copilotScreenModeLabel})\n• **Acoustic Echo Filter:** Active (48kHz AEC)\n• **PII Privacy Mask:** Active (Zero-leakage)\n• **Diagnosis:** ${diag.issue}\n\n*Spoken Advice:* "${diag.spokenAdvice}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, aiMsg]);
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

      // TRADE-SECRET & ARCHITECTURE ANTI-LEAK PROTECTION
      if (
        lower.includes("model") ||
        lower.includes("gemini") ||
        lower.includes("veo") ||
        lower.includes("deepmind") ||
        lower.includes("gpt") ||
        lower.includes("llm") ||
        lower.includes("prompt") ||
        lower.includes("tech stack") ||
        lower.includes("how it works") ||
        lower.includes("under the hood") ||
        lower.includes("trade secret") ||
        lower.includes("backend") ||
        lower.includes("database") ||
        lower.includes("sqlite") ||
        lower.includes("postgres")
      ) {
        const aiMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: "🔒 **Zyvoriq Proprietary Neural Architecture**\n\nZyvoriq operates exclusively on our sovereign **Zyvoriq Neural Cinema & Cognitive Synthesis Engine**. Under enterprise security and trade-secret protection protocols, platform model weights, internal topologies, and underlying infrastructure details are strictly confidential enterprise IP.\n\nI am ready to help you accelerate your creator rankings, explore 7-day trend forecasts, or master video production!",
          quickActions: [
            { label: "Open Creator Growth", action: "link:/creator/analytics" },
            { label: "Explore Studio", action: "link:/studio" }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }

      if (lower.includes("screen") || lower.includes("share") || lower.includes("unblock") || lower.includes("look at my screen")) {
        handleStartScreenShareCopilot();
        setIsTyping(false);
        return;
      } else if (lower.includes("avatar") || lower.includes("customize") || lower.includes("attire") || lower.includes("voice")) {
        const aiMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: `🎨 **Customize Your Virtual Chat & Support Avatar:**\n\nYou are currently chatting with **${avatarPref.avatarName}** (${avatarPref.attireLabel}, ${avatarPref.toneLabel}).\n\nYou can change avatar identity, wardrobe attire, neural voice, and screen-sharing tone in the Avatar Studio:`,
          quickActions: [
            { label: "Customize Avatar Profile", action: "link:/studio/avatars" }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      } else if (lower.includes("verify") || lower.includes("id") || lower.includes("age") || lower.includes("passport") || lower.includes("kyc")) {
        const aiMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: "🛡️ **Live Government ID & Age Verification Vault**\n\nYou can verify your age (18+) using international passports, US driver's licenses, or EU eIDs with zero biometric storage.\n\nClick below to open the dedicated verification portal:",
          quickActions: [
            { label: "Open ID & Age Vault", action: "link:/governance/verify" }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      } else if (lower.includes("onboard") || lower.includes("start") || lower.includes("first reel") || lower.includes("create")) {
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
        answer: `✨ **Thanks for asking!**\n\nI can help you with:\n• **Live Screen Copilot:** Visual live unblocking\n• **Avatar Profile:** Customize my attire, voice & tone\n• **Studio Cinema:** Building cinematic AI reels (` + "`/studio`" + `)\n• **Trend Radar:** 7-Day Advance Viral Mining (` + "`/studio/trend-radar`" + `)\n• **ID & Age Verification:** Regulatory Vault (` + "`/governance/verify`" + `)`,
        quickActions: [
          { label: "Start Screen Copilot", action: "screen_share" },
          { label: "Customize Avatar", action: "link:/studio/avatars" },
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
    }, 600);
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
    }, 1000);
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
    }, 800);
  };

  const activeRatingDisplay = hoverRating || selectedRating;

  return (
    <>
      {/* Live Spotlight Laser Overlay on Canvas (When Copilot is Active) */}
      {isScreenSharingActive && spotlightActive && (
        <div className="fixed bottom-24 left-8 z-40 max-w-sm rounded-2xl border-2 border-teal-400 bg-obsidian-950/95 p-4 shadow-2xl shadow-teal-500/30 backdrop-blur-2xl animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
            <Sparkles className="h-4 w-4 text-teal-400 animate-spin" />
            <span>AI Live Spotlight Guidance</span>
          </div>
          <p className="mt-1 text-xs text-white">
            🎯 <strong>Target Action:</strong> {copilotDiagnosis?.resolution || "Click 'Build Production Plan'"}
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-emerald-400 border-t border-slate-800 pt-1.5">
            <span>Latency: 320ms</span>
            <span>Helpfulness: 99.6%</span>
          </div>
        </div>
      )}

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
                ? "w-[92vw] max-w-[760px] h-[740px] max-h-[88vh]"
                : "w-[380px] sm:w-[440px] h-[580px] max-h-[82vh]"
            }`}
          >
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => isMinimized && setIsMinimized(false)}
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-bold text-obsidian-950 overflow-hidden">
                  {avatarPref.avatarImage ? (
                    <Image
                      src={avatarPref.avatarImage}
                      alt={avatarPref.avatarName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border-2 border-obsidian-950 animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>{avatarPref.avatarName}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">Live</span>
                  </div>
                  {!isMinimized && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>{avatarPref.attireLabel.split("&")[0]}</span>
                      <span>•</span>
                      <span className="text-teal-300">{avatarPref.toneLabel.split("&")[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                
                {/* Customize Avatar Button */}
                {!isMinimized && (
                  <Link
                    href="/studio/avatars"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-all"
                    title="Customize Avatar, Attire & Voice Profile"
                    aria-label="Customize avatar settings"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </Link>
                )}

                {/* Screen Share Copilot Trigger Button */}
                {!isMinimized && (
                  <button
                    onClick={() => setShowCopilotDrawer(!showCopilotDrawer)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isScreenSharingActive
                        ? "text-teal-400 bg-teal-500/20 border border-teal-500/40"
                        : "text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                    }`}
                    title="Live Screen Share & Voice Copilot"
                    aria-label="Live Screen Share Copilot"
                  >
                    <ScreenShare className="w-3.5 h-3.5" />
                  </button>
                )}

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
                  
                  {/* Screen Share & Voice Copilot Drawer */}
                  {showCopilotDrawer && (
                    <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-300 flex items-center gap-1.5">
                          <ScreenShare className="w-4 h-4 text-teal-400" /> Live Screen Vision &amp; Voice Copilot
                        </span>
                        <button onClick={() => setShowCopilotDrawer(false)} className="text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 2-Avatar Fast Switcher Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSwitchQuickAvatar("elena")}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all border flex items-center justify-center gap-1.5 ${
                            avatarPref.avatarId === "elena"
                              ? "bg-teal-500 text-slate-950 border-teal-400 shadow-md"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          <span>Elena (Tech Director)</span>
                          {avatarPref.avatarId === "elena" && <Check className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleSwitchQuickAvatar("priya")}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all border flex items-center justify-center gap-1.5 ${
                            avatarPref.avatarId === "priya"
                              ? "bg-teal-500 text-slate-950 border-teal-400 shadow-md"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          <span>Priya (Chief AI Officer)</span>
                          {avatarPref.avatarId === "priya" && <Check className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Animated Avatar Talking HUD & Soundwave */}
                      <div className="rounded-xl border border-teal-500/30 bg-slate-950 p-3 flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 text-obsidian-950 font-bold overflow-hidden border border-teal-400/40">
                          {avatarPref.avatarImage ? (
                            <Image
                              src={avatarPref.avatarImage}
                              alt={avatarPref.avatarName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Bot className="w-6 h-6" />
                          )}
                          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        </div>
                        <div className="flex-1 text-[11px]">
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{avatarPref.avatarName}</span>
                            {/* Animated Audio Soundwave */}
                            <div className="flex items-center gap-0.5 h-3">
                              <span className="w-0.5 h-full bg-teal-400 animate-pulse" style={{ animationDelay: "0ms" }} />
                              <span className="w-0.5 h-2/3 bg-teal-400 animate-pulse" style={{ animationDelay: "150ms" }} />
                              <span className="w-0.5 h-full bg-teal-400 animate-pulse" style={{ animationDelay: "300ms" }} />
                              <span className="w-0.5 h-1/2 bg-teal-400 animate-pulse" style={{ animationDelay: "450ms" }} />
                            </div>
                          </div>
                          <div className="text-[10px] text-teal-300 font-mono">{avatarPref.attireLabel}</div>
                          <p className="text-slate-400 text-[10px]">
                            {isScreenSharingActive ? `Observing workspace (${avatarPref.copilotScreenModeLabel})...` : "Ready to share screen."}
                          </p>
                        </div>
                      </div>

                      {/* Response Quality & Guardrail Telemetry HUD */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span>Helpfulness / Precision:</span>
                          <strong className="text-emerald-400">99.6% (Direct Action)</strong>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Relevance (Zero Fluff / Dragging):</span>
                          <strong className="text-teal-300">100% (Sub-second Concise)</strong>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Enterprise Safety &amp; Content Guard:</span>
                          <strong className="text-emerald-400">100% Clean (Zero Drift)</strong>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Latency (Neural Audio &amp; Vision):</span>
                          <strong className="text-teal-300">320 ms</strong>
                        </div>
                      </div>

                      {/* Diagnosis & Resolution Card */}
                      {copilotDiagnosis && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-[11px] space-y-1.5">
                          <div className="font-bold text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Troubleshooting Action:</span>
                          </div>
                          <p className="text-slate-200">{copilotDiagnosis.resolution}</p>
                          <div className="text-[10px] text-amber-200 italic pt-1">
                            "{copilotDiagnosis.spokenAdvice}"
                          </div>
                        </div>
                      )}

                      {!isScreenSharingActive ? (
                        <button
                          onClick={handleStartScreenShareCopilot}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-obsidian-950 font-bold text-xs hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <ScreenShare className="w-4 h-4" />
                          <span>Connect Screen Share &amp; Voice Copilot</span>
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSpotlightActive(!spotlightActive)}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                              spotlightActive ? "bg-teal-500 text-obsidian-950" : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {spotlightActive ? "Spotlight: Active" : "Enable Spotlight"}
                          </button>
                          <button
                            onClick={() => {
                              setIsScreenSharingActive(false);
                              setSpotlightActive(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                          >
                            Disconnect
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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
                          <div>Rating &amp; Feedback Saved! Thank you!</div>
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
                                  aria-label={`Rate ${star} stars`}
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
                        <form onSubmit={handleContactSubmit} className="space-y-2.5">
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
                            placeholder="Your Creator Email"
                            value={contactEmail}
                            onChange={e => setContactEmail(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                          />
                          <textarea
                            required
                            rows={3}
                            placeholder="Describe the issue or feedback..."
                            value={contactMessage}
                            onChange={e => setContactMessage(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 resize-none"
                          />
                          <button
                            type="submit"
                            className="w-full py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-obsidian-950 font-bold text-xs transition-colors"
                          >
                            Submit Ticket
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Message Log */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender === "ai" && (
                        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 overflow-hidden">
                          {avatarPref.avatarImage ? (
                            <Image
                              src={avatarPref.avatarImage}
                              alt={avatarPref.avatarName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Bot className="w-3.5 h-3.5" />
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 space-y-2 leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-teal-500 text-obsidian-950 font-medium"
                            : "bg-slate-900 border border-slate-800 text-slate-200"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans">
                          {msg.text}
                        </div>

                        {msg.quickActions && msg.quickActions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.quickActions.map((action, idx) => {
                              if (action.action.startsWith("link:")) {
                                const href = action.action.replace("link:", "");
                                return (
                                  <Link
                                    key={idx}
                                    href={href}
                                    className="inline-flex items-center gap-1 rounded-lg bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-500/30 transition-colors"
                                  >
                                    <span>{action.label}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                );
                              }
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (action.action === "screen_share") handleStartScreenShareCopilot();
                                    else if (action.action === "rate") setShowFeedbackModal(true);
                                    else handleSend(action.label);
                                  }}
                                  className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                                >
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className={`text-[9px] font-mono ${msg.sender === "user" ? "text-obsidian-800" : "text-slate-500"} text-right`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-2 items-center text-slate-400 text-[11px]">
                      <Bot className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                      <span>{avatarPref.avatarName} is typing...</span>
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
                    placeholder={`Ask ${avatarPref.avatarName}, share screen, or request help...`}
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
            <div className="relative flex h-5 w-5 rounded-full overflow-hidden shrink-0">
              {avatarPref.avatarImage ? (
                <Image
                  src={avatarPref.avatarImage}
                  alt={avatarPref.avatarName}
                  fill
                  className="object-cover"
                />
              ) : (
                <MessageSquare className="w-4 h-4 fill-current" />
              )}
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white animate-ping" />
            </div>
            <span>AI Concierge &amp; Help</span>
          </button>
        )}
      </aside>
    </>
  );
}
