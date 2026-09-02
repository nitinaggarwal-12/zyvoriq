/**
 * 🎙️ ZYVORIQ MULTI-HOST & FIRESIDE CHAT PODCAST ENGINE
 * 
 * Generates broadcast-grade multi-host dialogues, intimate fireside chats,
 * executive roundtable panels (3-4 speakers), and keynote interview shows
 * with dynamic turn-taking, temporal non-collision, and audio ducking.
 */

import { PersonaClone, PRESET_PERSONAS } from "../reel/personas";

export type PodcastFormat = "two_host_debate" | "fireside_chat" | "executive_roundtable" | "keynote_interview";

export type PodcastDurationTier = "quick_bite" | "standard_show" | "deep_dive";

export interface PodcastDialogueTurn {
  id: string;
  speakerId: string;
  speakerName: string;
  role: "moderator" | "host" | "co-host" | "guest" | "panelist";
  scriptText: string;
  emotion: "curious" | "analytical" | "humorous" | "passionate" | "skeptical" | "visionary" | "reflective";
  durationSec: number;
  startSec: number;
  audioUrl?: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  topic: string;
  format: PodcastFormat;
  durationTier: PodcastDurationTier;
  summary: string;
  hosts: PersonaClone[];
  totalDurationSec: number;
  dialogueTurns: PodcastDialogueTurn[];
  introMusicTrack: string;
  outroMusicTrack: string;
  musicDuckingDb: number;
  createdAt: string;
}

export const PODCAST_FORMAT_CONFIG: Record<PodcastFormat, { name: string; badge: string; description: string; minHosts: number; maxHosts: number }> = {
  fireside_chat: {
    name: "🔥 Fireside Chat",
    badge: "Intimate 1-on-1 Interview",
    description: "Deep, exploratory 1-on-1 conversation between a lead host and a keynote guest.",
    minHosts: 2,
    maxHosts: 2
  },
  two_host_debate: {
    name: "🎙️ 2-Host Banter & Debate",
    badge: "Co-Host Dynamic",
    description: "Fast-paced conversational banter, thesis-testing, and counter-points between co-hosts.",
    minHosts: 2,
    maxHosts: 2
  },
  executive_roundtable: {
    name: "👥 Executive Roundtable (3-4 Hosts)",
    badge: "Panel Discussion",
    description: "Multi-perspective panel bringing together engineering, growth, security, and research.",
    minHosts: 3,
    maxHosts: 4
  },
  keynote_interview: {
    name: "🎤 Keynote with Audience Q&A",
    badge: "Keynote Interview",
    description: "Structured keynote interview followed by contrarian audience questions.",
    minHosts: 2,
    maxHosts: 3
  }
};

export const DURATION_TIER_CONFIG: Record<PodcastDurationTier, { label: string; turnsCount: number; targetSec: number }> = {
  quick_bite: { label: "⚡ Quick Bite (1-2 min)", turnsCount: 6, targetSec: 90 },
  standard_show: { label: "🎙️ Standard Show (3-5 min)", turnsCount: 12, targetSec: 240 },
  deep_dive: { label: "☕ Full Deep-Dive (10-15 min)", turnsCount: 20, targetSec: 600 }
};

/**
 * Procedurally synthesizes a broadcast podcast episode tailored to format, duration, and speaker roster.
 */
export function generatePodcastEpisode(
  topic: string,
  format: PodcastFormat = "fireside_chat",
  durationTier: PodcastDurationTier = "quick_bite",
  selectedHosts: PersonaClone[] = [PRESET_PERSONAS[0], PRESET_PERSONAS[3]], // Priya (CTO) & Carlos (Founder)
  introMusic = "lofi-chill"
): PodcastEpisode {
  const cleanTopic = topic.trim() || "Autonomous Agentic AI Infrastructure";
  const hosts = selectedHosts.length >= 2 ? selectedHosts : [PRESET_PERSONAS[0], PRESET_PERSONAS[3]];

  const moderator = hosts[0];
  const guest1 = hosts[1];
  const guest2 = hosts[2] || PRESET_PERSONAS[1]; // Marcus Vance
  const guest3 = hosts[3] || PRESET_PERSONAS[2]; // Elena Rostova

  type RawTurn = { speaker: PersonaClone; role: PodcastDialogueTurn["role"]; text: string; emotion: PodcastDialogueTurn["emotion"]; duration: number };
  let rawTurns: RawTurn[] = [];

  if (format === "fireside_chat") {
    rawTurns = [
      {
        speaker: moderator,
        role: "moderator",
        text: `Welcome to the Fireside Studio. Today I am sitting down with ${guest1.name} to pull back the curtain on ${cleanTopic}. ${guest1.name.split(" ")[0]}, let's start with what everyone is getting wrong.`,
        emotion: "curious",
        duration: 8.0
      },
      {
        speaker: guest1,
        role: "guest",
        text: `Thanks for having me. Honestly, 90% of teams approach ${cleanTopic} as a tooling problem. But in reality, it's an architecture and feedback loop problem. If your primitives are brittle, no amount of orchestration saves you.`,
        emotion: "reflective",
        duration: 9.5
      },
      {
        speaker: moderator,
        role: "moderator",
        text: `That resonates deeply. When you look back at when your team first cracked this, what was the contrarian insight that changed the trajectory?`,
        emotion: "analytical",
        duration: 7.0
      },
      {
        speaker: guest1,
        role: "guest",
        text: `We stopped treating it as a linear pipeline and started designing for autonomous self-correction. Once you build closed-loop verification, system reliability jumps from 70% to 99.8%.`,
        emotion: "passionate",
        duration: 8.5
      },
      {
        speaker: moderator,
        role: "moderator",
        text: `If an executive or technical founder is listening right now and wants to implement this tomorrow, where do they start?`,
        emotion: "curious",
        duration: 6.0
      },
      {
        speaker: guest1,
        role: "guest",
        text: `Audit your verification harness before writing a single line of generator code. If you cannot deterministically measure quality, you cannot automate it. Build the guardrails first.`,
        emotion: "visionary",
        duration: 8.0
      }
    ];
  } else if (format === "executive_roundtable") {
    rawTurns = [
      {
        speaker: moderator,
        role: "moderator",
        text: `Welcome to the Executive Roundtable. Today we have our engineering, security, and growth leads on the line to break down ${cleanTopic}. ${guest1.name.split(" ")[0]}, what is the architectural foundation?`,
        emotion: "analytical",
        duration: 8.0
      },
      {
        speaker: guest1,
        role: "panelist",
        text: `From an infrastructure perspective, ${cleanTopic} requires zero-latency edge caching and resilient fallback routing. We cannot tolerate 500ms jitter in production workflows.`,
        emotion: "visionary",
        duration: 7.5
      },
      {
        speaker: guest2,
        role: "panelist",
        text: `And from a security standpoint, we have to enforce zero-trust boundary verification. You cannot grant unrestricted execution without sandbox sandboxing and audit telemetry.`,
        emotion: "skeptical",
        duration: 8.0
      },
      {
        speaker: guest3,
        role: "panelist",
        text: `The math backs this up completely. When you pair deterministic safety with high-throughput distribution, compounding user retention skyrockets.`,
        emotion: "analytical",
        duration: 7.0
      },
      {
        speaker: moderator,
        role: "moderator",
        text: `So the consensus across engineering, security, and science is clear: build deterministic guardrails first. Thank you everyone for joining today's executive session.`,
        emotion: "passionate",
        duration: 7.5
      }
    ];
  } else {
    // Two-host debate default
    rawTurns = [
      {
        speaker: moderator,
        role: "host",
        text: `Welcome back to the studio. Today we are unpacking ${cleanTopic}, and frankly, most people are looking at this in reverse.`,
        emotion: "curious",
        duration: 6.0
      },
      {
        speaker: guest1,
        role: "co-host",
        text: `Totally agree. The conventional wisdom says you need more brute force, but the real unlock is sequencing and leverage.`,
        emotion: "analytical",
        duration: 6.5
      },
      {
        speaker: moderator,
        role: "host",
        text: `Exactly. If you look at high-output teams tackling ${cleanTopic}, they aren't working twice as long—they are eliminating low-leverage friction.`,
        emotion: "passionate",
        duration: 7.0
      },
      {
        speaker: guest1,
        role: "co-host",
        text: `What is the single biggest mistake you see creators and leaders make when they first try to implement this?`,
        emotion: "skeptical",
        duration: 5.5
      },
      {
        speaker: moderator,
        role: "host",
        text: `They try to optimize the output before standardizing the core system. Fix the underlying feedback loop first, and the rest compounds.`,
        emotion: "analytical",
        duration: 7.5
      },
      {
        speaker: guest1,
        role: "co-host",
        text: `That is the takeaway right there. Master the system, automate the noise, and let the compounding take care of the scale.`,
        emotion: "humorous",
        duration: 6.5
      }
    ];
  }

  // Extend turns if standard or deep dive is selected
  if (durationTier === "standard_show" || durationTier === "deep_dive") {
    const multiplier = durationTier === "deep_dive" ? 3 : 2;
    const baseTurns = [...rawTurns];
    for (let m = 1; m < multiplier; m++) {
      baseTurns.forEach((t, idx) => {
        rawTurns.push({
          speaker: t.speaker,
          role: t.role,
          text: `Expanding on our earlier point regarding ${cleanTopic} (Segment ${m + 1}): continuous verification ensures every cycle refines the outcome without compounding error drift.`,
          emotion: t.emotion,
          duration: t.duration * 0.95
        });
      });
    }
  }

  let currentTimestamp = 0.5; // Initial 0.5s music lead
  const dialogueTurns: PodcastDialogueTurn[] = rawTurns.map((turn, idx) => {
    const turnObj: PodcastDialogueTurn = {
      id: `turn_${idx + 1}`,
      speakerId: turn.speaker.id,
      speakerName: turn.speaker.name.split(" ")[0],
      role: turn.role,
      scriptText: turn.text,
      emotion: turn.emotion,
      durationSec: Number(turn.duration.toFixed(2)),
      startSec: Number(currentTimestamp.toFixed(2))
    };
    currentTimestamp += turn.duration + 0.35; // 350ms natural speech pause
    return turnObj;
  });

  const formatConfig = PODCAST_FORMAT_CONFIG[format] || PODCAST_FORMAT_CONFIG.fireside_chat;

  return {
    id: `podcast_${crypto.randomUUID().slice(0, 8)}`,
    title: `${formatConfig.name}: ${cleanTopic}`,
    topic: cleanTopic,
    format,
    durationTier,
    summary: `${formatConfig.badge} on ${cleanTopic} featuring ${hosts.map(h => h.name.split(" ")[0]).join(", ")}.`,
    hosts,
    totalDurationSec: Number(currentTimestamp.toFixed(2)),
    dialogueTurns,
    introMusicTrack: introMusic,
    outroMusicTrack: introMusic === "lofi-chill" ? "cyber-synth" : "ambient-cinema",
    musicDuckingDb: -18,
    createdAt: new Date().toISOString()
  };
}
