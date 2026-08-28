import { ANIME_SUBTITLE_CUES } from "./anime_subtitles";

export interface SeriesTrack {
  id: string;
  title: string;
  subtitle: string;
  category: "anime" | "executive" | "nature" | "space" | "engineering" | "medical" | "custom";
  character: string;
  videoSrc: string;
  acts: any[];
  duration: number;
  veritas?: {
    status: string;
    snarkProofHash: string;
  };
  createdAt?: string;
}

export const CANONICAL_SERIES_TRACKS: SeriesTrack[] = [
  {
    id: "track_anime_kaizen",
    title: "The Master & The Apprentice: Path to Kaizen",
    subtitle: "7-Act Cinematic Japanese Anime Series · Sensei Ren & Apprentice Aoi",
    category: "anime",
    character: "🥋 Sensei Ren & Apprentice Aoi",
    videoSrc: "/assets/video/ren_and_aoi_conversation_synced.mp4",
    acts: ANIME_SUBTITLE_CUES,
    duration: 56.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x8f2d61bca79e4310d289aa84bb234f9011"
    }
  },
  {
    id: "track_executive_sovereign",
    title: "Executive Sovereign AI Keynote",
    subtitle: "Frontier Autonomous Intelligence & Veritas zk-SNARK Provenance",
    category: "executive",
    character: "👩‍💼 Priya Sharma (Chief AI Officer)",
    videoSrc: "/assets/video/priya_4k_10act_master.mp4",
    acts: [
      {
        id: "exec_act_1",
        startTime: 0.25,
        endTime: 11.5,
        speaker: "Priya",
        speakerRole: "Chief AI Officer",
        actName: "Act 1: Frontier Autonomous AI",
        philosophy: "Sovereign Intelligence Architecture",
        text: {
          ja: "🌐 PRIYA: 「企業の意思決定を加速する自律型AIインテリジェンスの新時代へようこそ。」",
          en: "🌐 PRIYA: \"Welcome to the frontier of sovereign autonomous enterprise intelligence.\"",
          es: "🌐 PRIYA: \"Bienvenidos a la frontera de la inteligencia empresarial autónoma y soberana.\"",
          fr: "🌐 PRIYA: « Bienvenue à la frontière de l'intelligence d'entreprise souveraine et autonome. »",
          de: "🌐 PRIYA: „Willkommen an der Grenze souveräner autonomer Unternehmensintelligenz.“",
          hi: "🌐 प्रिया: \"स्वायत्त उद्यम बुद्धिमत्ता के नए युग में आपका स्वागत है।\""
        }
      },
      {
        id: "exec_act_2",
        startTime: 12.0,
        endTime: 23.5,
        speaker: "Priya",
        speakerRole: "Chief AI Officer",
        actName: "Act 2: Cryptographic zk-SNARK Sealing",
        philosophy: "Veritas Zero-Drift Media Synthesis",
        text: {
          ja: "🌐 PRIYA: 「Veritas暗号化証明書により、すべての主張と動画フレームの真実性を保証します。」",
          en: "🌐 PRIYA: \"Veritas zk-SNARK guarantees claim-level grounding and zero lip-sync drift.\"",
          es: "🌐 PRIYA: \"Veritas zk-SNARK garantiza la veracidad y cero desfase labial.\"",
          fr: "🌐 PRIYA: «破 Veritas zk-SNARK garantit l'ancrage des faits et zéro décalage labial. »",
          de: "🌐 PRIYA: „Veritas zk-SNARK garantiert faktische Fundierung und 0ms Drift.“",
          hi: "🌐 प्रिया: \"वेरिटास तकनीक हर दावे की प्रामाणिकता और सटीक लिप-सिंक सुनिश्चित करती है।\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x4e9a82b31cd904fe716bb21890ea5541"
    }
  },
  {
    id: "track_zurich_neural",
    title: "Zurich Neural Systems & Quantum Protocol",
    subtitle: "Distributed Micro-Inference & Sovereign Model Topologies",
    category: "executive",
    character: "👨‍💼 David Kim (Lead Infrastructure)",
    videoSrc: "/assets/video/david_master.mp4",
    acts: [
      {
        id: "zurich_act_1",
        startTime: 0.25,
        endTime: 15.0,
        speaker: "David",
        speakerRole: "Lead Infrastructure",
        actName: "Act 1: Distributed Core Topologies",
        philosophy: "Zero-Latency Edge Inference",
        text: {
          ja: "⚡ DAVID: 「分散マイクロ推論により、エッジでのミリ秒単位の応答を実現します。」",
          en: "⚡ DAVID: \"Distributed micro-inference enables sub-millisecond deterministic edge response.\"",
          es: "⚡ DAVID: \"La microinferencia distribuida permite respuestas deterministas en submilisegundos.\"",
          fr: "⚡ DAVID: « La micro-inférence distribuée permet une réponse déterministe en moins d'une milliseconde. »",
          de: "⚡ DAVID: „Verteilte Mikro-Inferenz ermöglicht deterministische Reaktionszeiten unter einer Millisekunde.“",
          hi: "⚡ डेविड: \"वितरित माइक्रो-इनफेरेंस मिलीसेकंड प्रतिक्रिया समय सक्षम करता है।\""
        }
      }
    ],
    duration: 16.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x9c31fa78120b08dc6524ea801b7e4429"
    }
  }
];
