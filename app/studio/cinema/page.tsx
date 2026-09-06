"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { StudioSidebar } from "@/components/StudioSidebar";
import {
  Clapperboard,
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Globe,
  Download,
  Share2,
  Sliders,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  Cpu,
  Terminal,
  Activity,
  Award,
  Zap,
  Check,
  ChevronRight,
  AlertCircle,
  Clock,
  Music,
  Users,
  Eye,
  Camera,
  Flame,
  Info,
  Mic,
  MessageSquare,
  Volume1,
  BookOpen,
  List,
  ArrowRight
} from "lucide-react";
import {
  DHARMAKSHETRA_ACTS,
  DHARMAKSHETRA_DIALOGUES,
  DHARMAKSHETRA_118_SHOTS,
  CinematicAct,
  CinematicShot
} from "@/lib/cinema/dharmakshetra15m";
import {
  NAPOLEON_ROMANCE_ACTS,
  NAPOLEON_ROMANCE_30_SHOTS,
  NAPOLEON_ROMANCE_DIALOGUES
} from "@/lib/cinema/napoleonRomance180s";

export interface DialogueLine {
  id: string;
  character: string;
  actorRole: string;
  voiceGender?: "male" | "female";
  timestampSec: number;
  timecodeFormatted?: string;
  emotion: string;
  text: {
    hi?: string;
    en: string;
    es?: string;
    fr?: string;
    ja?: string;
    de?: string;
    it?: string;
    sa?: string;
    [key: string]: string | undefined;
  };
}

export interface CastMember {
  character: string;
  actor: string;
  actorId: string;
  archetype: string;
  vocalProfile: string;
  wardrobe: string;
}

export interface CrewMember {
  role: string;
  name: string;
  modelEngine: string;
  notes: string;
}

export interface FrameAudit {
  timecodeSec: number;
  timecodeFormatted: string;
  detectedEntities: string[];
  hasSacredIconography: boolean;
  eraClassification: "Ancient Vedic / Bronze Age" | "Contemporary 21st Century" | "Near-Future Cyberpunk" | "Nomadic Medieval";
  visualMood: string;
  semanticAlignmentScore: number;
  notes: string;
}

export interface DetectedIssue {
  id: string;
  category: "CANON_REVERENCE" | "BIOMECHANICAL_ANATOMY" | "TEMPORAL_GLITCH" | "LIP_SYNC_ACOUSTICS" | "PROP_CONTINUITY" | "LEGAL_IP";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  timecode: string;
  description: string;
  impactAnalysis: string;
  suggestedActuator: "INVARIANT_ROUTER" | "SAM2_INPAINTING" | "GOOGLE_FILM" | "CRANIUM_LIP_WARP" | "REALITY_SHADER";
  autoHealAvailable: boolean;
  directorManualOptions: string[];
}

export interface MultimodalEvaluationResult {
  evaluationId: string;
  timestamp: string;
  videoSrc: string;
  filmTitle: string;
  requestedGenre: string;
  overallStatus: "CERTIFIED_IMF_MASTER" | "REJECTED_MULTIMODAL_MISMATCH";
  scores: {
    semanticCongruence: number;
    temporalCoherence: number;
    kinematicYield: number;
    syncNetConfidence: number;
    lufsLoudnessDb: number;
  };
  culturalReverenceGate: {
    passed: boolean;
    status: "VERIFIED_REVERENT" | "SACRILEGE_ALERT" | "SECULAR_NEUTRAL";
    reasoning: string;
  };
  framesAudited: FrameAudit[];
  detectedIssues: DetectedIssue[];
  c2paAuditHash: string;
  remedyAction?: string;
}

export interface CinemaFilm {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  format: string;
  durationMinutes: number;
  shotCount: number;
  directorAesthetic: string;
  leadActors: string[];
  musicalScore: string;
  videoSrc: string;
  veritasScore: number;
  c2paCertId: string;
  imfStatus: string;
  availableLanguages: string[];
  subtitles: Record<string, string>;
  synopsis: string;
  dialogues: DialogueLine[];
  cast?: CastMember[];
  crew?: CrewMember[];
}

const PRELOADED_ORIGINALS: CinemaFilm[] = [
  {
    id: "film_napoleon_romance",
    title: "Napoleon: The Emperor's Heart (L'Amour et L'Empire)",
    tagline: "The Epic Love Story of Napoleon Bonaparte, Désirée Clary, and Empress Joséphine · 180.0s SMPTE Master",
    genre: "Historical Romance / Period Cinema",
    format: "3:00 Mins · 30 Shots (SMPTE 24.00 fps Broadcast Cut)",
    durationMinutes: 3,
    shotCount: 30,
    directorAesthetic: "Ridley Scott & Kubrick Naturalist Candlelight 2.39:1 Anamorphic",
    leadActors: ["Napoleon Bonaparte (Young Artillery Officer / Emperor)", "Désirée Clary (First Love)", "Empress Joséphine de Beauharnais"],
    musicalScore: "Beethoven Symphony No. 7 in A major, Op. 92 – II. Allegretto (Pure Acoustic Strings Orchestra)",
    videoSrc: "/scratch/productions/napoleon_romance/shots/napoleon_romance_180s_master.mp4",
    veritasScore: 99.8,
    c2paCertId: "c2pa_ed25519_napoleon_romance_180s_master_certified",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["French (Native)", "English", "Italian", "Spanish", "German"],
    subtitles: {
      "fr": "Napoléon: 'Regardez, mademoiselle... Il n'y a pas de plus belle vue dans toute la Provence à cette heure.'",
      "en": "Napoleon: 'Look, mademoiselle... There is no finer view in all of Provence at this hour.'",
      "it": "Napoleone: 'Guardate, signorina... Non c'è vista più bella in tutta la Provenza a quest'ora.'",
      "es": "Napoleón: 'Mire, señorita... No hay vista más hermosa en toda la Provenza a esta hora.'",
      "de": "Napoleon: 'Seht, Mademoiselle... Zu dieser Stunde gibt es in der ganzen Provence keinen schöneren Anblick.'"
    },
    synopsis: "From a passionate youth in revolutionary Marseilles courting the merchant's daughter Désirée Clary, to the whirlwind coronation of Joséphine in Notre-Dame Cathedral and the tragic political divorce of 1809, this 180-second cinematic master chronicles the turbulent emotional life of the man who conquered Europe but could never conquer love.",
    dialogues: NAPOLEON_ROMANCE_DIALOGUES,
    cast: [
      {
        character: "Napoleon Bonaparte",
        actor: "Paul M. (Procedural Synthetic Star)",
        actorId: "syn_napoleon_01",
        archetype: "The Ambition & The Agony",
        vocalProfile: "Commanding Baritone with Corsican Undercurrent",
        wardrobe: "Dark Blue Revolutionary Coat with Gold Epaulets / Ermine Coronation Robes"
      },
      {
        character: "Désirée Clary",
        actor: "Camille R. (Procedural Star)",
        actorId: "syn_desiree_02",
        archetype: "Youthful Innocence & First Love",
        vocalProfile: "Soft Lyric Soprano",
        wardrobe: "Pastel Silk Empire-waist Gown with Marseilles Lace"
      },
      {
        character: "Empress Joséphine de Beauharnais",
        actor: "Élodie D. (Procedural Star)",
        actorId: "syn_josephine_03",
        archetype: "Grace, Elegance & Tragic Sacrifice",
        vocalProfile: "Warm Melancholic Mezzo-Soprano",
        wardrobe: "Imperial Crimson Velvet Robe Embroidered with Golden Bees"
      }
    ],
    crew: [
      {
        role: "Director Swarm",
        name: "Autonomous Period Romance Directive v4.0",
        modelEngine: "Veo 3.1 & Multimodal Gemini 2.5 Cinema Engine",
        notes: "Natural Candlelight Lighting, 2.39:1 Anamorphic Lens Geometry"
      },
      {
        role: "Musical Orchestration",
        name: "Beethoven Symphony No. 7 Chamber Master",
        modelEngine: "48kHz 24-bit Broadcast Master",
        notes: "Symphony No. 7 in A major, Op. 92 – II. Allegretto (Pure Acoustic Master, Zero Electronic Buzzers)"
      },
      {
        role: "Audio Engineering & Sync",
        name: "Speech Limiter & Foley High-Pass Filter",
        modelEngine: "Zero Voice Overlap Architecture",
        notes: "Zero Cross-Talk Bleed · Native French Dialogue · EBU R128 -24 LUFS Compliance"
      }
    ]
  }
];

export default function CinemaStudioPage() {
  const [activeTab, setActiveTab] = useState<"originals" | "produce" | "telemetry">("originals");
  const [selectedFilm, setSelectedFilm] = useState<CinemaFilm>(PRELOADED_ORIGINALS[0]);
  const [selectedLang, setSelectedLang] = useState<string>("fr"); // Default to French Native for Napoleon!
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [autoNarrateDialogues, setAutoNarrateDialogues] = useState<boolean>(true);
  const [activeSpeakingLineId, setActiveSpeakingLineId] = useState<string | null>(null);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("");
  const [showCastCrewModal, setShowCastCrewModal] = useState<boolean>(false);

  // Production Form State
  const [prodTitle, setProdTitle] = useState("Noor-e-Ishq: Chapter II (The Swiss Reprise)");
  const [prodLogline, setProdLogline] = useState("Two estranged lovers from Udaipur and Geneva meet again under the shadows of the Matterhorn during the winter solstice, with secrets neither can reveal.");
  const [prodGenre, setProdGenre] = useState("romantic_epic");
  const [prodFormat, setProdFormat] = useState<"short_15m" | "pilot_30m" | "feature_90m">("short_15m");
  const [prodDirector, setProdDirector] = useState("yash_chopra_chiffon");
  const [prodLeadCast, setProdLeadCast] = useState<string[]>(["syn_kabir_01", "syn_meera_02"]);
  const [prodMusicTheme, setProdMusicTheme] = useState("lyria_sitar_orchestral");

  // 4-Tier QA Controls
  const [arcfaceThreshold, setArcfaceThreshold] = useState<number>(0.86);
  const [kinematicGuard, setKinematicGuard] = useState<boolean>(true);
  const [visionScoreThreshold, setVisionScoreThreshold] = useState<number>(85);
  const [enableJLCut, setEnableJLCut] = useState<boolean>(true);
  const [enableFoleyIR, setEnableFoleyIR] = useState<boolean>(true);
  const [circuitBreakerRetries, setCircuitBreakerRetries] = useState<number>(3);

  // Dispatch & Live Telemetry State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genProgress, setGenProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<string>("idle");
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[00:00.04] Initiating Autonomous Studio OS Engine...",
    "[00:00.12] Screenplay Parsed: 5 Acts, 118 atomic shots allocated with Google DeepMind Veo 3.1 cinematic conditioning.",
    "[00:00.45] Biometric Talent Vault: Locked Bhagwan Shri Krishna & Dhanurdhara Arjuna (ArcFace 512-dim embedding threshold: 0.86).",
    "[00:00.90] Soundstage Engine: J-Cut/L-Cut dialogue overlap active (+800ms lead-in) · Foley IR reverb primed.",
    "[00:01.32] 20 cloud GPU workers dispatched. Shots #001 to #020 rendering concurrently.",
    "[00:02.10] Automated 4-Tier QA Robo-Director active: ArcFace similarity 0.914, 0 extra limbs detected.",
    "[00:03.45] SELF-HEALED: Retargeted Shot #014 optical motion vectors with Google FILM inpainting.",
    "[00:04.20] SMPTE 2067-21 IMF Master Package Sealed & Cryptographically Signed (C2PA Ed25519)."
  ]);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [showMultimodalModal, setShowMultimodalModal] = useState<boolean>(false);
  const [multimodalResult, setMultimodalResult] = useState<MultimodalEvaluationResult | null>(null);
  const [isAuditingMultimodal, setIsAuditingMultimodal] = useState<boolean>(false);
  const [multimodalAuditError, setMultimodalAuditError] = useState<string | null>(null);
  const [healingWorkflowMode, setHealingWorkflowMode] = useState<"autonomous" | "manual">("autonomous");
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [healingStepProgress, setHealingStepProgress] = useState<string | null>(null);
  const [healedSuccessData, setHealedSuccessData] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasSpokenMap = useRef<Record<string, boolean>>({});

  // 15-Minute Feature Film Master State
  const [timeline15mSec, setTimeline15mSec] = useState<number>(0);
  const [is118ShotModalOpen, setIs118ShotModalOpen] = useState<boolean>(false);
  const [isScreenplayModalOpen, setIsScreenplayModalOpen] = useState<boolean>(false);
  const [showImfModal, setShowImfModal] = useState<boolean>(false);
  const [showShotManifestModal, setShowShotManifestModal] = useState<boolean>(false);
  const [manifestCopied, setManifestCopied] = useState<boolean>(false);
  const [hasVideoLoadError, setHasVideoLoadError] = useState<boolean>(false);

  // Active Act derived from timeline15mSec
  const currentAct = DHARMAKSHETRA_ACTS.find(
    (act) => timeline15mSec >= act.timecodeStartSec && timeline15mSec < act.timecodeEndSec
  ) || DHARMAKSHETRA_ACTS[0];

  // Active Shot derived from timeline15mSec (1 to 118)
  const currentShot = DHARMAKSHETRA_118_SHOTS.find(
    (s) => timeline15mSec >= s.timecodeStartSec && timeline15mSec < s.timecodeEndSec
  ) || DHARMAKSHETRA_118_SHOTS[0];

  // Active 15m dialogue matching current timeline window
  const active15mDialogue = DHARMAKSHETRA_DIALOGUES.find(
    (d) => Math.abs(d.timestampSec - timeline15mSec) <= 15
  );

  // High-Precision Master Playback Clock (15 minutes = 900 seconds)
  // Decoupled from individual video clips to ensure continuous 15-minute playback without synthetic loops
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeline15mSec((prev) => {
        if (prev >= 900) {
          setIsPlaying(false);
          return 900;
        }
        return Number((prev + 0.25).toFixed(2));
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Dialogue narration synchronized with Master Timeline
  useEffect(() => {
    if (!isPlaying || !autoNarrateDialogues) return;
    const currentSecInt = Math.floor(timeline15mSec);
    const matchingLine = selectedFilm.dialogues.find(
      (d) => Math.abs(d.timestampSec - currentSecInt) <= 1 && !hasSpokenMap.current[d.id]
    );
    if (matchingLine) {
      hasSpokenMap.current[matchingLine.id] = true;
      speakDialogueLine(matchingLine, selectedLang);
    }
  }, [timeline15mSec, isPlaying, autoNarrateDialogues, selectedFilm.dialogues, selectedLang]);

  const formatTime15m = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // Dynamic video footage matching the synthesized video of the film
  const activeVideoSrc = useMemo(() => {
    return selectedFilm.videoSrc || "";
  }, [selectedFilm.videoSrc]);

  const prevSrcRef = useRef<string>(activeVideoSrc);
  useEffect(() => {
    if (videoRef.current && prevSrcRef.current !== activeVideoSrc) {
      prevSrcRef.current = activeVideoSrc;
      const wasPlaying = isPlaying;
      if (activeVideoSrc) {
        videoRef.current.src = activeVideoSrc;
        videoRef.current.load();
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      } else {
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
    }
  }, [activeVideoSrc, isPlaying]);

  const getShotMotionStyle = (shotType: string) => {
    switch (shotType) {
      case "Extreme Wide Aerial":
        return "scale-100 transition-all duration-[2000ms] ease-out";
      case "Close-Up Hero":
        return "scale-110 object-top transition-all duration-[2000ms] ease-out";
      case "Extreme Close-Up":
        return "scale-120 contrast-105 transition-all duration-[1500ms] ease-out";
      case "Low-Angle Dutch Tilt":
        return "scale-105 rotate-1 transition-all duration-[2000ms] ease-out";
      case "Tracking Dolly":
        return "scale-105 translate-x-2 transition-all duration-[2000ms] ease-linear";
      case "Wide Battle Canvas":
      default:
        return "scale-102 transition-all duration-[2000ms] ease-out";
    }
  };

  const handleScrub15m = (val: number) => {
    setTimeline15mSec(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val % (videoRef.current.duration || 6.0);
    }
    // Clean spoken status for upcoming lines after seek position so they speak properly
    Object.keys(hasSpokenMap.current).forEach((key) => {
      const d = selectedFilm.dialogues.find((dia) => dia.id === key);
      if (d && d.timestampSec >= val) {
        delete hasSpokenMap.current[key];
      }
    });
    // Check if there is a dialogue line right at this seek point
    const nearLine = selectedFilm.dialogues.find(
      (d) => Math.abs(d.timestampSec - val) <= 3
    );
    if (nearLine) {
      hasSpokenMap.current[nearLine.id] = true;
      speakDialogueLine(nearLine, selectedLang);
    }
  };

  const jumpToAct = (actNum: number) => {
    const act = DHARMAKSHETRA_ACTS.find((a) => a.actNumber === actNum);
    if (act) {
      handleScrub15m(act.timecodeStartSec);
    }
  };

  const jumpToShot = (shotNum: number) => {
    const shot = DHARMAKSHETRA_118_SHOTS.find((s) => s.shotNumber === shotNum);
    if (shot) {
      handleScrub15m(shot.timecodeStartSec);
      setIs118ShotModalOpen(false);
    }
  };

  // Reset subtitle when film or language changes
  useEffect(() => {
    hasSpokenMap.current = {};
    const initialLine = selectedFilm.dialogues[0];
    if (initialLine) {
      const text = initialLine.text[selectedLang as keyof typeof initialLine.text] || initialLine.text["hi"] || initialLine.text["en"];
      setCurrentSubtitleText(`${initialLine.character}: '${text}'`);
    } else {
      setCurrentSubtitleText(selectedFilm.subtitles[selectedLang] || selectedFilm.subtitles["hi"] || selectedFilm.subtitles["en"] || "");
    }
  }, [selectedFilm, selectedLang]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakDialogueLine = (line: DialogueLine, lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();

    const textToSpeak = line.text[lang as keyof typeof line.text] || line.text["hi"] || line.text["en"];
    const displaySubtitle = `${line.character}: '${textToSpeak}'`;
    setCurrentSubtitleText(displaySubtitle);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Language mapping
    const langMap: Record<string, string> = {
      hi: "hi-IN",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      ja: "ja-JP"
    };
    utterance.lang = langMap[lang] || "hi-IN";

    // Character & emotional voice modulation
    if (line.character.includes("Krishna")) {
      utterance.pitch = 0.78; // Deep, serene celestial baritone (Bhagwan Shri Krishna)
      utterance.rate = 0.88;
    } else if (line.character.includes("Arjuna")) {
      utterance.pitch = 0.95; // Tormented kshatriya warrior tenor (Dhanurdhara Arjuna)
      utterance.rate = 0.92;
    } else if (line.voiceGender === "male") {
      utterance.pitch = 0.82; // Warm baritone (Kabir Verma)
      utterance.rate = 0.90;
    } else {
      utterance.pitch = 1.15; // Lyrical alto (Meera Sen)
      utterance.rate = 0.95;
    }

    // Best matching voice lookup
    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = utterance.lang.toLowerCase().split("-")[0];
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (match) {
      utterance.voice = match;
    }

    // Audio ducking: Duck background video volume to 50% so background score remains audible and grand
    if (videoRef.current) {
      videoRef.current.volume = 0.50;
    }

    utterance.onend = () => {
      setActiveSpeakingLineId(null);
      if (videoRef.current) {
        videoRef.current.volume = 0.90;
      }
    };

    utterance.onerror = () => {
      setActiveSpeakingLineId(null);
      if (videoRef.current) {
        videoRef.current.volume = 0.90;
      }
    };

    setActiveSpeakingLineId(line.id);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeakingLineId(null);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      // If at start, trigger the first line immediately if auto-narrate is on
      if (autoNarrateDialogues && selectedFilm.dialogues.length > 0 && !hasSpokenMap.current[selectedFilm.dialogues[0].id]) {
        hasSpokenMap.current[selectedFilm.dialogues[0].id] = true;
        speakDialogueLine(selectedFilm.dialogues[0], selectedLang);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (timeline15mSec / 900) * 100;
    setVideoProgress(progress);
  };

  const handleLaunchProduction = async () => {
    setIsGenerating(true);
    setActiveTab("telemetry");
    setGenProgress(5);
    setActiveStage("Decomposing Screenplay into 122 Atomic Shot Manifests");
    setTelemetryLogs([
      `[00:00.90] Soundstage Engine: J-Cut/L-Cut dialogue overlap active (+800ms lead-in) · Foley IR reverb primed.`,
      `[00:00.45] Biometric Talent Vault: Locked ${prodLeadCast.join(" & ")} (ArcFace 512-dim embedding threshold: ${arcfaceThreshold}).`,
      `[00:00.12] Screenplay Parsed: 3 Acts, 122 atomic shots allocated with Google DeepMind Veo 3.1 cinematic conditioning.`,
      `[00:00.04] Initiating Autonomous Studio OS Engine...`
    ]);

    try {
      const res = await fetch("/api/studio/cinema/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prodTitle,
          prompt: prodLogline,
          genre: prodGenre,
          format: prodFormat,
          leadCast: prodLeadCast,
          directorStyle: prodDirector,
          qaThresholds: {
            arcfaceMatch: arcfaceThreshold,
            kinematicPassRate: 0.95,
            geminiVisionScore: visionScoreThreshold,
            maxRetries: circuitBreakerRetries
          },
          soundstage: {
            jCutLCut: enableJLCut,
            opticalFoley: enableFoleyIR,
            autoDuckingDb: -12,
            musicalTheme: prodMusicTheme
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dispatch failed");

      // Progress animation steps simulating the 20-worker automated pipeline
      setTimeout(() => {
        setGenProgress(25);
        setActiveStage("Parallel 20x Cloud GPU Batch Dispatch (Veo 2 & Imagen 3)");
        setTelemetryLogs((prev) => [
          `[00:01.32] 20 cloud GPU workers dispatched. Shots #001 to #020 rendering concurrently.`,
          ...prev
        ]);
      }, 1000);

      setTimeout(() => {
        setGenProgress(55);
        setActiveStage("Automated 4-Tier QA Robo-Director (ArcFace & YOLOv10)");
        setTelemetryLogs((prev) => [
          `[00:02.80] Shot #014 re-evaluated: ArcFace 0.931, Kinematics 100% (SELF-HEALED).`,
          `[00:02.45] Shot #014 flagged (hand anatomy anomaly) -> Auto-reroll triggered (+137 seed jitter).`,
          `[00:02.10] 4-Tier QA Gate: 28 shots evaluated. ArcFace mean score: 0.922 (PASS).`,
          ...prev
        ]);
      }, 2000);

      setTimeout(() => {
        setGenProgress(80);
        setActiveStage("Neural Lip-Sync, Foley Impulse Response & Lyria Arranger");
        setTelemetryLogs((prev) => [
          `[00:04.05] Lyria 3.0 Sitar & Strings stems master ducked to -12dB under spoken dialogue.`,
          `[00:03.65] Optical motion foley synced: snow footsteps, saree fabric rustle, train whistle.`,
          `[00:03.20] DeepMind Emotional TTS synthesized with native Hindi phoneme cadence.`,
          ...prev
        ]);
      }, 3000);

      setTimeout(() => {
        setGenProgress(100);
        setActiveStage("Completed: 4K Master Exported & C2PA Cryptographically Signed");
        setTelemetryLogs((prev) => [
          `[00:05.00] Master Film ready for distribution on Netflix, Prime Video & Zyvoriq Cinema.`,
          `[00:04.80] C2PA Ed25519 digital signature embedded, IMF SMPTE 2067 package sealed.`,
          `[00:04.50] Concat pass complete. Kodak 2383 3D LUT + 35mm film grain composited.`,
          ...prev
        ]);
        setIsGenerating(false);

        // Prepend new film to originals
        const newFilm: CinemaFilm = {
          id: `film_custom_${Date.now()}`,
          title: prodTitle,
          tagline: prodLogline,
          genre: "Bollywood Romantic Epic / Musical",
          format: prodFormat === "short_15m" ? "Festival Short (15m)" : "Prestige Feature",
          durationMinutes: prodFormat === "short_15m" ? 15 : 90,
          shotCount: prodFormat === "short_15m" ? 122 : 920,
          directorAesthetic: "Yash Chopra Golden Hour & Chiffon",
          leadActors: prodLeadCast,
          musicalScore: "Lyria 3.0 Orchestral Sitar & Strings",
          videoSrc: "",
          veritasScore: 98.1,
          c2paCertId: `c2pa_ed25519_${Date.now()}_master`,
          imfStatus: "IMF_SMPTE_2067_CERTIFIED",
          availableLanguages: ["Hindi (Native)", "English", "Spanish"],
          subtitles: {
            "en": "Kabir: 'Time changes, but this heartbeat remains eternal.'",
            "hi": "कबीर: 'वक़्त बदल सकता है, पर यह धड़कन नहीं...'"
          },
          synopsis: prodLogline,
          dialogues: [
            {
              id: "dia_custom_1",
              character: "Kabir Verma",
              actorRole: "Romantic Lead",
              voiceGender: "male",
              timestampSec: 2,
              emotion: "Solemn Passion",
              text: {
                hi: "वक़्त बदल सकता है, पर यह धड़कन हमेशा तुम्हारा ही नाम लेगी।",
                en: "Time may change, but this heartbeat will always whisper your name.",
                es: "El tiempo puede cambiar, pero este latido siempre susurrará tu nombre.",
                fr: "Le temps peut changer, mais ce battement de cœur chuchotera toujours ton nom.",
                ja: "時は変われど、この鼓動は常に君の名を囁き続ける。"
              }
            }
          ]
        };
        setSelectedFilm(newFilm);
      }, 4200);

    } catch (err: any) {
      console.error("Production generation error:", err);
      setIsGenerating(false);
      setActiveStage("Failed");
      setTelemetryLogs((prev) => [`[ERROR] ${err.message}`, ...prev]);
    }
  };

  const handleAuditMultimodal = async (overrideParams?: {
    title?: string;
    genre?: string;
    videoSrc?: string;
    dialogues?: DialogueLine[];
  }) => {
    setIsAuditingMultimodal(true);
    setMultimodalAuditError(null);
    setShowMultimodalModal(true);

    try {
      const payload = {
        filmId: selectedFilm.id,
        title: overrideParams?.title ?? selectedFilm.title,
        genre: overrideParams?.genre ?? selectedFilm.genre,
        videoSrc: overrideParams?.videoSrc ?? selectedFilm.videoSrc,
        dialogues: overrideParams?.dialogues ?? selectedFilm.dialogues
      };

      const res = await fetch("/api/studio/cinema/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Multimodal evaluation failed");
      setMultimodalResult(data);
    } catch (err: any) {
      console.error("Multimodal frame evaluation error:", err);
      setMultimodalAuditError(err.message || "Failed to audit frames");
    } finally {
      setIsAuditingMultimodal(false);
    }
  };

  const handleExecuteSelfHealing = async (params: {
    issueId?: string;
    actuatorType?: "INVARIANT_ROUTER" | "SAM2_INPAINTING" | "GOOGLE_FILM" | "CRANIUM_LIP_WARP" | "REALITY_SHADER";
    mode: "autonomous" | "manual_override";
    markArtisticIntent?: boolean;
    customDirection?: string;
  }) => {
    setIsHealing(true);
    setHealingStepProgress("Engaging Self-Healing Actuator...");
    try {
      await new Promise((r) => setTimeout(r, 600));
      setHealingStepProgress("Synthesizing Invariant Patch & Retargeting Vectors...");
      const res = await fetch("/api/studio/cinema/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filmId: selectedFilm.id,
          issueId: params.issueId || "issue_reverence_001",
          actuatorType: params.actuatorType || "INVARIANT_ROUTER",
          mode: params.mode,
          markArtisticIntent: params.markArtisticIntent,
          customDirection: params.customDirection
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Self-healing failed");

      setHealingStepProgress("Verifying 6-Sensor Perception Mesh...");
      await new Promise((r) => setTimeout(r, 600));

      setHealedSuccessData(data);
      if (multimodalResult) {
        setMultimodalResult({
          ...multimodalResult,
          overallStatus: "CERTIFIED_IMF_MASTER",
          scores: data.newScores,
          culturalReverenceGate: {
            passed: true,
            status: "VERIFIED_REVERENT",
            reasoning: data.patchSummary
          },
          detectedIssues: [],
          c2paAuditHash: data.c2paAuditHash
        });
      }

      if (data.remedyApplied) {
        setSelectedFilm((prev) => ({
          ...prev,
          title: data.remedyApplied.title,
          genre: data.remedyApplied.genre,
          videoSrc: data.remedyApplied.videoSrc
        }));
      }
    } catch (err: any) {
      console.error("Healing error:", err);
      alert(`Self-healing error: ${err.message}`);
    } finally {
      setIsHealing(false);
      setHealingStepProgress(null);
    }
  };

  return (
    <StudioSidebar currentPath="/studio/cinema">
      <main className="flex-1 min-w-0 mx-auto max-w-[1600px] w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-6 md:pt-10 pb-16 overflow-x-hidden min-h-dvh">
        
        {/* Sticky Full-Width Header Bar with Ample Margin */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                <Clapperboard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                    ZYVORIQ CINEMA ORIGINALS
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Phase 3 Cloud Studio
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-slate-400 max-w-3xl">
                  Autonomous Original Movie Production House · End-to-end screenplay decomposition, 4-Tier automated QA self-healing, synthetic Bollywood star casting, and IMF distribution packaging.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Studio KPI Highlights */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Overhead:</span>
              <span className="font-bold text-white font-mono">$0 Soundstage</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-slate-400">QA Gates:</span>
              <span className="font-bold text-teal-300 font-mono">4-Tier Auto</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">Master:</span>
              <span className="font-bold text-amber-300 font-mono">4K IMF / C2PA</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mt-8 pb-4 border-b border-slate-800/60 overflow-x-auto">
          <div className="flex items-center gap-3">
            <button
              id="tab-originals"
              onClick={() => setActiveTab("originals")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "originals"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Originals Vault (Stream & Distribute)</span>
            </button>

            <button
              id="tab-produce"
              onClick={() => setActiveTab("produce")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "produce"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Autonomous Movie Studio (Create)</span>
            </button>

            <button
              id="tab-telemetry"
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "telemetry"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Mission Control & 4-Tier QA Telemetry</span>
              {isGenerating && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORIGINALS VAULT (STREAMING & DISTRIBUTION MASTER) */}
        {/* ======================================================== */}
        {activeTab === "originals" && (
          <div className="space-y-10 mt-8">
            
            {/* Grand Marquee Spotlight Player */}
            <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Cinema Video Player & Synchronized Dialogue Engine */}
                <div className="lg:col-span-7 space-y-4">

                  {/* 15-Minute Feature Film Chapter / Act Jump Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Acts:</span>
                      {[
                        { act: 1, label: "Act I (00:00)", id: "jump-act-1" },
                        { act: 2, label: "Act II (02:45)", id: "jump-act-2" },
                        { act: 3, label: "Act III (05:45)", id: "jump-act-3" },
                        { act: 4, label: "Act IV (09:30)", id: "jump-act-4" },
                        { act: 5, label: "Act V (12:45)", id: "jump-act-5" },
                      ].map((btn) => (
                        <button
                          key={btn.act}
                          id={btn.id}
                          onClick={() => jumpToAct(btn.act)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            currentAct.actNumber === btn.act
                              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="open-118-shot-edl-btn"
                        onClick={() => setIs118ShotModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/20 transition-all"
                      >
                        <List className="h-3.5 w-3.5" />
                        <span>118-Shot Master EDL</span>
                      </button>
                      <button
                        id="open-screenplay-modal-btn"
                        onClick={() => setIsScreenplayModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Screenplay</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Viewport Container with Dynamic Overlays */}
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-2xl">
                    {activeVideoSrc ? (
                      <video
                        ref={videoRef}
                        src={activeVideoSrc}
                        playsInline
                        muted={isMuted}
                        preload="auto"
                        onError={() => setHasVideoLoadError(true)}
                        onLoadedData={() => setHasVideoLoadError(false)}
                        onTimeUpdate={handleTimeUpdate}
                        className={`w-full h-full object-cover transform transition-all duration-700 ${getShotMotionStyle(currentShot.shotType)} ${hasVideoLoadError ? "opacity-0" : "opacity-100"}`}
                      />
                    ) : null}

                    {/* Fresh Slate Cinematic Canvas (Renders when local video assets are cleared) */}
                    {(hasVideoLoadError || !activeVideoSrc) ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-xl">
                          <Film className="h-8 w-8" />
                        </div>
                        <span className="px-3 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-bold mb-2">
                          CLEAN SLATE · FRESH PRODUCTION CANVAS
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-white font-serif tracking-wide max-w-xl">
                          {selectedFilm.title}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-lg mt-1 font-mono">
                          {currentShot.heading} · {currentShot.shotType}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => setActiveTab("produce")}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all pointer-events-auto"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Launch Fresh AI Studio Diffusion</span>
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Act 5 Theatrical Master Credits Overlay */}
                    {currentAct.actNumber === 5 && timeline15mSec >= 840 && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6 text-center z-15 backdrop-blur-[2px] pointer-events-none">
                        <span className="text-amber-400 font-serif text-xl tracking-widest uppercase font-bold">Dharmakshetra: The Song of the Divine</span>
                        <span className="text-xs text-slate-300 font-mono mt-1.5">C2PA Cryptographic Provenance · 4K SMPTE ST 2067 Master</span>
                        <span className="text-[11px] text-amber-500/90 font-mono mt-2">Directed by Autonomous Multi-Agent Epic Swarm</span>
                      </div>
                    )}

                    {/* Top Unified HUD: Zero-Overlap Act, Shot, and Camera Telemetry */}
                    <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-4 pointer-events-none z-10">
                      {/* Left: Act & Shot Telemetry */}
                      <div className="space-y-1.5">
                        <div
                          id="active-act-badge"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-lg"
                        >
                          <Flame className="h-3.5 w-3.5 text-amber-400" />
                          <span>ACT {currentAct.actNumber}: {currentAct.title}</span>
                        </div>
                        <div
                          id="active-shot-badge"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-slate-300 font-mono border border-slate-700/60"
                        >
                          <Camera className="h-3 w-3 text-teal-400" />
                          <span>Shot #{String(currentShot.shotNumber).padStart(3, "0")} / 118 · {currentShot.shotType}</span>
                        </div>
                      </div>

                      {/* Right: Unified Scene & Optics Card */}
                      <div className="text-right space-y-1.5 hidden sm:block max-w-[340px]">
                        <div
                          id="active-scene-heading"
                          className="px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[11px] text-slate-200 font-mono border border-slate-700 truncate shadow-lg"
                        >
                          {currentShot.heading}
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-teal-300 font-mono border border-slate-800 flex items-center justify-end gap-2">
                          <span>📹 {currentShot.lens}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-amber-400">💡 {currentShot.lighting}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtitle Overlay (Dynamic to spoken dialogue or current language) */}
                    <div className="absolute bottom-14 left-0 right-0 px-6 text-center pointer-events-none z-10">
                      <p id="cinema-subtitle-text" className="inline-block px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md text-amber-300 font-serif text-sm md:text-base border border-amber-500/30 shadow-2xl max-w-[90%]">
                        {active15mDialogue ? (
                          `${active15mDialogue.character}: '${active15mDialogue.text[selectedLang as keyof typeof active15mDialogue.text] || active15mDialogue.text.hi || active15mDialogue.text.en}'`
                        ) : (
                          currentSubtitleText || selectedFilm.subtitles[selectedLang] || selectedFilm.subtitles["hi"] || selectedFilm.subtitles["en"]
                        )}
                      </p>
                    </div>

                    {/* Active Voice Speaking Badge */}
                    {activeSpeakingLineId && (
                      <div className="absolute top-16 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs shadow-lg backdrop-blur-md animate-pulse">
                        <Volume1 className="h-3.5 w-3.5 animate-bounce" />
                        <span>Speaking: {selectedFilm.dialogues.find(d => d.id === activeSpeakingLineId)?.character} ({selectedLang.toUpperCase()})</span>
                      </div>
                    )}

                    {/* 15-Minute Video Player Controls Bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4 flex items-center justify-between gap-3 z-20">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={togglePlay}
                          className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-all font-bold min-h-[36px]"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950 ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="h-9 w-9 rounded-xl bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700 transition-all min-h-[36px]"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Interactive 15-Minute Scrubber */}
                      <div className="flex-1 flex items-center gap-2.5">
                        <input
                          id="timeline-scrubber-15m"
                          type="range"
                          min={0}
                          max={900}
                          step={0.5}
                          value={timeline15mSec}
                          onChange={(e) => handleScrub15m(Number(e.target.value))}
                          className="flex-1 h-2 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
                        />
                        <span id="timecode-display-15m" className="text-xs font-mono font-bold text-amber-400 shrink-0">
                          {formatTime15m(timeline15mSec)} / 15:00.00
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-slate-400 hidden sm:inline">1080p 4K HDR</span>
                      </div>
                    </div>
                  </div>

                  {/* Multilingual Audio & Subtitle Switcher */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-400">Audio / Subtitles:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["hi", "en", "es", "fr", "ja"].map((lang) => (
                          <button
                            key={lang}
                            id={`lang-btn-${lang}`}
                            onClick={() => {
                              setSelectedLang(lang);
                              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                window.speechSynthesis.cancel();
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedLang === lang
                                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                : "bg-slate-800/80 text-slate-300 hover:text-white"
                            }`}
                          >
                            {lang.toUpperCase()}{lang === "hi" ? " (Native)" : ""}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-Narrate Spoken Dialogue Toggle */}
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setAutoNarrateDialogues(!autoNarrateDialogues)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border transition-all ${
                          autoNarrateDialogues
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <Mic className="h-3 w-3" />
                        <span>Auto-Voice Narrate: {autoNarrateDialogues ? "ON" : "OFF"}</span>
                      </button>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SCENE DIALOGUES & NEURAL VOICE TRACK (INTERACTIVE SCRIPT) */}
                  {/* ======================================================== */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-amber-400" />
                        <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                          Scene Dialogue & Spoken Voice Track ({selectedLang.toUpperCase()})
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Click any line to hear actor speak aloud
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedFilm.dialogues && selectedFilm.dialogues.length > 0 ? (
                        selectedFilm.dialogues.map((dia) => {
                          const isActive = activeSpeakingLineId === dia.id;
                          const lineText = dia.text[selectedLang as keyof typeof dia.text] || dia.text["hi"] || dia.text["en"];

                          return (
                            <div
                              key={dia.id}
                              id={`dialogue-line-${dia.id}`}
                              onClick={() => {
                                handleScrub15m(dia.timestampSec);
                                speakDialogueLine(dia, selectedLang);
                              }}
                              className={`dialogue-line-item p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                isActive
                                  ? "border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                                  : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                              }`}
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-black ${dia.voiceGender === "male" ? "text-amber-300" : "text-pink-300"}`}>
                                    {dia.character}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                    {dia.emotion}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                                    {formatTime15m(dia.timestampSec)}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-200 font-serif leading-relaxed">
                                  &ldquo;{lineText}&rdquo;
                                </p>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScrub15m(dia.timestampSec);
                                  speakDialogueLine(dia, selectedLang);
                                }}
                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                  isActive
                                    ? "bg-amber-500 text-slate-950 font-bold"
                                    : "bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950"
                                }`}
                                title="Jump & speak this dialogue aloud"
                              >
                                {isActive ? (
                                  <Volume1 className="h-4 w-4 animate-bounce" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500 italic py-2">No dialogues logged for this track.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right: Film Metadata & Distribution Master Suite */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {selectedFilm.format}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {selectedFilm.durationMinutes} Mins · {selectedFilm.shotCount} Shots
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {selectedFilm.title}
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-amber-400 font-medium italic">
                      {selectedFilm.tagline}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedFilm.synopsis}
                  </p>

                  {/* Production Blueprint Specs */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block">Directive Aesthetic:</span>
                      <span className="font-semibold text-slate-200">{selectedFilm.directorAesthetic}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lead Synthetic Cast:</span>
                      <span className="font-semibold text-slate-200">{selectedFilm.leadActors.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Veritas Quality Score:</span>
                      <span className="font-bold text-teal-400">{selectedFilm.veritasScore} / 100 (Certified)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IMF Specification:</span>
                      <span className="font-bold text-amber-300">{selectedFilm.imfStatus}</span>
                    </div>
                  </div>

                  {/* Bollywood Cast & Crew Roster Trigger */}
                  {selectedFilm.cast && selectedFilm.crew && (
                    <button
                      id="view-cast-crew-btn"
                      onClick={() => setShowCastCrewModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all border border-amber-500/40 shadow-lg shadow-amber-500/5 min-h-[44px]"
                    >
                      <Users className="h-4 w-4 text-amber-400" />
                      <span>View Full Bollywood Cast & Crew Roster ({selectedFilm.cast.length + selectedFilm.crew.length} Team Members)</span>
                    </button>
                  )}

                  {/* 1-Click Master Distribution Export Actions */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Studio Master Export & Distribution
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <a
                        href={selectedFilm.videoSrc}
                        download={`${selectedFilm.id}_4K_master.mp4`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10 min-h-[44px]"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export 4K Master (ProRes)</span>
                      </a>

                      <button
                        id="package-imf-btn"
                        onClick={() => setShowImfModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <Tv className="h-4 w-4 text-teal-400" />
                        <span>Package IMF for Netflix/Prime</span>
                      </button>

                      <button
                        id="inspect-multimodal-btn"
                        onClick={() => handleAuditMultimodal()}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/10 text-teal-300 font-bold text-xs hover:bg-teal-500/30 transition-all border border-teal-500/40 min-h-[44px] shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/30"
                      >
                        <Eye className="h-4 w-4 text-teal-400 animate-pulse" />
                        <span>Audit Multimodal AI Vision & Frames</span>
                      </button>

                      <Link
                        id="open-dedicated-audit-page-btn"
                        href={`/studio/cinema/audit?filmId=${selectedFilm.id}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-teal-500/20 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all border border-amber-500/40 min-h-[44px] shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                      >
                        <Sliders className="h-4 w-4 text-amber-400" />
                        <span>Director&apos;s Quality Audit Suite (Dedicated Page)</span>
                      </Link>

                      <button
                        id="inspect-c2pa-btn"
                        onClick={() => setShowCertModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Inspect C2PA Provenance</span>
                      </button>

                      <button
                        id="shot-manifest-btn"
                        onClick={() => setShowShotManifestModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <Terminal className="h-4 w-4 text-indigo-400" />
                        <span>Shot Manifest JSON</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Catalog of Studio Originals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Zyvoriq Studio Catalog (Original Productions)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {PRELOADED_ORIGINALS.length} Features Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRELOADED_ORIGINALS.map((film) => (
                  <div
                    key={film.id}
                    id={`film-card-${film.id}`}
                    onClick={() => {
                      setSelectedFilm(film);
                      setIsPlaying(false);
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                      }
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                      setActiveSpeakingLineId(null);
                    }}
                    className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                      selectedFilm.id === film.id
                        ? "border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/10"
                        : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                        {film.format}
                      </span>
                      <span className="font-mono">{film.durationMinutes} mins</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white line-clamp-1">
                      {film.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {film.tagline}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-teal-400 font-semibold font-mono">
                        VQS: {film.veritasScore}/100
                      </span>
                      <span className="text-amber-400 flex items-center gap-1 font-bold">
                        <span>Select Master</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: AUTONOMOUS FEATURE FILM STUDIO (THE ENGINE)       */}
        {/* ======================================================== */}
        {activeTab === "produce" && (
          <div className="space-y-8 mt-8">
            <div className="p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                  <span>Autonomous Screenplay-to-Feature Engine</span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Configure your narrative premise, choose your synthetic talent, lock your 4-Tier QA thresholds, and launch a complete autonomous feature film pipeline.
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                
                {/* Column 1: Story & Cast */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      1. Film Title & Screenplay Premise
                    </label>
                    <input
                      type="text"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-amber-500 mb-3"
                      placeholder="e.g. Noor-e-Ishq (The Light of Love)"
                    />
                    <textarea
                      rows={4}
                      value={prodLogline}
                      onChange={(e) => setProdLogline(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
                      placeholder="Write your story synopsis or scene premise..."
                    />
                  </div>

                  {/* Format & Duration Selector (Golden Sweet Spot Highlighted) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      2. Duration & Scope (The Golden Sweet Spot)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setProdFormat("short_15m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "short_15m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-amber-400">Sweet Spot</span>
                          <Check className={`h-3 w-3 ${prodFormat === "short_15m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">12–18 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">118 shots · 95% consistency · ~$28 compute</p>
                      </div>

                      <div
                        onClick={() => setProdFormat("pilot_30m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "pilot_30m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-indigo-400">TV Pilot</span>
                          <Check className={`h-3 w-3 ${prodFormat === "pilot_30m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">30–45 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">280 shots · 85% consistency · ~$74 compute</p>
                      </div>

                      <div
                        onClick={() => setProdFormat("feature_90m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "feature_90m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-teal-400">Feature Film</span>
                          <Check className={`h-3 w-3 ${prodFormat === "feature_90m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">90–110 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">920 shots · Auto-Healed · ~$368 compute</p>
                      </div>
                    </div>
                  </div>

                  {/* Synthetic Lead Cast Vault */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      3. Synthetic Talent Vault (Legally Clean Procedural Stars)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      {[
                        { id: "syn_kabir_01", name: "Kabir Verma", archetype: "Romantic Baritone Lead" },
                        { id: "syn_meera_02", name: "Meera Sen", archetype: "Heritage Classical Heroine" },
                        { id: "syn_aryan_03", name: "Aryan Khan-Raza", archetype: "Action / Hero Archetype" },
                        { id: "syn_tara_04", name: "Tara Thorne", archetype: "Cyberpunk / Tech Protagonist" }
                      ].map((star) => (
                        <div
                          key={star.id}
                          onClick={() => {
                            if (prodLeadCast.includes(star.id)) {
                              setProdLeadCast(prodLeadCast.filter((c) => c !== star.id));
                            } else {
                              setProdLeadCast([...prodLeadCast, star.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            prodLeadCast.includes(star.id)
                              ? "border-amber-500 bg-amber-500/10 text-white"
                              : "border-slate-800 bg-slate-950 text-slate-400"
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-white">{star.name}</span>
                            <span className="text-[10px] text-slate-400">{star.archetype}</span>
                          </div>
                          <Check className={`h-3.5 w-3.5 ${prodLeadCast.includes(star.id) ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Director Style, Soundstage & 4-Tier QA */}
                <div className="space-y-6">
                  {/* Director Aesthetic & 3D LUT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      4. Directive Vision & Master 3D LUT
                    </label>
                    <select
                      value={prodDirector}
                      onChange={(e) => setProdDirector(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="yash_chopra_chiffon">Yash Chopra: Swiss Alps Golden Hour, Chiffon Sarees, Kodak 2383 LUT</option>
                      <option value="roger_deakins_naturalist">Roger Deakins: Naturalist 50mm Anamorphic, Practical Soft Light</option>
                      <option value="david_fincher_amber">David Fincher: Low-Key Amber/Tungsten Precision, Fluid Tracking</option>
                      <option value="christopher_nolan_imax">Christopher Nolan: 70mm IMAX Practical Scale, 35mm Heavy Film Grain</option>
                    </select>
                  </div>

                  {/* Soundstage & Acoustic Controls */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                      5. Virtual Soundstage & Foley Engine
                    </label>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">J-Cut / L-Cut Dialogue Overlap</span>
                        <span className="text-slate-500 text-[11px]">800ms natural conversational audio lead-in</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableJLCut}
                        onChange={(e) => setEnableJLCut(e.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">Optical Motion Foley & Room IR Reverb</span>
                        <span className="text-slate-500 text-[11px]">Auto-synthesizes footsteps, wind, fabric rustle</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableFoleyIR}
                        onChange={(e) => setEnableFoleyIR(e.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* 4-Tier Automated QA & Self-Healing Circuit Breaker */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                      <span>6. 4-Tier Automated QA & Circuit Breakers</span>
                      <ShieldCheck className="h-4 w-4 text-teal-400" />
                    </label>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>ArcFace Face Similarity Lock:</span>
                        <span className="font-bold text-white font-mono">≥ {arcfaceThreshold}</span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="0.95"
                        step="0.01"
                        value={arcfaceThreshold}
                        onChange={(e) => setArcfaceThreshold(parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-white font-semibold block">YOLOv10 Kinematic & Anatomy Guard</span>
                        <span className="text-slate-500 text-[11px]">0 extra limbs or impossible physics tolerance</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">Active</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-white font-semibold block">Max Retries Before Cutaway Fallback</span>
                        <span className="text-slate-500 text-[11px]">Prevents infinite token burn on impossible shots</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">3 Strikes</span>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    id="launch-production-btn"
                    onClick={handleLaunchProduction}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm md:text-base hover:from-amber-400 hover:to-amber-300 transition-all shadow-xl shadow-amber-500/20 min-h-[48px]"
                  >
                    <Clapperboard className="h-5 w-5 fill-slate-950" />
                    <span>LAUNCH AUTONOMOUS MOVIE PRODUCTION</span>
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MISSION CONTROL & 4-TIER QA TELEMETRY            */}
        {/* ======================================================== */}
        {activeTab === "telemetry" && (
          <div className="space-y-8 mt-8">
            <div className="p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Autonomous Production Mission Control
                    </h2>
                  </div>
                  <p className="mt-1 text-xs md:text-sm text-slate-400">
                    Active Job: <span className="text-amber-300 font-mono">{prodTitle}</span> ({prodFormat.replace("_", " ").toUpperCase()})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Current Status:</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {isGenerating ? activeStage : "Master Package Sealed & Live"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Overall Pipeline Completion</span>
                  <span className="text-amber-400 font-bold">{isGenerating ? `${genProgress}%` : "100%"}</span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${isGenerating ? genProgress : 100}%` }}
                  />
                </div>
              </div>

              {/* Real-Time Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">ArcFace Mean Match</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">0.914</span>
                  <span className="text-[10px] text-teal-500/80 block mt-1">Threshold: ≥ 0.86 (PASS)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">Kinematics & Pose Yield</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">98.2%</span>
                  <span className="text-[10px] text-teal-500/80 block mt-1">0 Extra Limbs Detected</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">Self-Healed Rerolls</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">8 Shots</span>
                  <span className="text-[10px] text-amber-500/80 block mt-1">0 Human QA Touches</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">GPU Compute Cost</span>
                  <span className="text-2xl font-black text-white font-mono">$28.50</span>
                  <span className="text-[10px] text-slate-500 block mt-1">20 Cloud Workers</span>
                </div>
              </div>

              {/* Real-time Streaming Terminal Logs */}
              <div className="mt-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Live Autonomous Pipeline Event Log
                </span>
                <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 shadow-inner">
                  {telemetryLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-amber-500/80 select-none">&gt;</span>
                      <span className={log.includes("ERROR") ? "text-red-400" : log.includes("SELF-HEALED") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Switch to Player */}
              {!isGenerating && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab("originals")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 min-h-[44px]"
                  >
                    <span>View Master in Originals Vault</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* C2PA Cryptographic Provenance Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-teal-400" />
                <h3 className="text-xl font-bold text-white">C2PA Cryptographic Provenance Certificate</h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Manifest ID:</span>
                <span className="text-amber-300 select-all">{selectedFilm.c2paCertId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Digital Signing Algorithm:</span>
                <span className="text-teal-300">Ed25519 (Zero Third-Party Cloud Egress)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Content Authenticity Claim:</span>
                <span className="text-slate-200">Generative Synthetic Media produced under Zyvoriq Veritas 5-Axis Governance</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">IMF Specification:</span>
                <span className="text-amber-400">SMPTE 2067-21 (Netflix / Amazon Prime Video Direct Compliant)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="close-c2pa-btn"
                onClick={() => setShowCertModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all min-h-[40px]"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multimodal AI Vision & Frame-Audit Inspector Modal */}
      {showMultimodalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-4xl w-full rounded-3xl bg-slate-900 border border-teal-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-lg shadow-teal-500/10 shrink-0">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      Multimodal AI Vision & Frame-Audit Inspector
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                      DeepMind Video & Acoustic QA
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Frame-by-frame visual decoding, cross-modal semantic congruence, and sacred cultural reverence governance.
                  </p>
                </div>
              </div>
              <button
                id="close-multimodal-btn"
                onClick={() => setShowMultimodalModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-all shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Interactive Test Mode Switcher: Audit Master vs Simulate Mismatch & Workflow Selector */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-white font-bold block">
                    Interactive Evaluation & Self-Healing Harness
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Verify master certification, simulate cross-modal defects, and test healing workflows
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="audit-certified-master-btn"
                    onClick={() => {
                      setHealedSuccessData(null);
                      handleAuditMultimodal();
                    }}
                    disabled={isAuditingMultimodal || isHealing}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-all min-h-[36px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>Audit Master ({selectedFilm.title.split(":")[0]})</span>
                  </button>
                  <button
                    id="simulate-mismatch-btn"
                    onClick={() => {
                      setHealedSuccessData(null);
                      handleAuditMultimodal({
                        title: "Noor-e-Ishq: Chapter I",
                        genre: "romantic_epic",
                        videoSrc: selectedFilm.videoSrc || ""
                      });
                    }}
                    disabled={isAuditingMultimodal || isHealing}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all min-h-[36px]"
                    title="Simulate passing romantic melodrama dialogue over the sacred Kurukshetra chariot scene"
                  >
                    <Zap className="h-3.5 w-3.5 text-red-400" />
                    <span>Simulate Sacrilege Mismatch Bug</span>
                  </button>

                  <Link
                    id="open-audit-page-modal-btn"
                    href={`/studio/cinema/audit?filmId=${selectedFilm.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all min-h-[36px]"
                  >
                    <Sliders className="h-3.5 w-3.5 text-amber-400" />
                    <span>Open Dedicated Audit Page</span>
                  </Link>
                </div>
              </div>

              {/* Workflow Mode Selector: Autonomous vs Manual Review */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
                <span className="text-slate-400 font-semibold">Self-Healing Dispatch Mode:</span>
                <div className="flex items-center gap-2">
                  <button
                    id="mode-autonomous-btn"
                    onClick={() => setHealingWorkflowMode("autonomous")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[34px] ${
                      healingWorkflowMode === "autonomous"
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    <Zap className="h-3 w-3 fill-current" />
                    <span>⚡ Autonomous Self-Healing (1-Click)</span>
                  </button>
                  <button
                    id="mode-manual-btn"
                    onClick={() => setHealingWorkflowMode("manual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[34px] ${
                      healingWorkflowMode === "manual"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    <Sliders className="h-3 w-3" />
                    <span>🎬 Director's Review & Override</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Self-Healing Progress Indicator */}
            {isHealing && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 to-emerald-950/60 border border-teal-500/40 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
                <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                <p className="text-sm font-black text-teal-200">
                  {healingStepProgress || "Engaging Self-Healing Actuator..."}
                </p>
                <span className="text-[11px] text-slate-400 font-mono">
                  Autonomous Finite State Machine · Circuit Breaker Active · Anti-Drift Locked
                </span>
              </div>
            )}

            {/* Healed Success Notification Banner */}
            {healedSuccessData && !isHealing && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white">
                      Self-Healing Completed & Ratified: {healedSuccessData.actuatorUsed}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                    Circuit Breaker: 1/2 Retries (CLEAN)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {healedSuccessData.patchSummary}
                </p>
                {healedSuccessData.remedyApplied && (
                  <div className="text-[11px] text-teal-300 font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Active Master: {healedSuccessData.remedyApplied.title}</span>
                    <span className="text-slate-400">{healedSuccessData.remedyApplied.genre}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Audit Loading State */}
            {isAuditingMultimodal && (
              <div className="p-8 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-white">
                  Decoding Physical Video Bitstream & Generating Multi-Frame Semantic Embeddings...
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Evaluating temporal coherence, ArcFace identity preservation & cross-modal reverence gate
                </p>
              </div>
            )}

            {/* Audit Error State */}
            {multimodalAuditError && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs space-y-1">
                <span className="font-bold block">Audit Execution Error:</span>
                <p>{multimodalAuditError}</p>
              </div>
            )}

            {/* Audit Results Presentation */}
            {!isAuditingMultimodal && multimodalResult && (
              <div className="space-y-6">
                
                {/* Overall Certification Status Banner */}
                <div
                  id="multimodal-status-banner"
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/5"
                      : "bg-red-500/20 border-red-500/40 text-red-200 shadow-lg shadow-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black tracking-wider uppercase">
                          Overall Gate Status:
                        </span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER"
                            ? "bg-emerald-500/30 text-emerald-300"
                            : "bg-red-500/30 text-red-300 animate-pulse"
                        }`}>
                          {multimodalResult.overallStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER"
                          ? "Physical video frames, dialogue shlokas, and cultural reverence all align with mathematical precision."
                          : "Visual frames contradict dialogue metadata. Production asset halted before master packaging."}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 self-start sm:self-auto">
                    ID: {multimodalResult.evaluationId}
                  </span>
                </div>

                {/* Detected Issues & Impact Triage Console */}
                {multimodalResult.detectedIssues && multimodalResult.detectedIssues.length > 0 && (
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                        <h4 className="text-sm font-black text-white tracking-wide uppercase">
                          Production Defect Triage & Impact Assessment ({multimodalResult.detectedIssues.length} Issues Identified)
                        </h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/30 text-red-300 font-mono font-bold">
                        Mode: {healingWorkflowMode.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {multimodalResult.detectedIssues.map((issue) => (
                        <div key={issue.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] font-mono ${
                                issue.severity === "CRITICAL"
                                  ? "bg-red-500/30 text-red-300 border border-red-500/40"
                                  : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                {issue.category}
                              </span>
                              <span className="text-teal-400 font-mono font-bold">
                                {issue.timecode}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Actuator: <strong className="text-amber-300 font-mono">{issue.suggestedActuator}</strong>
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-white text-sm">{issue.title}</h5>
                            <p className="text-slate-300 mt-1 leading-relaxed">{issue.description}</p>
                          </div>

                          {/* Impact Analysis Callout */}
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 space-y-1">
                            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">
                              Regulatory & Theatrical Impact Assessment:
                            </span>
                            <p className="text-[11px] text-red-200 leading-relaxed">
                              {issue.impactAnalysis}
                            </p>
                          </div>

                          {/* Workflow Actions */}
                          <div className="pt-1">
                            {healingWorkflowMode === "autonomous" ? (
                              <button
                                id="execute-auto-heal-btn"
                                onClick={() => handleExecuteSelfHealing({
                                  issueId: issue.id,
                                  actuatorType: issue.suggestedActuator,
                                  mode: "autonomous"
                                })}
                                disabled={isHealing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 min-h-[44px]"
                              >
                                <Zap className="h-4 w-4 fill-current" />
                                <span>⚡ Execute 1-Click Autonomous Self-Healing ({issue.suggestedActuator})</span>
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <button
                                  id="manual-apply-fix-btn"
                                  onClick={() => handleExecuteSelfHealing({
                                    issueId: issue.id,
                                    actuatorType: issue.suggestedActuator,
                                    mode: "manual_override"
                                  })}
                                  disabled={isHealing}
                                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all min-h-[40px]"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Apply Fix ({issue.suggestedActuator})</span>
                                </button>
                                <button
                                  id="manual-artistic-intent-btn"
                                  onClick={() => handleExecuteSelfHealing({
                                    issueId: issue.id,
                                    actuatorType: issue.suggestedActuator,
                                    mode: "manual_override",
                                    markArtisticIntent: true
                                  })}
                                  disabled={isHealing}
                                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold text-xs transition-all min-h-[40px]"
                                >
                                  <Award className="h-3.5 w-3.5" />
                                  <span>Ratify Artistic Intent (Director Escrow)</span>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4 Multi-Metric Gauges Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Gauge 1: Cross-Modal Semantic Congruence */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Semantic Congruence
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl font-black font-mono ${
                        multimodalResult.scores.semanticCongruence >= 0.85 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {(multimodalResult.scores.semanticCongruence * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Req: &ge;85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          multimodalResult.scores.semanticCongruence >= 0.85 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, multimodalResult.scores.semanticCongruence * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Screenplay vs Visual Cosine Metric
                    </span>
                  </div>

                  {/* Gauge 2: Cultural Reverence Gate */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Reverence Gate
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        multimodalResult.culturalReverenceGate.status === "VERIFIED_REVERENT"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : multimodalResult.culturalReverenceGate.status === "SACRILEGE_ALERT"
                          ? "bg-red-500/30 text-red-300 font-mono"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {multimodalResult.culturalReverenceGate.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {multimodalResult.culturalReverenceGate.reasoning}
                    </p>
                  </div>

                  {/* Gauge 3: Kinematic Yield */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kinematic Yield
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black font-mono text-teal-400">
                        {(multimodalResult.scores.kinematicYield * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Req: &ge;95%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${multimodalResult.scores.kinematicYield * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Zero Temporal Judder / Optical Flow
                    </span>
                  </div>

                  {/* Gauge 4: SyncNet & Audio Loudness */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SyncNet AV & Loudness
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black font-mono text-amber-300">
                        {multimodalResult.scores.syncNetConfidence.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Conf: &ge;6.0</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>LKFS Loudness:</span>
                      <span className="font-mono text-slate-200">{multimodalResult.scores.lufsLoudnessDb} dB</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      SMPTE EBU R128 Compliant
                    </span>
                  </div>

                </div>

                {/* Cultural Reverence / Violation Detail Callout */}
                <div className={`p-4 rounded-2xl border ${
                  multimodalResult.culturalReverenceGate.passed
                    ? "bg-slate-950 border-teal-500/30"
                    : "bg-red-950/40 border-red-500/40"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`h-4 w-4 ${
                      multimodalResult.culturalReverenceGate.passed ? "text-teal-400" : "text-red-400"
                    }`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Reverence Analysis & Contextual Reasoning:
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {multimodalResult.culturalReverenceGate.reasoning}
                  </p>
                  {multimodalResult.remedyAction && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                      <span className="font-bold text-amber-300 block mb-0.5">Automated Self-Healing Action:</span>
                      <p>{multimodalResult.remedyAction}</p>
                    </div>
                  )}
                </div>

                {/* Keyframe Physical Vision Manifest */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Camera className="h-4 w-4 text-teal-400" />
                      <span>Decoded Video Keyframes & Visual Entity Manifest ({multimodalResult.framesAudited.length} Frames Audited)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Target: {multimodalResult.videoSrc.split("/").pop()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {multimodalResult.framesAudited.map((frame, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-2 text-xs transition-all ${
                          frame.semanticAlignmentScore >= 0.85
                            ? "bg-slate-950 border-slate-800"
                            : "bg-red-950/20 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono font-bold">
                              {frame.timecodeFormatted}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium text-[11px]">
                              {frame.eraClassification}
                            </span>
                          </div>
                          {frame.hasSacredIconography && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                              Sacred Iconography
                            </span>
                          )}
                        </div>

                        {/* Detected Entities */}
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">
                            Detected Visual Entities:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {frame.detectedEntities.map((entity, eIdx) => (
                              <span
                                key={eIdx}
                                className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px]"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Semantic Alignment Score Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Cross-Modal Alignment:</span>
                            <span className={`font-mono font-bold ${
                              frame.semanticAlignmentScore >= 0.85 ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {(frame.semanticAlignmentScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                frame.semanticAlignmentScore >= 0.85 ? "bg-emerald-500" : "bg-red-500"
                              }`}
                              style={{ width: `${frame.semanticAlignmentScore * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-900">
                          {frame.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cryptographic C2PA Hash */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">C2PA Audit Hash:</span>
                  <span className="text-teal-400 select-all">{multimodalResult.c2paAuditHash}</span>
                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Zyvoriq Veritas Phase 3 Multimodal QA Engine
              </span>
              <button
                onClick={() => setShowMultimodalModal(false)}
                className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all min-h-[40px] shadow-lg shadow-teal-500/10"
              >
                Close Audit Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bollywood Cast & Crew Roster Modal */}
      {showCastCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-3xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedFilm.title} — Official Call Sheet</h3>
                  <p className="text-xs text-amber-400/90 font-medium">Full Bollywood Cast, Characters & Creative Crew Directive Architecture</p>
                </div>
              </div>
              <button
                id="close-cast-crew-btn"
                onClick={() => setShowCastCrewModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2"
              >
                ✕
              </button>
            </div>

            {/* Cast Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎭 Star Cast & Character Archetypes</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFilm.cast?.map((actor, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm">{actor.character}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {actor.actorId}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Played by: </span>
                      <span className="text-slate-200 font-semibold">{actor.actor}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Archetype: </span>
                      <span className="text-amber-400/90">{actor.archetype}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Vocal Profile: </span>
                      <span className="text-slate-300 font-mono">{actor.vocalProfile}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Wardrobe / Styling: </span>
                      <span className="text-slate-300">{actor.wardrobe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎬 Creative & Technical Crew (Autonomous Directive Swarm)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFilm.crew?.map((member, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-bold">{member.role}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{member.modelEngine}</span>
                    </div>
                    <p className="font-extrabold text-white">{member.name}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{member.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setShowCastCrewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all min-h-[40px]"
              >
                Close Call Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master 118-Shot Scene & Shot List Modal (EDL) */}
      {is118ShotModalOpen && (
        <div id="shot-list-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-5xl w-full rounded-3xl bg-slate-900 border border-teal-500/30 p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <List className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white">
                    Master 118-Shot Cinematic EDL (Edit Decision List)
                  </h3>
                  <p className="text-xs text-slate-400">
                    SMPTE Timecode Indexed · 15:00.00 Feature Film Architecture · 5 Acts · 2.39:1 Anamorphic
                  </p>
                </div>
              </div>
              <button
                id="close-118-shot-modal-btn"
                onClick={() => setIs118ShotModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable 118-Shot Grid */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
              {DHARMAKSHETRA_118_SHOTS.map((s) => {
                const isCurrent = currentShot.shotNumber === s.shotNumber;
                return (
                  <div
                    key={s.shotNumber}
                    data-testid="edl-shot-card"
                    className={`edl-shot-card p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-amber-400 font-mono">
                          Shot #{String(s.shotNumber).padStart(3, "0")}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          Act {s.actNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                          {s.shotType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTime15m(s.timecodeStartSec)} – {formatTime15m(s.timecodeEndSec)} ({s.durationSec}s)
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white font-mono">{s.heading}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{s.actionDescription}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                        <span>📹 {s.lens}</span>
                        <span>🎬 {s.cameraMotion}</span>
                        <span>💡 {s.lighting}</span>
                      </div>
                    </div>

                    <button
                      id={`jump-shot-${s.shotNumber}`}
                      onClick={() => jumpToShot(s.shotNumber)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isCurrent
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                          : "bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950"
                      }`}
                    >
                      {isCurrent ? "Active on Screen" : "Jump to Shot"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                Total Deliverable: 118 Shots · 900.00 Seconds · 21,600 Master Frames @ 24fps
              </span>
              <button
                onClick={() => setIs118ShotModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all"
              >
                Close EDL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Film Screenplay & Production Bible Modal */}
      {isScreenplayModalOpen && (
        <div id="screenplay-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-4xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white">
                    Master Screenplay: Dharmakshetra (The Song of the Divine)
                  </h3>
                  <p className="text-xs text-slate-400">
                    15-Minute Theatrical Short · 5-Act Epic Structure · Sanskrit & Hindi Dialogue
                  </p>
                </div>
              </div>
              <button
                id="close-screenplay-modal-btn"
                onClick={() => setIsScreenplayModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Screenplay Document */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-slate-200 font-serif leading-relaxed text-sm bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="text-center space-y-1 pb-4 border-b border-slate-800">
                <h2 className="text-xl font-black text-amber-300 uppercase tracking-widest font-sans">
                  DHARMAKSHETRA: THE SONG OF THE DIVINE
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Written for Screen by Autonomous Epic Directive Swarm · Based on the Bhagavad Gita by Maharishi Vyasa
                </p>
                <p className="text-[11px] text-amber-400/80 font-mono font-sans">
                  15:00 RUNTIME · 5 ACTS · 118 SCENE BEATS · 2.39:1 CINEMA
                </p>
              </div>

              {DHARMAKSHETRA_ACTS.map((act) => (
                <div key={act.actNumber} className="space-y-4 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-sans">
                      ACT {act.actNumber}: {act.title.toUpperCase()} ({formatTime15m(act.timecodeStartSec)} - {formatTime15m(act.timecodeEndSec)})
                    </span>
                    <p className="text-xs text-slate-300 font-sans italic mt-0.5">{act.tagline}</p>
                    <p className="text-[11px] text-slate-400 font-sans mt-1">🎵 Score: {act.musicalTheme}</p>
                  </div>

                  <div className="space-y-3 pl-2">
                    <p className="text-xs text-slate-400 italic">
                      [SCENE DESCRIPTION: {act.visualAtmosphere}]
                    </p>
                    <p className="text-xs text-slate-300">
                      [DRAMATIC STAKES: {act.dramaticStakes}]
                    </p>

                    {DHARMAKSHETRA_DIALOGUES.filter(d => d.actNumber === act.actNumber).map(dia => (
                      <div key={dia.id} className="py-2 pl-4 border-l-2 border-amber-500/40 space-y-1">
                        <p className="text-xs font-bold text-amber-300 font-sans uppercase tracking-wider">
                          {dia.character} <span className="text-slate-400 font-normal">({dia.emotion} · {dia.timecodeFormatted})</span>
                        </p>
                        <p className="text-xs md:text-sm text-slate-100 italic">
                          &ldquo;{dia.text.hi}&rdquo;
                        </p>
                        <p className="text-xs text-slate-300">
                          English Translation: &ldquo;{dia.text.en}&rdquo;
                        </p>
                        {dia.text.sa && (
                          <p className="text-[11px] text-amber-400/70 font-mono">
                            Sanskrit Shloka: {dia.text.sa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                C2PA Certified Theatrical Master Screenplay
              </span>
              <button
                onClick={() => setIsScreenplayModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
              >
                Close Screenplay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMPTE 2067-21 IMF Master Packaging Modal */}
      {showImfModal && (
        <div id="imf-package-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-3xl w-full rounded-3xl bg-slate-900 border border-teal-500/40 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Tv className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white">
                    SMPTE 2067-21 IMF Master Deliverable
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interoperable Master Format · Netflix / Prime Video Direct / Apple TV+ Spec
                  </p>
                </div>
              </div>
              <button
                id="close-imf-modal-btn"
                onClick={() => setShowImfModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Package Profile</span>
                  <p className="font-bold text-white text-sm">SMPTE ST 2067-21:2020 App 2E</p>
                  <p className="text-slate-400 text-[11px]">Lossless JPEG 2000 Broadcast Intermediate Profile</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Audio Configuration</span>
                  <p className="font-bold text-white text-sm">5.1 Discrete + Stereo Lt/Rt</p>
                  <p className="text-slate-400 text-[11px]">48kHz / 24-bit PCM SMPTE ST 377M BWF Stems</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Color Science & EOTF</span>
                  <p className="font-bold text-white text-sm">DCI-P3 D65 · Rec.2020 · PQ ST 2084</p>
                  <p className="text-slate-400 text-[11px]">Dolby Vision v4.0 XML Metadata Sidecar attached</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">C2PA Cryptographic Seal</span>
                  <p className="font-mono text-emerald-300 text-xs truncate">{selectedFilm.c2paCertId}</p>
                  <p className="text-slate-400 text-[11px]">Hardware TPM Key Sealed · ISO/IEC 18033-2</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/20 space-y-2">
                <span className="font-mono text-[11px] text-teal-400 font-bold block">IMF PACKAGE CONTENTS MANIFEST:</span>
                <pre className="text-[10px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
{`├── CPL_${selectedFilm.id.toUpperCase()}_4K_HDR.xml  (Composition Playlist)
├── PKL_${selectedFilm.id.toUpperCase()}_ST2067.xml  (Packing List with SHA-256 Hashes)
├── ASSETMAP.xml                              (Asset Map & Resource Resolution)
├── VOLINDEX.xml                              (Volume Index)
├── video_track_j2k_4k_master.mxf             (SMPTE 2067-2 Track File · 24.00 fps)
├── audio_stem_dialogue_discrete.mxf          (EBU R128 -24 LUFS Character Audio)
├── audio_stem_music_allegretto_beethoven.mxf (Orchestral Score Stems)
└── sidecar_c2pa_provenance_manifest.json     (Hardware HSM Signature)`}
                </pre>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800 shrink-0 gap-2">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Ready for Direct S3/Aspera Ingest
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify({
                      imfVersion: "SMPTE 2067-21:2020",
                      film: selectedFilm.title,
                      c2paHash: selectedFilm.c2paCertId,
                      lufsTarget: -24,
                      assets: ["CPL.xml", "PKL.xml", "ASSETMAP.xml", "VOLINDEX.xml"]
                    }, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedFilm.id}_imf_manifest.json`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-teal-300 font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Download Spec XML
                </button>
                <button
                  onClick={() => setShowImfModal(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shot Manifest JSON Modal */}
      {showShotManifestModal && (
        <div id="shot-manifest-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-4xl w-full rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white">
                    Shot Manifest JSON: {selectedFilm.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Atomic Shot Vector Matrix · ArcFace 512-dim Biometrics · Audio Stem Routing
                  </p>
                </div>
              </div>
              <button
                id="close-shot-manifest-modal-btn"
                onClick={() => setShowShotManifestModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed">
{JSON.stringify({
  manifestVersion: "2.4.0-SMPTE-PRO",
  filmId: selectedFilm.id,
  title: selectedFilm.title,
  runtime: `${selectedFilm.durationMinutes} Minutes`,
  shotCount: selectedFilm.shotCount,
  directorAesthetic: selectedFilm.directorAesthetic,
  musicalScore: selectedFilm.musicalScore,
  c2paHash: selectedFilm.c2paCertId,
  leadActors: selectedFilm.leadActors,
  veritasScore: selectedFilm.veritasScore,
  audioConfiguration: {
    dialogueStem: "48kHz 24-bit discrete character audio (EBU R128 -24 LUFS)",
    scoreStem: "48kHz Beethoven Symphony 7 Allegretto pure acoustic orchestra",
    speechBleedPrevention: "Active (Speech Limiter & High-Pass Foley isolation)"
  },
  sampleShots: DHARMAKSHETRA_118_SHOTS.slice(0, 5).map(s => ({
    shotNumber: s.shotNumber,
    actNumber: s.actNumber,
    timecode: `${formatTime15m(s.timecodeStartSec)} - ${formatTime15m(s.timecodeEndSec)}`,
    heading: s.heading,
    lens: s.lens,
    motion: s.cameraMotion,
    lighting: s.lighting,
    arcFaceBiometricConfidence: 0.942
  }))
}, null, 2)}
              </pre>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {selectedFilm.shotCount} Total Shots Indexed
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const manifestStr = JSON.stringify({
                      manifestVersion: "2.4.0-SMPTE-PRO",
                      filmId: selectedFilm.id,
                      title: selectedFilm.title,
                      runtime: `${selectedFilm.durationMinutes} Minutes`,
                      shotCount: selectedFilm.shotCount,
                      directorAesthetic: selectedFilm.directorAesthetic,
                      c2paHash: selectedFilm.c2paCertId
                    }, null, 2);
                    navigator.clipboard?.writeText(manifestStr);
                    setManifestCopied(true);
                    setTimeout(() => setManifestCopied(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-indigo-300 font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700"
                >
                  {manifestCopied ? "✓ Copied to Clipboard!" : "Copy JSON"}
                </button>
                <button
                  onClick={() => setShowShotManifestModal(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </StudioSidebar>
  );
}
