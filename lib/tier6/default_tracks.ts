import { ANIME_SUBTITLE_CUES } from "./anime_subtitles";

export interface SeriesTrack {
  id: string;
  title: string;
  subtitle: string;
  category: "anime" | "executive" | "nature" | "space" | "engineering" | "medical" | "paintings" | "plays" | "cartoon" | "movies" | "custom" | string;
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
    id: "track_wildlife_serengeti_120s",
    title: "Serengeti & Masai Mara: The 15-Act Wildlife Odyssey",
    subtitle: "15-Act 120s 4K African Wildlife Documentary · The Great Migration & Apex Predators",
    category: "nature",
    character: "🦁 Serengeti Apex Wildlife & Savannah Ecosystem",
    videoSrc: "/assets/video/option_1_keynote_wide.mp4",
    duration: 120.0,
    acts: [
      {
        id: "wildlife_act_1",
        startTime: 0.0,
        endTime: 8.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 1: Dawn Over the Serengeti Plain",
        philosophy: "The Awakening Savannah",
        text: {
          ja: "🦁 NARRATOR: 「夜明けの金色の光が地平線を照らし、百万頭のヌーが命がけの大移動を開始します。」",
          en: "🦁 NARRATOR: \"Golden dawn breaks across the endless acacia plains of the Serengeti as the great migration begins.\"",
          es: "🦁 NARRATOR: \"El amanecer dorado despierta las llanuras del Serengeti cuando comienza la gran migración.\"",
          fr: "🦁 NARRATOR: « L'aube dorée illumine les plaines du Serengeti alors que commence la grande migration. »",
          de: "🦁 NARRATOR: „Der goldene Sonnenaufgang erhellt die Serengeti-Ebene bei Beginn der großen Tierwanderung.“",
          hi: "🦁 सूत्रधार: \"सेरेनगेटी के सुनहरे मैदानों पर सुबह की पहली किरण के साथ महान प्रवासन का आरंभ होता है।\""
        }
      },
      {
        id: "wildlife_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 2: The Lion Pride Awakens",
        philosophy: "Apex Predator Dominance",
        text: {
          ja: "🦁 NARRATOR: 「岩山の上で威厳あるライオンの群れが目覚め、獲物の気配を鋭く探ります。」",
          en: "🦁 NARRATOR: \"A powerful pride of lions stirs on the kopje rocks, scanning the morning horizon for prey.\"",
          es: "🦁 NARRATOR: \"Una manada de leones se despereza sobre las rocas, vigilando el horizonte en busca de presas.\"",
          fr: "🦁 NARRATOR: « Une troupe de lions s'éveille sur les rochers, scrutant l'horizon matinal en quête de proies. »",
          de: "🦁 NARRATOR: „Ein Löwenrudel erwacht auf den Felsen und späht den morgendlichen Horizont nach Beute ab.“",
          hi: "🦁 सूत्रधार: \"चट्टानों पर शेरों का झुंड जागता है और शिकार की तलाश में नज़रें दौड़ाता है।\""
        }
      },
      {
        id: "wildlife_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 3: Cheetah in the Tall Grass",
        philosophy: "Silent Stalking & Focus",
        text: {
          ja: "🦁 NARRATOR: 「風に揺れる黄金の草むらの中、チーターが音もなくガゼルへと忍び寄ります。」",
          en: "🦁 NARRATOR: \"Crouched low in the whispering golden grass, a solitary cheetah locks eyes with a grazing gazelle.\"",
          es: "🦁 NARRATOR: \"Agachado en la hierba dorada, un guepardo solitario fija su mirada en una gacela.\"",
          fr: "🦁 NARRATOR: « Accroupi dans les herbes dorées, un guépard solitaire fixe une gazelle qui broute. »",
          de: "🦁 NARRATOR: „Geduckt im goldenen Gras fixiert ein einsamer Gepard eine grasende Gazelle.“",
          hi: "🦁 सूत्रधार: \"सुनहरी घास में छिपा एक चीता चरती हुई गज़ेल पर अपनी नज़रें गड़ाता है।\""
        }
      },
      {
        id: "wildlife_act_4",
        startTime: 24.0,
        endTime: 32.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 4: The 70mph Cheetah Sprint",
        philosophy: "Aerodynamic Kinetic Power",
        text: {
          ja: "🦁 NARRATOR: 「時速110キロの爆発的な疾走！大地を蹴り、驚異的な敏捷性で獲物を追いつめます。」",
          en: "🦁 NARRATOR: \"Explosive acceleration at 70 miles per hour! A breathtaking sprint across the sunbaked earth.\"",
          es: "🦁 NARRATOR: \"¡Aceleración explosiva a más de 100 km/h! Una carrera asombrosa por la tierra árida.\"",
          fr: "🦁 NARRATOR: « Une accélération fulgurante à plus de 100 km/h ! Un sprint spectaculaire à travers la savane. »",
          de: "🦁 NARRATOR: „Explosive Beschleunigung auf über 100 km/h! Ein atemberaubender Sprint über den staubigen Boden.“",
          hi: "🦁 सूत्रधार: \"100 किमी प्रति घंटे की रफ्तार से विस्फोटक दौड़! सवाना की धरती पर रोमांचक पीछा।\""
        }
      },
      {
        id: "wildlife_act_5",
        startTime: 32.0,
        endTime: 40.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 5: Elephant Matriarch & The Herd",
        philosophy: "Ancestral Wisdom & Bond",
        text: {
          ja: "🦁 NARRATOR: 「長老の母ゾウに率いられた群れが、水場を求めてゆったりと赤い大地を進みます。」",
          en: "🦁 NARRATOR: \"Guided by the matriarch's ancestral memory, an elephant herd marches toward distant waterholes.\"",
          es: "🦁 NARRATOR: \"Guiada por la matriarca, una manada de elefantes marcha hacia los lejanos pozos de agua.\"",
          fr: "🦁 NARRATOR: « Guidé par la matriarche, un troupeau d'éléphants s'avance paisiblement vers les points d'eau. »",
          de: "🦁 NARRATOR: „Geleitet von der weisen Matriarchin zieht eine Elefantenherde zu fernen Wasserstellen.“",
          hi: "🦁 सूत्रधार: \"मातृसत्तात्मक हथिनी के नेतृत्व में हाथियों का झुंड पानी की तलाश में आगे बढ़ता है।\""
        }
      },
      {
        id: "wildlife_act_6",
        startTime: 40.0,
        endTime: 48.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 6: Giraffes in the Acacia Canopy",
        philosophy: "Graceful High Elevation",
        text: {
          ja: "🦁 NARRATOR: 「優雅なキリンたちがアカシアの梢を食み、青空を背景に優美なシルエットを描きます。」",
          en: "🦁 NARRATOR: \"Towering giraffes delicately browse thorny acacia crowns, framed gracefully against the azure sky.\"",
          es: "🦁 NARRATOR: \"Majestuosas jirafas se alimentan de las acacias espinosas, recortadas contra el cielo azul.\"",
          fr: "🦁 NARRATOR: « De majestueuses girafes broutent les épineuses cimes d'acacias sous un ciel d'azur. »",
          de: "🦁 NARRATOR: „Erhabene Giraffen äsen an den dornigen Kronen der Akazien vor dem tiefblauen Himmel.“",
          hi: "🦁 सूत्रधार: \"ऊंची जिराफें बबूल के पेड़ों की पत्तियों को खाते हुए नीले आसमान के नीचे सुंदर दृश्य बनाती हैं।\""
        }
      },
      {
        id: "wildlife_act_7",
        startTime: 48.0,
        endTime: 56.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 7: Gathering Storm Over the Mara",
        philosophy: "Atmospheric Tension",
        text: {
          ja: "🦁 NARRATOR: 「重く垂れ込めた雨雲が稲妻を走らせ、大地に生命の雨の到来を告げます。」",
          en: "🦁 NARRATOR: \"Thunderheads roll dark across the horizon as lightning crackles, heralding the life-giving rains.\"",
          es: "🦁 NARRATOR: \"Las nubes de tormenta oscurecen el horizonte mientras los relámpagos anuncian las lluvias vitales.\"",
          fr: "🦁 NARRATOR: « De sombres nuages d'orage grondent à l'horizon, annonçant les pluies bienfaitrices. »",
          de: "🦁 NARRATOR: „Dunkle Gewitterwolken ziehen auf und Blitze künden vom lebensspendenden Regen.“",
          hi: "🦁 सूत्रधार: \"आसमान में काले बादल गरजते हैं और बिजली चमकती है, जो जीवनदायिनी बारिश का संदेश देती है।\""
        }
      },
      {
        id: "wildlife_act_8",
        startTime: 56.0,
        endTime: 64.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 8: The Precipice of the Mara River",
        philosophy: "The Hesitation of the Herd",
        text: {
          ja: "🦁 NARRATOR: 「怒涛のマラ川の岸辺。数万頭のシマウマとヌーが濁流を見つめ、躊躇いながら立ち尽くします。」",
          en: "🦁 NARRATOR: \"At the steep cliff of the churning Mara River, thousands of wildebeest hesitate before the fateful plunge.\"",
          es: "🦁 NARRATOR: \"En la empinada orilla del río Mara, miles de ñus dudan antes del fatídico salto.\"",
          fr: "🦁 NARRATOR: « Au bord des berges escarpées de la rivière Mara, des milliers de gnous hésitent avant le grand saut. »",
          de: "🦁 NARRATOR: „Am steilen Ufer des reißenden Mara-Flusses zögern Tausende Gnus vor dem waghalsigen Sprung.“",
          hi: "🦁 सूत्रधार: \"मारा नदी के खतरनाक किनारे पर लाखों वन्यजीव पानी में कूदने से पहले रुकते हैं।\""
        }
      },
      {
        id: "wildlife_act_9",
        startTime: 64.0,
        endTime: 72.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 9: The Leap of Faith: River Crossing",
        philosophy: "Mass Collective Courage",
        text: {
          ja: "🦁 NARRATOR: 「最初の一頭が跳んだ！激流へと飛び込む無数の群れが川を埋め尽くします。」",
          en: "🦁 NARRATOR: \"The first brave leader leaps! A roaring avalanche of hooves crashes into the rushing white water.\"",
          es: "🦁 NARRATOR: \"¡El primer líder salta! Una avalancha de cascos se precipita contra las aguas turbulentas.\"",
          fr: "🦁 NARRATOR: « Le premier chef s'élance ! Une marée d'animaux plonge dans les eaux tumultueuses. »",
          de: "🦁 NARRATOR: „Der erste Mutige springt! Eine Lawine aus Hufen stürzt in die tosenden Fluten.“",
          hi: "🦁 सूत्रधार: \"पहला साहसी जानवर छलांग लगाता है! और देखते ही देखते पूरी नदी में जीवों का सैलाब उमड़ पड़ता है।\""
        }
      },
      {
        id: "wildlife_act_10",
        startTime: 72.0,
        endTime: 80.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 10: Nile Crocodiles Strike",
        philosophy: "Ancient Prehistoric Trial",
        text: {
          ja: "🦁 NARRATOR: 「水中に潜む巨大なナイルワニが急浮上！大自然の過酷な掟が炸裂します。」",
          en: "🦁 NARRATOR: \"Massive prehistoric Nile crocodiles erupt from the depths, claiming their ancient toll from the river.\"",
          es: "🦁 NARRATOR: \"Enormes cocodrilos del Nilo emergen de las profundidades, imponiendo la ley más implacable de la naturaleza.\"",
          fr: "🦁 NARRATOR: « De gigantesques crocodiles du Nil surgissent des profondeurs, prélevant leur tribut ancestral. »",
          de: "🦁 NARRATOR: „Riesige Nilkrokodile tauchen aus den Tiefen auf und fordern ihren uralten Tribut.“",
          hi: "🦁 सूत्रधार: \"विशालकाय मगरमच्छ गहराई से बाहर आते हैं और प्रकृति के सबसे कठोर नियम को लागू करते हैं।\""
        }
      },
      {
        id: "wildlife_act_11",
        startTime: 80.0,
        endTime: 88.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 11: Triumph of the Survivors",
        philosophy: "Resilience & Renewal",
        text: {
          ja: "🦁 NARRATOR: 「対岸の緑豊かな大地へ這い上がる生き残りたち。新たな命の旅が続きます。」",
          en: "🦁 NARRATOR: \"Exhausted but victorious, the surviving herds scramble up the fertile northern banks.\"",
          es: "🦁 NARRATOR: \"Agotadas pero victoriosas, las manadas supervivientes alcanzan las verdes y fértiles orillas.\"",
          fr: "🦁 NARRATOR: « Épuisés mais vainqueurs, les survivants gravissent les rives fertiles du nord. »",
          de: "🦁 NARRATOR: „Erschöpft, aber siegreich erklimmen die Überlebenden das saftig grüne Nordufer.“",
          hi: "🦁 सूत्रधार: \"थके हुए लेकिन विजयी, जीवित जानवर नदी के पार हरे-भरे मैदानों पर पहुंचते हैं।\""
        }
      },
      {
        id: "wildlife_act_12",
        startTime: 88.0,
        endTime: 96.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 12: The Hyena Clan & Scavengers",
        philosophy: "The Cleaners of the Savannah",
        text: {
          ja: "🦁 NARRATOR: 「ブチハイエナの群れとハゲワシが集い、生態系の清掃者としての役割を果たします。」",
          en: "🦁 NARRATOR: \"Spotted hyena clans and circling vultures clean the plains, recycling vital nutrients back into the soil.\"",
          es: "🦁 NARRATOR: \"Clanes de hienas y buitres cumplen su papel esencial, devolviendo nutrientes vitales al suelo.\"",
          fr: "🦁 NARRATOR: « Les hyènes tachetées et les vautours nettoient les plaines, nourrissant la terre nourricière. »",
          de: "🦁 NARRATOR: „Tüpfelhyänen und kreisende Geier erfüllen ihre wichtige Rolle im Nährstoffkreislauf des Ökosystems.“",
          hi: "🦁 सूत्रधार: \"लकड़बग्घे और गिद्ध मैदानों को साफ करके प्रकृति के पोषक चक्र को बनाए रखते हैं।\""
        }
      },
      {
        id: "wildlife_act_13",
        startTime: 96.0,
        endTime: 104.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 13: Solitary Leopard in the Sausage Tree",
        philosophy: "Master of Solitude",
        text: {
          ja: "🦁 NARRATOR: 「樹上で休むヒョウの澄んだ眼差し。夕暮れの気配を静かに見守っています。」",
          en: "🦁 NARRATOR: \"Draped across a sausage tree limb, a solitary leopard gazes over the vast quiet savanna.\"",
          es: "🦁 NARRATOR: \"Recostado sobre la rama de un árbol, un solitario leopardo contempla la inmensidad de la sabana.\"",
          fr: "🦁 NARRATOR: « Allongé sur une branche, un léopard solitaire contemple le calme de la savane au couchant. »",
          de: "🦁 NARRATOR: „Auf einem Ast liegend blickt ein einsamer Leopard über die friedliche Weite der Savanne.“",
          hi: "🦁 सूत्रधार: \"पेड़ की डाल पर बैठा एक शांत तेंदुआ शाम के समय सवाना के विशाल विस्तार को देखता है।\""
        }
      },
      {
        id: "wildlife_act_14",
        startTime: 104.0,
        endTime: 112.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 14: Crimson Twilight Over Acacia Silhouettes",
        philosophy: "Sunset Majesty",
        text: {
          ja: "🦁 NARRATOR: 「燃えるような茜色の夕陽が大地を包み、野生の息吹が穏やかに鎮まります。」",
          en: "🦁 NARRATOR: \"A blazing crimson sunset washes across the silhouette of marching elephants and acacia canopies.\"",
          es: "🦁 NARRATOR: \"Un ardiente atardecer carmesí baña la silueta de los elefantes y los árboles de acacia.\"",
          fr: "🦁 NARRATOR: « Un flamboyant coucher de soleil écarlate enveloppe les silhouettes des éléphants en marche. »",
          de: "🦁 NARRATOR: „Ein glutroter Sonnenuntergang taucht die ziehenden Elefanten und Akazien in warmes Licht.“",
          hi: "🦁 सूत्रधार: \"ढलते सूरज की लालिमा हाथियों के झुंड और बबूल के पेड़ों की परछाइयों को सुंदरता से रंगती है।\""
        }
      },
      {
        id: "wildlife_act_15",
        startTime: 112.0,
        endTime: 120.0,
        speaker: "Narrator",
        speakerRole: "National Geographic Documentarian",
        actName: "Act 15: The Starlit Savanna & The Circle of Life",
        philosophy: "Eternal Ecological Harmony",
        text: {
          ja: "🦁 NARRATOR: 「満天の星空の下、セレンゲティの夜が深まります。生命の輪は永遠に続いていくのです。」",
          en: "🦁 NARRATOR: \"Under a canopy of brilliant African stars, the savannah rests. The timeless circle of life continues forever.\"",
          es: "🦁 NARRATOR: \"Bajo un manto de brillantes estrellas africanas, la sabana descansa. El ciclo eterno de la vida continúa.\"",
          fr: "🦁 NARRATOR: « Sous la voûte étoilée d'Afrique, la savane s'endort. Le cercle éternel de la vie perdure à jamais. »",
          de: "🦁 NARRATOR: „Unter dem funkelnden afrikanischen Sternenhimmel ruht die Savanne. Der ewige Kreis des Lebens schließt sich.“",
          hi: "🦁 सूत्रधार: \"तारों से भरे अफ्रीकी आकाश के नीचे सवाना शांत है। जीवन का शाश्वत चक्र यूं ही निरंतर चलता रहेगा।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x8f2d91a082bc310d289aa84bb9084e88"
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
          hi: "⚡ MAYA: \"Neo-Tokyo\""
        }
      }
    ],
    duration: 8.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x8f2d4e1082bc310d289aa84bb9084c66"
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
  },
  {
    id: "track_renaissance_painting",
    title: "The Living Canvas: Renaissance Allegory & Oil Masterpiece",
    subtitle: "3-Act Classical Oil Painting Animation · Caravaggio Chiaroscuro & Leonardo Alchemy",
    category: "paintings",
    character: "🎨 Maestro Leonardo (Renaissance Master)",
    videoSrc: "/assets/video/option_5_authoritative_orator.mp4",
    acts: [
      {
        id: "paint_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Leonardo",
        speakerRole: "Master Painter & Polymath",
        actName: "Act 1: The Alchemy of Pigment & Primer",
        philosophy: "Sfumato Layering Technique",
        text: {
          ja: "🎨 LEONARDO: 「砕いたラピスラズリと亜麻仁油がキャンバス上で混ざり合い、永遠の光を生み出します。」",
          en: "🎨 LEONARDO: \"Crushed lapis lazuli and cold-pressed linseed oil blend upon the linen canvas, capturing immortal luminescence.\"",
          es: "🎨 LEONARDO: \"El lapislázuli triturado y el aceite de linaza se funden sobre el lienzo, capturando una luz inmortal.\"",
          fr: "🎨 LEONARDO: « Le lapis-lazuli broyé et l'huile de lin se mêlent sur la toile pour capturer une lumière éternelle. »",
          de: "🎨 LEONARDO: „Zerstoßenes Lapislazuli und Leinöl verschmelzen auf der Leinwand und fangen ewiges Licht ein.“",
          hi: "🎨 लियोनार्डो: \"पिसा हुआ लापिस लाजुली और अलसी का तेल कैनवास पर मिलकर अमर प्रकाश को कैद करते हैं।\""
        }
      },
      {
        id: "paint_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Leonardo",
        speakerRole: "Master Painter & Polymath",
        actName: "Act 2: Chiaroscuro & The Golden Spiral",
        philosophy: "Divine Geometric Proportions",
        text: {
          ja: "🎨 LEONARDO: 「光と影の劇的な対比——キアロスクーロによって、人物の魂がカンバスから浮かび上がります。」",
          en: "🎨 LEONARDO: \"Through the dramatic drama of chiaroscuro, light and shadow carve the human soul directly from darkness.\"",
          es: "🎨 LEONARDO: \"Mediante el claroscuro, la luz y la sombra tallan el alma humana directamente desde la oscuridad.\"",
          fr: "🎨 LEONARDO: « Grâce au clair-obscur, l'ombre et la lumière sculptent l'âme humaine hors des ténèbres. »",
          de: "🎨 LEONARDO: „Durch den dramatischen Hell-Dunkel-Kontrast formt das Licht die menschliche Seele aus der Finsternis.“",
          hi: "🎨 लियोनार्डो: \"प्रकाश और छाया के नाटकीय संतुलन से मानव आत्मा अंधेरे से निकलकर जीवंत हो उठती है।\""
        }
      },
      {
        id: "paint_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Leonardo",
        speakerRole: "Master Painter & Polymath",
        actName: "Act 3: The Canvas Breathes: Timeless Immortality",
        philosophy: "Universal Aesthetic Harmony",
        text: {
          ja: "🎨 LEONARDO: 「絵画は五百年を超えて生き続ける。美とは、時代を超越した精神の呼吸そのものなのです。」",
          en: "🎨 LEONARDO: \"The masterpiece breathes across five centuries. Art is not merely pigment—it is the eternal pulse of civilization.\"",
          es: "🎨 LEONARDO: \"La obra maestra respira a través de cinco siglos. El arte es el pulso eterno de la civilización.\"",
          fr: "🎨 LEONARDO: « Le chef-d'œuvre respire à travers cinq siècles. L'art est le battement éternel de notre humanité. »",
          de: "🎨 LEONARDO: „Das Meisterwerk atmet über fünf Jahrhunderte hinweg. Kunst ist der unvergängliche Herzschlag der Zivilisation.“",
          hi: "🎨 लियोनार्डो: \"यह उत्कृष्ट कृति पाँच शताब्दियों तक सांस लेती है। कला सभ्यता का शाश्वत स्पंदन है।\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x88bb71c092da310d289ff84bb2347162"
    }
  },
  {
    id: "track_theatrical_hamlet",
    title: "The Hamlet Soliloquy: Tragedy of the Crown",
    subtitle: "3-Act Shakespearean Globe Theatre Stageplay & Royal Betrayal",
    category: "plays",
    character: "🎭 Lord Hamlet (Prince of Denmark)",
    videoSrc: "/assets/video/option_4_tech_podium.mp4",
    acts: [
      {
        id: "hamlet_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Hamlet",
        speakerRole: "Prince of Denmark",
        actName: "Act 1: Midnight upon the Ramparts of Elsinore",
        philosophy: "The Ghostly Revelation",
        text: {
          ja: "🎭 HAMLET: 「エルシノアの夜霧の中、父王の亡霊が現れ、王冠に隠された毒殺の真実を告げる。」",
          en: "🎭 HAMLET: \"Upon the freezing battlements of Elsinore, the spectral shade of my father reveals the murderous usurpation.\"",
          es: "🎭 HAMLET: \"En las heladas almenas de Elsinor, la sombra de mi padre revela la usurpación asesina.\"",
          fr: "🎭 HAMLET: « Sur les remparts glacés d'Elseneur, le spectre de mon père révèle l'usurpation meurtrière. »",
          de: "🎭 HAMLET: „Auf den eisigen Zinnen von Helsingör offenbart der Geist meines Vaters den blutigen Verrat.“",
          hi: "🎭 हेमलेट: \"एल्सिनोर की बर्फीली प्राचीर पर, मेरे पिता का प्रेत विश्वासघात और हत्या का सच उजागर करता है।\""
        }
      },
      {
        id: "hamlet_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Hamlet",
        speakerRole: "Prince of Denmark",
        actName: "Act 2: To Be or Not to Be: The Soliloquy",
        philosophy: "Existential Resolve & Fate",
        text: {
          ja: "🎭 HAMLET: 「生きるべきか、死ぬべきか、それが問題だ。過酷な運命の矢に耐えるか、それとも立ち向かうべきか。」",
          en: "🎭 HAMLET: \"To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings of outrageous fortune.\"",
          es: "🎭 HAMLET: \"Ser o no ser, esa es la cuestión: si es más noble para el alma sufrir las flechas de la fortuna injusta.\"",
          fr: "🎭 HAMLET: « Être ou ne pas être, telle est la question : est-il plus noble de supporter les flèches de la fortune adverse ? »",
          de: "🎭 HAMLET: „Sein oder Nichtsein, das ist hier die Frage: Ob 's edler im Gemüt, die Pfeile des wütenden Geschicks zu dulden.“",
          hi: "🎭 हेमलेट: \"होना या न होना, यही प्रश्न है: क्या भाग्य के प्रहारों को सहना अधिक महान है या उनका अंत करना?\""
        }
      },
      {
        id: "hamlet_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Hamlet",
        speakerRole: "Prince of Denmark",
        actName: "Act 3: The Mousetrap: Catching the King's Conscience",
        philosophy: "The Catharsis of Drama",
        text: {
          ja: "🎭 HAMLET: 「劇こそが罠だ。これによって私は国王の良心を捕らえ、真実の裁きを下すのだ！」",
          en: "🎭 HAMLET: \"The play's the thing wherein I'll catch the conscience of the King! Sound the trumpets of judgment!\"",
          es: "🎭 HAMLET: \"¡La obra es la trampa donde atraparé la conciencia del Rey! ¡Que suenen las trompetas del juicio!\"",
          fr: "🎭 HAMLET: « La pièce est le piège où j'attraperai la conscience du Roi ! Que sonnent les trompettes du jugement ! »",
          de: "🎭 HAMLET: „Das Schauspiel ist die Schlinge, in die das Gewissen des Königs geht! Blast die Trompeten des Gerichts!“",
          hi: "🎭 हेमलेट: \"यह नाटक ही वह जाल है जिसमें मैं राजा के अंतर्मन को पकड़ूंगा! न्याय के बिगुल बजाओ!\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x55aa61f092ea310d289bb84bb9910471"
    }
  },
  {
    id: "track_starlight_cartoon",
    title: "Barnaby & The Starlight Biscuit: Cosmic Pup Adventure",
    subtitle: "3-Act 3D Pixar Style Animated Cartoon · The Galactic Odyssey",
    category: "cartoon",
    character: "🐾 Astro-Pup Barnaby (Cosmic Explorer)",
    videoSrc: "/assets/video/veo_anime_kiri.mp4",
    acts: [
      {
        id: "pup_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Barnaby",
        speakerRole: "Heroic Astro-Pup",
        actName: "Act 1: Launch from the Backyard Observatory",
        philosophy: "Pure Wholesome Curiosity",
        text: {
          ja: "🐾 BARNABY: 「ワン！ダンボールロケット発射！裏庭から夜空へ、宇宙一の骨型ビスケットを探す大冒険だワン！」",
          en: "🐾 BARNABY: \"Woof! Cardboard rocket blastoff! Zooming past the doghouse into the starry cosmos for the legendary Golden Biscuit!\"",
          es: "🐾 BARNABY: \"¡Guau! ¡Despegue del cohete de cartón! ¡Directo al cosmos en busca de la legendaria galleta dorada!\"",
          fr: "🐾 BARNABY: « Ouah ! Décollage de la fusée en carton ! Vers les étoiles pour dénicher le légendaire Biscuit Doré ! »",
          de: "🐾 BARNABY: „Wuff! Raketenstart aus dem Garten! Auf ins Weltall auf der Suche nach dem Goldenen Riesen-Keks!“",
          hi: "🐾 बार्नाबी: \"भौंक! कार्डबोर्ड रॉकेट उड़ान! सुनहरे जादुई बिस्कुट की तलाश में अंतरिक्ष की सैर!\""
        }
      },
      {
        id: "pup_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Barnaby",
        speakerRole: "Heroic Astro-Pup",
        actName: "Act 2: Slalom Through the Bubblegum Asteroids",
        philosophy: "Playful Cosmic Acrobatics",
        text: {
          ja: "🐾 BARNABY: 「ピンクのバブルガム小惑星帯をジャンプ！星屑のクッキーの香りがしてきたぞ、もっとスピードアップだ！」",
          en: "🐾 BARNABY: \"Bouncing through the pink bubblegum asteroid belt! Tail wagging at warp speed toward the cookie nebula!\"",
          es: "🐾 BARNABY: \"¡Rebotando en los asteroides de chicle rosa! ¡Moviendo la colita a velocidad luz hacia la nebulosa!\"",
          fr: "🐾 BARNABY: « Slalom entre les astéroïdes en chewing-gum rose ! La queue frétillante à la vitesse de la lumière ! »",
          de: "🐾 BARNABY: „Slalom durch den Kaugummi-Asteroidengürtel! Mit vollem Schwung hinein in den Keks-Nebel!“",
          hi: "🐾 बार्नाबी: \"गुलाबी बबल-गम उल्कापिंडों के बीच छलांग! खुशी से पूंछ हिलाते हुए कुकी नेबुला की ओर!\""
        }
      },
      {
        id: "pup_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Barnaby",
        speakerRole: "Heroic Astro-Pup",
        actName: "Act 3: The Moon of Golden Biscuits & Friendship",
        philosophy: "The Warmth of Best Friends",
        text: {
          ja: "🐾 BARNABY: 「月面で巨大な黄金ビスケットを発見！宇宙のエイリアンたちみんなで仲良く分け合って食べるんだワン！」",
          en: "🐾 BARNABY: \"Landed on the Golden Biscuit Moon! Sharing crunchy galactic treats with alien friends under the sparkling Milky Way!\"",
          es: "🐾 BARNABY: \"¡Aterrizamos en la Luna de Galletas! ¡Compartiendo deliciosos bocadillos cósmicos con amigos extraterrestres!\"",
          fr: "🐾 BARNABY: « Atterrissage sur la Lune de Biscuit ! Partage de friandises croquantes avec tous nos amis extraterrestres ! »",
          de: "🐾 BARNABY: „Landung auf dem Riesen-Keks-Mond! Knusprige Leckerlis für alle außerirdischen Freunde unter den Sternen!“",
          hi: "🐾 बार्नाबी: \"गोल्डन बिस्कुट चांद पर सुरक्षित लैंडिंग! सभी एलियन दोस्तों के साथ मिलकर दावत!\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x33cc81a092fb310d289aa84bb1199321"
    }
  },
  {
    id: "track_hollywood_blockbuster",
    title: "Dune of Solitude: The Desert Oracle Chronicle",
    subtitle: "3-Act IMAX 70mm Hollywood Action Blockbuster · Sandstorm Odyssey",
    category: "movies",
    character: "🎬 General Sean Sterling (Desert Vanguard)",
    videoSrc: "/assets/video/option_1_keynote_wide.mp4",
    acts: [
      {
        id: "dune_act_1",
        startTime: 0.25,
        endTime: 8.0,
        speaker: "Sean",
        speakerRole: "Vanguard Commander",
        actName: "Act 1: The Crimson Sandstorm over the Citadel",
        philosophy: "Cinematic Desert Atmosphere",
        text: {
          ja: "🎬 SEAN: 「砂嵐が沈黙の要塞を包み込む。太陽が沈む前に、オラクル神殿への侵攻を開始せよ。」",
          en: "🎬 SEAN: \"A crimson sandstorm engulfs the sunken citadel. We breach the Oracle perimeter before the twin suns set.\"",
          es: "🎬 SEAN: \"Una tormenta carmesí envuelve la ciudadela. Entramos al perímetro del Oráculo antes de la puesta de los soles.\"",
          fr: "🎬 SEAN: « Une tempête cramoisie engloutit la citadelle. Percée du périmètre de l'Oracle avant le crépuscule. »",
          de: "🎬 SEAN: „Ein karmesinroter Sandsturm verschlingt die Zitadelle. Durchbruch zur Orakel-Bastion vor Sonnenuntergang.“",
          hi: "🎬 सीन: \"लाल रेत का तूफान प्राचीन किले को घेरता है। सूर्यास्त से पहले ओरेकल परिधि को भेदना होगा।\""
        }
      },
      {
        id: "dune_act_2",
        startTime: 8.0,
        endTime: 16.0,
        speaker: "Sean",
        speakerRole: "Vanguard Commander",
        actName: "Act 2: Awakening the Obsidian Monolith",
        philosophy: "Ancient Cosmic Power",
        text: {
          ja: "🎬 SEAN: 「黒曜石の巨石が共鳴を始めた。惑星の核に眠る古代のエネルギーグリッドが再起動する！」",
          en: "🎬 SEAN: \"The obsidian monolith resonates with tectonic force. Planetary energy grids awaken from millennia of slumber!\"",
          es: "🎬 SEAN: \"El monolito de obsidiana resuena con fuerza tectónica. ¡La red de energía planetaria vuelve a despertar!\"",
          fr: "🎬 SEAN: « Le monolithe d'obsidienne résonne. Les réseaux d'énergie planétaire se réveillent après des millénaires ! »",
          de: "🎬 SEAN: „Der Obsidian-Monolith erwacht mit tektonischer Wucht. Das uralte planetare Energienetz ist reaktiviert!“",
          hi: "🎬 सीन: \"ओब्सीडियन का विशाल खंभा गूंजता है। सहस्राब्दियों की नींद के बाद ग्रह का ऊर्जा ग्रिड पुनः सक्रिय!\""
        }
      },
      {
        id: "dune_act_3",
        startTime: 16.0,
        endTime: 24.0,
        speaker: "Sean",
        speakerRole: "Vanguard Commander",
        actName: "Act 3: Charge of the Sand-Riders: The Liberation",
        philosophy: "Epic Climax & Triumph",
        text: {
          ja: "🎬 SEAN: 「全軍突撃！砂漠の民の自由を賭けて、砂丘の彼方へ勝利の進軍を続けよ！」",
          en: "🎬 SEAN: \"All units, advance! Riding across the crest of the dunes to secure eternal liberation for our people!\"",
          es: "🎬 SEAN: \"¡Todas las unidades, al ataque! ¡Cruzando la cresta de las dunas hacia la liberación eterna!\"",
          fr: "🎬 SEAN: « Toutes les unités, en avant ! À travers les crêtes des dunes pour la libération éternelle ! »",
          de: "🎬 SEAN: „Alle Einheiten, vorrücken! Über die Dünenkämme hinweg für die ewige Freiheit unseres Volkes!“",
          hi: "🎬 सीन: \"सभी टुकड़ियां आगे बढ़ें! रेत के टीलों को पार करते हुए अपनी जनता के लिए अंतिम विजय प्राप्त करें!\""
        }
      }
    ],
    duration: 24.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x99dd61e092fa310d289ee84bb8810239"
    }
  }
];
