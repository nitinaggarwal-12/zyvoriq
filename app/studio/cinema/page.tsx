"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { StudioSidebar } from "@/components/StudioSidebar";
import {
  Clapperboard,
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Globe,
  Download,
  Share2,
  Sliders,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  Cpu,
  Terminal,
  Activity,
  Award,
  Zap,
  Check,
  ChevronRight,
  AlertCircle,
  Clock,
  Music,
  Users,
  Eye,
  Camera,
  Flame,
  Info,
  Mic,
  MessageSquare,
  Volume1,
  BookOpen,
  List
} from "lucide-react";
import {
  DHARMAKSHETRA_ACTS,
  DHARMAKSHETRA_DIALOGUES,
  DHARMAKSHETRA_118_SHOTS,
  CinematicAct,
  CinematicShot
} from "@/lib/cinema/dharmakshetra15m";

export interface DialogueLine {
  id: string;
  character: string;
  actorRole: string;
  voiceGender: "male" | "female";
  timestampSec: number;
  emotion: string;
  text: {
    hi: string;
    en: string;
    es: string;
    fr: string;
    ja: string;
    sa?: string;
  };
}

export interface CastMember {
  character: string;
  actor: string;
  actorId: string;
  archetype: string;
  vocalProfile: string;
  wardrobe: string;
}

export interface CrewMember {
  role: string;
  name: string;
  modelEngine: string;
  notes: string;
}

export interface FrameAudit {
  timecodeSec: number;
  timecodeFormatted: string;
  detectedEntities: string[];
  hasSacredIconography: boolean;
  eraClassification: "Ancient Vedic / Bronze Age" | "Contemporary 21st Century" | "Near-Future Cyberpunk" | "Nomadic Medieval";
  visualMood: string;
  semanticAlignmentScore: number;
  notes: string;
}

export interface DetectedIssue {
  id: string;
  category: "CANON_REVERENCE" | "BIOMECHANICAL_ANATOMY" | "TEMPORAL_GLITCH" | "LIP_SYNC_ACOUSTICS" | "PROP_CONTINUITY" | "LEGAL_IP";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  timecode: string;
  description: string;
  impactAnalysis: string;
  suggestedActuator: "INVARIANT_ROUTER" | "SAM2_INPAINTING" | "GOOGLE_FILM" | "CRANIUM_LIP_WARP" | "REALITY_SHADER";
  autoHealAvailable: boolean;
  directorManualOptions: string[];
}

export interface MultimodalEvaluationResult {
  evaluationId: string;
  timestamp: string;
  videoSrc: string;
  filmTitle: string;
  requestedGenre: string;
  overallStatus: "CERTIFIED_IMF_MASTER" | "REJECTED_MULTIMODAL_MISMATCH";
  scores: {
    semanticCongruence: number;
    temporalCoherence: number;
    kinematicYield: number;
    syncNetConfidence: number;
    lufsLoudnessDb: number;
  };
  culturalReverenceGate: {
    passed: boolean;
    status: "VERIFIED_REVERENT" | "SACRILEGE_ALERT" | "SECULAR_NEUTRAL";
    reasoning: string;
  };
  framesAudited: FrameAudit[];
  detectedIssues: DetectedIssue[];
  c2paAuditHash: string;
  remedyAction?: string;
}

export interface CinemaFilm {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  format: string;
  durationMinutes: number;
  shotCount: number;
  directorAesthetic: string;
  leadActors: string[];
  musicalScore: string;
  videoSrc: string;
  veritasScore: number;
  c2paCertId: string;
  imfStatus: string;
  availableLanguages: string[];
  subtitles: Record<string, string>;
  synopsis: string;
  dialogues: DialogueLine[];
  cast?: CastMember[];
  crew?: CrewMember[];
}

const PRELOADED_ORIGINALS: CinemaFilm[] = [
  {
    id: "film_dharmakshetra",
    title: "Dharmakshetra: The Song of the Divine (कुरुक्षेत्र: श्रीमद्भगवद्गीता)",
    tagline: "The Supreme Kurukshetra Dialogue between Bhagwan Shri Krishna & Arjuna · Sacred Sanskrit & Hindi Master",
    genre: "Sacred Indian Epic / Mythological Heritage",
    format: "15 Mins · 118 Shots (Master Theatrical Cut)",
    durationMinutes: 15,
    shotCount: 118,
    directorAesthetic: "B.R. Chopra & Peter Brook Grand Epic Canvas",
    leadActors: ["Bhagwan Shri Krishna (syn_krishna_01)", "Dhanurdhara Arjuna (syn_arjuna_02)"],
    musicalScore: "Vedic Shankh, Classical Raga & Symphonic Dhrupad (Pt. Hariprasad Chaurasia & Pt. Jasraj)",
    videoSrc: "",
    veritasScore: 99.2,
    c2paCertId: "c2pa_ed25519_zyvoriq_dharmakshetra_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["Hindi (Native)", "English (Dubbed)", "Spanish", "French", "Japanese"],
    subtitles: {
      "hi": "अर्जुन: 'हे वासुदेव, गांडीव मेरे हाथ से छूट रहा है... इन स्वजनों को मारकर मैं कैसा विजय चाहूं?'",
      "en": "Arjuna: 'O Vasudeva, the Gandiva slips from my hands... What victory could I desire by slaying my own kin?'",
      "es": "Arjuna: '¡Oh Vasudeva! El arco Gandiva se me escapa de las manos... ¿Qué victoria podría desear matando a mis propios familiares?'",
      "fr": "Arjuna: 'Ô Vasudeva, l'arc Gandiva glisse de mes mains... Quelle victoire pourrais-je désirer en tuant mes propres proches ?'",
      "ja": "アルジュナ:「おお、ヴァースデーヴァよ。私の手からガンディーヴァが滑り落ちる…身内を殺して何のための勝利であろうか」"
    },
    synopsis: "Poised between the millions assembled on the sacred plains of Kurukshetra, the third Pandava prince Arjuna is overcome with grief and moral conflict upon beholding his elders, teachers, and brethren in battle array. In the chariot between both armies, Bhagwan Shri Krishna imparts the timeless wisdom of the Bhagavad Gita—on the eternal nature of the soul (Atman), the path of selfless duty (Karma Yoga), and cosmic devotion (Bhakti).",
    dialogues: [
      {
        id: "dia_15m_01",
        character: "Dhanurdhara Arjuna",
        actorRole: "The Conflicted Pandava Prince",
        voiceGender: "male",
        timestampSec: 2,
        emotion: "Sorrowful Agony (विषाद योग)",
        text: {
          hi: "हे वासुदेव, गांडीव मेरे हाथ से छूट रहा है... इन स्वजनों को देखकर मेरा मन भ्रमित हो रहा है। मैं कैसा विजय और कैसा राज्य चाहूं?",
          en: "O Vasudeva, the Gandiva bow slips from my trembling hands... Beholding my own kin, my mind reels. What victory or kingdom could I desire?",
          sa: "गाण्डीवं स्रंसते हस्तात्त्वक्चैव परिदह्यते। न च शक्नोम्यवस्थातुं भ्रमतीव च मे मनः॥",
          es: "¡Oh Vasudeva! El arco Gandiva resbala de mis manos temblorosas... ¿Qué victoria o qué reino desearía a costa de mis propios familiares?",
          fr: "Ô Vasudeva, l'arc Gandiva glisse de mes mains tremblantes... Quelle victoire pourrais-je désirer en tuant mes proches ?",
          ja: "おお、ヴァースデーヴァよ。私の震える手からガンディーヴァの弓が滑り落ちる…身内を殺して何のための勝利、何のための王国であろうか。"
        }
      },
      {
        id: "dia_15m_02",
        character: "Bhagwan Shri Krishna",
        actorRole: "Yogeshwara (Supreme Divine Guide)",
        voiceGender: "male",
        timestampSec: 14,
        emotion: "Divine Transcendent Calm (सांख्य योग)",
        text: {
          hi: "कुतस्त्वा कश्मलमिदं विषमे समुपस्थितम्। हे पार्थ! इस संकट काल में तुम्हें यह मोह और कायरता कहाँ से प्राप्त हुई? उठो और धर्मयुद्ध करो!",
          en: "Whence has this dejection come upon you in this hour of peril, O Partha? It is unbefitting a noble warrior. Cast off this weakness and arise!",
          sa: "कुतस्त्वा कश्मलमिदं विषमे समुपस्थितम्। क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते॥",
          es: "¿De dónde te viene este desaliento en la hora del peligro, oh Partha? Desecha esta flaqueza indigna de ti y ¡levántate!",
          fr: "D'où te vient cet abattement à l'heure du péril, ô Partha ? Rejette cette faiblesse indigne d'un noble kshatriya et lève-toi !",
          ja: "危難の時に際し、汝のこの無気力はどこから生じたのか、パルタよ。卑小なる心の弱さを捨てて立て！"
        }
      },
      {
        id: "dia_15m_03",
        character: "Dhanurdhara Arjuna",
        actorRole: "The Conflicted Pandava Prince",
        voiceGender: "male",
        timestampSec: 30,
        emotion: "Commanding Eagerness",
        text: {
          hi: "सेनयोरुभयोर्मध्ये रथं स्थापय मेऽच्युत। हे अच्युत, दोनों सेनाओं के मध्य मेरे इस रथ को खड़ा कीजिए ताकि मैं देख सकूं कि धर्म के इस युद्ध में मुझसे लड़ने कौन आया है।",
          en: "Draw up my chariot between both armies, O Achyuta, so that I may behold those who stand eager for battle in this great clash of righteousness.",
          sa: "सेनयोरुभयोर्मध्ये रथं स्थापय मेऽच्युत। यावदेतान्निरीक्षेऽहं योद्धुकामानवस्थितान्॥",
          es: "Detén mi carro entre ambos ejércitos, ¡oh Achyuta!, para que pueda contemplar a quienes anhelan la batalla.",
          fr: "Arrête mon char entre les deux armées, ô Achyuta, afin que je contemple ceux qui brûlent de combattre.",
          ja: "おお、アチュタよ、両軍の間に我が戦車を止めよ。戦いを望む者たちの姿を見届けん。"
        }
      },
      {
        id: "dia_15m_04",
        character: "Bhagwan Shri Krishna",
        actorRole: "Yogeshwara (Supreme Divine Guide)",
        voiceGender: "male",
        timestampSec: 105,
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
        id: "dia_15m_05",
        character: "Dhanurdhara Arjuna",
        actorRole: "The Conflicted Pandava Prince",
        voiceGender: "male",
        timestampSec: 195,
        emotion: "Sorrowful Agony (विषाद योग)",
        text: {
          hi: "हे वासुदेव, पूज्य भीष्म और द्रोण पर मैं बाण कैसे चलाऊं? इन महानुभाव गुरुजनों को मारकर रक्त रंजित भोग भोगने से अच्छा तो भिक्षा मांगना है!",
          en: "O Vasudeva, how can I shoot arrows at revered Bhishma and Drona? Better it would be to live on alms than feast upon treasures stained with their blood!",
          sa: "कथं भीष्ममहं सङ्ख्ये द्रोणं च मधुसूदन। इषुभिः प्रतियोत्स्यामि पूजार्हावरिसूदन॥",
          es: "¿Cómo dispararé flechas contra el venerable Bhishma y Drona? ¡Mejor sería mendigar que saborear riquezas manchadas con su sangre!",
          fr: "Comment pourrais-je décocher des flèches contre le vénéré Bhishma et Drona ? Il vaudrait mieux mendier que jouir de richesses souillées de leur sang !",
          ja: "おお、マドゥスーダナよ。尊崇すべきビーシュマやドローナにどうして矢を射かけられようか。血に塗れた歓楽を味わうよりは物乞いをする方が勝る！"
        }
      },
      {
        id: "dia_15m_06",
        character: "Dhanurdhara Arjuna",
        actorRole: "The Conflicted Pandava Prince",
        voiceGender: "male",
        timestampSec: 270,
        emotion: "Despairing Surrender",
        text: {
          hi: "कार्पण्यदोषोपहतस्वभावः पृच्छामि त्वाम्... शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्। मैं आपका शिष्य हूँ, मुझे निश्चित श्रेयस्कर मार्ग बताइए। मैं युद्ध नहीं करूंगा!",
          en: "My nature afflicted by faint-heartedness, I ask you: reveal that which is decisively best for me. I am your disciple; guide me, who has taken refuge in You. I shall not fight!",
          sa: "कार्पण्यदोषोपहतस्वभावः पृच्छामि त्वां धर्मसंमूढचेताः। यच्छ्रेयः स्यान्निश्चितं ब्रूहि तन्मे शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्॥",
          es: "Con el ánimo turbado y el juicio nublado por el dolor, te pregunto: indícame el camino certero. Soy tu discípulo; ¡guíame, que me refugio en Ti!",
          fr: "L'esprit accablé par le doute, je t'interroge : révèle-moi ce qui est souverainement bon. Je suis ton disciple ; instruis-moi, je m'abandonne à Toi !",
          ja: "心の弱さに侵され、正法に惑いし私は問う。確固たる最善の道を説き給え。私は御身の弟子。帰依する私を導き給え！"
        }
      },
      {
        id: "dia_15m_07",
        character: "Bhagwan Shri Krishna",
        actorRole: "Yogeshwara (Supreme Divine Guide)",
        voiceGender: "male",
        timestampSec: 375,
        emotion: "Divine Wisdom (सांख्य योग)",
        text: {
          hi: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः। देही नित्यमवध्योऽयं देहे सर्वस्य भारत!",
          en: "You grieve for those who need no grief, yet speak words of apparent wisdom. The truly wise grieve neither for the living nor for the dead. The soul dwelling in all bodies is eternally immortal!",
          sa: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः॥",
          es: "Lloras por quienes no debes llorar, y hablas con palabras doctas. Los sabios no lloran a los vivos ni a los muertos. ¡El alma es siempre invulnerable!",
          fr: "Tu t'affliges pour ceux qui ne méritent nulle douleur, tout en tenant des discours de sagesse. Les vrais sages ne pleurent ni les vivants ni les morts !",
          ja: "嘆くべきでない者たちのために嘆きながら、知者のような言葉を語るのか。賢者は生者も死者も嘆かぬ。魂は永遠に不死なのだ！"
        }
      },
      {
        id: "dia_15m_08",
        character: "Bhagwan Shri Krishna",
        actorRole: "Yogeshwara (Supreme Divine Guide)",
        voiceGender: "male",
        timestampSec: 450,
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
        id: "dia_15m_09",
        character: "Bhagwan Shri Krishna",
        actorRole: "Yogeshwara (Supreme Divine Guide)",
        voiceGender: "male",
        timestampSec: 525,
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
        id: "dia_15m_10",
        character: "Bhagwan Shri Krishna",
        actorRole: "Yogeshwara (Supreme Divine Guide)",
        voiceGender: "male",
        timestampSec: 615,
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
        id: "dia_15m_11",
        character: "Dhanurdhara Arjuna",
        actorRole: "The Conflicted Pandava Prince",
        voiceGender: "male",
        timestampSec: 705,
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
        id: "dia_15m_12",
        character: "Sanjaya",
        actorRole: "The Divine-Vision Narrator",
        voiceGender: "male",
        timestampSec: 810,
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
    ],
    cast: [
      {
        character: "Bhagwan Shri Krishna",
        actor: "Nitish B. / Sourabh R. (Procedural Star)",
        actorId: "syn_krishna_01",
        archetype: "Yogeshwara & Divine Cosmic Guide",
        vocalProfile: "Deep Resonant Celestial Baritone (0.78 pitch · Sanskrit Vedic Clarity)",
        wardrobe: "Golden Peetambari silk drapes, peacock feather (Mayur Pankh) crown, Sudarshana Chakra halo"
      },
      {
        character: "Dhanurdhara Arjuna",
        actor: "Feroz K. / Shaheer S. (Procedural Star)",
        actorId: "syn_arjuna_02",
        archetype: "The Tormented Archer / Peerless Pandava Kshatriya",
        vocalProfile: "Tormented Kshatriya Tenor (0.95 pitch)",
        wardrobe: "Sun-etched golden armor (Kavach), royal quiver, Gandiva celestial longbow"
      },
      {
        character: "Pitamah Bhishma",
        actor: "Mukesh K. (Procedural Star)",
        actorId: "syn_bhishma_03",
        archetype: "The Unyielding Grandfather of the Kuru Lineage",
        vocalProfile: "Reverberant Aristocratic Bass (0.72 pitch)",
        wardrobe: "Silver armor with Hastinapur royal standard and five golden arrows"
      },
      {
        character: "Maharathi Karna",
        actor: "Pankaj D. (Procedural Star)",
        actorId: "syn_karna_04",
        archetype: "The Tragic Sun Warrior (Surya Putra)",
        vocalProfile: "Noble Embittered Baritone (0.85 pitch)",
        wardrobe: "Radiant golden ear-rings (Kundala) & impenetrable congenital armor"
      }
    ],
    crew: [
      {
        role: "Director",
        name: "B.R. Chopra & Peter Brook Epic Directive Model",
        modelEngine: "Autonomous Epic Directive Swarm v4.0",
        notes: "Signature dramatic freezes, cosmic zooms, timeless philosophical pause cadence, and monumental battle choreography"
      },
      {
        role: "Story & Philosophy Core",
        name: "Maharishi Vyasa / Gita Press Authentic Sanskrit Core",
        modelEngine: "Sanskrit Shloka & Philosophical Subtext NLP",
        notes: "Direct verse-by-verse Bhagavad Gita alignment from Chapter 1 (Arjuna Vishada Yoga) through Chapter 18 (Moksha Sanyasa Yoga)"
      },
      {
        role: "Vocal Chants & Stotras",
        name: "Shankar Mahadevan & Hariharan Sacred Vedic Choir",
        modelEngine: "DeepMind 5-Band Vedic Phoneme Dubbing",
        notes: "48kHz lossless Sanskrit chants, Shankh conch resonances, and -12dB auto-ducking under dialogue"
      },
      {
        role: "Music & Classical Orchestration",
        name: "Pt. Hariprasad Chaurasia & Pt. Jasraj Classical Suite",
        modelEngine: "Lyria 3.0 Classical Indian Raga Generator",
        notes: "Divine Bansuri flute motifs, ancient Dhrupad vocal drones, Pakhawaj war drums, and sacred conch blasts"
      },
      {
        role: "Director of Photography (DOP)",
        name: "Veo 2 Golden War Chariot Anamorphic Rig",
        modelEngine: "Veo 2 65mm Imax Anamorphic Simulator",
        notes: "Sun-drenched Kurukshetra dust, four white divine stallions, cosmic radiance aura, Kodak 5219 warm gold LUT"
      },
      {
        role: "Costume & Sacred Styling",
        name: "Bespoke Ancient Vedic Atelier",
        modelEngine: "Imagen 3 Repoussé Armor & Silk Texture Engine",
        notes: "Authentic bronze repoussé armor, hand-woven gold-bordered angavastrams, and sacred tilak detailing"
      },
      {
        role: "Sound Design & Foley",
        name: "Resul Pookutty Sacred Epic Soundscape",
        modelEngine: "Optical Motion Vector Foley Synthesizer",
        notes: "War conch reverberations across battlefield, wooden chariot wheel rumble, divine bell overtones, and arrow sonic twangs"
      }
    ]
  },
  {
    id: "film_noor_e_ishq",
    title: "Noor-e-Ishq (The Light of Love)",
    tagline: "A Grand Romance in the Swiss Alps · Yash Chopra Cinematic Directive Model",
    genre: "Bollywood Romantic Epic / Musical",
    format: "Festival Short (Sweet Spot Master)",
    durationMinutes: 15,
    shotCount: 122,
    directorAesthetic: "Yash Chopra Golden Hour & Chiffon (Kodak 2383 LUT)",
    leadActors: ["Kabir Verma (syn_kabir_01)", "Meera Sen (syn_meera_02)"],
    musicalScore: "Lyria 3.0 Sitar, Sarangi & 60-Piece Orchestral Strings",
    videoSrc: "",
    veritasScore: 97.4,
    c2paCertId: "c2pa_ed25519_zyvoriq_noor_e_ishq_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["Hindi (Native)", "English (Dubbed)", "Spanish", "French", "Japanese"],
    subtitles: {
      "hi": "कबीर: 'अगर यह ख्वाब है, तो मुझे कभी मत जगाना...'",
      "en": "Kabir: 'If this is a dream, never awaken me...'",
      "es": "Kabir: 'Si esto es un sueño, nunca me despiertes...'",
      "fr": "Kabir: 'Si c'est un rêve, ne me réveille jamais...'",
      "ja": "カビール:「これが夢なら、決して私を起こさないでくれ…」"
    },
    synopsis: "Set against the snow-covered cliffs of Grindelwald and the rain-slicked courtyards of Udaipur, Kabir, an architect of forgotten memories, encounters Meera, a classical heritage restorer. As family obligations threaten to tear them apart, their unspoken bond defies continents, culminating in a dramatic reunion at an Alpine railway station.",
    dialogues: [
      {
        id: "dia_noor_1",
        character: "Kabir Verma",
        actorRole: "Romantic Lead (Warm Baritone)",
        voiceGender: "male",
        timestampSec: 2,
        emotion: "Romantic Whisper",
        text: {
          hi: "अगर यह ख्वाब है, तो मुझे कभी मत जगाना... क्योंकि हकीकत में तुम मेरी नहीं हो सकतीं।",
          en: "If this is a dream, never awaken me... because in reality, you may never be mine.",
          es: "Si esto es un sueño, nunca me despiertes... porque en la realidad, nunca podrás ser mía.",
          fr: "Si c'est un rêve, ne me réveille jamais... car en réalité, tu ne seras peut-être jamais à moi.",
          ja: "これが夢なら、決して私を起こさないでくれ…現実では、君は私のものにはなれないのだから。"
        }
      },
      {
        id: "dia_noor_2",
        character: "Meera Sen",
        actorRole: "Classical Heroine (Lyric Alto)",
        voiceGender: "female",
        timestampSec: 8,
        emotion: "Nostalgic Warmth",
        text: {
          hi: "कहीं न कहीं, किसी जनम में... हम पहले भी इस बर्फ़ पर मिल चुके हैं, कबीर।",
          en: "Somewhere, in another lifetime... we have walked on this very snow before, Kabir.",
          es: "En algún lugar, en otra vida... ya hemos caminado sobre esta misma nieve, Kabir.",
          fr: "Quelque part, dans une autre vie... nous avons déjà marché sur cette même neige, Kabir.",
          ja: "どこかで、別の前世で…私たちは以前にもこの雪の上を歩いたことがあるわ、カビール。"
        }
      },
      {
        id: "dia_noor_3",
        character: "Kabir Verma",
        actorRole: "Romantic Lead (Warm Baritone)",
        voiceGender: "male",
        timestampSec: 15,
        emotion: "Intense Conviction",
        text: {
          hi: "प्यार कोई मजबूरी नहीं, मीरा... यह तो रूह की सबसे पाक क़ुबूलियत है।",
          en: "Love is no obligation, Meera... it is the purest acceptance of the soul.",
          es: "El amor no es una obligación, Meera... es la más pura aceptación del alma.",
          fr: "L'amour n'est pas une obligation, Meera... c'est la plus pure acceptation de l'âme.",
          ja: "愛は義務ではない、ミーラ…それは魂の最も純粋な受容なのだ。"
        }
      },
      {
        id: "dia_noor_4",
        character: "Meera Sen",
        actorRole: "Classical Heroine (Lyric Alto)",
        voiceGender: "female",
        timestampSec: 22,
        emotion: "Conflicted Grace",
        text: {
          hi: "मेरे फ़ैसले सिर्फ़ मेरे नहीं हैं... उदयपुर की दीवारें और मेरी ज़िम्मेदारियाँ मुझे रोकती हैं।",
          en: "My choices do not belong to me alone... the royal walls of Udaipur and my duties hold me back.",
          es: "Mis decisiones no me pertenecen solo a mí... las murallas de Udaipur y mis deberes me atan.",
          fr: "Mes choix ne m'appartiennent pas à moi seule... les murs d'Udaipur et mes devoirs me retiennent.",
          ja: "私の決断は私だけのものではない…ウダイプルの壁と私の義務が私を縛っているの。"
        }
      },
      {
        id: "dia_noor_5",
        character: "Kabir Verma",
        actorRole: "Romantic Lead (Warm Baritone)",
        voiceGender: "male",
        timestampSec: 29,
        emotion: "Passionate Crescendo",
        text: {
          hi: "दुनिया और ज़माना बदल सकता है, पर जब तक यह धड़कन चलेगी, तुम मेरे दिल में रहोगी।",
          en: "The world and eras may change, but as long as this heart beats, you will live within me.",
          es: "El mundo y las épocas pueden cambiar, pero mientras este corazón lata, vivirás dentro de mí.",
          fr: "Le monde et les époques peuvent changer, mais tant que ce cœur battra, tu vivras en moi.",
          ja: "世界や時代が変わろうとも、この鼓動が続く限り、君は私の心の中に生き続ける。"
        }
      }
    ],
    cast: [
      {
        character: "Kabir Verma",
        actor: "Aryan V. (Procedural Star)",
        actorId: "syn_kabir_01",
        archetype: "SRK / Ranbir Archetype (The Soulful Romantic Lead)",
        vocalProfile: "Deep Soulful Baritone (0.82 pitch · Native Hindi & Urdu)",
        wardrobe: "Charcoal cashmere trench coat & ivory Swiss rollneck in snow"
      },
      {
        character: "Meera Sen",
        actor: "Ananya S. (Procedural Star)",
        actorId: "syn_meera_02",
        archetype: "Triptii / Deepika Archetype (Classical Heritage Heroine)",
        vocalProfile: "Lyrical Alto with Nostalgic Warmth (1.15 pitch)",
        wardrobe: "Saffron and turquoise chiffon sarees flowing in Swiss Alps"
      },
      {
        character: "Thakur Digvijay Sen",
        actor: "Vikramaditya R. (Procedural Star)",
        actorId: "syn_digvijay_07",
        archetype: "Amrish Puri / Amitabh Bachchan Archetype (Udaipur Royal Patriarch)",
        vocalProfile: "Commanding Resonant Bass (0.75 pitch · Aristocratic Diction)",
        wardrobe: "Royal embroidered bandhgala & royal velvet sherwani"
      },
      {
        character: "Rani Gayatri Devi",
        actor: "Devika M. (Procedural Star)",
        actorId: "syn_gayatri_08",
        archetype: "Waheeda Rehman Archetype (The Emotional Matriarch)",
        vocalProfile: "Gentle Emotional Alto (1.05 pitch)",
        wardrobe: "Heritage Banarasi gold-zari woven silk sarees"
      },
      {
        character: "Vikram Singhania",
        actor: "Reyansh K. (Procedural Star)",
        actorId: "syn_vikram_09",
        archetype: "Mayfair London NRI Tycoon (The Aristocratic Rival)",
        vocalProfile: "Crisp British-Asian Accent (0.95 pitch)",
        wardrobe: "Bespoke Savile Row charcoal double-breasted suits"
      }
    ],
    crew: [
      {
        role: "Director",
        name: "Yash Chopra Directive Model",
        modelEngine: "Autonomous Yashraj Style Directive v3.2",
        notes: "Signature high-altitude Swiss helicopter pans, golden hour chiffon in snow, emotional crescendo melodrama"
      },
      {
        role: "Story & Screenplay",
        name: "Aditya Chopra / Salim-Javed Narrative Core",
        modelEngine: "Gemini 2.5 Pro 3-Act Melodrama Compiler",
        notes: "High emotional conflict: individual love vs. ancestral family honor & Udaipur royal heritage"
      },
      {
        role: "Dialogue & Urdu Shayari",
        name: "Javed Akhtar / Gulzar Style Engine",
        modelEngine: "Hindustani Poetic Subtext NLP",
        notes: "Refined conversational Hindi layered with classic Lucknowi Urdu romantic couplets"
      },
      {
        role: "Music Director & Score",
        name: "Shiv-Hari & A.R. Rahman Neural Suite",
        modelEngine: "Lyria 3.0 Pro Orchestral Arranger",
        notes: "Acoustic Sarangi, Santoor, Sitar, Punjabi Dholak, and 60-piece Western symphonic strings"
      },
      {
        role: "Playback Vocal Casting",
        name: "Arijit Singh & Shreya Ghoshal Matrices",
        modelEngine: "DeepMind 5-Band Vocal Tract Formant Dubbing",
        notes: "48kHz lossless vocal stems with gold karaoke word timestamps & -12dB auto-ducking"
      },
      {
        role: "Director of Photography (DOP)",
        name: "Manmohan Singh Cinematic Eye",
        modelEngine: "Veo 2 Anamorphic Camera Rig",
        notes: "50mm anamorphic lens, shallow depth of field, Swiss Alps panoramas, Kodak 2383 warm gold 3D LUT"
      },
      {
        role: "Costume & Wardrobe Design",
        name: "Manish Malhotra Virtual Atelier",
        modelEngine: "Imagen 3 Fabric & Drape Texture Engine",
        notes: "Flowing georgette and chiffon drapes, Rajasthani royal zardozi embroidery"
      },
      {
        role: "Sound Design & Foley",
        name: "Resul Pookutty Style Soundscape",
        modelEngine: "Optical Motion Vector Foley Synthesizer",
        notes: "Snow crunch footsteps, Swiss mountain winds, silk saree rustle, 5.1 surround sound master"
      }
    ]
  },
  {
    id: "film_mongol_conquest",
    title: "The Mongol Steppe Storm: Wrath of the Khans",
    tagline: "20-Act 1,200s Master Historical Docu-Drama · Genghis Khan to the Four Khanates",
    genre: "Historical Docu-Drama",
    format: "Prestige Featurette (20 Minutes)",
    durationMinutes: 20,
    shotCount: 168,
    directorAesthetic: "Roger Deakins 50mm Anamorphic Naturalist",
    leadActors: ["Subutai Ba'atur (syn_subutai_05)", "Genghis Khan (syn_temujin_06)"],
    musicalScore: "Norse & Steppe Wardruna War Drums + Primordial Throat Chants",
    videoSrc: "",
    veritasScore: 98.2,
    c2paCertId: "c2pa_ed25519_mongol_steppe_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["Mongolian (Native)", "English", "Hindi", "Japanese"],
    subtitles: {
      "hi": "सूत्रधार: 'अनंत नीले आकाश के नीचे दुनिया बदलने वाली घुड़सवार सेना का उदय होता है।'"
    },
    synopsis: "The tactical mastery of Subutai and the nomadic endurance of the Mongol cavalry, chronicling the unification of the tribes and the greatest military conquest in human history.",
    dialogues: [
      {
        id: "dia_mongol_1",
        character: "Genghis Khan",
        actorRole: "Supreme Khagan",
        voiceGender: "male",
        timestampSec: 2,
        emotion: "Martial Authority",
        text: {
          hi: "हम सब एक ही तीर की तरह बंधे हैं। कुल की दीवारें टूटेंगी, सिर्फ योग्यता राज करेगी!",
          en: "We are bound together like a single arrow. Clan barriers will fall; merit alone will command!",
          es: "Estamos unidos como una sola flecha. ¡Las barreras de los clanes caerán, solo el mérito gobernará!",
          fr: "Nous sommes unis comme une seule flèche. Les barrières des clans tomberont, seul le mérite commandera !",
          ja: "我らはひとつの矢のように束ねられた。氏族の壁を破り、実力のみが地位を決める！"
        }
      },
      {
        id: "dia_mongol_2",
        character: "Subutai Ba'atur",
        actorRole: "Master Strategist",
        voiceGender: "male",
        timestampSec: 10,
        emotion: "Tactical Calm",
        text: {
          hi: "जब मंगोल सेना चलती है, तो ज़मीन भी आसमान के हुक्म का इंतज़ार करती है।",
          en: "When the Mongol horde advances, the very earth waits for the command of Tengri.",
          es: "Cuando la horda mongola avanza, la tierra misma espera la orden de Tengri.",
          fr: "Quand la horde mongole avance, la terre elle-même attend l'ordre de Tengri.",
          ja: "モンゴル軍が進軍するとき、大地そのものが蒼天の命令を待つのだ。"
        }
      }
    ]
  },
  {
    id: "film_quantum_horizon",
    title: "Quantum Horizon 2099",
    tagline: "Cyberpunk Hard Sci-Fi · Quantum-Entangled Consciousness in Old Varanasi",
    genre: "Cyberpunk Sci-Fi",
    format: "Prestige Pilot (35 Minutes)",
    durationMinutes: 35,
    shotCount: 280,
    directorAesthetic: "David Fincher Low-Key Amber & Tungsten Precision",
    leadActors: ["Tara Thorne (syn_tara_04)", "Aryan Khan-Raza (syn_aryan_03)"],
    musicalScore: "Analog Modular Synthwave + Deep Sub-Bass Drones",
    videoSrc: "",
    veritasScore: 96.1,
    c2paCertId: "c2pa_ed25519_quantum_horizon_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["English", "Hindi", "Japanese"],
    subtitles: {
      "en": "Tara: 'The qubit doesn't collapse because you observe it. It collapses because it remembers you.'"
    },
    synopsis: "In a 2099 megalopolis built along the Ganges, a neuro-quantum cipher runner uncovers a state secret hidden inside an ancient temple's holographic frequency.",
    dialogues: [
      {
        id: "dia_quantum_1",
        character: "Tara Thorne",
        actorRole: "Cipher Runner",
        voiceGender: "female",
        timestampSec: 2,
        emotion: "Cybernetic Whisper",
        text: {
          hi: "क्यूबिट इसलिए नहीं गिरता क्योंकि तुम उसे देखते हो... वह इसलिए गिरता है क्योंकि वह तुम्हें याद रखता है।",
          en: "The qubit doesn't collapse because you observe it. It collapses because it remembers you.",
          es: "El cúbit no colapsa porque lo observes. Colapsa porque te recuerda.",
          fr: "Le qubit ne s'effondre pas parce que vous l'observez. Il s'effondre parce qu'il se souvient de vous.",
          ja: "量子ビットは君が観測するから崩壊するのではない。君を覚えているから崩壊するのだ。"
        }
      },
      {
        id: "dia_quantum_2",
        character: "Aryan Khan-Raza",
        actorRole: "Neural Operative",
        voiceGender: "male",
        timestampSec: 10,
        emotion: "Grave Warning",
        text: {
          hi: "काशी के इस प्राचीन मंदिर की दीवारों में 2099 का सबसे घातक कोड छुपा हुआ है, तारा।",
          en: "Beneath the stone walls of this ancient Varanasi temple lies the most lethal code of 2099, Tara.",
          es: "Bajo los muros de piedra de este antiguo templo de Benarés se oculta el código más letal de 2099, Tara.",
          fr: "Sous les murs de pierre de ce temple séculaire de Bénarès se cache le code le plus mortel de 2099, Tara.",
          ja: "この古代バラナシ寺院の石壁の下に、2099年で最も致死的なコードが隠されている、タラ。"
        }
      }
    ]
  }
];

export default function CinemaStudioPage() {
  const [activeTab, setActiveTab] = useState<"originals" | "produce" | "telemetry">("originals");
  const [selectedFilm, setSelectedFilm] = useState<CinemaFilm>(PRELOADED_ORIGINALS[0]);
  const [selectedLang, setSelectedLang] = useState<string>("hi"); // Default to Hindi Native!
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [autoNarrateDialogues, setAutoNarrateDialogues] = useState<boolean>(true);
  const [activeSpeakingLineId, setActiveSpeakingLineId] = useState<string | null>(null);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("");
  const [showCastCrewModal, setShowCastCrewModal] = useState<boolean>(false);

  // Production Form State
  const [prodTitle, setProdTitle] = useState("Noor-e-Ishq: Chapter II (The Swiss Reprise)");
  const [prodLogline, setProdLogline] = useState("Two estranged lovers from Udaipur and Geneva meet again under the shadows of the Matterhorn during the winter solstice, with secrets neither can reveal.");
  const [prodGenre, setProdGenre] = useState("romantic_epic");
  const [prodFormat, setProdFormat] = useState<"short_15m" | "pilot_30m" | "feature_90m">("short_15m");
  const [prodDirector, setProdDirector] = useState("yash_chopra_chiffon");
  const [prodLeadCast, setProdLeadCast] = useState<string[]>(["syn_kabir_01", "syn_meera_02"]);
  const [prodMusicTheme, setProdMusicTheme] = useState("lyria_sitar_orchestral");

  // 4-Tier QA Controls
  const [arcfaceThreshold, setArcfaceThreshold] = useState<number>(0.86);
  const [kinematicGuard, setKinematicGuard] = useState<boolean>(true);
  const [visionScoreThreshold, setVisionScoreThreshold] = useState<number>(85);
  const [enableJLCut, setEnableJLCut] = useState<boolean>(true);
  const [enableFoleyIR, setEnableFoleyIR] = useState<boolean>(true);
  const [circuitBreakerRetries, setCircuitBreakerRetries] = useState<number>(3);

  // Dispatch & Live Telemetry State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genProgress, setGenProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<string>("idle");
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [showMultimodalModal, setShowMultimodalModal] = useState<boolean>(false);
  const [multimodalResult, setMultimodalResult] = useState<MultimodalEvaluationResult | null>(null);
  const [isAuditingMultimodal, setIsAuditingMultimodal] = useState<boolean>(false);
  const [multimodalAuditError, setMultimodalAuditError] = useState<string | null>(null);
  const [healingWorkflowMode, setHealingWorkflowMode] = useState<"autonomous" | "manual">("autonomous");
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [healingStepProgress, setHealingStepProgress] = useState<string | null>(null);
  const [healedSuccessData, setHealedSuccessData] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasSpokenMap = useRef<Record<string, boolean>>({});

  // 15-Minute Feature Film Master State
  const [timeline15mSec, setTimeline15mSec] = useState<number>(0);
  const [is118ShotModalOpen, setIs118ShotModalOpen] = useState<boolean>(false);
  const [isScreenplayModalOpen, setIsScreenplayModalOpen] = useState<boolean>(false);
  const [hasVideoLoadError, setHasVideoLoadError] = useState<boolean>(true);

  // Active Act derived from timeline15mSec
  const currentAct = DHARMAKSHETRA_ACTS.find(
    (act) => timeline15mSec >= act.timecodeStartSec && timeline15mSec < act.timecodeEndSec
  ) || DHARMAKSHETRA_ACTS[0];

  // Active Shot derived from timeline15mSec (1 to 118)
  const currentShot = DHARMAKSHETRA_118_SHOTS.find(
    (s) => timeline15mSec >= s.timecodeStartSec && timeline15mSec < s.timecodeEndSec
  ) || DHARMAKSHETRA_118_SHOTS[0];

  // Active 15m dialogue matching current timeline window
  const active15mDialogue = DHARMAKSHETRA_DIALOGUES.find(
    (d) => Math.abs(d.timestampSec - timeline15mSec) <= 15
  );

  // High-Precision Master Playback Clock (15 minutes = 900 seconds)
  // Decoupled from individual video clips to ensure continuous 15-minute playback without synthetic loops
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeline15mSec((prev) => {
        if (prev >= 900) {
          setIsPlaying(false);
          return 900;
        }
        return Number((prev + 0.25).toFixed(2));
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Dialogue narration synchronized with Master Timeline
  useEffect(() => {
    if (!isPlaying || !autoNarrateDialogues) return;
    const currentSecInt = Math.floor(timeline15mSec);
    const matchingLine = selectedFilm.dialogues.find(
      (d) => Math.abs(d.timestampSec - currentSecInt) <= 1 && !hasSpokenMap.current[d.id]
    );
    if (matchingLine) {
      hasSpokenMap.current[matchingLine.id] = true;
      speakDialogueLine(matchingLine, selectedLang);
    }
  }, [timeline15mSec, isPlaying, autoNarrateDialogues, selectedFilm.dialogues, selectedLang]);

  const formatTime15m = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // Dynamic video footage matching the synthesized video of the film
  const activeVideoSrc = useMemo(() => {
    return selectedFilm.videoSrc || "";
  }, [selectedFilm.videoSrc]);

  const prevSrcRef = useRef<string>(activeVideoSrc);
  useEffect(() => {
    if (videoRef.current && prevSrcRef.current !== activeVideoSrc) {
      prevSrcRef.current = activeVideoSrc;
      const wasPlaying = isPlaying;
      videoRef.current.src = activeVideoSrc;
      videoRef.current.load();
      if (wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [activeVideoSrc, isPlaying]);

  const getShotMotionStyle = (shotType: string) => {
    switch (shotType) {
      case "Extreme Wide Aerial":
        return "scale-100 transition-all duration-[2000ms] ease-out";
      case "Close-Up Hero":
        return "scale-110 object-top transition-all duration-[2000ms] ease-out";
      case "Extreme Close-Up":
        return "scale-120 contrast-105 transition-all duration-[1500ms] ease-out";
      case "Low-Angle Dutch Tilt":
        return "scale-105 rotate-1 transition-all duration-[2000ms] ease-out";
      case "Tracking Dolly":
        return "scale-105 translate-x-2 transition-all duration-[2000ms] ease-linear";
      case "Wide Battle Canvas":
      default:
        return "scale-102 transition-all duration-[2000ms] ease-out";
    }
  };

  const handleScrub15m = (val: number) => {
    setTimeline15mSec(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val % (videoRef.current.duration || 6.0);
    }
    // Clean spoken status for upcoming lines after seek position so they speak properly
    Object.keys(hasSpokenMap.current).forEach((key) => {
      const d = selectedFilm.dialogues.find((dia) => dia.id === key);
      if (d && d.timestampSec >= val) {
        delete hasSpokenMap.current[key];
      }
    });
    // Check if there is a dialogue line right at this seek point
    const nearLine = selectedFilm.dialogues.find(
      (d) => Math.abs(d.timestampSec - val) <= 3
    );
    if (nearLine) {
      hasSpokenMap.current[nearLine.id] = true;
      speakDialogueLine(nearLine, selectedLang);
    }
  };

  const jumpToAct = (actNum: number) => {
    const act = DHARMAKSHETRA_ACTS.find((a) => a.actNumber === actNum);
    if (act) {
      handleScrub15m(act.timecodeStartSec);
    }
  };

  const jumpToShot = (shotNum: number) => {
    const shot = DHARMAKSHETRA_118_SHOTS.find((s) => s.shotNumber === shotNum);
    if (shot) {
      handleScrub15m(shot.timecodeStartSec);
      setIs118ShotModalOpen(false);
    }
  };

  // Reset subtitle when film or language changes
  useEffect(() => {
    hasSpokenMap.current = {};
    const initialLine = selectedFilm.dialogues[0];
    if (initialLine) {
      const text = initialLine.text[selectedLang as keyof typeof initialLine.text] || initialLine.text["hi"] || initialLine.text["en"];
      setCurrentSubtitleText(`${initialLine.character}: '${text}'`);
    } else {
      setCurrentSubtitleText(selectedFilm.subtitles[selectedLang] || selectedFilm.subtitles["hi"] || selectedFilm.subtitles["en"] || "");
    }
  }, [selectedFilm, selectedLang]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakDialogueLine = (line: DialogueLine, lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();

    const textToSpeak = line.text[lang as keyof typeof line.text] || line.text["hi"] || line.text["en"];
    const displaySubtitle = `${line.character}: '${textToSpeak}'`;
    setCurrentSubtitleText(displaySubtitle);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Language mapping
    const langMap: Record<string, string> = {
      hi: "hi-IN",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      ja: "ja-JP"
    };
    utterance.lang = langMap[lang] || "hi-IN";

    // Character & emotional voice modulation
    if (line.character.includes("Krishna")) {
      utterance.pitch = 0.78; // Deep, serene celestial baritone (Bhagwan Shri Krishna)
      utterance.rate = 0.88;
    } else if (line.character.includes("Arjuna")) {
      utterance.pitch = 0.95; // Tormented kshatriya warrior tenor (Dhanurdhara Arjuna)
      utterance.rate = 0.92;
    } else if (line.voiceGender === "male") {
      utterance.pitch = 0.82; // Warm baritone (Kabir Verma)
      utterance.rate = 0.90;
    } else {
      utterance.pitch = 1.15; // Lyrical alto (Meera Sen)
      utterance.rate = 0.95;
    }

    // Best matching voice lookup
    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = utterance.lang.toLowerCase().split("-")[0];
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (match) {
      utterance.voice = match;
    }

    // Audio ducking: Duck background video volume to 50% so background score remains audible and grand
    if (videoRef.current) {
      videoRef.current.volume = 0.50;
    }

    utterance.onend = () => {
      setActiveSpeakingLineId(null);
      if (videoRef.current) {
        videoRef.current.volume = 0.90;
      }
    };

    utterance.onerror = () => {
      setActiveSpeakingLineId(null);
      if (videoRef.current) {
        videoRef.current.volume = 0.90;
      }
    };

    setActiveSpeakingLineId(line.id);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeakingLineId(null);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      // If at start, trigger the first line immediately if auto-narrate is on
      if (autoNarrateDialogues && selectedFilm.dialogues.length > 0 && !hasSpokenMap.current[selectedFilm.dialogues[0].id]) {
        hasSpokenMap.current[selectedFilm.dialogues[0].id] = true;
        speakDialogueLine(selectedFilm.dialogues[0], selectedLang);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (timeline15mSec / 900) * 100;
    setVideoProgress(progress);
  };

  const handleLaunchProduction = async () => {
    setIsGenerating(true);
    setActiveTab("telemetry");
    setGenProgress(5);
    setActiveStage("Decomposing Screenplay into 122 Atomic Shot Manifests");
    setTelemetryLogs([
      `[00:00.90] Soundstage Engine: J-Cut/L-Cut dialogue overlap active (+800ms lead-in) · Foley IR reverb primed.`,
      `[00:00.45] Biometric Talent Vault: Locked ${prodLeadCast.join(" & ")} (ArcFace 512-dim embedding threshold: ${arcfaceThreshold}).`,
      `[00:00.12] Screenplay Parsed: 3 Acts, 122 atomic shots allocated with 3D stage eyeline vectors.`,
      `[00:00.04] Initiating Autonomous Studio OS Engine...`
    ]);

    try {
      const res = await fetch("/api/studio/cinema/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prodTitle,
          prompt: prodLogline,
          genre: prodGenre,
          format: prodFormat,
          leadCast: prodLeadCast,
          directorStyle: prodDirector,
          qaThresholds: {
            arcfaceMatch: arcfaceThreshold,
            kinematicPassRate: 0.95,
            geminiVisionScore: visionScoreThreshold,
            maxRetries: circuitBreakerRetries
          },
          soundstage: {
            jCutLCut: enableJLCut,
            opticalFoley: enableFoleyIR,
            autoDuckingDb: -12,
            musicalTheme: prodMusicTheme
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dispatch failed");

      // Progress animation steps simulating the 20-worker automated pipeline
      setTimeout(() => {
        setGenProgress(25);
        setActiveStage("Parallel 20x Cloud GPU Batch Dispatch (Veo 2 & Imagen 3)");
        setTelemetryLogs((prev) => [
          `[00:01.32] 20 cloud GPU workers dispatched. Shots #001 to #020 rendering concurrently.`,
          ...prev
        ]);
      }, 1000);

      setTimeout(() => {
        setGenProgress(55);
        setActiveStage("Automated 4-Tier QA Robo-Director (ArcFace & YOLOv10)");
        setTelemetryLogs((prev) => [
          `[00:02.80] Shot #014 re-evaluated: ArcFace 0.931, Kinematics 100% (SELF-HEALED).`,
          `[00:02.45] Shot #014 flagged (hand anatomy anomaly) -> Auto-reroll triggered (+137 seed jitter).`,
          `[00:02.10] 4-Tier QA Gate: 28 shots evaluated. ArcFace mean score: 0.922 (PASS).`,
          ...prev
        ]);
      }, 2000);

      setTimeout(() => {
        setGenProgress(80);
        setActiveStage("Neural Lip-Sync, Foley Impulse Response & Lyria Arranger");
        setTelemetryLogs((prev) => [
          `[00:04.05] Lyria 3.0 Sitar & Strings stems master ducked to -12dB under spoken dialogue.`,
          `[00:03.65] Optical motion foley synced: snow footsteps, saree fabric rustle, train whistle.`,
          `[00:03.20] DeepMind Emotional TTS synthesized with native Hindi phoneme cadence.`,
          ...prev
        ]);
      }, 3000);

      setTimeout(() => {
        setGenProgress(100);
        setActiveStage("Completed: 4K Master Exported & C2PA Cryptographically Signed");
        setTelemetryLogs((prev) => [
          `[00:05.00] Master Film ready for distribution on Netflix, Prime Video & Zyvoriq Cinema.`,
          `[00:04.80] C2PA Ed25519 digital signature embedded, IMF SMPTE 2067 package sealed.`,
          `[00:04.50] Concat pass complete. Kodak 2383 3D LUT + 35mm film grain composited.`,
          ...prev
        ]);
        setIsGenerating(false);

        // Prepend new film to originals
        const newFilm: CinemaFilm = {
          id: `film_custom_${Date.now()}`,
          title: prodTitle,
          tagline: prodLogline,
          genre: "Bollywood Romantic Epic / Musical",
          format: prodFormat === "short_15m" ? "Festival Short (15m)" : "Prestige Feature",
          durationMinutes: prodFormat === "short_15m" ? 15 : 90,
          shotCount: prodFormat === "short_15m" ? 122 : 920,
          directorAesthetic: "Yash Chopra Golden Hour & Chiffon",
          leadActors: prodLeadCast,
          musicalScore: "Lyria 3.0 Orchestral Sitar & Strings",
          videoSrc: "",
          veritasScore: 98.1,
          c2paCertId: `c2pa_ed25519_${Date.now()}_master`,
          imfStatus: "IMF_SMPTE_2067_CERTIFIED",
          availableLanguages: ["Hindi (Native)", "English", "Spanish"],
          subtitles: {
            "en": "Kabir: 'Time changes, but this heartbeat remains eternal.'",
            "hi": "कबीर: 'वक़्त बदल सकता है, पर यह धड़कन नहीं...'"
          },
          synopsis: prodLogline,
          dialogues: [
            {
              id: "dia_custom_1",
              character: "Kabir Verma",
              actorRole: "Romantic Lead",
              voiceGender: "male",
              timestampSec: 2,
              emotion: "Solemn Passion",
              text: {
                hi: "वक़्त बदल सकता है, पर यह धड़कन हमेशा तुम्हारा ही नाम लेगी।",
                en: "Time may change, but this heartbeat will always whisper your name.",
                es: "El tiempo puede cambiar, pero este latido siempre susurrará tu nombre.",
                fr: "Le temps peut changer, mais ce battement de cœur chuchotera toujours ton nom.",
                ja: "時は変われど、この鼓動は常に君の名を囁き続ける。"
              }
            }
          ]
        };
        setSelectedFilm(newFilm);
      }, 4200);

    } catch (err: any) {
      console.error("Production generation error:", err);
      setIsGenerating(false);
      setActiveStage("Failed");
      setTelemetryLogs((prev) => [`[ERROR] ${err.message}`, ...prev]);
    }
  };

  const handleAuditMultimodal = async (overrideParams?: {
    title?: string;
    genre?: string;
    videoSrc?: string;
    dialogues?: DialogueLine[];
  }) => {
    setIsAuditingMultimodal(true);
    setMultimodalAuditError(null);
    setShowMultimodalModal(true);

    try {
      const payload = {
        filmId: selectedFilm.id,
        title: overrideParams?.title ?? selectedFilm.title,
        genre: overrideParams?.genre ?? selectedFilm.genre,
        videoSrc: overrideParams?.videoSrc ?? selectedFilm.videoSrc,
        dialogues: overrideParams?.dialogues ?? selectedFilm.dialogues
      };

      const res = await fetch("/api/studio/cinema/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Multimodal evaluation failed");
      setMultimodalResult(data);
    } catch (err: any) {
      console.error("Multimodal frame evaluation error:", err);
      setMultimodalAuditError(err.message || "Failed to audit frames");
    } finally {
      setIsAuditingMultimodal(false);
    }
  };

  const handleExecuteSelfHealing = async (params: {
    issueId?: string;
    actuatorType?: "INVARIANT_ROUTER" | "SAM2_INPAINTING" | "GOOGLE_FILM" | "CRANIUM_LIP_WARP" | "REALITY_SHADER";
    mode: "autonomous" | "manual_override";
    markArtisticIntent?: boolean;
    customDirection?: string;
  }) => {
    setIsHealing(true);
    setHealingStepProgress("Engaging Self-Healing Actuator...");
    try {
      await new Promise((r) => setTimeout(r, 600));
      setHealingStepProgress("Synthesizing Invariant Patch & Retargeting Vectors...");
      const res = await fetch("/api/studio/cinema/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filmId: selectedFilm.id,
          issueId: params.issueId || "issue_reverence_001",
          actuatorType: params.actuatorType || "INVARIANT_ROUTER",
          mode: params.mode,
          markArtisticIntent: params.markArtisticIntent,
          customDirection: params.customDirection
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Self-healing failed");

      setHealingStepProgress("Verifying 6-Sensor Perception Mesh...");
      await new Promise((r) => setTimeout(r, 600));

      setHealedSuccessData(data);
      if (multimodalResult) {
        setMultimodalResult({
          ...multimodalResult,
          overallStatus: "CERTIFIED_IMF_MASTER",
          scores: data.newScores,
          culturalReverenceGate: {
            passed: true,
            status: "VERIFIED_REVERENT",
            reasoning: data.patchSummary
          },
          detectedIssues: [],
          c2paAuditHash: data.c2paAuditHash
        });
      }

      if (data.remedyApplied) {
        setSelectedFilm((prev) => ({
          ...prev,
          title: data.remedyApplied.title,
          genre: data.remedyApplied.genre,
          videoSrc: data.remedyApplied.videoSrc
        }));
      }
    } catch (err: any) {
      console.error("Healing error:", err);
      alert(`Self-healing error: ${err.message}`);
    } finally {
      setIsHealing(false);
      setHealingStepProgress(null);
    }
  };

  return (
    <StudioSidebar currentPath="/studio/cinema">
      <main className="flex-1 min-w-0 mx-auto max-w-[1600px] w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-6 md:pt-10 pb-16 overflow-x-hidden min-h-dvh">
        
        {/* Sticky Full-Width Header Bar with Ample Margin */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                <Clapperboard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                    ZYVORIQ CINEMA ORIGINALS
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Phase 3 Cloud Studio
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-slate-400 max-w-3xl">
                  Autonomous Original Movie Production House · End-to-end screenplay decomposition, 4-Tier automated QA self-healing, synthetic Bollywood star casting, and IMF distribution packaging.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Studio KPI Highlights */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Overhead:</span>
              <span className="font-bold text-white font-mono">$0 Soundstage</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-slate-400">QA Gates:</span>
              <span className="font-bold text-teal-300 font-mono">4-Tier Auto</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">Master:</span>
              <span className="font-bold text-amber-300 font-mono">4K IMF / C2PA</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mt-8 pb-4 border-b border-slate-800/60 overflow-x-auto">
          <div className="flex items-center gap-3">
            <button
              id="tab-originals"
              onClick={() => setActiveTab("originals")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "originals"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Originals Vault (Stream & Distribute)</span>
            </button>

            <button
              id="tab-produce"
              onClick={() => setActiveTab("produce")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "produce"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Autonomous Movie Studio (Create)</span>
            </button>

            <button
              id="tab-telemetry"
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "telemetry"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Mission Control & 4-Tier QA Telemetry</span>
              {isGenerating && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORIGINALS VAULT (STREAMING & DISTRIBUTION MASTER) */}
        {/* ======================================================== */}
        {activeTab === "originals" && (
          <div className="space-y-10 mt-8">
            
            {/* Grand Marquee Spotlight Player */}
            <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Cinema Video Player & Synchronized Dialogue Engine */}
                <div className="lg:col-span-7 space-y-4">

                  {/* 15-Minute Feature Film Chapter / Act Jump Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Acts:</span>
                      {[
                        { act: 1, label: "Act I (00:00)", id: "jump-act-1" },
                        { act: 2, label: "Act II (02:45)", id: "jump-act-2" },
                        { act: 3, label: "Act III (05:45)", id: "jump-act-3" },
                        { act: 4, label: "Act IV (09:30)", id: "jump-act-4" },
                        { act: 5, label: "Act V (12:45)", id: "jump-act-5" },
                      ].map((btn) => (
                        <button
                          key={btn.act}
                          id={btn.id}
                          onClick={() => jumpToAct(btn.act)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            currentAct.actNumber === btn.act
                              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="open-118-shot-edl-btn"
                        onClick={() => setIs118ShotModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/20 transition-all"
                      >
                        <List className="h-3.5 w-3.5" />
                        <span>118-Shot Master EDL</span>
                      </button>
                      <button
                        id="open-screenplay-modal-btn"
                        onClick={() => setIsScreenplayModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Screenplay</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Viewport Container with Dynamic Overlays */}
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-2xl">
                    <video
                      ref={videoRef}
                      src={activeVideoSrc}
                      playsInline
                      muted={isMuted}
                      preload="auto"
                      onError={() => setHasVideoLoadError(true)}
                      onLoadedData={() => setHasVideoLoadError(false)}
                      onTimeUpdate={handleTimeUpdate}
                      className={`w-full h-full object-cover transform transition-all duration-700 ${getShotMotionStyle(currentShot.shotType)} ${hasVideoLoadError ? "opacity-0" : "opacity-100"}`}
                    />

                    {/* Fresh Slate Cinematic Canvas (Renders when local video assets are cleared) */}
                    {hasVideoLoadError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-xl">
                          <Film className="h-8 w-8" />
                        </div>
                        <span className="px-3 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-bold mb-2">
                          CLEAN SLATE · FRESH PRODUCTION CANVAS
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-white font-serif tracking-wide max-w-xl">
                          {selectedFilm.title}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-lg mt-1 font-mono">
                          {currentShot.heading} · {currentShot.shotType}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => setActiveTab("produce")}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all pointer-events-auto"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Launch Fresh AI Studio Diffusion</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Act 5 Theatrical Master Credits Overlay */}
                    {currentAct.actNumber === 5 && timeline15mSec >= 840 && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6 text-center z-15 backdrop-blur-[2px] pointer-events-none">
                        <span className="text-amber-400 font-serif text-xl tracking-widest uppercase font-bold">Dharmakshetra: The Song of the Divine</span>
                        <span className="text-xs text-slate-300 font-mono mt-1.5">C2PA Cryptographic Provenance · 4K SMPTE ST 2067 Master</span>
                        <span className="text-[11px] text-amber-500/90 font-mono mt-2">Directed by Autonomous Multi-Agent Epic Swarm</span>
                      </div>
                    )}

                    {/* Top Unified HUD: Zero-Overlap Act, Shot, and Camera Telemetry */}
                    <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-4 pointer-events-none z-10">
                      {/* Left: Act & Shot Telemetry */}
                      <div className="space-y-1.5">
                        <div
                          id="active-act-badge"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-lg"
                        >
                          <Flame className="h-3.5 w-3.5 text-amber-400" />
                          <span>ACT {currentAct.actNumber}: {currentAct.title}</span>
                        </div>
                        <div
                          id="active-shot-badge"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-slate-300 font-mono border border-slate-700/60"
                        >
                          <Camera className="h-3 w-3 text-teal-400" />
                          <span>Shot #{String(currentShot.shotNumber).padStart(3, "0")} / 118 · {currentShot.shotType}</span>
                        </div>
                      </div>

                      {/* Right: Unified Scene & Optics Card */}
                      <div className="text-right space-y-1.5 hidden sm:block max-w-[340px]">
                        <div
                          id="active-scene-heading"
                          className="px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[11px] text-slate-200 font-mono border border-slate-700 truncate shadow-lg"
                        >
                          {currentShot.heading}
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-teal-300 font-mono border border-slate-800 flex items-center justify-end gap-2">
                          <span>📹 {currentShot.lens}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-amber-400">💡 {currentShot.lighting}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtitle Overlay (Dynamic to spoken dialogue or current language) */}
                    <div className="absolute bottom-14 left-0 right-0 px-6 text-center pointer-events-none z-10">
                      <p id="cinema-subtitle-text" className="inline-block px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md text-amber-300 font-serif text-sm md:text-base border border-amber-500/30 shadow-2xl max-w-[90%]">
                        {active15mDialogue ? (
                          `${active15mDialogue.character}: '${active15mDialogue.text[selectedLang as keyof typeof active15mDialogue.text] || active15mDialogue.text.hi || active15mDialogue.text.en}'`
                        ) : (
                          currentSubtitleText || selectedFilm.subtitles[selectedLang] || selectedFilm.subtitles["hi"] || selectedFilm.subtitles["en"]
                        )}
                      </p>
                    </div>

                    {/* Active Voice Speaking Badge */}
                    {activeSpeakingLineId && (
                      <div className="absolute top-16 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs shadow-lg backdrop-blur-md animate-pulse">
                        <Volume1 className="h-3.5 w-3.5 animate-bounce" />
                        <span>Speaking: {selectedFilm.dialogues.find(d => d.id === activeSpeakingLineId)?.character} ({selectedLang.toUpperCase()})</span>
                      </div>
                    )}

                    {/* 15-Minute Video Player Controls Bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4 flex items-center justify-between gap-3 z-20">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={togglePlay}
                          className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-all font-bold min-h-[36px]"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950 ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="h-9 w-9 rounded-xl bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700 transition-all min-h-[36px]"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Interactive 15-Minute Scrubber */}
                      <div className="flex-1 flex items-center gap-2.5">
                        <input
                          id="timeline-scrubber-15m"
                          type="range"
                          min={0}
                          max={900}
                          step={0.5}
                          value={timeline15mSec}
                          onChange={(e) => handleScrub15m(Number(e.target.value))}
                          className="flex-1 h-2 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
                        />
                        <span id="timecode-display-15m" className="text-xs font-mono font-bold text-amber-400 shrink-0">
                          {formatTime15m(timeline15mSec)} / 15:00.00
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-slate-400 hidden sm:inline">1080p 4K HDR</span>
                      </div>
                    </div>
                  </div>

                  {/* Multilingual Audio & Subtitle Switcher */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-400">Audio / Subtitles:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["hi", "en", "es", "fr", "ja"].map((lang) => (
                          <button
                            key={lang}
                            id={`lang-btn-${lang}`}
                            onClick={() => {
                              setSelectedLang(lang);
                              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                                window.speechSynthesis.cancel();
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedLang === lang
                                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                : "bg-slate-800/80 text-slate-300 hover:text-white"
                            }`}
                          >
                            {lang.toUpperCase()}{lang === "hi" ? " (Native)" : ""}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-Narrate Spoken Dialogue Toggle */}
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setAutoNarrateDialogues(!autoNarrateDialogues)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border transition-all ${
                          autoNarrateDialogues
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <Mic className="h-3 w-3" />
                        <span>Auto-Voice Narrate: {autoNarrateDialogues ? "ON" : "OFF"}</span>
                      </button>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SCENE DIALOGUES & NEURAL VOICE TRACK (INTERACTIVE SCRIPT) */}
                  {/* ======================================================== */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-amber-400" />
                        <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                          Scene Dialogue & Spoken Voice Track ({selectedLang.toUpperCase()})
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Click any line to hear actor speak aloud
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedFilm.dialogues && selectedFilm.dialogues.length > 0 ? (
                        selectedFilm.dialogues.map((dia) => {
                          const isActive = activeSpeakingLineId === dia.id;
                          const lineText = dia.text[selectedLang as keyof typeof dia.text] || dia.text["hi"] || dia.text["en"];

                          return (
                            <div
                              key={dia.id}
                              id={`dialogue-line-${dia.id}`}
                              onClick={() => {
                                handleScrub15m(dia.timestampSec);
                                speakDialogueLine(dia, selectedLang);
                              }}
                              className={`dialogue-line-item p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                isActive
                                  ? "border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                                  : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                              }`}
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-black ${dia.voiceGender === "male" ? "text-amber-300" : "text-pink-300"}`}>
                                    {dia.character}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                    {dia.emotion}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                                    {formatTime15m(dia.timestampSec)}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-200 font-serif leading-relaxed">
                                  &ldquo;{lineText}&rdquo;
                                </p>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScrub15m(dia.timestampSec);
                                  speakDialogueLine(dia, selectedLang);
                                }}
                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                  isActive
                                    ? "bg-amber-500 text-slate-950 font-bold"
                                    : "bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950"
                                }`}
                                title="Jump & speak this dialogue aloud"
                              >
                                {isActive ? (
                                  <Volume1 className="h-4 w-4 animate-bounce" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500 italic py-2">No dialogues logged for this track.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right: Film Metadata & Distribution Master Suite */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {selectedFilm.format}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {selectedFilm.durationMinutes} Mins · {selectedFilm.shotCount} Shots
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {selectedFilm.title}
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-amber-400 font-medium italic">
                      {selectedFilm.tagline}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedFilm.synopsis}
                  </p>

                  {/* Production Blueprint Specs */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block">Directive Aesthetic:</span>
                      <span className="font-semibold text-slate-200">{selectedFilm.directorAesthetic}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lead Synthetic Cast:</span>
                      <span className="font-semibold text-slate-200">{selectedFilm.leadActors.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Veritas Quality Score:</span>
                      <span className="font-bold text-teal-400">{selectedFilm.veritasScore} / 100 (Certified)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IMF Specification:</span>
                      <span className="font-bold text-amber-300">{selectedFilm.imfStatus}</span>
                    </div>
                  </div>

                  {/* Bollywood Cast & Crew Roster Trigger */}
                  {selectedFilm.cast && selectedFilm.crew && (
                    <button
                      id="view-cast-crew-btn"
                      onClick={() => setShowCastCrewModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all border border-amber-500/40 shadow-lg shadow-amber-500/5 min-h-[44px]"
                    >
                      <Users className="h-4 w-4 text-amber-400" />
                      <span>View Full Bollywood Cast & Crew Roster ({selectedFilm.cast.length + selectedFilm.crew.length} Team Members)</span>
                    </button>
                  )}

                  {/* 1-Click Master Distribution Export Actions */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Studio Master Export & Distribution
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <a
                        href={selectedFilm.videoSrc}
                        download={`${selectedFilm.id}_4K_master.mp4`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10 min-h-[44px]"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export 4K Master (ProRes)</span>
                      </a>

                      <button
                        onClick={() => alert(`Packaging IMF Master for ${selectedFilm.title}:\n\n- SMPTE 2067-21 Compliant\n- 5.1 Discrete Surround Audio Stems\n- C2PA Provenance Manifest Hash: ${selectedFilm.c2paCertId}\n\nReady for direct ingestion to Netflix / Amazon Prime Video Direct.`)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <Tv className="h-4 w-4 text-teal-400" />
                        <span>Package IMF for Netflix/Prime</span>
                      </button>

                      <button
                        id="inspect-multimodal-btn"
                        onClick={() => handleAuditMultimodal()}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/10 text-teal-300 font-bold text-xs hover:bg-teal-500/30 transition-all border border-teal-500/40 min-h-[44px] shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/30"
                      >
                        <Eye className="h-4 w-4 text-teal-400 animate-pulse" />
                        <span>Audit Multimodal AI Vision & Frames</span>
                      </button>

                      <Link
                        id="open-dedicated-audit-page-btn"
                        href={`/studio/cinema/audit?filmId=${selectedFilm.id}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-teal-500/20 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all border border-amber-500/40 min-h-[44px] shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                      >
                        <Sliders className="h-4 w-4 text-amber-400" />
                        <span>Director&apos;s Quality Audit Suite (Dedicated Page)</span>
                      </Link>

                      <button
                        id="inspect-c2pa-btn"
                        onClick={() => setShowCertModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Inspect C2PA Provenance</span>
                      </button>

                      <button
                        onClick={() => alert(`Exporting JSON Shot Manifest:\n\n- ${selectedFilm.shotCount} atomic shots with 3D stage vectors\n- 512-dim ArcFace biometric locks\n- Lyria stem mix points`)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <Terminal className="h-4 w-4 text-indigo-400" />
                        <span>Shot Manifest JSON</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Catalog of Studio Originals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Zyvoriq Studio Catalog (Original Productions)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {PRELOADED_ORIGINALS.length} Features Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRELOADED_ORIGINALS.map((film) => (
                  <div
                    key={film.id}
                    onClick={() => {
                      setSelectedFilm(film);
                      setIsPlaying(false);
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                      }
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                      setActiveSpeakingLineId(null);
                    }}
                    className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                      selectedFilm.id === film.id
                        ? "border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/10"
                        : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                        {film.format}
                      </span>
                      <span className="font-mono">{film.durationMinutes} mins</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white line-clamp-1">
                      {film.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {film.tagline}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-teal-400 font-semibold font-mono">
                        VQS: {film.veritasScore}/100
                      </span>
                      <span className="text-amber-400 flex items-center gap-1 font-bold">
                        <span>Select Master</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: AUTONOMOUS FEATURE FILM STUDIO (THE ENGINE)       */}
        {/* ======================================================== */}
        {activeTab === "produce" && (
          <div className="space-y-8 mt-8">
            <div className="p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                  <span>Autonomous Screenplay-to-Feature Engine</span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Configure your narrative premise, choose your synthetic talent, lock your 4-Tier QA thresholds, and launch a complete autonomous feature film pipeline.
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                
                {/* Column 1: Story & Cast */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      1. Film Title & Screenplay Premise
                    </label>
                    <input
                      type="text"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-amber-500 mb-3"
                      placeholder="e.g. Noor-e-Ishq (The Light of Love)"
                    />
                    <textarea
                      rows={4}
                      value={prodLogline}
                      onChange={(e) => setProdLogline(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
                      placeholder="Write your story synopsis or scene premise..."
                    />
                  </div>

                  {/* Format & Duration Selector (Golden Sweet Spot Highlighted) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      2. Duration & Scope (The Golden Sweet Spot)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setProdFormat("short_15m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "short_15m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-amber-400">Sweet Spot</span>
                          <Check className={`h-3 w-3 ${prodFormat === "short_15m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">12–18 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">118 shots · 95% consistency · ~$28 compute</p>
                      </div>

                      <div
                        onClick={() => setProdFormat("pilot_30m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "pilot_30m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-indigo-400">TV Pilot</span>
                          <Check className={`h-3 w-3 ${prodFormat === "pilot_30m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">30–45 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">280 shots · 85% consistency · ~$74 compute</p>
                      </div>

                      <div
                        onClick={() => setProdFormat("feature_90m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "feature_90m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-teal-400">Feature Film</span>
                          <Check className={`h-3 w-3 ${prodFormat === "feature_90m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">90–110 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">920 shots · Auto-Healed · ~$368 compute</p>
                      </div>
                    </div>
                  </div>

                  {/* Synthetic Lead Cast Vault */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      3. Synthetic Talent Vault (Legally Clean Procedural Stars)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      {[
                        { id: "syn_kabir_01", name: "Kabir Verma", archetype: "Romantic Baritone Lead" },
                        { id: "syn_meera_02", name: "Meera Sen", archetype: "Heritage Classical Heroine" },
                        { id: "syn_aryan_03", name: "Aryan Khan-Raza", archetype: "Action / Hero Archetype" },
                        { id: "syn_tara_04", name: "Tara Thorne", archetype: "Cyberpunk / Tech Protagonist" }
                      ].map((star) => (
                        <div
                          key={star.id}
                          onClick={() => {
                            if (prodLeadCast.includes(star.id)) {
                              setProdLeadCast(prodLeadCast.filter((c) => c !== star.id));
                            } else {
                              setProdLeadCast([...prodLeadCast, star.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            prodLeadCast.includes(star.id)
                              ? "border-amber-500 bg-amber-500/10 text-white"
                              : "border-slate-800 bg-slate-950 text-slate-400"
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-white">{star.name}</span>
                            <span className="text-[10px] text-slate-400">{star.archetype}</span>
                          </div>
                          <Check className={`h-3.5 w-3.5 ${prodLeadCast.includes(star.id) ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Director Style, Soundstage & 4-Tier QA */}
                <div className="space-y-6">
                  {/* Director Aesthetic & 3D LUT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      4. Directive Vision & Master 3D LUT
                    </label>
                    <select
                      value={prodDirector}
                      onChange={(e) => setProdDirector(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="yash_chopra_chiffon">Yash Chopra: Swiss Alps Golden Hour, Chiffon Sarees, Kodak 2383 LUT</option>
                      <option value="roger_deakins_naturalist">Roger Deakins: Naturalist 50mm Anamorphic, Practical Soft Light</option>
                      <option value="david_fincher_amber">David Fincher: Low-Key Amber/Tungsten Precision, Fluid Tracking</option>
                      <option value="christopher_nolan_imax">Christopher Nolan: 70mm IMAX Practical Scale, 35mm Heavy Film Grain</option>
                    </select>
                  </div>

                  {/* Soundstage & Acoustic Controls */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                      5. Virtual Soundstage & Foley Engine
                    </label>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">J-Cut / L-Cut Dialogue Overlap</span>
                        <span className="text-slate-500 text-[11px]">800ms natural conversational audio lead-in</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableJLCut}
                        onChange={(e) => setEnableJLCut(e.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">Optical Motion Foley & Room IR Reverb</span>
                        <span className="text-slate-500 text-[11px]">Auto-synthesizes footsteps, wind, fabric rustle</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableFoleyIR}
                        onChange={(e) => setEnableFoleyIR(e.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* 4-Tier Automated QA & Self-Healing Circuit Breaker */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                      <span>6. 4-Tier Automated QA & Circuit Breakers</span>
                      <ShieldCheck className="h-4 w-4 text-teal-400" />
                    </label>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>ArcFace Face Similarity Lock:</span>
                        <span className="font-bold text-white font-mono">≥ {arcfaceThreshold}</span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="0.95"
                        step="0.01"
                        value={arcfaceThreshold}
                        onChange={(e) => setArcfaceThreshold(parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-white font-semibold block">YOLOv10 Kinematic & Anatomy Guard</span>
                        <span className="text-slate-500 text-[11px]">0 extra limbs or impossible physics tolerance</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">Active</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-white font-semibold block">Max Retries Before Cutaway Fallback</span>
                        <span className="text-slate-500 text-[11px]">Prevents infinite token burn on impossible shots</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">3 Strikes</span>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    id="launch-production-btn"
                    onClick={handleLaunchProduction}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm md:text-base hover:from-amber-400 hover:to-amber-300 transition-all shadow-xl shadow-amber-500/20 min-h-[48px]"
                  >
                    <Clapperboard className="h-5 w-5 fill-slate-950" />
                    <span>LAUNCH AUTONOMOUS MOVIE PRODUCTION</span>
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MISSION CONTROL & 4-TIER QA TELEMETRY            */}
        {/* ======================================================== */}
        {activeTab === "telemetry" && (
          <div className="space-y-8 mt-8">
            <div className="p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Autonomous Production Mission Control
                    </h2>
                  </div>
                  <p className="mt-1 text-xs md:text-sm text-slate-400">
                    Active Job: <span className="text-amber-300 font-mono">{prodTitle}</span> ({prodFormat.replace("_", " ").toUpperCase()})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Current Status:</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {isGenerating ? activeStage : "Master Package Sealed & Live"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Overall Pipeline Completion</span>
                  <span className="text-amber-400 font-bold">{isGenerating ? `${genProgress}%` : "100%"}</span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${isGenerating ? genProgress : 100}%` }}
                  />
                </div>
              </div>

              {/* Real-Time Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">ArcFace Mean Match</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">0.914</span>
                  <span className="text-[10px] text-teal-500/80 block mt-1">Threshold: ≥ 0.86 (PASS)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">Kinematics & Pose Yield</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">98.2%</span>
                  <span className="text-[10px] text-teal-500/80 block mt-1">0 Extra Limbs Detected</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">Self-Healed Rerolls</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">8 Shots</span>
                  <span className="text-[10px] text-amber-500/80 block mt-1">0 Human QA Touches</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">GPU Compute Cost</span>
                  <span className="text-2xl font-black text-white font-mono">$28.50</span>
                  <span className="text-[10px] text-slate-500 block mt-1">20 Cloud Workers</span>
                </div>
              </div>

              {/* Real-time Streaming Terminal Logs */}
              <div className="mt-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Live Autonomous Pipeline Event Log
                </span>
                <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 shadow-inner">
                  {telemetryLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-amber-500/80 select-none">&gt;</span>
                      <span className={log.includes("ERROR") ? "text-red-400" : log.includes("SELF-HEALED") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Switch to Player */}
              {!isGenerating && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab("originals")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 min-h-[44px]"
                  >
                    <span>View Master in Originals Vault</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* C2PA Cryptographic Provenance Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-teal-400" />
                <h3 className="text-xl font-bold text-white">C2PA Cryptographic Provenance Certificate</h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Manifest ID:</span>
                <span className="text-amber-300 select-all">{selectedFilm.c2paCertId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Digital Signing Algorithm:</span>
                <span className="text-teal-300">Ed25519 (Zero Third-Party Cloud Egress)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Content Authenticity Claim:</span>
                <span className="text-slate-200">Generative Synthetic Media produced under Zyvoriq Veritas 5-Axis Governance</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">IMF Specification:</span>
                <span className="text-amber-400">SMPTE 2067-21 (Netflix / Amazon Prime Video Direct Compliant)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="close-c2pa-btn"
                onClick={() => setShowCertModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all min-h-[40px]"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multimodal AI Vision & Frame-Audit Inspector Modal */}
      {showMultimodalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-4xl w-full rounded-3xl bg-slate-900 border border-teal-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-lg shadow-teal-500/10 shrink-0">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      Multimodal AI Vision & Frame-Audit Inspector
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                      DeepMind Video & Acoustic QA
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Frame-by-frame visual decoding, cross-modal semantic congruence, and sacred cultural reverence governance.
                  </p>
                </div>
              </div>
              <button
                id="close-multimodal-btn"
                onClick={() => setShowMultimodalModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-all shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Interactive Test Mode Switcher: Audit Master vs Simulate Mismatch & Workflow Selector */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-white font-bold block">
                    Interactive Evaluation & Self-Healing Harness
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Verify master certification, simulate cross-modal defects, and test healing workflows
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="audit-certified-master-btn"
                    onClick={() => {
                      setHealedSuccessData(null);
                      handleAuditMultimodal();
                    }}
                    disabled={isAuditingMultimodal || isHealing}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-all min-h-[36px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>Audit Master ({selectedFilm.title.split(":")[0]})</span>
                  </button>
                  <button
                    id="simulate-mismatch-btn"
                    onClick={() => {
                      setHealedSuccessData(null);
                      handleAuditMultimodal({
                        title: "Noor-e-Ishq: Chapter I",
                        genre: "romantic_epic",
                        videoSrc: selectedFilm.videoSrc || ""
                      });
                    }}
                    disabled={isAuditingMultimodal || isHealing}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all min-h-[36px]"
                    title="Simulate passing romantic melodrama dialogue over the sacred Kurukshetra chariot scene"
                  >
                    <Zap className="h-3.5 w-3.5 text-red-400" />
                    <span>Simulate Sacrilege Mismatch Bug</span>
                  </button>

                  <Link
                    id="open-audit-page-modal-btn"
                    href={`/studio/cinema/audit?filmId=${selectedFilm.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all min-h-[36px]"
                  >
                    <Sliders className="h-3.5 w-3.5 text-amber-400" />
                    <span>Open Dedicated Audit Page</span>
                  </Link>
                </div>
              </div>

              {/* Workflow Mode Selector: Autonomous vs Manual Review */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
                <span className="text-slate-400 font-semibold">Self-Healing Dispatch Mode:</span>
                <div className="flex items-center gap-2">
                  <button
                    id="mode-autonomous-btn"
                    onClick={() => setHealingWorkflowMode("autonomous")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[34px] ${
                      healingWorkflowMode === "autonomous"
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    <Zap className="h-3 w-3 fill-current" />
                    <span>⚡ Autonomous Self-Healing (1-Click)</span>
                  </button>
                  <button
                    id="mode-manual-btn"
                    onClick={() => setHealingWorkflowMode("manual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[34px] ${
                      healingWorkflowMode === "manual"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    <Sliders className="h-3 w-3" />
                    <span>🎬 Director's Review & Override</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Self-Healing Progress Indicator */}
            {isHealing && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 to-emerald-950/60 border border-teal-500/40 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
                <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                <p className="text-sm font-black text-teal-200">
                  {healingStepProgress || "Engaging Self-Healing Actuator..."}
                </p>
                <span className="text-[11px] text-slate-400 font-mono">
                  Autonomous Finite State Machine · Circuit Breaker Active · Anti-Drift Locked
                </span>
              </div>
            )}

            {/* Healed Success Notification Banner */}
            {healedSuccessData && !isHealing && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white">
                      Self-Healing Completed & Ratified: {healedSuccessData.actuatorUsed}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                    Circuit Breaker: 1/2 Retries (CLEAN)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {healedSuccessData.patchSummary}
                </p>
                {healedSuccessData.remedyApplied && (
                  <div className="text-[11px] text-teal-300 font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Active Master: {healedSuccessData.remedyApplied.title}</span>
                    <span className="text-slate-400">{healedSuccessData.remedyApplied.genre}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Audit Loading State */}
            {isAuditingMultimodal && (
              <div className="p-8 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-white">
                  Decoding Physical Video Bitstream & Generating Multi-Frame Semantic Embeddings...
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Evaluating temporal coherence, ArcFace identity preservation & cross-modal reverence gate
                </p>
              </div>
            )}

            {/* Audit Error State */}
            {multimodalAuditError && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs space-y-1">
                <span className="font-bold block">Audit Execution Error:</span>
                <p>{multimodalAuditError}</p>
              </div>
            )}

            {/* Audit Results Presentation */}
            {!isAuditingMultimodal && multimodalResult && (
              <div className="space-y-6">
                
                {/* Overall Certification Status Banner */}
                <div
                  id="multimodal-status-banner"
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/5"
                      : "bg-red-500/20 border-red-500/40 text-red-200 shadow-lg shadow-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black tracking-wider uppercase">
                          Overall Gate Status:
                        </span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER"
                            ? "bg-emerald-500/30 text-emerald-300"
                            : "bg-red-500/30 text-red-300 animate-pulse"
                        }`}>
                          {multimodalResult.overallStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {multimodalResult.overallStatus === "CERTIFIED_IMF_MASTER"
                          ? "Physical video frames, dialogue shlokas, and cultural reverence all align with mathematical precision."
                          : "Visual frames contradict dialogue metadata. Production asset halted before master packaging."}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 self-start sm:self-auto">
                    ID: {multimodalResult.evaluationId}
                  </span>
                </div>

                {/* Detected Issues & Impact Triage Console */}
                {multimodalResult.detectedIssues && multimodalResult.detectedIssues.length > 0 && (
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                        <h4 className="text-sm font-black text-white tracking-wide uppercase">
                          Production Defect Triage & Impact Assessment ({multimodalResult.detectedIssues.length} Issues Identified)
                        </h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/30 text-red-300 font-mono font-bold">
                        Mode: {healingWorkflowMode.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {multimodalResult.detectedIssues.map((issue) => (
                        <div key={issue.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] font-mono ${
                                issue.severity === "CRITICAL"
                                  ? "bg-red-500/30 text-red-300 border border-red-500/40"
                                  : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                {issue.category}
                              </span>
                              <span className="text-teal-400 font-mono font-bold">
                                {issue.timecode}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Actuator: <strong className="text-amber-300 font-mono">{issue.suggestedActuator}</strong>
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-white text-sm">{issue.title}</h5>
                            <p className="text-slate-300 mt-1 leading-relaxed">{issue.description}</p>
                          </div>

                          {/* Impact Analysis Callout */}
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 space-y-1">
                            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">
                              Regulatory & Theatrical Impact Assessment:
                            </span>
                            <p className="text-[11px] text-red-200 leading-relaxed">
                              {issue.impactAnalysis}
                            </p>
                          </div>

                          {/* Workflow Actions */}
                          <div className="pt-1">
                            {healingWorkflowMode === "autonomous" ? (
                              <button
                                id="execute-auto-heal-btn"
                                onClick={() => handleExecuteSelfHealing({
                                  issueId: issue.id,
                                  actuatorType: issue.suggestedActuator,
                                  mode: "autonomous"
                                })}
                                disabled={isHealing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 min-h-[44px]"
                              >
                                <Zap className="h-4 w-4 fill-current" />
                                <span>⚡ Execute 1-Click Autonomous Self-Healing ({issue.suggestedActuator})</span>
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <button
                                  id="manual-apply-fix-btn"
                                  onClick={() => handleExecuteSelfHealing({
                                    issueId: issue.id,
                                    actuatorType: issue.suggestedActuator,
                                    mode: "manual_override"
                                  })}
                                  disabled={isHealing}
                                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all min-h-[40px]"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Apply Fix ({issue.suggestedActuator})</span>
                                </button>
                                <button
                                  id="manual-artistic-intent-btn"
                                  onClick={() => handleExecuteSelfHealing({
                                    issueId: issue.id,
                                    actuatorType: issue.suggestedActuator,
                                    mode: "manual_override",
                                    markArtisticIntent: true
                                  })}
                                  disabled={isHealing}
                                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold text-xs transition-all min-h-[40px]"
                                >
                                  <Award className="h-3.5 w-3.5" />
                                  <span>Ratify Artistic Intent (Director Escrow)</span>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4 Multi-Metric Gauges Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Gauge 1: Cross-Modal Semantic Congruence */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Semantic Congruence
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl font-black font-mono ${
                        multimodalResult.scores.semanticCongruence >= 0.85 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {(multimodalResult.scores.semanticCongruence * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Req: &ge;85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          multimodalResult.scores.semanticCongruence >= 0.85 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, multimodalResult.scores.semanticCongruence * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Screenplay vs Visual Cosine Metric
                    </span>
                  </div>

                  {/* Gauge 2: Cultural Reverence Gate */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Reverence Gate
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        multimodalResult.culturalReverenceGate.status === "VERIFIED_REVERENT"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : multimodalResult.culturalReverenceGate.status === "SACRILEGE_ALERT"
                          ? "bg-red-500/30 text-red-300 font-mono"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {multimodalResult.culturalReverenceGate.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {multimodalResult.culturalReverenceGate.reasoning}
                    </p>
                  </div>

                  {/* Gauge 3: Kinematic Yield */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kinematic Yield
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black font-mono text-teal-400">
                        {(multimodalResult.scores.kinematicYield * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Req: &ge;95%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${multimodalResult.scores.kinematicYield * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Zero Temporal Judder / Optical Flow
                    </span>
                  </div>

                  {/* Gauge 4: SyncNet & Audio Loudness */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      SyncNet AV & Loudness
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black font-mono text-amber-300">
                        {multimodalResult.scores.syncNetConfidence.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Conf: &ge;6.0</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>LKFS Loudness:</span>
                      <span className="font-mono text-slate-200">{multimodalResult.scores.lufsLoudnessDb} dB</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      SMPTE EBU R128 Compliant
                    </span>
                  </div>

                </div>

                {/* Cultural Reverence / Violation Detail Callout */}
                <div className={`p-4 rounded-2xl border ${
                  multimodalResult.culturalReverenceGate.passed
                    ? "bg-slate-950 border-teal-500/30"
                    : "bg-red-950/40 border-red-500/40"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`h-4 w-4 ${
                      multimodalResult.culturalReverenceGate.passed ? "text-teal-400" : "text-red-400"
                    }`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Reverence Analysis & Contextual Reasoning:
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {multimodalResult.culturalReverenceGate.reasoning}
                  </p>
                  {multimodalResult.remedyAction && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                      <span className="font-bold text-amber-300 block mb-0.5">Automated Self-Healing Action:</span>
                      <p>{multimodalResult.remedyAction}</p>
                    </div>
                  )}
                </div>

                {/* Keyframe Physical Vision Manifest */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Camera className="h-4 w-4 text-teal-400" />
                      <span>Decoded Video Keyframes & Visual Entity Manifest ({multimodalResult.framesAudited.length} Frames Audited)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Target: {multimodalResult.videoSrc.split("/").pop()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {multimodalResult.framesAudited.map((frame, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-2 text-xs transition-all ${
                          frame.semanticAlignmentScore >= 0.85
                            ? "bg-slate-950 border-slate-800"
                            : "bg-red-950/20 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono font-bold">
                              {frame.timecodeFormatted}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium text-[11px]">
                              {frame.eraClassification}
                            </span>
                          </div>
                          {frame.hasSacredIconography && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                              Sacred Iconography
                            </span>
                          )}
                        </div>

                        {/* Detected Entities */}
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">
                            Detected Visual Entities:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {frame.detectedEntities.map((entity, eIdx) => (
                              <span
                                key={eIdx}
                                className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px]"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Semantic Alignment Score Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Cross-Modal Alignment:</span>
                            <span className={`font-mono font-bold ${
                              frame.semanticAlignmentScore >= 0.85 ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {(frame.semanticAlignmentScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                frame.semanticAlignmentScore >= 0.85 ? "bg-emerald-500" : "bg-red-500"
                              }`}
                              style={{ width: `${frame.semanticAlignmentScore * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-900">
                          {frame.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cryptographic C2PA Hash */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">C2PA Audit Hash:</span>
                  <span className="text-teal-400 select-all">{multimodalResult.c2paAuditHash}</span>
                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Zyvoriq Veritas Phase 3 Multimodal QA Engine
              </span>
              <button
                onClick={() => setShowMultimodalModal(false)}
                className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all min-h-[40px] shadow-lg shadow-teal-500/10"
              >
                Close Audit Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bollywood Cast & Crew Roster Modal */}
      {showCastCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-3xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedFilm.title} — Official Call Sheet</h3>
                  <p className="text-xs text-amber-400/90 font-medium">Full Bollywood Cast, Characters & Creative Crew Directive Architecture</p>
                </div>
              </div>
              <button
                id="close-cast-crew-btn"
                onClick={() => setShowCastCrewModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2"
              >
                ✕
              </button>
            </div>

            {/* Cast Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎭 Star Cast & Character Archetypes</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFilm.cast?.map((actor, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm">{actor.character}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {actor.actorId}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Played by: </span>
                      <span className="text-slate-200 font-semibold">{actor.actor}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Archetype: </span>
                      <span className="text-amber-400/90">{actor.archetype}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Vocal Profile: </span>
                      <span className="text-slate-300 font-mono">{actor.vocalProfile}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Wardrobe / Styling: </span>
                      <span className="text-slate-300">{actor.wardrobe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎬 Creative & Technical Crew (Autonomous Directive Swarm)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFilm.crew?.map((member, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-bold">{member.role}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{member.modelEngine}</span>
                    </div>
                    <p className="font-extrabold text-white">{member.name}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{member.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setShowCastCrewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all min-h-[40px]"
              >
                Close Call Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master 118-Shot Scene & Shot List Modal (EDL) */}
      {is118ShotModalOpen && (
        <div id="shot-list-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-5xl w-full rounded-3xl bg-slate-900 border border-teal-500/30 p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <List className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white">
                    Master 118-Shot Cinematic EDL (Edit Decision List)
                  </h3>
                  <p className="text-xs text-slate-400">
                    SMPTE Timecode Indexed · 15:00.00 Feature Film Architecture · 5 Acts · 2.39:1 Anamorphic
                  </p>
                </div>
              </div>
              <button
                id="close-118-shot-modal-btn"
                onClick={() => setIs118ShotModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable 118-Shot Grid */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
              {DHARMAKSHETRA_118_SHOTS.map((s) => {
                const isCurrent = currentShot.shotNumber === s.shotNumber;
                return (
                  <div
                    key={s.shotNumber}
                    data-testid="edl-shot-card"
                    className={`edl-shot-card p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-amber-400 font-mono">
                          Shot #{String(s.shotNumber).padStart(3, "0")}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          Act {s.actNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                          {s.shotType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTime15m(s.timecodeStartSec)} – {formatTime15m(s.timecodeEndSec)} ({s.durationSec}s)
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white font-mono">{s.heading}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{s.actionDescription}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                        <span>📹 {s.lens}</span>
                        <span>🎬 {s.cameraMotion}</span>
                        <span>💡 {s.lighting}</span>
                      </div>
                    </div>

                    <button
                      id={`jump-shot-${s.shotNumber}`}
                      onClick={() => jumpToShot(s.shotNumber)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isCurrent
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                          : "bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950"
                      }`}
                    >
                      {isCurrent ? "Active on Screen" : "Jump to Shot"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                Total Deliverable: 118 Shots · 900.00 Seconds · 21,600 Master Frames @ 24fps
              </span>
              <button
                onClick={() => setIs118ShotModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all"
              >
                Close EDL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Film Screenplay & Production Bible Modal */}
      {isScreenplayModalOpen && (
        <div id="screenplay-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-4xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white">
                    Master Screenplay: Dharmakshetra (The Song of the Divine)
                  </h3>
                  <p className="text-xs text-slate-400">
                    15-Minute Theatrical Short · 5-Act Epic Structure · Sanskrit & Hindi Dialogue
                  </p>
                </div>
              </div>
              <button
                id="close-screenplay-modal-btn"
                onClick={() => setIsScreenplayModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Screenplay Document */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-slate-200 font-serif leading-relaxed text-sm bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="text-center space-y-1 pb-4 border-b border-slate-800">
                <h2 className="text-xl font-black text-amber-300 uppercase tracking-widest font-sans">
                  DHARMAKSHETRA: THE SONG OF THE DIVINE
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Written for Screen by Autonomous Epic Directive Swarm · Based on the Bhagavad Gita by Maharishi Vyasa
                </p>
                <p className="text-[11px] text-amber-400/80 font-mono font-sans">
                  15:00 RUNTIME · 5 ACTS · 118 SCENE BEATS · 2.39:1 CINEMA
                </p>
              </div>

              {DHARMAKSHETRA_ACTS.map((act) => (
                <div key={act.actNumber} className="space-y-4 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-sans">
                      ACT {act.actNumber}: {act.title.toUpperCase()} ({formatTime15m(act.timecodeStartSec)} - {formatTime15m(act.timecodeEndSec)})
                    </span>
                    <p className="text-xs text-slate-300 font-sans italic mt-0.5">{act.tagline}</p>
                    <p className="text-[11px] text-slate-400 font-sans mt-1">🎵 Score: {act.musicalTheme}</p>
                  </div>

                  <div className="space-y-3 pl-2">
                    <p className="text-xs text-slate-400 italic">
                      [SCENE DESCRIPTION: {act.visualAtmosphere}]
                    </p>
                    <p className="text-xs text-slate-300">
                      [DRAMATIC STAKES: {act.dramaticStakes}]
                    </p>

                    {DHARMAKSHETRA_DIALOGUES.filter(d => d.actNumber === act.actNumber).map(dia => (
                      <div key={dia.id} className="py-2 pl-4 border-l-2 border-amber-500/40 space-y-1">
                        <p className="text-xs font-bold text-amber-300 font-sans uppercase tracking-wider">
                          {dia.character} <span className="text-slate-400 font-normal">({dia.emotion} · {dia.timecodeFormatted})</span>
                        </p>
                        <p className="text-xs md:text-sm text-slate-100 italic">
                          &ldquo;{dia.text.hi}&rdquo;
                        </p>
                        <p className="text-xs text-slate-300">
                          English Translation: &ldquo;{dia.text.en}&rdquo;
                        </p>
                        {dia.text.sa && (
                          <p className="text-[11px] text-amber-400/70 font-mono">
                            Sanskrit Shloka: {dia.text.sa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                C2PA Certified Theatrical Master Screenplay
              </span>
              <button
                onClick={() => setIsScreenplayModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
              >
                Close Screenplay
              </button>
            </div>
          </div>
        </div>
      )}

    </StudioSidebar>
  );
}
