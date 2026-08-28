export interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  speaker: string;
  speakerRole: string;
  actName: string;
  philosophy: string;
  text: {
    ja: string;
    en: string;
    es: string;
    fr: string;
    de: string;
    hi: string;
  };
}

export const ANIME_SUBTITLE_CUES: SubtitleCue[] = [
  {
    id: "act_1",
    startTime: 0.25,
    endTime: 7.20,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 1: Apprentice Doubt",
    philosophy: "Shoshin (初心) — Beginner's Mind",
    text: {
      ja: "🥋 葵: 「蓮先生…毎朝鍛錬していますが、なぜ私は未だに弱く、迷うのでしょうか？」",
      en: "🥋 AOI: \"Sensei Ren... I train every sunrise, yet why do I still feel so uncertain?\"",
      es: "🥋 AOI: \"Sensei Ren... entreno cada amanecer, pero ¿por qué sigo sintiendo tanta duda?\"",
      fr: "🥋 AOI: « Sensei Ren... je m'entraîne à chaque aube, mais pourquoi ai-je encore tant de doutes ? »",
      de: "🥋 AOI: „Sensei Ren... ich trainiere jeden Morgen, doch warum spüre ich noch so viel Zweifel?\"",
      hi: "🥋 आओई: \"गुरुजी रेन... मैं हर भोर अभ्यास करती हूँ, फिर भी मैं इतनी संशय में क्यों हूँ?\""
    }
  },
  {
    id: "act_2",
    startTime: 8.25,
    endTime: 15.20,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 2: The Bloom of Oubaitori",
    philosophy: "Oubaitori (桜梅桃李) — Never compare your spring to another's summer",
    text: {
      ja: "⛩️ 蓮先生: 「庭を見よ、葵。桜梅桃李。焦るでない、お前の花も必ず咲く。」",
      en: "⛩️ SENSEI REN: \"Look at the garden, Aoi. Oubaitori teaches: never compare your spring to another's summer.\"",
      es: "⛩️ SENSEI REN: \"Mira el jardín, Aoi. Oubaitori nos enseña: nunca compares tu primavera con el verano ajeno.\"",
      fr: "⛩️ SENSEI REN: « Regarde le jardin, Aoi. L'Oubaitori enseigne : ne compare jamais ton printemps à l'été d'autrui. »",
      de: "⛩️ SENSEI REN: „Schau den Garten an, Aoi. Oubaitori lehrt: Vergleiche deinen Frühling nie mit dem Sommer anderer.\"",
      hi: "⛩️ गुरुजी रेन: \"उपवन को देखो, आओई। उबैतोरी सिखाता है: कभी अपनी वसंत की तुलना किसी और के ग्रीष्म से मत करो।\""
    }
  },
  {
    id: "act_3",
    startTime: 16.25,
    endTime: 23.00,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 3: 1% Daily Growth",
    philosophy: "Kaizen (改善) — Continuous 1% compounding growth",
    text: {
      ja: "🥋 葵: 「己の季節…ならば今日の一振りも、確かな一歩の前進ですね？」",
      en: "🥋 AOI: \"My own season... then today's single practice stroke truly builds my mastery?\"",
      es: "🥋 AOI: \"Mi propia estación... ¿entonces cada golpe de hoy forja mi verdadera maestría?\"",
      fr: "🥋 AOI: « Ma propre saison... alors chaque geste aujourd'hui forge ma véritable maîtrise ? »",
      de: "🥋 AOI: „Meine eigene Zeit... formt also jeder heutige Schritt meine wahre Meisterschaft?\"",
      hi: "🥋 आओई: \"मेरी अपनी ऋतु... तो आज का मेरा यह एक अभ्यास भी मेरी कुशलता को गढ़ता है?\""
    }
  },
  {
    id: "act_4",
    startTime: 24.25,
    endTime: 31.20,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 4: Golden Seams of Kintsugi",
    philosophy: "Kintsugi (金継ぎ) & Wabi-Sabi (侘寂) — Scars mended with gold",
    text: {
      ja: "⛩️ 蓮先生: 「そうだ、それが改善だ。そして金継ぎを見よ。傷こそがお前を美しくする。」",
      en: "⛩️ SENSEI REN: \"That is Kaizen. And remember Kintsugi: mended scars become your greatest strength.\"",
      es: "⛩️ SENSEI REN: \"Eso es Kaizen. Y recuerda Kintsugi: las cicatrices unidas con oro son tu mayor fuerza.\"",
      fr: "⛩️ SENSEI REN: « C'est cela, le Kaizen. Et souviens-toi du Kintsugi : tes fêlures d'or sont ta plus grande force. »",
      de: "⛩️ SENSEI REN: „Das ist Kaizen. Und denk an Kintsugi: Mit Gold geheilte Narben sind deine größte Stärke.\"",
      hi: "⛩️ गुरुजी रेन: \"यही काइज़ेन है। और किंतसुगी को याद रखो: स्वर्ण से जुड़ी दरारें ही तुम्हारी सबसे बड़ी शक्ति हैं।\""
    }
  },
  {
    id: "act_5",
    startTime: 32.25,
    endTime: 39.00,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 5: Unyielding Bamboo",
    philosophy: "Gaman (我慢) — Resilience and patience in the storm",
    text: {
      ja: "🥋 葵: 「我慢！嵐に撓む竹のように、どんな困難にも私の心は折れません！」",
      en: "🥋 AOI: \"Gaman! Like bamboo bending in the storm, no hardship will ever break my resolve!\"",
      es: "🥋 AOI: \"¡Gaman! Como el bambú en la tormenta, ¡ninguna dificultad quebrará mi resolución!\"",
      fr: "🥋 AOI: « Gaman ! Comme le bambou dans la tempête, aucune épreuve ne brisera ma résolution ! »",
      de: "🥋 AOI: „Gaman! Wie Bambus im Sturm wird keine Prüfung meine Entschlossenheit brechen!\"",
      hi: "🥋 आओई: \"गामन! आंधी में झुकने वाले बांस की भांति, कोई भी विपदा मेरे संकल्प को तोड़ नहीं सकती!\""
    }
  },
  {
    id: "act_6",
    startTime: 40.25,
    endTime: 47.00,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 6: Finding Purpose",
    philosophy: "Ikigai (生き甲斐) — The reason for being",
    text: {
      ja: "⛩️ 蓮先生: 「見事だ、葵。己の鍛錬と慈悲が一つになる時、人は真の生き甲斐を見出す。」",
      en: "⛩️ SENSEI REN: \"Well spoken, Aoi. When discipline unites with compassion, you awaken your true Ikigai.\"",
      es: "⛩️ SENSEI REN: \"Bien dicho, Aoi. Cuando la disciplina se une a la compasión, despiertas tu verdadero Ikigai.\"",
      fr: "⛩️ SENSEI REN: « Bien parlé, Aoi. Quand la discipline s'unit à la compassion, tu éveilles ton véritable Ikigai. »",
      de: "⛩️ SENSEI REN: „Wohlgesprochen, Aoi. Wenn Disziplin und Mitgefühl sich einen, erwacht dein wahres Ikigai.\"",
      hi: "⛩️ गुरुजी रेन: \"उत्कृष्ट, आओई। जब अनुशासन करुणा से जुड़ता है, तब तुम अपने सच्चे इकिगाई को जागृत करती हो।\""
    }
  },
  {
    id: "act_7a",
    startTime: 48.35,
    endTime: 50.80,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 7: The Synchronized Bow",
    philosophy: "Reigi (礼儀) — Mutual Honor and Gratitude",
    text: {
      ja: "🥋 葵: 「ありがとうございます、蓮先生。」",
      en: "🥋 AOI: \"Thank you deeply, Sensei Ren.\"",
      es: "🥋 AOI: \"Muchas gracias, Sensei Ren.\"",
      fr: "🥋 AOI: « Merci de tout cœur, Sensei Ren. »",
      de: "🥋 AOI: „Habt vielen Dank, Sensei Ren.\"",
      hi: "🥋 आओई: \"कोटि-कोटि धन्यवाद, गुरुजी रेन।\""
    }
  },
  {
    id: "act_7b",
    startTime: 51.00,
    endTime: 55.00,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 7: The Synchronized Bow",
    philosophy: "Reigi (礼儀) — Mutual Honor and Gratitude",
    text: {
      ja: "⛩️ 蓮先生: 「共に歩もう、葵。夜明けは近い。」",
      en: "⛩️ SENSEI REN: \"Walk with honor, Aoi. A new dawn begins.\"",
      es: "⛩️ SENSEI REN: \"Caminemos con honor, Aoi. Comienza un nuevo amanecer.\"",
      fr: "⛩️ SENSEI REN: « Marchons avec honneur, Aoi. Une nouvelle aube commence. »",
      de: "⛩️ SENSEI REN: „Gehen wir in Ehren, Aoi. Ein neuer Tag beginnt.\"",
      hi: "⛩️ गुरुजी रेन: \"ससम्मान आगे बढ़ो, आओई। एक नया प्रभात आरंभ होता है।\""
    }
  }
];

export const AUDIO_LANGUAGES = [
  { code: "ja", name: "Japanese", label: "Japanese [Original Cast]", badge: "ORIGINAL" },
  { code: "en", name: "English", label: "English [Dub]", badge: "STEREO" },
  { code: "es", name: "Spanish", label: "Español [Doblaje]", badge: "STEREO" },
  { code: "fr", name: "French", label: "Français [Doublage]", badge: "STEREO" },
  { code: "de", name: "German", label: "Deutsch [Synchron]", badge: "STEREO" },
  { code: "hi", name: "Hindi", label: "हिन्दी [डबिंग]", badge: "STEREO" }
] as const;

export const SUBTITLE_LANGUAGES = [
  { code: "off", name: "Off", label: "Off" },
  { code: "en", name: "English", label: "English [CC]" },
  { code: "ja", name: "Japanese", label: "日本語 [字幕]" },
  { code: "es", name: "Spanish", label: "Español" },
  { code: "fr", name: "French", label: "Français" },
  { code: "de", name: "German", label: "Deutsch" },
  { code: "hi", name: "Hindi", label: "हिन्दी" }
] as const;

export type AudioLangCode = typeof AUDIO_LANGUAGES[number]["code"];
export type SubtitleLangCode = typeof SUBTITLE_LANGUAGES[number]["code"];
