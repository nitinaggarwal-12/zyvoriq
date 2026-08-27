export interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  speaker: "Aoi" | "Ren" | "Both";
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
    startTime: 0.60,
    endTime: 7.40,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 1: Apprentice Doubt",
    philosophy: "Shoshin (初心) — Beginner's Mind",
    text: {
      ja: "🥋 葵: 「蓮先生…毎朝手のひらが擦り切れるまで鍛錬していますが、なぜ私は未だに弱く、迷いばかりなのでしょうか？」",
      en: "🥋 AOI: \"Sensei Ren... I train every single sunrise until my palms bleed, yet why do I still feel so weak and full of doubt?\"",
      es: "🥋 AOI: \"Sensei Ren... entreno cada amanecer hasta que sangran mis manos, pero ¿por qué aún me siento tan débil y llena de dudas?\"",
      fr: "🥋 AOI: « Sensei Ren... je m'entraîne à chaque aube jusqu'à ce que mes mains saignent, alors pourquoi suis-je encore si faible et hésitante ? »",
      de: "🥋 AOI: „Sensei Ren... ich trainiere bei jedem Sonnenaufgang, bis meine Hände bluten. Warum fühle ich mich dennoch so schwach und voller Zweifel?\"",
      hi: "🥋 आओई: \"गुरुजी रेन... मैं हर भोर कठोर तप करती हूँ। फिर भी मैं स्वयं को इतना निर्बल और संशय में क्यों पाती हूँ?\""
    }
  },
  {
    id: "act_2",
    startTime: 8.60,
    endTime: 15.40,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 2: The Bloom of Oubaitori",
    philosophy: "Oubaitori (桜梅桃李) — Never compare your spring to another's summer",
    text: {
      ja: "⛩️ 蓮先生: 「庭を見るのだ、葵。桜梅桃李—桜も梅も桃も李も、己の季節に咲き誇る。焦るでない、お前の春も必ず訪れる。」",
      en: "⛩️ SENSEI REN: \"Look at the garden, Aoi. Oubaitori teaches us that cherry, plum, peach, and apricot each bloom in their own sacred time. Do not rush; your spring shall arrive.\"",
      es: "⛩️ SENSEI REN: \"Mira el jardín, Aoi. Oubaitori nos enseña que el cerezo y el ciruelo florecen a su debido tiempo. No te apresures; tu primavera llegará.\"",
      fr: "⛩️ SENSEI REN: « Regarde le jardin, Aoi. Oubaitori nous enseigne que cerisiers et pruniers fleurissent en leur temps sacré. Ne te presse pas ; ton printemps viendra. »",
      de: "⛩️ SENSEI REN: „Schau in den Garten, Aoi. Oubaitori lehrt uns: Kirsche und Pflaume blühen zu ihrer eigenen Zeit. Übe Geduld; dein Frühling wird kommen.\"",
      hi: "⛩️ गुरुजी रेन: \"इस उपवन को देखो, आओई। उबैतोरी सिखाता है कि हर पुष्प अपनी ऋतु में ही खिलता है। व्यग्र मत हो; तुम्हारा वसंत भी अवश्य आएगा।\""
    }
  },
  {
    id: "act_3",
    startTime: 16.60,
    endTime: 23.40,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 3: 1% Daily Growth",
    philosophy: "Kaizen (改善) — Continuous 1% compounding growth",
    text: {
      ja: "🥋 葵: 「己の季節…ならば今日のこの一振りの太刀筋も、僅か一歩の前進だとしても、確かな意味があるのですね？」",
      en: "🥋 AOI: \"My own sacred time... then my practice today, even if it advances me by just a single step, holds true meaning?\"",
      es: "🥋 AOI: \"Mi tiempo sagrado... entonces mi práctica hoy, ¿aunque solo sea un pequeño paso hacia adelante, tiene un significado real?\"",
      fr: "🥋 AOI: « Mon temps sacré... alors ma pratique aujourd'hui, même si elle ne me fait avancer que d'un pas, a-t-elle un sens véritable ? »",
      de: "🥋 AOI: „Meine eigene Zeit... bedeutet das, mein Training heute, selbst wenn es nur ein kleiner Schritt vorwärts ist, hat echte Bedeutung?\"",
      hi: "🥋 आओई: \"मेरी अपनी ऋतु... तो आज का मेरा यह अभ्यास, यदि यह एक छोटा सा कदम भी हो, तो क्या इसका वास्तविक अर्थ है?\""
    }
  },
  {
    id: "act_4",
    startTime: 24.60,
    endTime: 31.40,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 4: Golden Seams of Kintsugi",
    philosophy: "Kintsugi (金継ぎ) & Wabi-Sabi (侘寂) — Scars mended with gold",
    text: {
      ja: "⛩️ 蓮先生: 「そうだ、それこそが改善だ。そして金継ぎを見よ。傷を漆と金で繕うように、過ちこそがお前を強く美しくする。」",
      en: "⛩️ SENSEI REN: \"That is Kaizen. And remember Kintsugi: the clay mended with gold is stronger than pristine porcelain. Your flaws and scars make you radiant.\"",
      es: "⛩️ SENSEI REN: \"Eso es Kaizen. Y recuerda Kintsugi: la cerámica unida con oro es más fuerte que la porcelana intacta. Tus cicatrices te hacen radiante.\"",
      fr: "⛩️ SENSEI REN: « C'est cela, le Kaizen. Et souviens-toi du Kintsugi : la terre cuite réparée d'or est plus forte que la porcelaine intacte. Tes cicatrices te rendent éclatante. »",
      de: "⛩️ SENSEI REN: „Das ist Kaizen. Und denk an Kintsugi: Mit Gold repariertes Porzellan ist stärker als makelloses. Deine Narben machen dich strahlend.\"",
      hi: "⛩️ गुरुजी रेन: \"यही काइज़ेन है। और किंतसुगी को स्मरण रखो: स्वर्ण से जुड़ा पात्र अखंड से भी अधिक सुदृढ़ होता है। तुम्हारी त्रुटियां ही तुम्हारी आभा हैं।\""
    }
  },
  {
    id: "act_5",
    startTime: 32.60,
    endTime: 39.40,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 5: Unyielding Bamboo",
    philosophy: "Gaman (我慢) — Resilience and patience in the storm",
    text: {
      ja: "🥋 葵: 「我慢！嵐に撓みながらも折れぬ竹のように、どんな逆境であっても私の魂と決意は決して折れません！」",
      en: "🥋 AOI: \"Gaman! Like the resilient bamboo bending in the fiercest gale without breaking, no storm shall ever break my soul and resolve!\"",
      es: "🥋 AOI: \"¡Gaman! Como el bambú flexible ante la tempestad más feroz, ¡ninguna tormenta quebrará jamás mi alma ni mi determinación!\"",
      fr: "🥋 AOI: « Gaman ! Comme le bambou qui plie sous la plus violente tempête sans se rompre, rien ne brisera jamais mon âme ni ma résolution ! »",
      de: "🥋 AOI: „Gaman! Wie der biegsame Bambus im wildesten Sturm ohne zu brechen, wird kein Unwetter jemals meine Seele brechen!\"",
      hi: "🥋 आओई: \"गामन! तीव्र आंधी में झुकने वाले बांस की भांति, कोई भी संकट मेरी आत्मा और संकल्प को कभी नहीं तोड़ सकेगा!\""
    }
  },
  {
    id: "act_6",
    startTime: 40.60,
    endTime: 47.40,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 6: Finding Purpose",
    philosophy: "Ikigai (生き甲斐) — The reason for being",
    text: {
      ja: "⛩️ 蓮先生: 「見事だ、葵。己の鍛錬と他者への慈悲が一つになる時、人は真の生き甲斐と天命を見出すのだ。」",
      en: "⛩️ SENSEI REN: \"Well spoken, Aoi. When unwavering discipline unites with boundless compassion for others, you uncover your true Ikigai—your higher calling.\"",
      es: "⛩️ SENSEI REN: \"Bien dicho, Aoi. Cuando la disciplina se une a la compasión infinita por los demás, descubres tu verdadero Ikigai y tu vocación más elevada.\"",
      fr: "⛩️ SENSEI REN: « Bien parlé, Aoi. Quand la discipline s'unit à la compassion infinie pour autrui, tu découvres ton véritable Ikigai—ta vocation sacrée. »",
      de: "⛩️ SENSEI REN: „Treffend gesprochen, Aoi. Wenn Disziplin und Mitgefühl verschmelzen, findest du dein wahres Ikigai—deine edle Bestimmung.\"",
      hi: "⛩️ गुरुजी रेन: \"उत्कृष्ट विचार, आओई। जब अटूट अनुशासन करुणा से जुड़ता है, तब तुम अपने वास्तविक इकिगाई—अपने जीवन के ध्येय को पाती हो।\""
    }
  },
  {
    id: "act_7a",
    startTime: 48.60,
    endTime: 51.80,
    speaker: "Aoi",
    speakerRole: "Apprentice Samurai",
    actName: "Act 7: The Synchronized Bow",
    philosophy: "Reigi (礼儀) — Mutual Honor and Gratitude",
    text: {
      ja: "🥋 葵: 「ありがとうございます、蓮先生。この道を共に歩みます。」",
      en: "🥋 AOI: \"Arigatou gozaimasu, Sensei. Together we honor this path.\"",
      es: "🥋 AOI: \"Muchas gracias, Sensei. Juntos honramos este camino.\"",
      fr: "🥋 AOI: « Merci infiniment, Sensei. Ensemble, nous honorons cette voie. »",
      de: "🥋 AOI: „Arigatou gozaimasu, Sensei. Gemeinsam ehren wir diesen Weg.\"",
      hi: "🥋 आओई: \"कोटि-कोटि धन्यवाद गुरुजी। हम साथ मिलकर इस पवित्र मार्ग का सम्मान करते हैं।\""
    }
  },
  {
    id: "act_7b",
    startTime: 52.00,
    endTime: 55.40,
    speaker: "Ren",
    speakerRole: "Zen Master",
    actName: "Act 7: The Synchronized Bow",
    philosophy: "Reigi (礼儀) — Mutual Honor and Gratitude",
    text: {
      ja: "⛩️ 蓮先生: 「礼を尽くし、心清らかに、新たな夜明けへと進もう。」",
      en: "⛩️ SENSEI REN: \"Bow with honor, Aoi. Our greatest journey begins at dawn.\"",
      es: "⛩️ SENSEI REN: \"Inclínate con honor, Aoi. Nuestro gran viaje comienza al amanecer.\"",
      fr: "⛩️ SENSEI REN: « Incline-toi avec honneur, Aoi. Notre plus grand voyage commence à l'aube. »",
      de: "⛩️ SENSEI REN: „Verneige dich mit Ehre, Aoi. Unsere größte Reise beginnt im Morgengrauen.\"",
      hi: "⛩️ गुरुजी रेन: \"ससम्मान नमन करो, आओई। हमारी सबसे महान यात्रा इस उषाकाल से आरंभ होती है।\""
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
