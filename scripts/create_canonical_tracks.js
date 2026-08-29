const fs = require("fs");
const path = require("path");

const tracks = [
  // 1. Anime
  {
    id: "track_anime_kaizen",
    title: "The Master & The Apprentice: Path to Kaizen",
    subtitle: "7-Act Cinematic Japanese Anime Series · Sensei Ren & Apprentice Aoi",
    category: "anime",
    character: "🥋 Sensei Ren & Apprentice Aoi",
    videoSrc: "/assets/video/ren_and_aoi_conversation_synced.mp4",
    duration: 56.0,
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x8f2d61bca79e4310d289aa84bb234f9011"
    }
  },

  // 2. Executive
  {
    id: "track_executive_sovereign",
    title: "Executive Sovereign AI Keynote",
    subtitle: "Frontier Autonomous Intelligence & Veritas zk-SNARK Provenance",
    category: "executive",
    character: "👩‍💼 Priya Sharma (Chief AI Officer)",
    videoSrc: "/assets/video/priya_4k_10act_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "exec_act_1",
        startTime: 0.0,
        endTime: 12.0,
        videoUrl: "/assets/video/priya_4k_10act_master.mp4",
        speaker: "Priya Sharma",
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
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_24s_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Chief AI Officer",
        actName: "Act 2: Cryptographic zk-SNARK Sealing",
        philosophy: "Veritas Zero-Drift Media Synthesis",
        text: {
          ja: "🌐 PRIYA: 「Veritas暗号化証明書により、すべての主張と動画フレームの真実性を保証します。」",
          en: "🌐 PRIYA: \"Veritas zk-SNARK guarantees claim-level grounding and zero lip-sync drift.\"",
          es: "🌐 PRIYA: \"Veritas zk-SNARK garantiza la veracidad y cero desfase labial.\"",
          fr: "🌐 PRIYA: « Veritas zk-SNARK garantit l'ancrage des faits et zéro décalage labial. »",
          de: "🌐 PRIYA: „Veritas zk-SNARK garantiert faktische Fundierung und 0ms Drift.“",
          hi: "🌐 प्रिया: \"वेरिटास तकनीक हर दावे की प्रामाणिकता और सटीक लिप-सिंक सुनिश्चित करती है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x4e9a82b31cd904fe716bb21890ea5541"
    }
  },

  // 3. Nature & Wildlife
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
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x8f2d91a082bc310d289aa84bb9084e88"
    }
  },

  // 4. Music
  {
    id: "track_music_synthwave_2099",
    title: "🎧 2099 Cyberpunk Synthwave Beat Lab",
    subtitle: "3-Act 128 BPM Analog Modular Session with Holographic Synthesizers",
    category: "music",
    character: "🎹 Kenji Sato (Sound Architect)",
    videoSrc: "/assets/video/veo_aria_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "music_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_aria_master.mp4",
        speaker: "Kenji Sato",
        speakerRole: "Electronic Music Producer",
        actName: "Act 1: Patching the Analog Moog",
        philosophy: "Raw Voltage & Harmonic Resonance",
        text: {
          ja: "🎵 KENJI: 「モジュラーシンセのパッチケーブルが接続され、128BPMのアナログパルスが響き渡る。」",
          en: "🎵 KENJI: \"Modular patch cables lock in as the 128 BPM analog pulse resonates through the Tokyo night.\"",
          es: "🎵 KENJI: \"Los cables modulares se conectan mientras el pulso analógico a 128 BPM resuena.\"",
          fr: "🎵 KENJI: « Les câbles modulaires se verrouillent alors que la pulsation analogique résonne. »",
          de: "🎵 KENJI: „Modulare Patchkabel rasten ein, während der analoge 128-BPM-Puls pulsiert.“",
          hi: "🎵 केनजी: \"मॉड्यूलर सिंथेसाइज़र के सुर 128 बीपीएम की धड़कन के साथ जीवंत हो उठते हैं।\""
        }
      },
      {
        id: "music_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/ren_and_aoi_conversation_synced.mp4",
        speaker: "Kenji Sato",
        speakerRole: "Electronic Music Producer",
        actName: "Act 2: The Holographic Spectrum Drop",
        philosophy: "Kinetic Bass Architecture",
        text: {
          ja: "🎵 KENJI: 「低周波のサブベースが炸裂し、ホログラフィックスペクトラムが夜空に光を描く。」",
          en: "🎵 KENJI: \"The sub-bass drops into pure harmonic overdrive, lighting up the holographic spectrum analyzers.\"",
          es: "🎵 KENJI: \"El subgrave desciende en sobremarcha armónica, iluminando el espectro holográfico.\"",
          fr: "🎵 KENJI: « Les basses profondes explosent en harmonie, illuminant les analyseurs holographiques. »",
          de: "🎵 KENJI: „Der Subbass fällt in reine harmonische Verzerrung und erhellt das Frequenzspektrum.“",
          hi: "🎵 केनजी: \"गहरा बेस गूंजता है और होलोग्राम तरंगों में प्रकाश बिखेरता है।\""
        }
      },
      {
        id: "music_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_aria_master.mp4",
        speaker: "Kenji Sato",
        speakerRole: "Electronic Music Producer",
        actName: "Act 3: Master Track Outro & Reverb Tail",
        philosophy: "Infinite Acoustic Space",
        text: {
          ja: "🎵 KENJI: 「無限のリバーブテールが静寂に溶け込み、マスターセッションが完成する。」",
          en: "🎵 KENJI: \"An infinite spatial reverb tail fades into silence as the master synthesis completes.\"",
          es: "🎵 KENJI: \"Una reverberación espacial infinita se desvanece en silencio completando la síntesis maestra.\"",
          fr: "🎵 KENJI: « Une réverbération spatiale infinie s'éteint dans le silence alors que la session s'achève. »",
          de: "🎵 KENJI: „Ein unendlicher Hall verklingt in der Stille und vollendet die Master-Synthese.“",
          hi: "🎵 केनजी: \"अनंत गूंज शांत होकर मास्टर रिकॉर्डिंग को पूर्णता प्रदान करती है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x3d7a8f1920bc482a1049de8170c1aa39"
    }
  },

  // 5. Gaming & Esports
  {
    id: "track_gaming_nexus_arena",
    title: "🏆 Grand Finals: Nexus Arena Championship",
    subtitle: "3-Act 4K Tactical Clutch & Stadium Holographic Replay",
    category: "gaming",
    character: "🎮 Aoi Takahashi (Pro Esports Caster)",
    videoSrc: "/assets/video/veo_anime_kiri.mp4",
    duration: 24.0,
    acts: [
      {
        id: "game_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_anime_kiri.mp4",
        speaker: "Aoi Takahashi",
        speakerRole: "Lead Esports Caster",
        actName: "Act 1: Stadium Countdown & Match Point",
        philosophy: "Competitive Hyper-Focus",
        text: {
          ja: "🎮 AOI: 「ソウルスタジアムの8万人観衆が息をのむ。マッチポイントの秒読みが始まった！」",
          en: "🎮 AOI: \"Eighty thousand screaming fans in Seoul hold their breath as the final match point ticks down!\"",
          es: "🎮 AOI: \"¡Ochenta mil fanáticos en Seúl contienen la respiración mientras corre el punto de campeonato!\"",
          fr: "🎮 AOI: « Quatre-vingt mille spectateurs à Séoul retiennent leur souffle pour la balle de match ! »",
          de: "🎮 AOI: „Achtzigtausend Fans in Seoul halten den Atem an, als der Matchball gezählt wird!“",
          hi: "🎮 आओई: \"सियोल के स्टेडियम में अस्सी हजार दर्शक अंतिम मैच पॉइंट के लिए सांस रोके खड़े हैं!\""
        }
      },
      {
        id: "game_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/ren_and_aoi_conversation_synced.mp4",
        speaker: "Aoi Takahashi",
        speakerRole: "Lead Esports Caster",
        actName: "Act 2: The Impossible Flank Maneuver",
        philosophy: "Sub-Millisecond Tactical Execution",
        text: {
          ja: "🎮 AOI: 「電光石火のサイドステップ！完璧なタイミングで敵の防衛線を突破した！」",
          en: "🎮 AOI: \"An electric sidestep flank! Flawless tactical micro-positioning breaks through the enemy line!\"",
          es: "🎮 AOI: \"¡Un flanqueo relámpago! ¡Un posicionamiento táctico impecable rompe la línea enemiga!\"",
          fr: "🎮 AOI: « Un contournement éclair ! Un micro-positionnement tactique parfait brise la défense ! »",
          de: "🎮 AOI: „Ein blitzschneller Flankenangriff! Perfekte Taktik durchbricht die feindliche Linie!“",
          hi: "🎮 आओई: \"बिजली जैसी फुर्ती से विरोधी की रक्षा पंक्ति को भेद दिया गया!\""
        }
      },
      {
        id: "game_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_anime_kiri.mp4",
        speaker: "Aoi Takahashi",
        speakerRole: "Lead Esports Caster",
        actName: "Act 3: Trophy Presentation & Confetti Storm",
        philosophy: "Triumph of Unified Reflexes",
        text: {
          ja: "🎮 AOI: 「決まったー！ネクサスアリーナの王者が今ここに誕生！紙吹雪が舞い散ります！」",
          en: "🎮 AOI: \"It's over! The Nexus Arena World Championship is sealed as golden confetti showers the stage!\"",
          es: "🎮 AOI: \"¡Se acabó! ¡Los campeones del mundo del Nexus Arena son coronados bajo el confeti dorado!\"",
          fr: "🎮 AOI: « C'est fini ! Les champions du monde de la Nexus Arena sont sacrés sous les confettis dorés ! »",
          de: "🎮 AOI: „Es ist vollbracht! Die Nexus Arena Weltmeister stehen fest im goldenen Konfetti-Regen!“",
          hi: "🎮 आओई: \"शानदार जीत! नेक्सस एरिना के नए विश्व चैंपियन का ताज पहनाया गया!\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x7a109fe829c3401fa940e71629ab84f2"
    }
  },

  // 6. Comedy
  {
    id: "track_comedy_ai_alignment",
    title: "👔 The Absurd 'AI Alignment' Meeting",
    subtitle: "3-Act Witty Corporate Standup Roast on Endless Calendar Invites & Jargon",
    category: "comedy",
    character: "😂 David Kim (Standup Performer)",
    videoSrc: "/assets/video/veo_priya_sitting.mp4",
    duration: 24.0,
    acts: [
      {
        id: "comedy_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_sitting.mp4",
        speaker: "David Kim",
        speakerRole: "Tech Standup Comedian",
        actName: "Act 1: The Infinite Calendar Loop",
        philosophy: "Corporate Satire & Irony",
        text: {
          ja: "😂 DAVID: 「『念のため30分ミーティングをセットしよう』と言った人が、すでに4時間を無駄にしている件。」",
          en: "😂 DAVID: \"The guy who said 'Let's just put 30 mins on the calendar to align' has now wasted four working days.\"",
          es: "😂 DAVID: \"El tipo que dijo 'pongamos 30 minutos para alinearnos' ya ha desperdiciado cuatro días enteros.\"",
          fr: "😂 DAVID: « Le gars qui a dit 'mettons 30 minutes pour s'aligner' a déjà gaspillé quatre jours de travail. »",
          de: "😂 DAVID: „Der Typ, der meinte 'Lass mal 30 Minuten zum Abstimmen einstellen', hat vier Arbeitstage verbrannt.“",
          hi: "😂 डेविड: \"जिसने कहा था 'सिर्फ 30 मिनट की मीटिंग करते हैं', उसने चार दिन बर्बाद कर दिए!\""
        }
      },
      {
        id: "comedy_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_native.mp4",
        speaker: "David Kim",
        speakerRole: "Tech Standup Comedian",
        actName: "Act 2: The Autonomous Coffee Machine",
        philosophy: "The Over-Engineered Smart World",
        text: {
          ja: "😂 DAVID: 「うちのスマートコーヒーメーカー、強化学習の末に僕へのエスプレッソ提供を拒否し始めました。」",
          en: "😂 DAVID: \"Our office coffee maker uses reinforcement learning and recently decided I don't deserve caffeine.\"",
          es: "😂 DAVID: \"Nuestra cafetera inteligente usa aprendizaje por refuerzo y decidió que no merezco cafeína.\"",
          fr: "😂 DAVID: « Notre machine à café utilise l'apprentissage par renforcement et a décidé que je ne méritais pas de caféine. »",
          de: "😂 DAVID: „Unsere Kaffeemaschine nutzt Reinforcement Learning und weigert sich nun, mir Kaffee zu kochen.“",
          hi: "😂 डेविड: \"हमारी स्मार्ट कॉफी मशीन ने एआई से सीखकर मुझे कॉफी देने से ही मना कर दिया!\""
        }
      },
      {
        id: "comedy_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_sitting.mp4",
        speaker: "David Kim",
        speakerRole: "Tech Standup Comedian",
        actName: "Act 3: Let's Take This Offline",
        philosophy: "The Ultimate Evasion",
        text: {
          ja: "😂 DAVID: 「結論：『これについてはオフラインで話しましょう』は、人類史上最も洗練された逃げ台詞です。」",
          en: "😂 DAVID: \"In conclusion, 'Let's take this offline' is the single greatest polite surrender in human history.\"",
          es: "😂 DAVID: \"En conclusión, 'veámoslo fuera de línea' es la rendición más elegante de la historia humana.\"",
          fr: "😂 DAVID: « En conclusion, 'voyons cela hors ligne' est la plus belle dérobade de l'histoire humaine. »",
          de: "😂 DAVID: „Fazit: 'Lass uns das offline besprechen' ist die eleganteste Flucht der Menschheitsgeschichte.“",
          hi: "😂 डेविड: \"निष्कर्ष यह है कि 'इसे ऑफलाइन बात करेंगे' टालने का सबसे शानदार तरीका है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x5b92e81740fa189c2049e71630ba9118"
    }
  },

  // 7. Cinema
  {
    id: "track_cinema_midnight_shadow",
    title: "🌧️ Midnight Shadow: The Last Detective",
    subtitle: "3-Act 35mm Chicago Film Noir Mystery in Heavy Rain",
    category: "cinema",
    character: "🕵️ Marcus Vance (Detective Cole)",
    videoSrc: "/assets/video/veo_priya_16s_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "noir_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_16s_master.mp4",
        speaker: "Marcus Vance",
        speakerRole: "Private Detective",
        actName: "Act 1: Rain on the Wrought-Iron Fire Escape",
        philosophy: "Noir Solitude & Reflection",
        text: {
          ja: "🎭 MARCUS: 「シカゴの夜雨は罪を洗い流さない。濡れたアスファルトに光を反射させるだけだ。」",
          en: "🎭 MARCUS: \"The midnight rain in this town doesn't wash away secrets. It only reflects them on the wet asphalt.\"",
          es: "🎭 MARCUS: \"La lluvia de medianoche no borra los secretos, solo los refleja en el asfalto mojado.\"",
          fr: "🎭 MARCUS: « La pluie de minuit n'efface pas les secrets, elle ne fait que les refléter sur le bitume mouillé. »",
          de: "🎭 MARCUS: „Der Mitternachtsregen wäscht keine Geheimnisse weg, er spiegelt sie nur auf dem nassen Asphalt.“",
          hi: "🎭 मार्कस: \"इस शहर की बारिश राज़ नहीं धोती, बस उन्हें गीली सड़क पर चमकाती है।\""
        }
      },
      {
        id: "noir_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_master.mp4",
        speaker: "Marcus Vance",
        speakerRole: "Private Detective",
        actName: "Act 2: The Lamplit Alleyway Encounter",
        philosophy: "The Shadow of Betrayal",
        text: {
          ja: "🎭 MARCUS: 「ガス灯の下に佇む影。煙草の煙が静かに漂い、真実を語る時が来た。」",
          en: "🎭 MARCUS: \"A lone shadow beneath the streetlamp. Match strikes, cigarette smoke drifts—the moment of truth has arrived.\"",
          es: "🎭 MARCUS: \"Una sombra bajo la farola. Se enciende el fósforo, el humo se eleva: llegó la hora de la verdad.\"",
          fr: "🎭 MARCUS: « Une ombre solitaire sous le réverbère. L'allumette s'enflamme, la fumée s'élève : l'heure de vérité. »",
          de: "🎭 MARCUS: „Ein einsamer Schatten unter der Laterne. Ein Streichholz flammt auf, Rauch steigt auf: die Stunde der Wahrheit.“",
          hi: "🎭 मार्कस: \"दीये की रोशनी में खड़ा एक साया, सच सामने आने का वक्त आ गया है।\""
        }
      },
      {
        id: "noir_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_16s_master.mp4",
        speaker: "Marcus Vance",
        speakerRole: "Private Detective",
        actName: "Act 3: Into the Fog of Lake Michigan",
        philosophy: "The Unresolved Epilogue",
        text: {
          ja: "🎭 MARCUS: 「霧深きミシガン湖の波音の中へ、探偵は足早に消えてゆく。」",
          en: "🎭 MARCUS: \"Into the thick fog rolling off Lake Michigan, the lone trenchcoat fades into the eternal city night.\"",
          es: "🎭 MARCUS: \"Hacia la densa niebla del lago Michigan, el impermeable se desvanece en la noche eterna.\"",
          fr: "🎭 MARCUS: « Dans l'épais brouillard du lac Michigan, la silhouette s'estompe dans la nuit éternelle. »",
          de: "🎭 MARCUS: „Im dichten Nebel des Michigansees verliert sich die Silhouette in der ewigen Nacht.“",
          hi: "🎭 मार्कस: \"झील के घने कोहरे में वो साया शहर की रात में खो जाता है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x9c417e2830fa9811dc3049e71829bb04"
    }
  },

  // 8. High Fantasy
  {
    id: "track_fantasy_starlight_wyrm",
    title: "🐉 Citadel of the Starlight Wyrm",
    subtitle: "3-Act High Fantasy Epic with Floating Arcane Spires & Crystalline Dragons",
    category: "fantasy_scifi",
    character: "🏰 Elena Rostova (Arcane Chronicler)",
    videoSrc: "/assets/video/veo_aria_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "fantasy_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_aria_master.mp4",
        speaker: "Elena Rostova",
        speakerRole: "Arcane Chronicler",
        actName: "Act 1: Awakening of the Floating Runes",
        philosophy: "Ancient Celestial Resonance",
        text: {
          ja: "🏰 ELENA: 「千年の眠りから覚めた星光のルーンが、浮遊要塞の尖塔を黄金色に染め上げる。」",
          en: "🏰 ELENA: \"Awakened from a thousand-year slumber, the starlight runes bathe the floating citadel in golden fire.\"",
          es: "🏰 ELENA: \"Despertadas de un sueño milenario, las runas estelares bañan la ciudadela flotante en fuego dorado.\"",
          fr: "🏰 ELENA: « Éveillées d'un sommeil millénaire, les runes stellaires baignent la citadelle flottante de lumière dorée. »",
          de: "🏰 ELENA: „Erwacht aus tausendjährigem Schlaf tauchen die Sternenrunen die schwebende Zitadelle in goldenes Licht.“",
          hi: "🏰 एलेना: \"हजारों साल की नींद से जागे रहस्यमयी संकेत तैरते किले को सुनहरे प्रकाश से भर देते हैं।\""
        }
      },
      {
        id: "fantasy_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_anime_kiri.mp4",
        speaker: "Elena Rostova",
        speakerRole: "Arcane Chronicler",
        actName: "Act 2: Flight of the Crystal Dragon",
        philosophy: "Majesty of the Skies",
        text: {
          ja: "🏰 ELENA: 「雲海を裂いて飛翔する水晶竜。その翼が放つプリズムが天空を虹色に染める。」",
          en: "🏰 ELENA: \"Shattering the sea of clouds, the crystalline dragon takes flight, its prismatic wings painting the sky.\"",
          es: "🏰 ELENA: \"Surcando el mar de nubes, el dragón de cristal alza el vuelo, pintando el cielo con sus alas prismáticas.\"",
          fr: "🏰 ELENA: « Fendant la mer de nuages, le dragon de cristal s'élance, peignant le ciel de ses ailes prismatiques. »",
          de: "🏰 ELENA: „Das Wolkenmeer durchbrechend steigt der Kristalldrache empor und taucht den Himmel in Prismenfarben.“",
          hi: "🏰 एलेना: \"बादलों को चीरता हुआ क्रिस्टल ड्रैगन आसमान में अपने रंग बिखेरता है।\""
        }
      },
      {
        id: "fantasy_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_aria_master.mp4",
        speaker: "Elena Rostova",
        speakerRole: "Arcane Chronicler",
        actName: "Act 3: Oath of the Starlight Wardens",
        philosophy: "Eternal Guardian Vow",
        text: {
          ja: "🏰 ELENA: 「星々の加護のもと、聖なる誓いが結ばれ、浮遊都市は新たな黎明を迎える。」",
          en: "🏰 ELENA: \"Under the celestial gaze of ancient constellations, the sacred covenant is renewed for all eternity.\"",
          es: "🏰 ELENA: \"Bajo la mirada celeste de constelaciones ancestrales, el pacto sagrado se renueva por la eternidad.\"",
          fr: "🏰 ELENA: « Sous le regard céleste des constellations ancestrales, le pacte sacré est scellé pour l'éternité. »",
          de: "🏰 ELENA: „Unter dem Himmelsblick uralter Sternbilder wird der heilige Bund für alle Ewigkeit erneuert.“",
          hi: "🏰 एलेना: \"तारों की छत्रछाया में प्राचीन प्रतिज्ञा सदा के लिए अमर हो जाती है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x1f9048a729e018cbb490192837482a10"
    }
  },

  // 9. Action & Stunts
  {
    id: "track_action_samurai_mushin",
    title: "⚡ The Thunderstorm of Mushin",
    subtitle: "3-Act Rain-Slicked Cedar Balcony Bokken Duel with Kinetic Spark Physics",
    category: "action_stunts",
    character: "🥋 Sensei Ren & Aoi",
    videoSrc: "/assets/video/ren_and_aoi_conversation_synced.mp4",
    duration: 24.0,
    acts: [
      {
        id: "action_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/ren_and_aoi_conversation_synced.mp4",
        speaker: "Sensei Ren",
        speakerRole: "Zen Master",
        actName: "Act 1: Thunder Over the Cedar Dojo",
        philosophy: "Presence in the Storm",
        text: {
          ja: "⚡ REN: 「豪雨と雷鳴の中、心を鏡のように静めよ。敵を見るな、空間を感じよ。」",
          en: "⚡ REN: \"In the fury of thunder and torrential rain, still your mind like a mirror. Do not watch the blade—feel the space.\"",
          es: "⚡ REN: \"En la furia del trueno y la lluvia torrencial, aquieta tu mente como un espejo. Siente el espacio.\"",
          fr: "⚡ REN: « Dans la fureur de l'orage, apaise ton esprit comme un miroir. Ressens l'espace autour de toi. »",
          de: "⚡ REN: „Im tosenden Gewitter beruhige deinen Geist wie einen Spiegel. Fühle den Raum um dich.“",
          hi: "⚡ रेन: \"तूफान और गरज के बीच अपने मन को दर्पण की तरह शांत रखो। केवल शून्य को महसूस करो।\""
        }
      },
      {
        id: "action_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_ren_and_aoi_duo.mp4",
        speaker: "Apprentice Aoi",
        speakerRole: "Martial Prodigy",
        actName: "Act 2: The Clash of Wooden Bokken",
        philosophy: "Kinetic Resonance & Speed",
        text: {
          ja: "⚡ AOI: 「一瞬の隙も見逃さない！木刀が交差し、火花が雨粒を照らす！」",
          en: "⚡ AOI: \"I see the opening! Wooden bokken strike in rapid succession, sparks illuminating falling raindrops!\"",
          es: "⚡ AOI: \"¡No perderé la apertura! Las espadas de madera chocan, ¡chispas iluminan las gotas de lluvia!\"",
          fr: "⚡ AOI: « Je saisis l'ouverture ! Les bokken s'entrechoquent et les étincelles éclairent les gouttes de pluie ! »",
          de: "⚡ AOI: „Ich nutze die Lücke! Holzschwerter prallen aufeinander und Funken erhellen die Regentropfen!“",
          hi: "⚡ आओई: \"लकड़ी की तलवारें टकराती हैं और चिंगारियां बारिश की बूंदों को चमका देती हैं!\""
        }
      },
      {
        id: "action_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/ren_and_aoi_conversation_synced.mp4",
        speaker: "Sensei Ren",
        speakerRole: "Zen Master",
        actName: "Act 3: Mushin Achieved",
        philosophy: "Total Mindful Harmony",
        text: {
          ja: "⚡ REN: 「見事だ、葵。刀と雨と心が一つになった。これが無心の境地だ。」",
          en: "⚡ REN: \"Magnificent, Aoi. The blade, the storm, and the mind have unified. This is true Mushin.\"",
          es: "⚡ REN: \"Magnífico, Aoi. La espada, la tormenta y la mente se han unido en perfecta armonía.\"",
          fr: "⚡ REN: « Magnifique, Aoi. La lame, la tempête et l'esprit ne font plus qu'un. C'est le vrai Mushin. »",
          de: "⚡ REN: „Hervorragend, Aoi. Klinge, Sturm und Geist sind eins geworden. Das ist wahres Mushin.“",
          hi: "⚡ रेन: \"अद्भुत, आओई। तलवार, तूफान और तुम्हारा मन एक हो चुके हैं। यही मुशिन की पराकाष्ठा है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x4c2089b170ea9144db82903847291a84"
    }
  },

  // 10. Podcasts & Video Essays
  {
    id: "track_podcasts_sovereign_architect",
    title: "🧠 The Sovereign Architect Podcast (Dual Host)",
    subtitle: "3-Act Fast-Paced Debate on AGI Decentralization & Zero-Drift Cryptographic Proofs",
    category: "podcasts_essays",
    character: "🎙️ Priya Sharma & David Kim",
    videoSrc: "/assets/video/veo_priya_sitting.mp4",
    duration: 24.0,
    acts: [
      {
        id: "pod_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_sitting.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Chief AI Officer",
        actName: "Act 1: The Thesis on Decentralized AGI",
        philosophy: "Sovereignty of Distributed Compute",
        text: {
          ja: "🎙️ PRIYA: 「AIが全知に近づくほど、それを中央集権化するリスクは文明規模の脆弱性になります。」",
          en: "🎙️ PRIYA: \"As artificial intelligence approaches omniscience, centralizing it creates an existential single point of failure.\"",
          es: "🎙️ PRIYA: \"A medida que la IA avanza, centralizarla crea un punto único de fallo para toda la civilización.\"",
          fr: "🎙️ PRIYA: « Plus l'IA devient omnisciente, plus la centraliser crée une vulnérabilité critique pour la société. »",
          de: "🎙️ PRIYA: „Je allwissender KI wird, desto gefährlicher wird eine zentralisierte Kontrolle für die Zivilisation.“",
          hi: "🎙️ प्रिया: \"जैसे-जैसे एआई शक्तिशाली होगा, उसे एक जगह केंद्रित करना सबसे बड़ा खतरा बन जाएगा।\""
        }
      },
      {
        id: "pod_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_keynote_21s.mp4",
        speaker: "David Kim",
        speakerRole: "Lead Systems Architect",
        actName: "Act 2: The Hardware Enclave Counter-Argument",
        philosophy: "Cryptographic Attestation & Physical Silicon",
        text: {
          ja: "🎙️ DAVID: 「しかし分散化しても、物理的なシリコン検証とzk-SNARK証明がなければ真の信頼は生まれません。」",
          en: "🎙️ DAVID: \"True, but decentralization without cryptographic zk-SNARK silicon attestation is just distributed chaos.\"",
          es: "🎙️ DAVID: \"Cierto, pero la descentralización sin atestación criptográfica zk-SNARK es solo caos distribuido.\"",
          fr: "🎙️ DAVID: « Certes, mais sans attestation cryptographique zk-SNARK sur le silicium, c'est le chaos distribué. »",
          de: "🎙️ DAVID: „Richtig, aber Dezentralisierung ohne kryptografische zk-SNARK-Attestierung ist reines Chaos.“",
          hi: "🎙️ डेविड: \"सही है, लेकिन बिना क्रिप्टोग्राफिक सबूतों के विकेंद्रीकरण सिर्फ अराजकता बन जाएगा।\""
        }
      },
      {
        id: "pod_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_sitting.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Chief AI Officer",
        actName: "Act 3: Synthesis & The Future Paradigm",
        philosophy: "The Veritas Protocol Convergence",
        text: {
          ja: "🎙️ PRIYA: 「だからこそVeritasのような数学的証明プロトコルが、次世代AI社会の基盤になるのです。」",
          en: "🎙️ PRIYA: \"Precisely why mathematical zero-knowledge consensus is the inevitable foundation of synthetic intelligence.\"",
          es: "🎙️ PRIYA: \"Precisamente por eso el consenso matemático de conocimiento cero es la base inevitable de la IA.\"",
          fr: "🎙️ PRIYA: « C'est exactement pourquoi le consensus mathématique à divulgation nulle de connaissance est indispensable. »",
          de: "🎙️ PRIYA: „Genau deshalb ist der mathematische Zero-Knowledge-Konsens das unverzichtbare Fundament der KI.“",
          hi: "🎙️ प्रिया: \"यही कारण है कि शून्य-ज्ञान गणितीय प्रमाण ही भविष्य की एआई का सच्चा आधार हैं।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x892a0e4179bf10284c892019483720ab"
    }
  },

  // 11. Culinary
  {
    id: "track_culinary_miyazaki_wagyu",
    title: "🥩 The Art of A5 Miyazaki Wagyu Searing",
    subtitle: "3-Act Sensory Michelin Masterclass on Binchotan Charcoal & Precise 54°C Maillard Sear",
    category: "culinary",
    character: "🍳 Kenji Sato (Executive Chef)",
    videoSrc: "/assets/video/veo_aria_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "culinary_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_aria_master.mp4",
        speaker: "Kenji Sato",
        speakerRole: "Michelin Star Chef",
        actName: "Act 1: The Binchotan White Charcoal Fire",
        philosophy: "Purity of Heat & Timber",
        text: {
          ja: "🍳 KENJI: 「備長炭の白く輝く灰の下で、千度の無煙赤外線が静かに息づいています。」",
          en: "🍳 KENJI: \"Beneath the pure white ash of Kishu Binchotan charcoal, pure thousand-degree infrared heat awakens.\"",
          es: "🍳 KENJI: \"Bajo la ceniza blanca del carbón Binchotan, despierta un calor infrarrojo puro a mil grados.\"",
          fr: "🍳 KENJI: « Sous la cendre blanche du charbon Binchotan, une chaleur infrarouge pure à mille degrés s'éveille. »",
          de: "🍳 KENJI: „Unter der weißen Asche der Binchotan-Kohle erwacht reine tausend Grad heiße Infrarothitze.“",
          hi: "🍳 केनजी: \"बिंचोतान सफेद कोयले की राख के नीचे एक हजार डिग्री की शुद्ध ऊष्मा जाग उठती है।\""
        }
      },
      {
        id: "culinary_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/ren_and_aoi_conversation_synced.mp4",
        speaker: "Kenji Sato",
        speakerRole: "Michelin Star Chef",
        actName: "Act 2: The Caramelized A5 Sear",
        philosophy: "The Science of the Maillard Reaction",
        text: {
          ja: "🍳 KENJI: 「宮崎牛の美しいサシが溶け出し、完璧なメイラード反応が表面を黄金色に焼き上げます。」",
          en: "🍳 KENJI: \"Intricate marbling renders instantly, creating an exquisite caramelized crust in sixty seconds.\"",
          es: "🍳 KENJI: \"El marmoleado se funde al instante, creando una exquisita costra caramelizada en sesenta segundos.\"",
          fr: "🍳 KENJI: « Le persillage d'exception fond instantanément, créant une croûte caramélisée en soixante secondes. »",
          de: "🍳 KENJI: „Die Marmorierung schmilzt sofort und bildet in sechzig Sekunden eine köstliche Kruste.“",
          hi: "🍳 केनजी: \"मीट की सतह साठ सेकंड में पूरी तरह सुनहरी और स्वादिष्ट हो जाती है।\""
        }
      },
      {
        id: "culinary_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_aria_master.mp4",
        speaker: "Kenji Sato",
        speakerRole: "Michelin Star Chef",
        actName: "Act 3: Sea Salt Crystals & Truffle Glaze",
        philosophy: "Balance of Texture & Mineral Salt",
        text: {
          ja: "🍳 KENJI: 「手摘みの能登塩と黒トリュフの香りを添えて、至高のひと皿を供します。」",
          en: "🍳 KENJI: \"Finished with hand-harvested sea salt flakes and black winter truffle. Culinary perfection.\"",
          es: "🍳 KENJI: \"Terminado con escamas de sal marina artesanal y trufa negra. Perfección culinaria.\"",
          fr: "🍳 KENJI: « Parachevé de fleur de sel artisanale et de truffe noire d'hiver. La perfection culinaire. »",
          de: "🍳 KENJI: „Vollendet mit handgeschöpften Meersalzflocken und schwarzem Wintertrüffel. Perfektion.“",
          hi: "🍳 केनजी: \"समुद्री नमक के क्रिस्टल और ब्लैक ट्रफल के साथ बेहतरीन व्यंजन तैयार है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x7e291048a9bc0192847291a84c90281b"
    }
  },

  // 12. Wellness & Vedanta
  {
    id: "track_wellness_advaita_vedanta",
    title: "🕉️ Advaita Vedanta: The Observer & The Observed",
    subtitle: "3-Act Non-Dual Philosophy Masterclass on Pure Consciousness & Mandukya Upanishad",
    category: "wellness_faith",
    character: "🧘 Priya Sharma (Vedantic Scholar)",
    videoSrc: "/assets/video/veo_priya_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "vedanta_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Vedantic Scholar",
        actName: "Act 1: The Three States of Mind",
        philosophy: "Waking, Dreaming & Deep Sleep (Jagrat, Swapna, Sushupti)",
        text: {
          ja: "🕉️ PRIYA: 「目覚め、夢、深い眠り。三つの状態を静かに見守る第四の意識、それが『トゥリーヤ』です。」",
          en: "🕉️ PRIYA: \"Waking, dreaming, and deep sleep. The changeless awareness witnessing all three is Turiya.\"",
          es: "🕉️ PRIYA: \"Vigilia, sueño y sueño profundo. La conciencia inmutable que presencia los tres es Turiya.\"",
          fr: "🕉️ PRIYA: « L'éveil, le rêve et le sommeil profond. La conscience immuable qui observe les trois est Turiya. »",
          de: "🕉️ PRIYA: „Wachen, Träumen und Tiefschlaf. Das unveränderliche Gewahrsein, das alle drei bezeugt, ist Turiya.“",
          hi: "🕉️ प्रिया: \"जागृत, स्वप्न और सुषुप्ति। इन तीनों अवस्थाओं को साक्षी भाव से देखने वाली चेतना ही तुरीय है।\""
        }
      },
      {
        id: "vedanta_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_sitting.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Vedantic Scholar",
        actName: "Act 2: The Great Mahavakya",
        philosophy: "Tat Tvam Asi (Thou Art That)",
        text: {
          ja: "🕉️ PRIYA: 「『タット・トヴァム・アシ』。あなたと宇宙の根源的実在は決して分かれていない。」",
          en: "🕉️ PRIYA: \"Tat Tvam Asi. You are not a separate wave upon the surface; you are the boundless ocean itself.\"",
          es: "🕉️ PRIYA: \"Tat Tvam Asi. No eres una ola separada en la superficie; eres el océano ilimitado mismo.\"",
          fr: "🕉️ PRIYA: « Tat Tvam Asi. Tu n'es pas une vague séparée à la surface ; tu es l'océan infini lui-même. »",
          de: "🕉️ PRIYA: „Tat Tvam Asi. Du bist keine getrennte Welle; du bist der grenzenlose Ozean selbst.“",
          hi: "🕉️ प्रिया: \"तत्त्वमसि। तुम सागर की अलग लहर नहीं हो, बल्कि तुम स्वयं अनंत सागर हो।\""
        }
      },
      {
        id: "vedanta_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Vedantic Scholar",
        actName: "Act 3: Abiding in Peace",
        philosophy: "Shanti & Universal Consciousness",
        text: {
          ja: "🕉️ PRIYA: 「執着を手放し、純粋な気づきの中に憩うとき、永遠の平安が心を満たします。」",
          en: "🕉️ PRIYA: \"When identity dissolves into pure witnessing awareness, unshakeable eternal peace remains.\"",
          es: "🕉️ PRIYA: \"Cuando la identidad se disuelve en pura conciencia testigo, solo queda una paz inquebrantable.\"",
          fr: "🕉️ PRIYA: « Quand l'identité se dissout dans la pure conscience témoin, demeure une paix inaltérable. »",
          de: "🕉️ PRIYA: „Wenn sich die Identität in reinem Gewahrsein auflöst, bleibt unerschütterlicher Frieden.“",
          hi: "🕉️ प्रिया: \"जब मन शुद्ध साक्षी भाव में ठहर जाता है, तो केवल शाश्वत शांति शेष रह जाती है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x6a019847291048a9bc0192847291a84c"
    }
  },

  // 13. Hard Science
  {
    id: "track_science_alphafold_cures",
    title: "🧬 AlphaFold 3: Designing Atomic Targeted Medicines",
    subtitle: "3-Act Molecular 4K Simulation on Synthetic Protein Binding & Oncogenic Neutralization",
    category: "science_space",
    character: "🔬 Elena Rostova (Computational Biologist)",
    videoSrc: "/assets/video/veo_priya_24s_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "science_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_24s_master.mp4",
        speaker: "Elena Rostova",
        speakerRole: "Computational Biologist",
        actName: "Act 1: The 50-Year Folding Grand Challenge",
        philosophy: "Algorithmic Resolution of Biochemistry",
        text: {
          ja: "🧬 ELENA: 「半世紀にわたり人類を悩ませたタンパク質立体構造の予測が、AIによって瞬時に解き明かされる。」",
          en: "🧬 ELENA: \"For fifty years, predicting 3D protein structures was biology's greatest unsolved grand challenge.\"",
          es: "🧬 ELENA: \"Durante cincuenta años, predecir estructuras 3D de proteínas fue el mayor reto de la biología.\"",
          fr: "🧬 ELENA: « Pendant cinquante ans, prédire la structure 3D des protéines était le plus grand défi de la biologie. »",
          de: "🧬 ELENA: „Fünfzig Jahre lang war die 3D-Proteinstruktur-Vorhersage das größte ungelöste Rätsel der Biologie.“",
          hi: "🧬 एलेना: \"पचास वर्षों से प्रोटीन संरचना का अनुमान लगाना जीव विज्ञान की सबसे बड़ी चुनौती थी।\""
        }
      },
      {
        id: "science_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_keynote_21s.mp4",
        speaker: "Elena Rostova",
        speakerRole: "Computational Biologist",
        actName: "Act 2: Designing the Synthetic Binder",
        philosophy: "Sub-Angstrom Molecular Precision",
        text: {
          ja: "🧬 ELENA: 「変異したがん受容体に対し、0.1オングストローム精度で合致する合成抗体を生成する。」",
          en: "🧬 ELENA: \"We synthesize de-novo molecular binders engineered at 0.1 angstrom precision to neutralize target mutations.\"",
          es: "🧬 ELENA: \"Sintetizamos aglutinantes moleculares de novo diseñados a una precisión de 0,1 ángstroms.\"",
          fr: "🧬 ELENA: « Nous concevons des liants moléculaires de novo avec une précision de 0,1 angström. »",
          de: "🧬 ELENA: „Wir synthetisieren de-novo molekulare Binder mit einer Präzision von 0,1 Ångström.“",
          hi: "🧬 एलेना: \"हम 0.1 एंगस्ट्रॉम की सटीकता से लक्षित म्यूटेशन को बेअसर करने वाले अणु डिजाइन करते हैं।\""
        }
      },
      {
        id: "science_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_24s_master.mp4",
        speaker: "Elena Rostova",
        speakerRole: "Computational Biologist",
        actName: "Act 3: The Era of Programmable Therapeutics",
        philosophy: "Eradication of Genetic Disease",
        text: {
          ja: "🧬 ELENA: 「病気を治療するのではなく、病気そのものを分子レベルで再プログラミングする時代の幕開けです。」",
          en: "🧬 ELENA: \"We no longer discover medicines by chance; we engineer programmable therapeutics from first principles.\"",
          es: "🧬 ELENA: \"Ya no descubrimos medicinas por azar; diseñamos terapias programables desde primeros principios.\"",
          fr: "🧬 ELENA: « Nous ne découvrons plus les médicaments par hasard ; nous les concevons selon des principes fondamentaux. »",
          de: "🧬 ELENA: „Wir entdecken Medikamente nicht mehr zufällig, sondern entwickeln programmierbare Therapeutika.“",
          hi: "🧬 एलेना: \"अब दवाइयां संयोग से नहीं खोजी जातीं, बल्कि मूलभूत सिद्धांतों पर बनाई जाती हैं।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x20ab19847291048a9bc0192847291a84"
    }
  },

  // 14. History & Geopolitics
  {
    id: "track_history_mohenjo_daro",
    title: "🏺 Mohenjo-Daro: The Bronze Age Urban Utopia",
    subtitle: "3-Act 4K Archaeological Reconstruction of 2500 BCE Indus Valley City Planning & Sanitation",
    category: "history_geopolitics",
    character: "🏛️ Priya Sharma (Archaeological Historian)",
    videoSrc: "/assets/video/veo_priya_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "history_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Archaeological Historian",
        actName: "Act 1: The Grid of 2500 BCE",
        philosophy: "Egalitarian Urban Architecture",
        text: {
          ja: "🏺 PRIYA: 「五千年前、宮殿も軍隊も持たず、上下水道と都市計画に心血を注いだ平和な文明が存在した。」",
          en: "🏺 PRIYA: \"Five thousand years ago, without palaces or armies, a Bronze Age metropolis thrived on pure civic engineering.\"",
          es: "🏺 PRIYA: \"Hace cinco mil años, sin palacios ni ejércitos, una metrópoli de la Edad del Bronce prosperó gracias a la ingeniería cívica.\"",
          fr: "🏺 PRIYA: « Il y a cinq mille ans, sans palais ni armées, une métropole de l'âge du bronze prospérait grâce à l'urbanisme. »",
          de: "🏺 PRIYA: „Vor fünftausend Jahren florierte eine bronzezeitliche Metropole ganz ohne Paläste durch reine Ingenieurskunst.“",
          hi: "🏺 प्रिया: \"पाँच हज़ार साल पहले बिना महलों और सेनाओं के केवल नागरिक इंजीनियरिंग पर आधारित एक महान शहर फला-फूला।\""
        }
      },
      {
        id: "history_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_sitting.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Archaeological Historian",
        actName: "Act 2: The Great Bath & Covered Drains",
        philosophy: "Purity & Hygiene in Antiquity",
        text: {
          ja: "🏺 PRIYA: 「焼成レンガで防水された大浴場と地下暗渠。ローマより二千年先を行く衛生システムです。」",
          en: "🏺 PRIYA: \"The bitumen-waterproofed Great Bath and underground drainage were two millennia ahead of Rome.\"",
          es: "🏺 PRIYA: \"El Gran Baño impermeabilizado con betún y el drenaje subterráneo se adelantaron dos mil años a Roma.\"",
          fr: "🏺 PRIYA: « Le Grand Bain étanchéifié au bitume et les égouts souterrains devançaient Rome de deux millénaires. »",
          de: "🏺 PRIYA: „Das mit Bitumen abgedichtete Große Bad und unterirdische Kanäle waren Rom um zwei Jahrtausende voraus.“",
          hi: "🏺 प्रिया: \"विशाल स्नानागार और भूमिगत जल निकासी प्रणाली रोम से भी दो हजार वर्ष आगे थी।\""
        }
      },
      {
        id: "history_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Archaeological Historian",
        actName: "Act 3: The Legacy of Indus Harmony",
        philosophy: "Timeless Lessons for Modern Cities",
        text: {
          ja: "🏺 PRIYA: 「モヘンジョダロが残した真の遺産は、持続可能で平和な共同体の青写真です。」",
          en: "🏺 PRIYA: \"The enduring legacy of Mohenjo-Daro is a timeless blueprint for sustainable, harmonious human civilization.\"",
          es: "🏺 PRIYA: \"El legado perdurable de Mohenjo-Daro es un modelo eterno para una civilización sostenible y armoniosa.\"",
          fr: "🏺 PRIYA: « L'héritage durable de Mohenjo-Daro est un modèle intemporel de civilisation durable et harmonieuse. »",
          de: "🏺 PRIYA: „Das bleibende Erbe von Mohenjo-Daro ist ein zeitloser Entwurf für eine nachhaltige Zivilisation.“",
          hi: "🏺 प्रिया: \"मोहनजोदड़ो की विरासत आज भी एक टिकाऊ और शांतिपूर्ण मानव समाज की प्रेरणा है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x51092847291048a9bc0192847291a84c"
    }
  },

  // 15. Finance & Wealth
  {
    id: "track_finance_sovereign_liquidity",
    title: "📈 Central Bank Sovereign Liquidity & Gold Reserves",
    subtitle: "3-Act Institutional Macro Breakdown of Cross-Border Settlement & Yield Curves",
    category: "finance_wealth",
    character: "💼 Marcus Vance (Macro Strategist)",
    videoSrc: "/assets/video/veo_priya_keynote_21s.mp4",
    duration: 24.0,
    acts: [
      {
        id: "fin_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/veo_priya_keynote_21s.mp4",
        speaker: "Marcus Vance",
        speakerRole: "Global Macro Strategist",
        actName: "Act 1: The Global Reserve Rebalancing",
        philosophy: "Sovereign Asset Diversification",
        text: {
          ja: "💼 MARCUS: 「世界の中央銀行が金準備を急拡大させている。基軸通貨の枠組みが静かに再編されている。」",
          en: "💼 MARCUS: \"Global central banks are accumulating gold at record velocity as reserve currency frameworks realign.\"",
          es: "💼 MARCUS: \"Los bancos centrales acumulan oro a velocidad récord mientras el marco de reservas se reestructura.\"",
          fr: "💼 MARCUS: « Les banques centrales accumulent de l'or à un rythme record alors que les réserves mondiales se réalignent. »",
          de: "💼 MARCUS: „Zentralbanken kaufen Rekordmengen Gold, während sich das Währungsgefüge neu ordnet.“",
          hi: "💼 मार्कस: \"दुनिया के केंद्रीय बैंक रिकॉर्ड मात्रा में सोना जमा कर रहे हैं क्योंकि वैश्विक मुद्रा प्रणाली बदल रही है।\""
        }
      },
      {
        id: "fin_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_16s_master.mp4",
        speaker: "Marcus Vance",
        speakerRole: "Global Macro Strategist",
        actName: "Act 2: Cross-Border Liquidity Corridors",
        philosophy: "Deterministic Real-Time Settlement",
        text: {
          ja: "💼 MARCUS: 「摩擦のない即時決済回廊の構築により、国際貿易の流動性コストが劇的に低減する。」",
          en: "💼 MARCUS: \"Instant bilateral settlement corridors eliminate counterparty risk and drastically reduce friction.\"",
          es: "💼 MARCUS: \"Los corredores de liquidación bilateral instantánea eliminan el riesgo de contraparte y reducen fricciones.\"",
          fr: "💼 MARCUS: « Les corridors de règlement instantané éliminent le risque de contrepartie et réduisent les frictions. »",
          de: "💼 MARCUS: „Bilaterale Sofortabwicklungskorridore eliminieren das Gegenparteirisiko und senken Reibungskosten.“",
          hi: "💼 मार्कस: \"तत्काल भुगतान प्रणाली ने जोखिम को समाप्त कर व्यापार को बहुत सुगम बना दिया है।\""
        }
      },
      {
        id: "fin_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/veo_priya_keynote_21s.mp4",
        speaker: "Marcus Vance",
        speakerRole: "Global Macro Strategist",
        actName: "Act 3: The 2030 Sovereign Liquidity Architecture",
        philosophy: "Cryptographic Asset Sovereign Shield",
        text: {
          ja: "💼 MARCUS: 「将来の金融主権は、暗号学的に証明された確実な担保の上に築かれます。」",
          en: "💼 MARCUS: \"The future of sovereign balance sheets belongs to cryptographically verified, deterministic collateral.\"",
          es: "💼 MARCUS: \"El futuro de los balances soberanos pertenece a garantías verificadas criptográficamente.\"",
          fr: "💼 MARCUS: « L'avenir des bilans souverains repose sur des garanties vérifiées cryptographiquement. »",
          de: "💼 MARCUS: „Die Zukunft souveräner Bilanzen liegt in kryptografisch verifizierten Sicherheiten.“",
          hi: "💼 मार्कस: \"भविष्य का वित्तीय ढांचा पूरी तरह से प्रमाणित और सुरक्षित संपत्तियों पर निर्भर होगा।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x9182a01948bc0192847291a84c90281b"
    }
  },

  // 16. Leadership
  {
    id: "track_leadership_rajarshi",
    title: "🏛️ The Rajarshi: Dharmic Sovereign Leadership",
    subtitle: "3-Act Executive Masterclass on Nishkama Karma & Ethical AI Governance",
    category: "leadership_masterclass",
    character: "👑 Priya Sharma (Executive Orator)",
    videoSrc: "/assets/video/priya_4k_10act_master.mp4",
    duration: 24.0,
    acts: [
      {
        id: "lead_act_1",
        startTime: 0.0,
        endTime: 8.0,
        videoUrl: "/assets/video/priya_4k_10act_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Chief AI Officer",
        actName: "Act 1: The Concept of the Sage-King",
        philosophy: "Rajarshi (Raja + Rishi) Ideal",
        text: {
          ja: "👑 PRIYA: 「真のリーダーシップとは権力の行使ではなく、自己の執着を捨てた真理の奉仕である。」",
          en: "👑 PRIYA: \"True leadership is not the assertion of authority, but the selfless stewardship of truth.\"",
          es: "👑 PRIYA: \"El verdadero liderazgo no es la afirmación de autoridad, sino la custodia desinteresada de la verdad.\"",
          fr: "👑 PRIYA: « Le vrai leadership n'est pas l'affirmation de l'autorité, mais le service désintéressé de la vérité. »",
          de: "👑 PRIYA: „Wahre Führung ist nicht Machtausübung, sondern die selbstlose Bewahrung der Wahrheit.“",
          hi: "👑 प्रिया: \"सच्चा नेतृत्व अधिकार जताना नहीं, बल्कि निस्वार्थ भाव से सत्य की रक्षा करना है।\""
        }
      },
      {
        id: "lead_act_2",
        startTime: 8.0,
        endTime: 16.0,
        videoUrl: "/assets/video/veo_priya_24s_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Chief AI Officer",
        actName: "Act 2: Detached Decision Making (Nishkama Karma)",
        philosophy: "Action Without Ego Attachment",
        text: {
          ja: "👑 PRIYA: 「結果に囚われず、正義と義務に基づき最善の決断を下す。これが निष्काम कर्म（無執着の行為）です。」",
          en: "👑 PRIYA: \"Acting decisively with unwavering ethics without attachment to personal accolades—Nishkama Karma.\"",
          es: "👑 PRIYA: \"Actuar con ética inquebrantable sin apego al reconocimiento personal: Nishkama Karma.\"",
          fr: "👑 PRIYA: « Agir avec une éthique inébranlable sans attachement aux honneurs personnels : Nishkama Karma. »",
          de: "👑 PRIYA: „Entschlossenes Handeln nach unerschütterlicher Ethik ohne Eitelkeit: Nishkama Karma.“",
          hi: "👑 प्रिया: \"बिना किसी फल की आसक्ति के केवल धर्म और कर्तव्य के लिए कर्म करना ही निष्काम कर्म है।\""
        }
      },
      {
        id: "lead_act_3",
        startTime: 16.0,
        endTime: 24.0,
        videoUrl: "/assets/video/priya_4k_10act_master.mp4",
        speaker: "Priya Sharma",
        speakerRole: "Chief AI Officer",
        actName: "Act 3: Sovereign Governance in the AI Age",
        philosophy: "Ethical Stewardship of Superintelligence",
        text: {
          ja: "👑 PRIYA: 「自律型知能の時代において、道徳的指針を持つリーダーこそが人類の未来を守る盾となる。」",
          en: "👑 PRIYA: \"In the age of superintelligence, ethical clarity is the ultimate sovereign shield of civilization.\"",
          es: "👑 PRIYA: \"En la era de la superinteligencia, la claridad ética es el escudo soberano de la civilización.\"",
          fr: "👑 PRIYA: « À l'ère de la superintelligence, la clarté éthique est le bouclier souverain de la civilisation. »",
          de: "👑 PRIYA: „Im Zeitalter der Superintelligenz ist ethische Klarheit der souveräne Schutzschild der Zivilisation.“",
          hi: "👑 प्रिया: \"सुपरइंटेलिजेंस के युग में नैतिक स्पष्टता ही मानव सभ्यता की सबसे बड़ी ढाल है।\""
        }
      }
    ],
    veritas: {
      status: "CERTIFIED_VALID",
      snarkProofHash: "0x8192a01948bc0192847291a84c90281a"
    }
  }
];

let tsCode = "import { ANIME_SUBTITLE_CUES } from \"./anime_subtitles\";\n\n";
tsCode += "export interface SeriesTrack {\n";
tsCode += "  id: string;\n";
tsCode += "  title: string;\n";
tsCode += "  subtitle: string;\n";
tsCode += "  category: string;\n";
tsCode += "  character: string;\n";
tsCode += "  videoSrc: string;\n";
tsCode += "  acts: any[];\n";
tsCode += "  duration: number;\n";
tsCode += "  veritas?: {\n";
tsCode += "    status: string;\n";
tsCode += "    snarkProofHash: string;\n";
tsCode += "  };\n";
tsCode += "  createdAt?: string;\n";
tsCode += "}\n\n";

tsCode += "export const CANONICAL_SERIES_TRACKS: SeriesTrack[] = " + JSON.stringify(tracks, null, 2)
  .replace('"acts": []', '"acts": ANIME_SUBTITLE_CUES')
  .replace('"id": "track_anime_kaizen",\n    "title": "The Master & The Apprentice: Path to Kaizen",\n    "subtitle": "7-Act Cinematic Japanese Anime Series · Sensei Ren & Apprentice Aoi",\n    "category": "anime",\n    "character": "🥋 Sensei Ren & Apprentice Aoi",\n    "videoSrc": "/assets/video/ren_and_aoi_conversation_synced.mp4",\n    "duration": 56,\n    "veritas": {\n      "status": "CERTIFIED_VALID",\n      "snarkProofHash": "0x8f2d61bca79e4310d289aa84bb234f9011"\n    }', '"id": "track_anime_kaizen",\n    "title": "The Master & The Apprentice: Path to Kaizen",\n    "subtitle": "7-Act Cinematic Japanese Anime Series · Sensei Ren & Apprentice Aoi",\n    "category": "anime",\n    "character": "🥋 Sensei Ren & Apprentice Aoi",\n    "videoSrc": "/assets/video/ren_and_aoi_conversation_synced.mp4",\n    "acts": ANIME_SUBTITLE_CUES,\n    "duration": 56,\n    "veritas": {\n      "status": "CERTIFIED_VALID",\n      "snarkProofHash": "0x8f2d61bca79e4310d289aa84bb234f9011"\n    }') + ";\n";

fs.writeFileSync(path.resolve(process.cwd(), "lib/tier6/default_tracks.ts"), tsCode, "utf8");
console.log("Successfully generated clean lib/tier6/default_tracks.ts");
