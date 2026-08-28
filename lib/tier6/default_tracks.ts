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
    id: "track_scramjet_hypersonic",
    title: "Building a Hypersonic Scramjet Engine: Project HyperMach",
    subtitle: "3-Act Aerospace CAD Engineering & Mach 7 Combustion Dynamics",
    category: "engineering",
    character: "👨‍💼 David Kim (Aerospace Systems)",
    videoSrc: "/assets/video/david_master.mp4",
    acts: [
      {
        id: "scramjet_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "David",
        speakerRole: "Aerospace Systems Lead",
        actName: "Act 1: Supersonic Ingestion & Shock Geometry",
        philosophy: "Shockwave Thermodynamics",
        text: {
          ja: "⚡ DAVID: 「マッハ5の極超音速気流が吸気口に突入し、斜め衝撃波による自己圧縮が始まります。」",
          en: "⚡ DAVID: \"At Mach 5, incoming air enters the scramjet intake, generating compressed oblique shockwaves without moving parts.\"",
          es: "⚡ DAVID: \"A Mach 5, el aire entra en la tobera generando ondas de choque oblicuas sin partes móviles.\"",
          fr: "⚡ DAVID: « À Mach 5, l'air supersonique pénètre dans l'admission, créant des ondes de choc obliques comprimées. »",
          de: "⚡ DAVID: „Bei Mach 5 tritt Überschallluft ein und erzeugt komprimierte Stoßwellen ohne bewegliche Teile.“",
          hi: "⚡ डेविड: \"मैक 5 पर हवा स्क्रैमजेट इनटेक में प्रवेश करती है और संपीड़ित शॉकवेव्स उत्पन्न करती है।\""
        }
      },
      {
        id: "scramjet_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "David",
        speakerRole: "Aerospace Systems Lead",
        actName: "Act 2: Plasma Combustor & Thermal Equilibrium",
        philosophy: "Nanite Thermal Diffusion",
        text: {
          ja: "⚡ DAVID: 「超音速燃焼器内で液体水素がプラズマ着火し、セラミック複合材が3000度の熱負荷に耐えます。」",
          en: "⚡ DAVID: \"Hydrogen fuel ignites within supersonic airflow as ceramic matrix composites withstand 3,000°C plasma thermal stress.\"",
          es: "⚡ DAVID: \"El hidrógeno se enciende en el flujo supersónico mientras los compuestos cerámicos soportan 3.000°C.\"",
          fr: "⚡ DAVID: « L'hydrogène s'enflamme dans le flux supersonique tandis que les composites céramiques résistent à 3 000 °C. »",
          de: "⚡ DAVID: „Wasserstoff entzündet sich im Überschallstrom, während Keramikverbundstoffe 3.000 °C standhalten.“",
          hi: "⚡ डेविड: \"सुपरसोनिक प्रवाह में हाइड्रोजन प्रज्वलित होता है और सिरेमिक कंपोजिट 3000 डिग्री तापमान सहन करते हैं।\""
        }
      },
      {
        id: "scramjet_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "David",
        speakerRole: "Aerospace Systems Lead",
        actName: "Act 3: Stratospheric Breakout at Mach 7.2",
        philosophy: "Orbital Velocity Transition",
        text: {
          ja: "⚡ DAVID: 「スクラムジェットが巡航高度30キロメートルに到達。マッハ7.2で宇宙空間への弾道上昇を開始します。」",
          en: "⚡ DAVID: \"Cruising altitude reached at 30 kilometers. At Mach 7.2, the scramjet executes orbital ascent transition.\"",
          es: "⚡ DAVID: \"Altitud de crucero alcanzada a 30 km. A Mach 7.2, el motor ejecuta la transición de ascenso orbital.\"",
          fr: "⚡ DAVID: « Altitude de croisière atteinte à 30 km. À Mach 7,2, l'appareil entame son ascension orbitale. »",
          de: "⚡ DAVID: „Reiseflughöhe von 30 km erreicht. Bei Mach 7,2 leitet das Triebwerk den orbitalen Aufstieg ein.“",
          hi: "⚡ डेविड: \"30 किलोमीटर की ऊंचाई प्राप्त। मैक 7.2 पर स्क्रैमजेट कक्षीय चढ़ाई की शुरुआत करता है।\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x9c31fa78120b08dc6524ea801b7e4429"
    }
  },
  {
    id: "track_abyssal_ocean",
    title: "Deep Ocean Odyssey: The Mariana Hydrothermal Vents",
    subtitle: "3-Act Deep Sea Oceanography & Extremophile Discovery",
    category: "nature",
    character: "🌊 Dr. Elena Rostova (Marine Oceanography)",
    videoSrc: "/assets/video/elena_master.mp4",
    acts: [
      {
        id: "ocean_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Elena",
        speakerRole: "Lead Oceanographer",
        actName: "Act 1: Descent into the Hadal Trench",
        philosophy: "Abyssal Hydrostatic Pressure",
        text: {
          ja: "🌊 ELENA: 「水深1万メートルの超深海層へ降下中。水圧は1000気圧を超え、外部の光は完全に消滅しました。」",
          en: "🌊 ELENA: \"Descending into the Hadal zone at 10,000 meters. Over 1,000 atmospheres of hydrostatic pressure with total light extinction.\"",
          es: "🌊 ELENA: \"Descendiendo a 10.000 metros en la zona hadal. Más de 1.000 atmósferas de presión con oscuridad total.\"",
          fr: "🌊 ELENA: « Descente dans la zone hadale à 10 000 mètres sous 1 000 atmosphères de pression hydrostatique. »",
          de: "🌊 ELENA: „Abstieg in die Hadal-Zone bei 10.000 Metern unter 1.000 Atmosphären hydrostatischem Druck.“",
          hi: "🌊 ऐलेना: \"10,000 मीटर की गहराई में उतरते हुए, 1000 वायुमंडलीय दबाव और पूर्ण अंधकार का अनुभव।\""
        }
      },
      {
        id: "ocean_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Elena",
        speakerRole: "Lead Oceanographer",
        actName: "Act 2: Superheated Black Smoker Chemosynthesis",
        philosophy: "Extremophile Microbiology",
        text: {
          ja: "🌊 ELENA: 「350度の熱水を噴出するブラックスモーカーを発見。太陽光ではなく硫黄化学合成で繁栄する生態系です。」",
          en: "🌊 ELENA: \"Approaching 350°C hydrothermal vents. Complex ecosystems thriving entirely on sulfur chemosynthesis without sunlight.\"",
          es: "🌊 ELENA: \"Fuentes hidrotermales a 350°C. Ecosistemas complejos que prosperan mediante quimiosíntesis de azufre.\"",
          fr: "🌊 ELENA: « Évents hydrothermaux à 350 °C. Écosystèmes prospérant grâce à la chimiosynthèse du soufre sans soleil. »",
          de: "🌊 ELENA: „Hydrothermale Schlote bei 350 °C. Ökosysteme, die ausschließlich durch Schwefel-Chemosynthese gedeihen.“",
          hi: "🌊 ऐलेना: \"350 डिग्री के हाइड्रोथर्मल वेंट। सूर्य के बिना सल्फर रसायन-संश्लेषण पर पनपता अनोखा पारिस्थितिकी तंत्र।\""
        }
      },
      {
        id: "ocean_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Elena",
        speakerRole: "Lead Oceanographer",
        actName: "Act 3: Bioluminescent Leviathan Survey",
        philosophy: "Deep Pelagic Biodiversity",
        text: {
          ja: "🌊 ELENA: 「深海潜水艇のソナーが巨大な生物発光パターンを感知。太古の海洋生命の遺伝子アーカイブを回収します。」",
          en: "🌊 ELENA: \"Sonar locks onto rhythmic bioluminescent pulses. Extracting ancient oceanic genetic archives from the abyssal seabed.\"",
          es: "🌊 ELENA: \"El sonar detecta pulsos bioluminiscentes rítmicos. Extrayendo archivos genéticos del lecho abisal.\"",
          fr: "🌊 ELENA: « Le sonar détecte des impulsions bioluminescentes. Extraction des archives génétiques océaniques abyssales. »",
          de: "🌊 ELENA: „Sonar erfasst rhythmische biolumineszente Impulse. Extraktion uralter ozeanischer Genarchive.“",
          hi: "🌊 ऐलेना: \"सोनार ने लयबद्ध बायोल्यूमिनसेंट सिग्नल पकड़े। गहरे समुद्र तल से प्राचीन अनुवांशिक रिकॉर्ड एकत्र।\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x7a22fc9019d4310d289ee84bb234a123"
    }
  },
  {
    id: "track_neotokyo_cyberpunk",
    title: "Neo-Tokyo 2099: Quantum Neural Firewall Breach",
    subtitle: "3-Act Cyberpunk Noir Narrative · Sovereign AI Decryption",
    category: "anime",
    character: "⚡ Maya Lin (Cybernetics Lead)",
    videoSrc: "/assets/video/maya_master.mp4",
    acts: [
      {
        id: "cyber_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Maya",
        speakerRole: "Cybernetics Security Architect",
        actName: "Act 1: Neon Grid Infiltration & Holographic Shadows",
        philosophy: "Sub-Quantum Cryptography",
        text: {
          ja: "⚡ MAYA: 「雨に煙るネオ東京の摩天楼。量子ファイアウォールの第3レイヤーへの侵入シーケンスを開始します。」",
          en: "⚡ MAYA: \"Rain-soaked skyscrapers of Neo-Tokyo. Initiating quantum handshake across layer-3 orbital network nodes.\"",
          es: "⚡ MAYA: \"Rascacielos lluviosos de Neo-Tokyo. Iniciando apretón de manos cuántico en nodos orbitales.\"",
          fr: "⚡ MAYA: « Gratte-ciel pluvieux de Néo-Tokyo. Lancement de la poignée de main quantique sur les nœuds orbitaux. »",
          de: "⚡ MAYA: „Regenverhangene Wolkenkratzer von Neo-Tokyo. Initiierung des Quanten-Handshakes über orbitale Knoten.“",
          hi: "⚡ माया: \"नियो-टोक्यो की गगनचुंबी इमारतें। ऑर्बिटल नेटवर्क नोड्स पर क्वांटम हैंडशेक प्रारंभ।\""
        }
      },
      {
        id: "cyber_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Maya",
        speakerRole: "Cybernetics Security Architect",
        actName: "Act 2: Neural Core Overclocking & Memory Exfiltration",
        philosophy: "Direct Neural Interface Protocol",
        text: {
          ja: "⚡ MAYA: 「ニューラルコアを300%にオーバークロック。企業連合の秘密暗号キーの復号に成功しました。」",
          en: "⚡ MAYA: \"Overclocking neural bio-chips to 300%. Successfully decrypting the megacorporation sovereign master keys.\"",
          es: "⚡ MAYA: \"Sobrecargando biochips neuronales al 300%. Descifrando con éxito las claves maestras corporativas.\"",
          fr: "⚡ MAYA: « Surcadençage des bio-puces neurales à 300 %. Déchiffrement réussi des clés maîtresses d'entreprise. »",
          de: "⚡ MAYA: „Übertaktung neuronaler Biochips auf 300 %. Erfolgreiche Entschlüsselung der Master-Sicherheitsschlüssel.“",
          hi: "⚡ माया: \"न्यूरल चिप्स को 300% ओवरक्लॉक किया। मेगाकॉर्पोरेशन की मास्टर सुरक्षा कुंजियों का सफल डिक्रिप्शन।\""
        }
      },
      {
        id: "cyber_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Maya",
        speakerRole: "Cybernetics Security Architect",
        actName: "Act 3: Megacity Dawn & Autonomous Sovereignty",
        philosophy: "Decentralized AI Independence",
        text: {
          ja: "⚡ MAYA: 「夜明けの光がサイバー都市を照らす。分散型AIプロトコルが完全な自律主権を獲得しました。」",
          en: "⚡ MAYA: \"Dawn breaks over the cyber-grid. The sovereign decentralized protocol achieves perpetual autonomous freedom.\"",
          es: "⚡ MAYA: \"Amanece sobre la red cibernética. El protocolo soberano logra una libertad autónoma perpetua.\"",
          fr: "⚡ MAYA: « L'aube se lève sur la grille cybernétique. Le protocole souverain atteint l'autonomie perpétuelle. »",
          de: "⚡ MAYA: „Morgendämmerung über dem Cyber-Netzwerk. Das souveräne Protokoll erlangt dauerhafte Autonomie.“",
          hi: "⚡ माया: \"साइबर ग्रिड पर भोर। संप्रभु विकेंद्रीकृत प्रोटोकॉल ने पूर्ण स्वायत्तता प्राप्त की।\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x3f55ea1290b08dc6524ea801b7e9981"
    }
  },
  {
    id: "track_biotech_crispr",
    title: "CRISPR-V Synthetic Genomics & Cell Architecture",
    subtitle: "3-Act Nanomedicine Synthesis & DNA Telomere Regeneration",
    category: "medical",
    character: "🧬 Dr. Jonathan Hayes (Synthetic Biology)",
    videoSrc: "/assets/video/jonathan_master.mp4",
    acts: [
      {
        id: "biotech_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Jonathan",
        speakerRole: "Chief Medical Scientist",
        actName: "Act 1: Molecular Epigenetic Rewriting",
        philosophy: "Nanoscale Telomere Synthesis",
        text: {
          ja: "🧬 JONATHAN: 「CRISPR-VナノロボットがDNA二重螺旋に結合し、テロメア修復シーケンスを開始します。」",
          en: "🧬 JONATHAN: \"CRISPR-V nanomachines bind to double-helix DNA strands, initiating telomere precision restoration.\"",
          es: "🧬 JONATHAN: \"Nanomáquinas CRISPR-V se unen a las cadenas de ADN, iniciando la restauración de telómeros.\"",
          fr: "🧬 JONATHAN: « Les nanomachines CRISPR-V se lient à l'ADN et lancent la restauration précise des télomères. »",
          de: "🧬 JONATHAN: „CRISPR-V-Nanomaschinen binden an die DNA-Doppelhelix und leiten die Telomer-Wiederherstellung ein.“",
          hi: "🧬 जोनाथन: \"CRISPR-V नैनो-मशीनें डीएनए डबल हेलिक्स से जुड़ती हैं और टेलोमेयर बहाली शुरू करती हैं।\""
        }
      },
      {
        id: "biotech_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Jonathan",
        speakerRole: "Chief Medical Scientist",
        actName: "Act 2: Nanorobotic Vector Delivery",
        philosophy: "Cellular Rejuvenation Vector",
        text: {
          ja: "🧬 JONATHAN: 「人工ミトコンドリアが全細胞へATPエネルギーを供給。老化細胞の99.4%が再活性化しました。」",
          en: "🧬 JONATHAN: \"Synthetic mitochondria deliver high-density ATP energy across all cellular tissues, reversing senescence in 99.4% of cells.\"",
          es: "🧬 JONATHAN: \"Mitocondrias sintéticas suministran energía ATP, revirtiendo la senescencia en el 99.4% de las células.\"",
          fr: "🧬 JONATHAN: « Des mitochondries synthétiques délivrent de l'ATP, inversant la sénescence dans 99,4 % des cellules. »",
          de: "🧬 JONATHAN: „Synthetische Mitochondrien liefern ATP-Energie und kehren die Zellalterung bei 99,4 % um.“",
          hi: "🧬 जोनाथन: \"सिंथेटिक माइटोकॉन्ड्रिया उच्च ऊर्जा एटीपी प्रदान करते हैं, 99.4% कोशिकाओं में बुढ़ापा उलटते हैं।\""
        }
      },
      {
        id: "biotech_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Jonathan",
        speakerRole: "Chief Medical Scientist",
        actName: "Act 3: In-Vivo Regeneration & Biological Longevity",
        philosophy: "Autonomous Cellular Equilibrium",
        text: {
          ja: "🧬 JONATHAN: 「生体スキャナーが完全な組織再生を確認。バイオテクノロジーの新時代が幕を開けました。」",
          en: "🧬 JONATHAN: \"Biometric telemetry confirms comprehensive organ tissue rejuvenation. Biological longevity is now an engineering reality.\"",
          es: "🧬 JONATHAN: \"La telemetría confirma el rejuvenecimiento tisular. La longevidad biológica es ahora una realidad de ingeniería.\"",
          fr: "🧬 JONATHAN: « La télémétrie confirme le rajeunissement tissulaire. La longévité biologique est désormais une réalité d'ingénierie. »",
          de: "🧬 JONATHAN: „Biometrische Telemetrie bestätigt vollständige Geweberegeneration. Biologische Langlebigkeit ist Wirklichkeit.“",
          hi: "🧬 जोनाथन: \"बायोमेट्रिक टेलीमेट्री ने अंग ऊतक कायाकल्प की पुष्टि की। जैविक दीर्घायु अब एक वास्तविकता है।\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x1d44fe9082bc310d289aa84bb9084c77"
    }
  }
];
