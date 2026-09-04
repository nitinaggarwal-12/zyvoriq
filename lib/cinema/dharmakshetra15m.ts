export interface CinematicAct {
  actNumber: number;
  title: string;
  tagline: string;
  timecodeStartSec: number;
  timecodeEndSec: number;
  durationSec: number;
  shotRange: string;
  musicalTheme: string;
  audioAsset: string;
  visualAtmosphere: string;
  dramaticStakes: string;
}

export interface CinematicShot {
  shotNumber: number;
  actNumber: number;
  timecodeStartSec: number;
  timecodeEndSec: number;
  durationSec: number;
  heading: string;
  shotType: "Extreme Wide Aerial" | "Wide Battle Canvas" | "Medium Two-Shot" | "Close-Up Hero" | "Extreme Close-Up" | "Tracking Dolly" | "Low-Angle Dutch Tilt" | "Crane Down";
  cameraMotion: string;
  lens: string;
  lighting: string;
  characters: string[];
  actionDescription: string;
  soundCue: string;
}

export interface FeatureFilmDialogue {
  id: string;
  actNumber: number;
  character: string;
  actorRole: string;
  timestampSec: number;
  timecodeFormatted: string;
  emotion: string;
  text: {
    hi: string;
    en: string;
    sa?: string;
    es?: string;
    fr?: string;
    ja?: string;
  };
}

export const DHARMAKSHETRA_ACTS: CinematicAct[] = [
  {
    actNumber: 1,
    title: "The Gathering Storm & The Conch of Destiny",
    tagline: "The Armies of Kurukshetra Face Off as the Divine Chariot Enters the Center (00:00 - 02:45)",
    timecodeStartSec: 0,
    timecodeEndSec: 165,
    durationSec: 165,
    shotRange: "Shots #001 to #024",
    musicalTheme: "Vedic Shankh, War Drums & Distant Brass (Pt. Hariprasad Chaurasia & Pt. Jasraj)",
    audioAsset: "/assets/audio/catalog/audio_vedanta_act1.wav",
    visualAtmosphere: "Golden morning mist, billowing saffron and white battle standards, fiery sunrise rim-lighting four white celestial stallions.",
    dramaticStakes: "The fate of the ancient world hangs in the balance as two mighty armies stand poised for annihilation."
  },
  {
    actNumber: 2,
    title: "The Moral Abyss: Arjuna's Sorrow (Vishada Yoga)",
    tagline: "The World's Greatest Archer Breaks Down Upon Seeing His Elders and Drops the Gandiva (02:45 - 05:45)",
    timecodeStartSec: 165,
    timecodeEndSec: 345,
    durationSec: 180,
    shotRange: "Shots #025 to #050",
    musicalTheme: "Lamentation of the Archer (Somber Sarangi & Bansuri in Raga Darbari Kanhra)",
    audioAsset: "/assets/audio/catalog/audio_vedanta_act2.wav",
    visualAtmosphere: "Desaturated amber dusk tones, deep psychological shadows, tear-stained close-ups, Gandiva slipping into the chariot dust.",
    dramaticStakes: "Existential moral collapse. Arjuna refuses to fight, questioning the very morality of victory purchased with familial blood."
  },
  {
    actNumber: 3,
    title: "The Cosmic Revelation (Vishwaroopa & Sankhya Yoga)",
    tagline: "Krishna Unveils the Immortality of the Soul and the Blinding Vision of Universal Time (05:45 - 09:30)",
    timecodeStartSec: 345,
    timecodeEndSec: 570,
    durationSec: 225,
    shotRange: "Shots #051 to #078",
    musicalTheme: "Symphonic Cosmic Choral & Vedic Chant (Shankar Mahadevan & Hariharan Choir)",
    audioAsset: "/assets/audio/catalog/audio_vedanta_act3.wav",
    visualAtmosphere: "Transcendent solar flare, time freezes across the battlefield, celestial aura (Sudarshana halo), infinite cosmic horizons.",
    dramaticStakes: "The mystery of existence revealed: the soul is eternal, death is an illusion, and destiny is already written."
  },
  {
    actNumber: 4,
    title: "The Great Awakening & The Resurgence (Karma Yoga)",
    tagline: "Arjuna Reclaims the Gandiva, Krishna Blows Panchajanya, and the Chariot Surges Forward (09:30 - 12:45)",
    timecodeStartSec: 570,
    timecodeEndSec: 765,
    durationSec: 195,
    shotRange: "Shots #079 to #102",
    musicalTheme: "Thunderous Pakhawaj War Drums & Sacred Conch Fanfare",
    audioAsset: "/assets/audio/catalog/audio_vedanta_act4.wav",
    visualAtmosphere: "Brilliant radiant morning light, blazing determined eyes, golden armor catching the sun, dust storm churned by charging stallions.",
    dramaticStakes: "Total psychological clarity. Selfless duty without attachment to fruit. The righteous battle begins."
  },
  {
    actNumber: 5,
    title: "The Dawn of Dharma & Theatrical Resolution",
    tagline: "Sanjaya's Eternal Prophecy, Widescreen Golden Panorama, and Master Theatrical Roll (12:45 - 15:00)",
    timecodeStartSec: 765,
    timecodeEndSec: 900,
    durationSec: 135,
    shotRange: "Shots #103 to #118",
    musicalTheme: "Grand Thematic Symphony & Raga Bhairavi Epilogue",
    audioAsset: "/assets/audio/catalog/audio_vedanta_act1.wav",
    visualAtmosphere: "Monumental anamorphic wide-angle landscape, golden rays over the sacred plains, full production credits rolling against starlit cosmos.",
    dramaticStakes: "Eternal moral victory: Where there is Krishna the Lord of Yoga and Partha the archer, there victory and Dharma shall reign forever."
  }
];

export const DHARMAKSHETRA_DIALOGUES: FeatureFilmDialogue[] = [
  {
    id: "dia_15m_01",
    actNumber: 1,
    character: "Dhanurdhara Arjuna",
    actorRole: "The Conflicted Pandava Prince",
    timestampSec: 30,
    timecodeFormatted: "00:30.00",
    emotion: "Commanding Eagerness",
    text: {
      hi: "सेनयोरुभयोर्मध्ये रथं स्थापय मेऽच्युत। हे अच्युत, दोनों सेनाओं के मध्य में मेरे इस रथ को खड़ा कीजिए ताकि मैं देख सकूं कि धर्म के इस युद्ध में मुझसे युद्ध करने कौन आया है।",
      en: "Draw up my chariot between both armies, O Achyuta, so that I may behold those who stand eager for battle in this great clash of righteousness.",
      sa: "सेनयोरुभयोर्मध्ये रथं स्थापय मेऽच्युत। यावदेतान्निरीक्षेऽहं योद्धुकामानवस्थितान्॥",
      es: "Detén mi carro entre ambos ejércitos, ¡oh Achyuta!, para que pueda contemplar a quienes anhelan la batalla.",
      fr: "Arrête mon char entre les deux armées, ô Achyuta, afin que je contemple ceux qui brûlent de combattre.",
      ja: "おお、アチュタよ、両軍の間に我が戦車を止めよ。戦いを望む者たちの姿を見届けん。"
    }
  },
  {
    id: "dia_15m_02",
    actNumber: 1,
    character: "Bhagwan Shri Krishna",
    actorRole: "Yogeshwara (Supreme Divine Guide)",
    timestampSec: 105,
    timecodeFormatted: "01:45.00",
    emotion: "Gentle Omniscient Calm",
    text: {
      hi: "पार्थ, पश्यैतान् समवेतान् कुरूनिति। हे पार्थ, इन सभी एकत्रित कौरवों और अपने कुल के योद्धाओं को भली-भांति देखो।",
      en: "Behold, O Partha, all the assembled Kurus gathered here upon this sacred plain of destiny.",
      sa: "पार्थ पश्यैतान् समवेतान् कुरूनिति॥",
      es: "He aquí, oh Partha, a todos los reunidos sobre este suelo sagrado del destino.",
      fr: "Regarde, ô Partha, tous les Kurus rassemblés ici sur cette plaine sacrée du destin.",
      ja: "パルタよ、見よ。運命の聖なる平原に集いしクル族の者たちを。"
    }
  },
  {
    id: "dia_15m_03",
    actNumber: 2,
    character: "Dhanurdhara Arjuna",
    actorRole: "The Conflicted Pandava Prince",
    timestampSec: 195,
    timecodeFormatted: "03:15.00",
    emotion: "Sorrowful Agony (विषाद योग)",
    text: {
      hi: "हे वासुदेव, गांडीव मेरे हाथ से छूट रहा है... त्वचा जल रही है। इन स्वजनों, पूज्य भीष्म और द्रोण को मारकर मैं कैसा विजय और कैसा राज्य चाहूं?",
      en: "O Vasudeva, the Gandiva bow slips from my trembling hands... my skin burns. What victory, what kingdom, or what happiness could I desire by slaying my own kin, revered Bhishma and Drona?",
      sa: "गाण्डीवं स्रंसते हस्तात्त्वक्चैव परिदह्यते। न च शक्नोम्यवस्थातुं भ्रमतीव च मे मनः॥",
      es: "¡Oh Vasudeva! El arco Gandiva resbala de mis manos temblorosas... ¿Qué victoria o qué reino desearía a costa de mis propios mayores?",
      fr: "Ô Vasudeva, l'arc Gandiva glisse de mes mains tremblantes... Quelle victoire pourrais-je désirer en versant le sang de mes propres aînés ?",
      ja: "おお、ヴァースデーヴァよ。震える手からガンディーヴァが滑り落ちる…尊き師や祖父を討ち、何のための勝利であろうか。"
    }
  },
  {
    id: "dia_15m_04",
    actNumber: 2,
    character: "Dhanurdhara Arjuna",
    actorRole: "The Conflicted Pandava Prince",
    timestampSec: 270,
    timecodeFormatted: "04:30.00",
    emotion: "Despairing Surrender",
    text: {
      hi: "गुरुनहत्वा हि महानुभावान् श्रेयो भोक्तुं भैक्ष्यमपीह लोके। इन महानुभाव गुरुजनों को मारने की अपेक्षा मैं इस संसार में भिक्षा मांगकर जीवन बिताना अधिक श्रेष्ठ समझता हूं। मैं युद्ध नहीं करूंगा!",
      en: "Better it would be to live in this world by begging alms than to slay these great-souled teachers! Stained with their blood would be any feast of sovereignty. I shall not fight!",
      sa: "गुरुनहत्वा हि महानुभावान् श्रेयो भोक्तुं भैक्ष्यमपीह लोके। न योत्स्य इति गोविन्दमुक्त्वा तूष्णीं बभूव ह॥",
      es: "¡Mejor sería vivir de limosnas que quitar la vida a estos nobles maestros! ¡No lucharé!",
      fr: "Il vaudrait mieux mendier dans ce monde que de tuer ces maîtres magnanimes ! Je ne combattrai pas !",
      ja: "この高潔なる師たちを殺めるよりは、乞食をして生きる方が遥かに勝る。私は戦わぬ！"
    }
  },
  {
    id: "dia_15m_05",
    actNumber: 3,
    character: "Bhagwan Shri Krishna",
    actorRole: "Yogeshwara (Supreme Divine Guide)",
    timestampSec: 375,
    timecodeFormatted: "06:15.00",
    emotion: "Divine Wisdom (सांख्य योग)",
    text: {
      hi: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः। तुम उनके लिए शोक करते हो जो शोक करने योग्य नहीं हैं, और विद्वानों जैसी बातें करते हो!",
      en: "You grieve for those who need no grief, yet speak words of apparent wisdom. The truly wise grieve neither for the living nor for the dead.",
      sa: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः॥",
      es: "Te lamentas por quienes no merecen pesar, aunque hablas con palabras doctas. Los sabios no lloran a los vivos ni a los muertos.",
      fr: "Tu t'affliges pour ceux qui ne méritent nulle peine, tout en tenant des discours de sagesse. Les vrais sages ne pleurent ni les vivants ni les morts.",
      ja: "嘆くべきでない者たちのために嘆きながら、知者のような言葉を語るのか。賢者は生者も死者も嘆かぬ。"
    }
  },
  {
    id: "dia_15m_06",
    actNumber: 3,
    character: "Bhagwan Shri Krishna",
    actorRole: "Yogeshwara (Supreme Divine Guide)",
    timestampSec: 450,
    timecodeFormatted: "07:30.00",
    emotion: "The Immortal Soul (आत्मनः अमरत्व)",
    text: {
      hi: "नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः। न चैनं क्लेदयन्त्यापो न शोषयति मारुतः। वासांसि जीर्णानि यथा विहाय... आत्मा अजर, अमर और शाश्वत है, पार्थ!",
      en: "Weapons cannot cleave the soul, nor can fire burn it. Water cannot wet it, nor can the wind dry it. As a person casts off worn-out garments and puts on new ones, so the soul casts off worn-out bodies. The soul is eternal, Partha!",
      sa: "नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः। न चैनं क्लेदयन्त्यापो न शोषयति मारुतः॥",
      es: "Las armas no hieren el alma, ni el fuego la calcina. Así como uno muda vestiduras gastadas, el alma muda cuerpos. ¡El alma es inmortal, Partha!",
      fr: "Le glaive ne peut trancher l'âme, ni la flamme la consumer. Comme l'on quitte un habit usé, l'âme quitte un corps éphémère. L'âme est éternelle, Partha !",
      ja: "武器も魂を裂けず、火もこれを焼き尽くさぬ。古き衣を脱ぎ捨てるが如く、魂は新たな肉体をまとう。魂は不変にして永遠なのだ！"
    }
  },
  {
    id: "dia_15m_07",
    actNumber: 3,
    character: "Bhagwan Shri Krishna",
    actorRole: "Yogeshwara (Supreme Divine Guide)",
    timestampSec: 525,
    timecodeFormatted: "08:45.00",
    emotion: "Cosmic Time Manifestation (कालोऽस्मि)",
    text: {
      hi: "कालोऽस्मि लोकक्षयकृत्प्रवृद्धो लोकान् समाहर्तुमिह प्रवृत्तः। मैं लोकों का नाश करने वाला महाकाल हूं! तुम्हारे बिना भी ये सभी योद्धा काल के गाल में समा चुके हैं। निमित्तमात्रं भव सव्यसाचिन्!",
      en: "I am Time, the cosmic destroyer of all worlds, here manifest to absorb creation! Even without your action, not one of these warriors arrayed against you shall survive destiny. Be merely the instrument, O ambidextrous archer!",
      sa: "कालोऽस्मि लोकक्षयकृत्प्रवृद्धो लोकान् समाहर्तुमिह प्रवृत्तः। ऋतेऽपि त्वां न भविष्यन्ति सर्वे येऽवस्थिताः प्रत्यनीकेषु योधाः॥",
      es: "¡Yo soy el Tiempo, el supremo destructor de mundos! Aun sin ti, ninguno de estos guerreros escapará a su sino. ¡Sé tan solo mi instrumento sagrado!",
      fr: "Je suis le Temps, le grand destructeur des mondes ! Même sans ton bras, nul parmi ces guerriers n'échappera au destin. Sois simplement l'instrument, noble archer !",
      ja: "我は時なり、世界を滅ぼす大いなる力！汝が戦わずとも、敵陣の勇士たちは誰一人として運命を免れ得ぬ。ただ我の具となりて起て！"
    }
  },
  {
    id: "dia_15m_08",
    actNumber: 4,
    character: "Bhagwan Shri Krishna",
    actorRole: "Yogeshwara (Supreme Divine Guide)",
    timestampSec: 615,
    timecodeFormatted: "10:15.00",
    emotion: "The Supreme Command (कर्मण्येवाधिकारस्ते)",
    text: {
      hi: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि। योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। उठो पार्थ, अधर्म का विनाश करो!",
      en: "Your sacred right is to perform your prescribed duty alone, never to claim its fruits. Let not the fruit of action be your motive, nor let your soul cling to inaction. Established in Yoga, perform your duty! Arise, Dhananjaya, and defend Dharma!",
      sa: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      es: "Tu derecho es solo cumplir con tu deber sagrado, jamás a sus frutos. ¡Afirmado en el Yoga, levántate, Dhananjaya, y defiende el Dharma!",
      fr: "Ton droit ne concerne que ton devoir sacré, jamais ses fruits. Établi dans le Yoga, lève-toi, Dhananjaya, et triomphe pour le Dharma !",
      ja: "汝の権利はただ義務を果たすことのみにあり、その果報にはあらず。執着を捨て、ヨガに立ちて起て、ダナンジャヤよ！"
    }
  },
  {
    id: "dia_15m_09",
    actNumber: 4,
    character: "Dhanurdhara Arjuna",
    actorRole: "The Conflicted Pandava Prince",
    timestampSec: 705,
    timecodeFormatted: "11:45.00",
    emotion: "Triumphant Awakening (करिष्ये वचनं तव)",
    text: {
      hi: "नष्टो मोहः स्मृतिर्लब्धा त्वत्प्रसादान्मयाच्युत। स्थितोऽस्मि गतसन्देहः करिष्ये वचनं तव! हे अच्युत, मेरा मोह नष्ट हो गया, मुझे आत्म-स्मृति प्राप्त हुई। मेरे समस्त संशय मिट चुके हैं, मैं आपके आदेश का पालन करूंगा!",
      en: "My delusion is shattered, my divine memory restored by your grace, O Achyuta! I stand firm, all doubts extinguished. I shall act according to your supreme command!",
      sa: "नष्टो मोहः स्मृतिर्लब्धा त्वत्प्रसादान्मयाच्युत। स्थितोऽस्मि गतसन्देहः करिष्ये वचनं तव॥",
      es: "¡Mi ilusión se ha disipado y mi memoria ha vuelto por tu gracia, oh Achyuta! Mis dudas se han ido. ¡Actuaré según tu palabra sagrada!",
      fr: "Mon illusion est brisée, ma mémoire retrouvée par ta grâce, ô Achyuta ! Mes doutes sont anéantis. J'accomplirai ta volonté !",
      ja: "迷妄は砕かれ、御身の恩寵により神聖なる記憶が甦りました！全ての疑念は晴れました。御身の命のままに戦います！"
    }
  },
  {
    id: "dia_15m_10",
    actNumber: 5,
    character: "Sanjaya",
    actorRole: "The Divine-Vision Narrator",
    timestampSec: 810,
    timecodeFormatted: "13:30.00",
    emotion: "Eternal Prophecy & Reverence",
    text: {
      hi: "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः। तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥ जहां योगेश्वर भगवान श्रीकृष्ण हैं और जहां गांडीवधारी अर्जुन हैं, वहां निश्चय ही विजय, समृद्धि और सनातन धर्म है!",
      en: "Wherever there is Krishna the Master of Yoga, and wherever there is Partha the supreme archer, there surely shall abide eternal victory, prosperity, and moral order. Such is my firm conviction!",
      sa: "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः। तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥",
      es: "Dondequiera que esté Krishna, el Señor del Yoga, y donde esté Partha, el arquero supremo, allí morarán la victoria inquebrantable, la gloria y el Dharma.",
      fr: "Là où se trouve Krishna, le Maître du Yoga, et là où se tient Partha, l'archer suprême, là résident à jamais la victoire, la prospérité et la justice éternelle.",
      ja: "ヨーガの主クリシュナあるところ、大弓の射手パルタあるところ、そこにこそ不変の勝利、栄光、そしてダルマが永久に宿るのだ。"
    }
  }
];

export function generate118CinematicShots(): CinematicShot[] {
  const shots: CinematicShot[] = [];
  let currentTime = 0;

  const headings = [
    { heading: "EXT. KURUKSHETRA PLAINS - WIDE HORIZON - DAWN", act: 1, type: "Extreme Wide Aerial", lens: "Panavision Primo 28mm T2.0", motion: "Slow Epic Jib Descending Through Golden Mist", light: "Sunrise Amber Rim Light", chars: ["Vast Armies of Pandavas & Kauravas"] },
    { heading: "EXT. KAURAVA LINES - LOW-ANGLE TRACKING", act: 1, type: "Low-Angle Dutch Tilt", lens: "Panavision Anamorphic 40mm", motion: "Low Dolly past Elephant Regiments", light: "Morning Shadow & Polished Bronze", chars: ["Pitamaha Bhishma", "Duryodhana"] },
    { heading: "EXT. PANDAVA CHARIOT - THE WHITE STALLIONS", act: 1, type: "Tracking Dolly", lens: "Cooke S4 50mm T1.3", motion: "High-Speed Dynamic Tracking at Wheel Level", light: "Backlit Sunbeams & Dust Kick", chars: ["Four White Celestial Stallions"] },
    { heading: "EXT. CHARIOT DECK - SRI KRISHNA AT THE REINS", act: 1, type: "Close-Up Hero", lens: "Panavision 85mm Portrait T1.4", motion: "Subtle Push-In on the Yogeshwara's Face", light: "Sudarshana Aura & Radiant Gold", chars: ["Bhagwan Shri Krishna"] },
    { heading: "EXT. ARJUNA'S GAZE - THE OPPOSING TIER", act: 1, type: "Extreme Close-Up", lens: "Macro 100mm T2.8", motion: "Static Tension Holding on Eyeline", light: "Direct Amber Reflection in Pupils", chars: ["Dhanurdhara Arjuna"] },
    { heading: "EXT. BETWEEN THE TWO ARMIES - EPIC STILLNESS", act: 1, type: "Wide Battle Canvas", lens: "35mm Anamorphic Widescreen", motion: "Chariot Halts in Center of Millions", light: "Vast Open Battlefield Exposure", chars: ["Krishna", "Arjuna", "Chariot"] },
    
    // Act 2
    { heading: "EXT. CHARIOT - ARJUNA BEHOLDS BHISHMA", act: 2, type: "Medium Two-Shot", lens: "50mm Anamorphic", motion: "Gentle Tracking Over Shoulder", light: "Cooling Shadow over Chariot Deck", chars: ["Arjuna", "Bhishma (distance)"] },
    { heading: "EXT. ARJUNA'S HANDS - GANDIVA SLIPS", act: 2, type: "Extreme Close-Up", lens: "100mm Macro", motion: "Downward Tilt Following Bow to Floor", light: "Dust Particle Bokeh", chars: ["Arjuna's Trembling Fingers", "Gandiva"] },
    { heading: "EXT. ARJUNA FALLS IN GRIEF (VISHADA YOGA)", act: 2, type: "Medium Two-Shot", lens: "35mm T1.4", motion: "Crane Slowly Descending to Knee Level", light: "Muted Desaturated Earth Tones", chars: ["Arjuna weeping", "Krishna observing"] },
    { heading: "EXT. KRISHNA TURNS - BENEVOLENT WITNESS", act: 2, type: "Close-Up Hero", lens: "85mm Primo", motion: "Slow Push-In with Golden Lens Flare", light: "Warm Divine Key Light", chars: ["Bhagwan Shri Krishna"] },

    // Act 3
    { heading: "EXT. KURUKSHETRA - TIME FREEZES (STILLNESS)", act: 3, type: "Extreme Wide Aerial", lens: "18mm Ultra-Wide", motion: "360-Degree Orbital Sweep Around Chariot", light: "Golden Stasis & Suspended Dust", chars: ["Frozen Armies", "Active Chariot"] },
    { heading: "EXT. KRISHNA IMPARTS SANKHYA YOGA", act: 3, type: "Close-Up Hero", lens: "50mm T1.3", motion: "Steady Handheld Intimacy", light: "Celestial Halo Radiance", chars: ["Bhagwan Shri Krishna"] },
    { heading: "EXT. COSMIC VISHWAROOPA - UNIVERSAL SCALE", act: 3, type: "Wide Battle Canvas", lens: "Anamorphic 35mm", motion: "Infinite Zoom-Out Revealing Cosmic Mandalas", light: "Supernova Flare & Nebular Starlight", chars: ["Cosmic Form (Vishwaroopa)"] },
    { heading: "EXT. ARJUNA BLINDED BY AWE & TERROR", act: 3, type: "Extreme Close-Up", lens: "85mm Portrait", motion: "Rapid Zoom-In with Anamorphic Breathing", light: "Multi-Prismatic Chromatic Light", chars: ["Arjuna with Folded Hands"] },
    { heading: "EXT. TIME THE DESTROYER (KALO'SMI)", act: 3, type: "Low-Angle Dutch Tilt", lens: "24mm Wide Low", motion: "Towering Tilt Up into Fiery Heavens", light: "Deep Crimson & Solar Gold", chars: ["Supreme Cosmic Time"] },

    // Act 4
    { heading: "EXT. ARJUNA RISES - DISPELLED DELUSION", act: 4, type: "Low-Angle Dutch Tilt", lens: "35mm Anamorphic", motion: "Heroic Tilt Up from Floor to Stand", light: "Blazing Morning Key & Armor Flash", chars: ["Dhanurdhara Arjuna"] },
    { heading: "EXT. RECLAIMING THE GANDIVA LONG-BOW", act: 4, type: "Close-Up Hero", lens: "50mm T1.3", motion: "Dynamic Whip-Pan to Bow Stringing", light: "Golden Glint on Bow Horns", chars: ["Arjuna stringing Gandiva"] },
    { heading: "EXT. KRISHNA BLOWS PANCHAJANYA CONCH", act: 4, type: "Close-Up Hero", lens: "85mm Close-Up", motion: "Low Push-In with Conch Resonating", light: "Divine Sunlight Rim", chars: ["Bhagwan Shri Krishna"] },
    { heading: "EXT. FOUR WHITE STALLIONS CHARGE", act: 4, type: "Tracking Dolly", lens: "28mm Anamorphic High-Speed", motion: "Ground-Level High-Speed Tracking (48fps)", light: "Golden Dust Volumetrics", chars: ["Divine Chariot Charging"] },

    // Act 5
    { heading: "EXT. BATTLEFIELD HORIZON - THE DAWN OF DHARMA", act: 5, type: "Extreme Wide Aerial", lens: "21mm Ultra-Wide Panoramic", motion: "Slow Majestic Crane Ascending 300 Feet", light: "Full Brilliant Sunlight over Plain", chars: ["Kurukshetra Panorama"] },
    { heading: "EXT. SANJAYA'S VISION - KING DHRITARASHTRA", act: 5, type: "Medium Two-Shot", lens: "50mm Prime", motion: "Slow Lateral Tracking across Palace Pillar", light: "Chamber Candlelight & Distant Horizon", chars: ["Sanjaya", "Dhritarashtra"] },
    { heading: "EXT. FINAL HEROIC TABLEAU - KRISHNA & ARJUNA", act: 5, type: "Wide Battle Canvas", lens: "35mm Anamorphic 2.39:1", motion: "Monumental Hero Silhouette Against Sun", light: "Iconic Golden Hour Rembrandt Key", chars: ["Yogeshwara Krishna", "Partha Arjuna"] },
    { heading: "EXT. THEATRICAL END CREDITS - KODAK VISION3 GRAIN", act: 5, type: "Crane Down", lens: "50mm Cinema Anamorphic", motion: "Slow Fade Through Starlight to Credit Roll", light: "Pure Cinematic Black with Gold Typography", chars: ["Master Production Credits", "C2PA Provenance"] }
  ];

  const totalShots = 118;
  const avgDuration = 900 / totalShots;

  for (let i = 0; i < totalShots; i++) {
    const template = headings[i % headings.length];
    const shotDuration = Number((avgDuration + ((i % 3) - 1) * 1.2).toFixed(2));
    const startSec = Number(currentTime.toFixed(2));
    currentTime += shotDuration;
    const endSec = i === totalShots - 1 ? 900.0 : Number(currentTime.toFixed(2));

    let actNum = 1;
    if (startSec >= 765) actNum = 5;
    else if (startSec >= 570) actNum = 4;
    else if (startSec >= 345) actNum = 3;
    else if (startSec >= 165) actNum = 2;

    const shotNumStr = String(i + 1).padStart(3, "0");
    shots.push({
      shotNumber: i + 1,
      actNumber: actNum,
      timecodeStartSec: startSec,
      timecodeEndSec: endSec,
      durationSec: Number((endSec - startSec).toFixed(2)),
      heading: `${template.heading} [#${shotNumStr}]`,
      shotType: template.type as any,
      cameraMotion: template.motion,
      lens: template.lens,
      lighting: template.light,
      characters: template.chars,
      actionDescription: `Shot #${i + 1} captures ${template.heading.toLowerCase()}. ${template.motion} timed with musical swell.`,
      soundCue: `Foley stem: ${template.chars[0]} movements, conch overtone, 5.1 surround ambience.`
    });
  }

  return shots;
}

export const DHARMAKSHETRA_118_SHOTS = generate118CinematicShots();
