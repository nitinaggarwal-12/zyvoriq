import { ANIME_SUBTITLE_CUES } from "./anime_subtitles";

export interface SeriesTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
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
    "id": "track_anime_kaizen",
    "title": "The Master & The Apprentice: Path to Kaizen",
    "subtitle": "7-Act Cinematic Japanese Anime Series · Sensei Ren & Apprentice Aoi",
    "category": "anime",
    "character": "🥋 Sensei Ren & Apprentice Aoi",
    "videoSrc": "/assets/video/ren_and_aoi_conversation_synced.mp4",
    "acts": ANIME_SUBTITLE_CUES,
    "duration": 56,
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x8f2d61bca79e4310d289aa84bb234f9011"
    }
  },
  {
    "id": "track_executive_sovereign",
    "title": "Executive Sovereign AI Keynote",
    "subtitle": "Frontier Autonomous Intelligence & Veritas zk-SNARK Provenance",
    "category": "executive",
    "character": "👩‍💼 Priya Sharma (Chief AI Officer)",
    "videoSrc": "/assets/video/priya_4k_10act_master.mp4",
    "duration": 24,
    "acts": [
      {
        "id": "exec_act_1",
        "startTime": 0,
        "endTime": 12,
        "videoUrl": "/assets/video/priya_4k_10act_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Chief AI Officer",
        "actName": "Act 1: Frontier Autonomous AI",
        "philosophy": "Sovereign Intelligence Architecture",
        "text": {
          "ja": "🌐 PRIYA: 「企業の意思決定を加速する自律型AIインテリジェンスの新時代へようこそ。」",
          "en": "🌐 PRIYA: \"Welcome to the frontier of sovereign autonomous enterprise intelligence.\"",
          "es": "🌐 PRIYA: \"Bienvenidos a la frontera de la inteligencia empresarial autónoma y soberana.\"",
          "fr": "🌐 PRIYA: « Bienvenue à la frontière de l'intelligence d'entreprise souveraine et autonome. »",
          "de": "🌐 PRIYA: „Willkommen an der Grenze souveräner autonomer Unternehmensintelligenz.“",
          "hi": "🌐 प्रिया: \"स्वायत्त उद्यम बुद्धिमत्ता के नए युग में आपका स्वागत है।\""
        }
      },
      {
        "id": "exec_act_2",
        "startTime": 12,
        "endTime": 24,
        "videoUrl": "/assets/video/veo_priya_24s_master.mp4",
        "speaker": "Priya Sharma",
        "speakerRole": "Chief AI Officer",
        "actName": "Act 2: Cryptographic zk-SNARK Sealing",
        "philosophy": "Veritas Zero-Drift Media Synthesis",
        "text": {
          "ja": "🌐 PRIYA: 「Veritas暗号化証明書により、すべての主張と動画フレームの真実性を保証します。」",
          "en": "🌐 PRIYA: \"Veritas zk-SNARK guarantees claim-level grounding and zero lip-sync drift.\"",
          "es": "🌐 PRIYA: \"Veritas zk-SNARK garantiza la veracidad y cero desfase labial.\"",
          "fr": "🌐 PRIYA: « Veritas zk-SNARK garantit l'ancrage des faits et zéro décalage labial. »",
          "de": "🌐 PRIYA: „Veritas zk-SNARK garantiert faktische Fundierung und 0ms Drift.“",
          "hi": "🌐 प्रिया: \"वेरिटास तकनीक हर दावे की प्रामाणिकता और सटीक लिप-सिंक सुनिश्चित करती है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x4e9a82b31cd904fe716bb21890ea5541"
    }
  },
  {
    "id": "track_wildlife_serengeti_120s",
    "title": "Serengeti & Masai Mara: The 15-Act Wildlife Odyssey",
    "subtitle": "15-Act 120s 4K African Wildlife Documentary · The Great Migration & Apex Predators",
    "category": "nature",
    "character": "🦁 Serengeti Apex Wildlife & Savannah Ecosystem",
    "videoSrc": "/assets/video/serengeti_savannah_8s.mp4",
    "duration": 120,
    "acts": [
      {
        "id": "wildlife_act_1",
        "startTime": 0,
        "endTime": 8,
        "videoUrl": "/assets/video/serengeti_savannah_8s.mp4",
        "audioUrl": "/assets/audio/wildlife/act_1.wav",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 1: Dawn Over the Serengeti Plain",
        "philosophy": "The Awakening Savannah",
        "text": {
          "ja": "🦁 NARRATOR: 「夜明けの金色の光が地平線を照らし、百万頭のヌーが命がけの大移動を開始します。」",
          "en": "🦁 NARRATOR: \"Golden dawn breaks across the endless acacia plains of the Serengeti as the great migration begins.\"",
          "es": "🦁 NARRATOR: \"El amanecer dorado despierta las llanuras del Serengeti cuando comienza la gran migración.\"",
          "fr": "🦁 NARRATOR: « L'aube dorée illumine les plaines du Serengeti alors que commence la grande migration. »",
          "de": "🦁 NARRATOR: „Der goldene Sonnenaufgang erhellt die Serengeti-Ebene bei Beginn der großen Tierwanderung.“",
          "hi": "🦁 सूत्रधार: \"सेरेनगेटी के सुनहरे मैदानों पर सुबह की पहली किरण के साथ महान प्रवासन का आरंभ होता है।\""
        }
      },
      {
        "id": "wildlife_act_2",
        "startTime": 8,
        "endTime": 16,
        "videoUrl": "/assets/video/serengeti_lion.mp4",
        "audioUrl": "/assets/audio/wildlife/act_2.wav",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 2: The Lion Pride Awakens",
        "philosophy": "Apex Predator Dominance",
        "text": {
          "ja": "🦁 NARRATOR: 「岩山の上で威厳あるライオンの群れが目覚め、獲物の気配を鋭く探ります。」",
          "en": "🦁 NARRATOR: \"A powerful pride of lions stirs on the kopje rocks, scanning the morning horizon for prey.\"",
          "es": "🦁 NARRATOR: \"Una manada de leones se despereza sobre las rocas, vigilando el horizonte en busca de presas.\"",
          "fr": "🦁 NARRATOR: « Une troupe de lions s'éveille sur les rochers, scrutant l'horizon matinal en quête de proies. »",
          "de": "🦁 NARRATOR: „Ein Löwenrudel erwacht auf den Felsen und späht den morgendlichen Horizont nach Beute ab.“",
          "hi": "🦁 सूत्रधार: \"चट्टानों पर शेरों का झुंड जागता है और शिकार की तलाश में नज़रें दौड़ाता है।\""
        }
      },
      {
        "id": "wildlife_act_3",
        "startTime": 16,
        "endTime": 24,
        "videoUrl": "/assets/video/serengeti_cheetah.mp4",
        "audioUrl": "/assets/audio/wildlife/act_3.wav",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 3: Cheetah in the Tall Grass",
        "philosophy": "Silent Stalking & Focus",
        "text": {
          "ja": "🦁 NARRATOR: 「風に揺れる黄金の草むらの中、チーターが音もなくガゼルへと忍び寄ります。」",
          "en": "🦁 NARRATOR: \"Crouched low in the whispering golden grass, a solitary cheetah locks eyes with a grazing gazelle.\"",
          "es": "🦁 NARRATOR: \"Agachado en la hierba dorada, un guepardo solitario fija su mirada en una gacela.\"",
          "fr": "🦁 NARRATOR: « Accroupi dans les herbes dorées, un guépard solitaire fixe une gazelle qui broute. »",
          "de": "🦁 NARRATOR: „Geduckt im goldenen Gras fixiert ein einsamer Gepard eine grasende Gazelle.“",
          "hi": "🦁 सूत्रधार: \"सुनहरी घास में छिपा एक चीता चरती हुई गज़ेल पर अपनी नज़रें गड़ाता है।\""
        }
      },
      {
        "id": "wildlife_act_4",
        "startTime": 24,
        "endTime": 32,
        "videoUrl": "/assets/video/serengeti_act_4_cheetah_sprint.mp4",
        "audioUrl": "/assets/audio/wildlife/act_4.wav",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 4: The 70mph Cheetah Sprint",
        "philosophy": "Aerodynamic Kinetic Power",
        "text": {
          "ja": "🦁 NARRATOR: 「時速110キロの爆発的な疾走！大地を蹴り、驚異的な敏捷性で獲物を追いつめます。」",
          "en": "🦁 NARRATOR: \"Explosive acceleration at 70 miles per hour! A breathtaking sprint across the sunbaked earth.\"",
          "es": "🦁 NARRATOR: \"¡Aceleración explosiva a más de 100 km/h! Una carrera asombrosa por la tierra árida.\"",
          "fr": "🦁 NARRATOR: « Une accélération fulgurante à plus de 100 km/h ! Un sprint spectaculaire à travers la savane. »",
          "de": "🦁 NARRATOR: „Explosive Beschleunigung auf über 100 km/h! Ein atemberaubender Sprint über den staubigen Boden.“",
          "hi": "🦁 सूत्रधार: \"100 किमी प्रति घंटे की रफ्तार से विस्फोटक दौड़! सवाना की धरती पर रोमांचक पीछा।\""
        }
      },
      {
        "id": "wildlife_act_5",
        "startTime": 32,
        "endTime": 40,
        "videoUrl": "/assets/video/serengeti_elephants.mp4",
        "audioUrl": "/assets/audio/wildlife/act_5.wav",
        "speaker": "Narrator",
        "speakerRole": "National Geographic Documentarian",
        "actName": "Act 5: Elephant Matriarch & The Herd",
        "philosophy": "Ancestral Wisdom & Bond",
        "text": {
          "ja": "🦁 NARRATOR: 「長老の母ゾウに率いられた群れが、水場を求めてゆったりと赤い大地を進みます。」",
          "en": "🦁 NARRATOR: \"Guided by the matriarch's ancestral memory, an elephant herd marches toward distant waterholes.\"",
          "es": "🦁 NARRATOR: \"Guiada por la matriarca, una manada de elefantes marcha hacia los lejanos pozos de agua.\"",
          "fr": "🦁 NARRATOR: « Guidé par la matriarche, un troupeau d'éléphants s'avance paisiblement vers les points d'eau. »",
          "de": "🦁 NARRATOR: „Geleitet von der weisen Matriarchin zieht eine Elefantenherde zu fernen Wasserstellen.“",
          "hi": "🦁 सूत्रधार: \"मातृसत्तात्मक हथिनी के नेतृत्व में हाथियों का झुंड पानी की तलाश में आगे बढ़ता है।\""
        }
      }
    ],
    "veritas": {
      "status": "CERTIFIED_VALID",
      "snarkProofHash": "0x8f2d91a082bc310d289aa84bb9084e88"
    }
  }
];
