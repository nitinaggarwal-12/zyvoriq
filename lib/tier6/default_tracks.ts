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
    id: "track_wildlife_serengeti_120s",
    title: "Serengeti & Masai Mara: The 15-Act Wildlife Odyssey",
    subtitle: "15-Act 120s 4K African Wildlife Documentary · The Great Migration & Apex Predators",
    category: "nature",
    character: "🦁 Serengeti Apex Wildlife & Savannah Ecosystem",
    videoSrc: "/assets/video/serengeti_savannah_8s.mp4",
    duration: 120.0,
    acts: [
      {
        id: "wildlife_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/serengeti_savannah_8s.mp4",
        audioUrl: "/assets/audio/wildlife/act_1.wav",
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
        videoUrl: "/assets/video/serengeti_lion.mp4",
        audioUrl: "/assets/audio/wildlife/act_2.wav",
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
        videoUrl: "/assets/video/serengeti_cheetah.mp4",
        audioUrl: "/assets/audio/wildlife/act_3.wav",
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
        videoUrl: "/assets/video/serengeti_act_4_cheetah_sprint.mp4",
        audioUrl: "/assets/audio/wildlife/act_4.wav",
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
        videoUrl: "/assets/video/serengeti_elephants.mp4",
        audioUrl: "/assets/audio/wildlife/act_5.wav",
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
        videoUrl: "/assets/video/serengeti_act_6_giraffes.mp4",
        audioUrl: "/assets/audio/wildlife/act_6.wav",
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
        videoUrl: "/assets/video/serengeti_act_7_storm.mp4",
        audioUrl: "/assets/audio/wildlife/act_7.wav",
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
        videoUrl: "/assets/video/serengeti_act_8_mara_cliff.mp4",
        audioUrl: "/assets/audio/wildlife/act_8.wav",
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
        videoUrl: "/assets/video/serengeti_act_9_river_crossing.mp4",
        audioUrl: "/assets/audio/wildlife/act_9.wav",
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
        videoUrl: "/assets/video/serengeti_act_10_crocodiles.mp4",
        audioUrl: "/assets/audio/wildlife/act_10.wav",
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
        videoUrl: "/assets/video/serengeti_act_11_survivors.mp4",
        audioUrl: "/assets/audio/wildlife/act_11.wav",
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
        videoUrl: "/assets/video/serengeti_act_12_hyenas.mp4",
        audioUrl: "/assets/audio/wildlife/act_12.wav",
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
        videoUrl: "/assets/video/serengeti_act_13_leopard.mp4",
        audioUrl: "/assets/audio/wildlife/act_13.wav",
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
        videoUrl: "/assets/video/serengeti_act_14_sunset_silhouette.mp4",
        audioUrl: "/assets/audio/wildlife/act_14.wav",
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
        videoUrl: "/assets/video/serengeti_act_15_night_stars.mp4",
        audioUrl: "/assets/audio/wildlife/act_15.wav",
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
  }
];

