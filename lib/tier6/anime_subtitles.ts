export interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  speaker: "Aoi" | "Ren" | "Both";
  text: {
    ja: string;
    en: string;
    es: string;
    fr: string;
    de: string;
    hi: string;
  };
  actName: string;
  philosophy: string;
}

export const ANIME_SUBTITLE_CUES: SubtitleCue[] = [
  {
    id: "act_1",
    startTime: 0.5,
    endTime: 7.2,
    speaker: "Aoi",
    actName: "Act 1: Apprentice Doubt",
    philosophy: "Shoshin (初心) — Beginner's Mind",
    text: {
      ja: "先生…毎朝手のひらが血で滲むまで鍛錬していますが、なぜ私はまだこんなに弱いのでしょう？",
      en: "Sensei... I train every single sunrise until my hands bleed. But why do I still feel so weak?",
      es: "Sensei... entreno cada amanecer con toda mi fuerza. Pero ¿por qué sigo sintiéndome tan débil?",
      fr: "Sensei... je m'entraîne à chaque aube sans relâche. Mais pourquoi ai-je encore l'impression d'être si faible ?",
      de: "Sensei... ich trainiere bei jedem Sonnenaufgang unermüdlich. Aber warum fühle ich mich noch immer so schwach?",
      hi: "गुरुजी... मैं हर भोर कठोर अभ्यास करती हूँ। फिर भी मैं स्वयं को इतना निर्बल क्यों पाती हूँ?"
    }
  },
  {
    id: "act_2",
    startTime: 8.5,
    endTime: 15.2,
    speaker: "Ren",
    actName: "Act 2: The Bloom of Oubaitori",
    philosophy: "Oubaitori (桜梅桃李) — Never compare your spring to another's summer",
    text: {
      ja: "庭を見るのだ、葵。「桜梅桃李」—桜も梅も桃も李も、己の季節に咲き誇る。他人の夏とお前の春を比べてはならぬ。",
      en: "Look at the garden, Aoi. Oubaitori teaches us that the cherry and the plum bloom in their own sacred season. Never measure your spring against another's summer.",
      es: "Mira el jardín, Aoi. Oubaitori nos enseña que cada flor florece en su propia estación. Nunca compares tu primavera con el verano de otro.",
      fr: "Regarde le jardin, Aoi. Oubaitori nous enseigne que chaque fleur s'épanouit en sa propre saison. Ne mesure jamais ton printemps à l'été d'autrui.",
      de: "Schau in den Garten, Aoi. Oubaitori lehrt uns: Jede Blüte öffnet sich in ihrer eigenen Zeit. Vergleiche deinen Frühling nie mit dem Sommer eines anderen.",
      hi: "इस उपवन को देखो, आओई। उबैतोरी हमें सिखाता है कि हर पुष्प अपने ही समय पर खिलता है। कभी अपनी वसंत की तुलना किसी और के ग्रीष्म से मत करो।"
    }
  },
  {
    id: "act_3",
    startTime: 16.5,
    endTime: 22.8,
    speaker: "Aoi",
    actName: "Act 3: 1% Daily Growth",
    philosophy: "Kaizen (改善) — Continuous 1% compounding growth",
    text: {
      ja: "ならば今日の太刀筋も…僅か一歩の成長でも、本当に意味があるのですね？",
      en: "So my sword strike today... even if it only improves by one percent... it truly matters?",
      es: "Entonces, mi práctica de espada hoy... ¿aunque solo mejore un uno por ciento, de verdad importa?",
      fr: "Ainsi, mon coup d'épée aujourd'hui... même amélioré d'un pourcent, a-t-il vraiment de la valeur ?",
      de: "Bedeutet das, mein Schwertstreich heute... selbst wenn er sich nur um ein Prozent verbessert... zählt wirklich?",
      hi: "तो आज का मेरा यह तलवार का प्रहार... यदि यह केवल एक प्रतिशत भी सुधरे, तो क्या इसका सचमुच कोई मोल है?"
    }
  },
  {
    id: "act_4",
    startTime: 24.5,
    endTime: 31.2,
    speaker: "Ren",
    actName: "Act 4: Golden Seams of Kintsugi",
    philosophy: "Kintsugi (金継ぎ) & Wabi-Sabi (侘寂) — Scars mended with gold",
    text: {
      ja: "それこそが「改善」だ。そして「金継ぎ」を思い出せ。傷を誇れ、それこそがお前の黄金の輝きだ。",
      en: "That is Kaizen. And remember Kintsugi: the clay mended with gold is stronger than unbroken porcelain. Your struggles are your golden seams.",
      es: "Eso es Kaizen. Y recuerda Kintsugi: la cerámica unida con oro es más fuerte. Tus cicatrices son tus vetas doradas.",
      fr: "C'est cela, le Kaizen. Et rappelle-toi le Kintsugi : la céramique réparée d'or est plus résistante. Tes cicatrices sont tes veines d'or.",
      de: "Das ist Kaizen. Und denk an Kintsugi: Mit Gold repariertes Porzellan ist stärker. Deine Narben sind deine goldenen Linien.",
      hi: "यही काइज़ेन है। और किंतसुगी को स्मरण रखो: स्वर्ण से जुड़ा पात्र अखंड मिट्टी से भी अधिक दृढ़ होता है। तुम्हारे संघर्ष ही तुम्हारी स्वर्णिम आभा हैं।"
    }
  },
  {
    id: "act_5",
    startTime: 32.5,
    endTime: 38.8,
    speaker: "Aoi",
    actName: "Act 5: Unyielding Bamboo",
    philosophy: "Gaman (我慢) — Resilience and patience in the storm",
    text: {
      ja: "「我慢」！嵐に撓む竹のように、私の心は決して折れません！",
      en: "Gaman! Like the bamboo bending in fierce wind, my spirit will never break!",
      es: "¡Gaman! Como el bambú ante la tormenta, ¡mi espíritu jamás se quebrará!",
      fr: "Gaman ! Comme le bambou sous la tempête, mon esprit ne brisera jamais !",
      de: "Gaman! Wie der Bambus im Sturm wird mein Geist niemals brechen!",
      hi: "गामन! तीव्र आंधी में झुकने वाले बांस की भांति, मेरा संकल्प कभी नहीं टूटेगा!"
    }
  },
  {
    id: "act_6",
    startTime: 40.5,
    endTime: 47.0,
    speaker: "Ren",
    actName: "Act 6: Finding Purpose",
    philosophy: "Ikigai (生き甲斐) — The reason for being",
    text: {
      ja: "見事だ。志と慈悲が重なる時、己の「生き甲斐」が見出されよう。",
      en: "When your discipline unites with compassion, you find your true Ikigai—your sacred purpose under the sun.",
      es: "Cuando tu disciplina se une con propósito, descubres tu verdadero Ikigai.",
      fr: "Lorsque ta discipline s'unit à la sagesse, tu découvres ton véritable Ikigai.",
      de: "Wenn Disziplin und Mitgefühl verschmelzen, findest du dein wahres Ikigai.",
      hi: "जब तुम्हारा अनुशासन उद्देश्य से मिलता है, तब तुम अपने वास्तविक इकिगाई को प्राप्त करती हो।"
    }
  },
  {
    id: "act_7a",
    startTime: 48.5,
    endTime: 51.5,
    speaker: "Aoi",
    actName: "Act 7: The Synchronized Bow",
    philosophy: "Reigi (礼儀) — Mutual Honor and Gratitude",
    text: {
      ja: "ありがとうございます、先生。共に道を歩みましょう。",
      en: "Arigatou gozaimasu, Sensei. Together we walk the path.",
      es: "Muchas gracias, Sensei. Juntos caminamos este sendero.",
      fr: "Merci infiniment, Sensei. Ensemble, nous avançons sur la voie.",
      de: "Arigatou gozaimasu, Sensei. Gemeinsam gehen wir diesen Pfad.",
      hi: "धन्यवाद गुरुजी। हम साथ मिलकर इस मार्ग पर चलेंगे।"
    }
  },
  {
    id: "act_7b",
    startTime: 52.0,
    endTime: 55.5,
    speaker: "Ren",
    actName: "Act 7: The Synchronized Bow",
    philosophy: "Reigi (礼儀) — Mutual Honor and Gratitude",
    text: {
      ja: "礼を尽くし、歩みを進めよう。",
      en: "Bow with honor, Aoi. Our journey has only just begun.",
      es: "Inclínate con honor, Aoi. Nuestro viaje apenas comienza.",
      fr: "Salue avec honneur, Aoi. Notre voyage ne fait que commencer.",
      de: "Verneige dich mit Ehre, Aoi. Unsere Reise hat gerade erst begonnen.",
      hi: "ससम्मान नमन करो, आओई। हमारी यात्रा तो बस अभी आरंभ हुई है।"
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
