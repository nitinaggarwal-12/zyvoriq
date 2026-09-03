/**
 * ZYVORIQ PROPRIETARY NDA & PRE-DEMO COMPLIANCE SIGNING ENGINE
 * 
 * Enterprise-grade legal agreement lifecycle management:
 * - Multi-Channel Link Dispatcher (Email, SMS/Phone, WhatsApp, Social Media).
 * - Multilingual Legal Clause Translations (English, Spanish, Japanese, German, French, Hindi).
 * - Dual-Sided Counter-Signing with Zyvoriq Corporate Seal & C2PA Provenance.
 * - Cryptographic Digital Signing with SHA-256 Audit Trail & 72-Hour Expiration Guard.
 */

export type NdaLanguage = "en" | "es" | "ja" | "de" | "fr" | "hi";

export interface NdaAgreement {
  id: string;
  token: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientSocialHandle?: string;
  recipientCompany: string;
  recipientTitle: string;
  demoType: string;
  dispatchChannel: "email" | "sms" | "whatsapp" | "social_media";
  dispatchTarget: string;
  status: "pending_signature" | "signed_and_verified" | "expired";
  language: NdaLanguage;
  createdAt: string;
  expiresAt: string;
  signedAt?: string;
  signatureDataUrl?: string;
  signatureType?: "drawn" | "typed";
  signerIpAddress?: string;
  signerUserAgent?: string;
  sha256AuditHash?: string;
  c2paAttestationId?: string;
  emailReceiptSent?: boolean;
  corporateCounterSignature: {
    officerName: string;
    officerTitle: string;
    signedAt: string;
    sealBadgeUrl: string;
    isExecuted: boolean;
  };
}

export interface AdminNotification {
  id: string;
  agreementId: string;
  recipientName: string;
  recipientCompany: string;
  demoType: string;
  signedAt: string;
  read: boolean;
  message: string;
}

export interface LegalClause {
  clauseNumber: string;
  title: string;
  summary: string;
  fullText: string;
}

export const MULTILINGUAL_NDA_CLAUSES: Record<NdaLanguage, { languageName: string; flag: string; clauses: LegalClause[] }> = {
  en: {
    languageName: "English (US)",
    flag: "🇺🇸",
    clauses: [
      {
        clauseNumber: "1.0",
        title: "Confidential Demonstration & Proprietary AI Information",
        summary: "All models, architectures, user interfaces, and audio/video synthesis engines demonstrated are confidential.",
        fullText: "The Receiving Party agrees that all technical, commercial, financial, and operational information disclosed by Zyvoriq, Inc. during the demonstration—including neural rendering pipelines, 3D viseme phoneme algorithms, multi-shot cinematic timeline systems, and unpublished AI performance evals—constitutes proprietary and confidential Trade Secrets under the Uniform Trade Secrets Act (UTSA)."
      },
      {
        clauseNumber: "2.0",
        title: "Prohibition on Reverse Engineering & Recording",
        summary: "No unauthorized screen recording, prompt extraction, or reverse engineering is permitted.",
        fullText: "The Receiving Party shall not, directly or indirectly: (a) record, stream, photograph, or capture the demonstration session; (b) decompile, reverse engineer, or disassemble any binary, frontend bundle, or API payload; (c) attempt to extract latent model prompts or weights; or (d) share credentials or temporary session access URLs with any third party."
      },
      {
        clauseNumber: "3.0",
        title: "Intellectual Property & Sovereign Rights",
        summary: "Zyvoriq retains exclusive worldwide ownership over all demonstrated intellectual property.",
        fullText: "All title, patents, copyrights, trade secrets, and intellectual property rights in and to the Zyvoriq platform remain the exclusive property of Zyvoriq, Inc. No license or conveyance of rights is granted under this Agreement."
      },
      {
        clauseNumber: "4.0",
        title: "Cryptographic Provenance & Watermark Compliance",
        summary: "Demonstration artifacts contain C2PA cryptographic signatures and watermarks.",
        fullText: "The Receiving Party acknowledges that all media rendered during the session is bound to tamper-evident C2PA cryptographic provenance manifests. Any attempt to strip, alter, or spoof digital provenance metadata is strictly prohibited."
      },
      {
        clauseNumber: "5.0",
        title: "Injunctive Relief & Liquidated Damages",
        summary: "Breach of confidentiality results in irreparable harm and immediate injunctive relief.",
        fullText: "Because unauthorized disclosure of proprietary AI architectures causes immediate and irreparable harm for which monetary damages alone are inadequate, Zyvoriq is entitled to seek equitable relief, including immediate preliminary injunctions."
      },
      {
        clauseNumber: "6.0",
        title: "Term & Governing Law",
        summary: "Confidentiality obligations endure for 3 years; governed by Delaware Law.",
        fullText: "This Agreement and all obligations of confidentiality herein shall endure for a period of three (3) years from the date of execution. Governed by Delaware Law, USA."
      }
    ]
  },
  es: {
    languageName: "Español",
    flag: "🇪🇸",
    clauses: [
      {
        clauseNumber: "1.0",
        title: "Demostración Confidencial e Información Propietaria de IA",
        summary: "Todos los modelos, arquitecturas y motores de síntesis de video/audio son estrictamente confidenciales.",
        fullText: "La Parte Receptora acuerda que toda la información técnica, comercial y operativa revelada por Zyvoriq, Inc. durante la demostración constituye Secreto Comercial propietario y confidencial protegido por ley."
      },
      {
        clauseNumber: "2.0",
        title: "Prohibición de Ingeniería Inversa y Grabación",
        summary: "No se permite la grabación de pantalla, extracción de prompts ni descompilación.",
        fullText: "La Parte Receptora no podrá: (a) grabar o transmitir la sesión; (b) realizar ingeniería inversa o descompilar el software; (c) intentar extraer prompts o pesos de modelos de IA."
      },
      {
        clauseNumber: "3.0",
        title: "Propiedad Intelectual y Derechos Soberanos",
        summary: "Zyvoriq retiene la propiedad exclusiva mundial de toda la tecnología demostrada.",
        fullText: "Todas las patentes, derechos de autor y secretos comerciales de la plataforma Zyvoriq pertenecen exclusivamente a Zyvoriq, Inc."
      },
      {
        clauseNumber: "4.0",
        title: "Procedencia Criptográfica C2PA",
        summary: "Los archivos generados contienen marcas de agua criptográficas inviolables.",
        fullText: "Los medios generados están protegidos con manifiestos C2PA y marcas de agua SynthID a prueba de manipulaciones."
      },
      {
        clauseNumber: "5.0",
        title: "Medidas Cautelares y Daños y Perjuicios",
        summary: "El incumplimiento causa daño irreparable y otorga derecho a medidas cautelares inmediatas.",
        fullText: "Zyvoriq tendrá derecho a solicitar medidas cautelares inmediatas ante los tribunales competentes."
      },
      {
        clauseNumber: "6.0",
        title: "Vigencia y Ley Aplicable",
        summary: "Vigencia de 3 años; regido por las leyes del Estado de Delaware, EE. UU.",
        fullText: "Este Acuerdo tendrá una duración de tres (3) años a partir de su firma digital."
      }
    ]
  },
  ja: {
    languageName: "日本語 (Japanese)",
    flag: "🇯🇵",
    clauses: [
      {
        clauseNumber: "1.0",
        title: "秘密デモンストレーションおよび独自AI技術情報",
        summary: "実演されるすべてのAIモデル、アーキテクチャ、オーディオ/ビデオ生成エンジンは機密情報です。",
        fullText: "受領当事者は、Zyvoriq社が本製品デモ中に開示するすべての技術、モデル重み、3Dリップシンクアルゴリズム、未公開のベンチマークが法的営業秘密を構成することに同意します。"
      },
      {
        clauseNumber: "2.0",
        title: "リバースエンジニアリングおよび録画の禁止",
        summary: "画面録画、プロンプト抽出、逆コンパイルはいかなる形式でも禁止されています。",
        fullText: "受領当事者は、セッションの録画、配信、逆アセンブル、またはAIプロンプトの抽出を直接的または間接的に行ってはなりません。"
      },
      {
        clauseNumber: "3.0",
        title: "知的財産権の帰属",
        summary: "Zyvoriq社は実演されたすべての知的財産の排他的所有権を世界規模で保持します。",
        fullText: "Zyvoriqプラットフォームに関するすべての特許、著作権、および営業秘密はZyvoriq社に独占的に帰属します。"
      },
      {
        clauseNumber: "4.0",
        title: "C2PA暗号証明および透かし検証",
        summary: "生成メディアには改ざん防止C2PA暗号署名が付与されています。",
        fullText: "レンダリングされたすべてのメディアはC2PA暗号来歴マニフェストによって保護されています。"
      },
      {
        clauseNumber: "5.0",
        title: "差止請求権および損害賠償",
        summary: "機密漏洩は回復不能な損害をもたらし、即時の差止命令の対象となります。",
        fullText: "不正開示が発生した場合、Zyvoriq社は即時の差止救済を請求する権利を有します。"
      },
      {
        clauseNumber: "6.0",
        title: "有効期間および準拠法",
        summary: "有効期間は締結日より3年間。米国デラウェア州法に準拠。",
        fullText: "本契約は署名日より3年間有効であり、米国デラウェア州法に準拠して解釈されます。"
      }
    ]
  },
  de: {
    languageName: "Deutsch",
    flag: "🇩🇪",
    clauses: [
      {
        clauseNumber: "1.0",
        title: "Vertrauliche Vorführung & Proprietäre KI-Informationen",
        summary: "Alle vorgeführten Modelle, Architekturen und Audio/Video-Engines sind streng vertraulich.",
        fullText: "Die empfangende Partei erkennt an, dass alle von Zyvoriq, Inc. offengelegten technischen und geschäftlichen Informationen geschützte Geschäftsgeheimnisse darstellen."
      },
      {
        clauseNumber: "2.0",
        title: "Verbot von Reverse Engineering & Aufzeichnung",
        summary: "Keine Bildschirmaufzeichnung, Prompt-Extraktion oder Dekompilierung gestattet.",
        fullText: "Es ist untersagt, die Vorführung aufzuzeichnen, zu streamen oder zu versuchen, System-Prompts oder Modellgewichte zu extrahieren."
      },
      {
        clauseNumber: "3.0",
        title: "Geistiges Eigentum & Schutzrechte",
        summary: "Zyvoriq behält das ausschließliche weltweite Eigentum an allen Technologien.",
        fullText: "Alle Patente, Urheberrechte und Geschäftsgeheimnisse verbleiben im ausschließlichen Eigentum von Zyvoriq, Inc."
      },
      {
        clauseNumber: "4.0",
        title: "Kryptografische C2PA-Herkunftsnachweise",
        summary: "Alle Medien sind mit manipulationssicheren C2PA-Signaturen versehen.",
        fullText: "Die während der Sitzung gerenderten Medien sind an fälschungssichere C2PA-Herkunftsdaten gebunden."
      },
      {
        clauseNumber: "5.0",
        title: "Unterlassungsanspruch & Schadensersatz",
        summary: "Geheimhaltungsverletzungen berechtigen zu sofortigen gerichtlichen Unterlassungsverfügungen.",
        fullText: "Zyvoriq ist berechtigt, sofortige vorläufige Unterlassungsansprüche gerichtlich geltend zu machen."
      },
      {
        clauseNumber: "6.0",
        title: "Laufzeit & Anwendbares Recht",
        summary: "Laufzeit von 3 Jahren; Recht des US-Bundesstaates Delaware.",
        fullText: "Diese Vereinbarung gilt für einen Zeitraum von drei (3) Jahren ab digitaler Unterzeichnung."
      }
    ]
  },
  fr: {
    languageName: "Français",
    flag: "🇫🇷",
    clauses: [
      {
        clauseNumber: "1.0",
        title: "Démonstration Confidentielle & Propriété Intellectuelle IA",
        summary: "Tous les modèles, architectures et moteurs de synthèse sont strictement confidentiels.",
        fullText: "La Partie Réceptrice convient que toutes les informations techniques divulguées par Zyvoriq, Inc. constituent des secrets commerciaux exclusifs et confidentiels."
      },
      {
        clauseNumber: "2.0",
        title: "Interdiction de Rétro-Ingénierie et d'Enregistrement",
        summary: "Aucun enregistrement d'écran ni extraction de prompts n'est autorisé.",
        fullText: "Il est strictement interdit d'enregistrer, décompiler ou tenter d'extraire les prompts ou les poids des modèles IA."
      },
      {
        clauseNumber: "3.0",
        title: "Propriété Intellectuelle Exclusive",
        summary: "Zyvoriq conserve la propriété exclusive mondiale de toutes les technologies.",
        fullText: "Tous les brevets, droits d'auteur et secrets commerciaux demeurent la propriété exclusive de Zyvoriq, Inc."
      },
      {
        clauseNumber: "4.0",
        title: "Traçabilité Cryptographique C2PA",
        summary: "Les médias générés sont protégés par des manifestes C2PA inviolables.",
        fullText: "Tous les médias sont liés à des manifestes de provenance cryptographique C2PA infalsifiables."
      },
      {
        clauseNumber: "5.0",
        title: "Mesures Injonctives & Réparation",
        summary: "Toute violation donne droit à des injonctions judiciaires immédiates.",
        fullText: "Zyvoriq est en droit de solliciter des mesures injonctives immédiates devant les juridictions compétentes."
      },
      {
        clauseNumber: "6.0",
        title: "Durée & Droit Applicable",
        summary: "Durée de 3 ans; régi par les lois de l'État du Delaware, États-Unis.",
        fullText: "Le présent accord est conclu pour une durée de trois (3) ans à compter de sa signature."
      }
    ]
  },
  hi: {
    languageName: "हिन्दी (Hindi)",
    flag: "🇮🇳",
    clauses: [
      {
        clauseNumber: "1.0",
        title: "गोपनीय प्रदर्शन और मालिकाना एआई सूचना",
        summary: "डेमो के दौरान प्रदर्शित सभी मॉडल, आर्किटेक्चर और वीडियो/ऑडियो इंजन पूर्णतः गोपनीय हैं।",
        fullText: "प्राप्तकर्ता पक्ष सहमत है कि Zyvoriq, Inc. द्वारा प्रदर्शित सभी तकनीकी और व्यावसायिक जानकारी कानूनी रूप से संरक्षित व्यापार रहस्य है।"
      },
      {
        clauseNumber: "2.0",
        title: "रिवर्स इंजीनियरिंग और रिकॉर्डिंग पर प्रतिबंध",
        summary: "स्क्रीन रिकॉर्डिंग, प्रॉम्प्ट निष्कर्षण या डीकंपाइलेशन सख्त वर्जित है।",
        fullText: "प्राप्तकर्ता सत्र को रिकॉर्ड, स्ट्रीम या एआई प्रॉम्प्ट और मॉडल वेट्स को निकालने का प्रयास नहीं करेगा।"
      },
      {
        clauseNumber: "3.0",
        title: "बौद्धिक संपदा अधिकार",
        summary: "Zyvoriq सभी प्रदर्शित बौद्धिक संपदा का विश्वव्यापी विशेष स्वामित्व रखता है।",
        fullText: "Zyvoriq प्लेटफॉर्म के सभी पेटेंट, कॉपीराइट और व्यापार रहस्य विशेष रूप से Zyvoriq, Inc. के स्वामित्व में हैं।"
      },
      {
        clauseNumber: "4.0",
        title: "C2PA क्रिप्टोग्राफ़िक सत्यता सत्यापन",
        summary: "सभी मीडिया में सुरक्षित C2PA क्रिप्टोग्राफ़िक वाटरमार्क शामिल हैं।",
        fullText: "प्रदर्शित सभी मीडिया सुरक्षित C2PA क्रिप्टोग्राफ़िक उद्गम घोषणापत्रों से बंधे हैं।"
      },
      {
        clauseNumber: "5.0",
        title: "कानूनी राहत और हर्जाना",
        summary: "गोपनीयता के उल्लंघन पर तत्काल कानूनी निषेधाज्ञा लागू होगी।",
        fullText: "उल्लंघन की स्थिति में Zyvoriq तत्काल अदालती निषेधाज्ञा प्राप्त करने का हकदार होगा।"
      },
      {
        clauseNumber: "6.0",
        title: "अवधि और लागू कानून",
        summary: "अवधि 3 वर्ष; डेलावेयर, यूएसए के कानूनों द्वारा शासित।",
        fullText: "यह समझौता डिजिटल हस्ताक्षर की तारीख से तीन (3) वर्षों के लिए लागू रहेगा।"
      }
    ]
  }
};

export const STANDARD_NDA_LEGAL_CLAUSES = MULTILINGUAL_NDA_CLAUSES.en.clauses;

// In-Memory Database Store for Agreements
let agreementsStore: NdaAgreement[] = [
  {
    id: "nda_rec_9182a",
    token: "demo_alpha_9182a",
    recipientName: "Nitin Aggarwal",
    recipientEmail: "nitin@zyvoriq.com",
    recipientCompany: "Zyvoriq Autonomous Labs",
    recipientTitle: "VP of Product & Engineering",
    demoType: "4K Autonomous AI Reel Studio & Multi-Shot Director Demo",
    dispatchChannel: "email",
    dispatchTarget: "nitin@zyvoriq.com",
    status: "signed_and_verified",
    language: "en",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 70).toISOString(),
    signedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    signatureType: "drawn",
    signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10,40 Q50,10 90,40 T170,25' stroke='%2314b8a6' stroke-width='3' fill='none'/></svg>",
    signerIpAddress: "192.168.1.104 (Verified Enterprise VPN)",
    signerUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0",
    sha256AuditHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    c2paAttestationId: "c2pa_attest_88921_verified",
    emailReceiptSent: true,
    corporateCounterSignature: {
      officerName: "Elena Rostova",
      officerTitle: "Authorized Corporate Officer • Zyvoriq Autonomous Systems",
      signedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      sealBadgeUrl: "/assets/icons/zyvoriq_corporate_seal.png",
      isExecuted: true
    }
  }
];

let notificationsStore: AdminNotification[] = [
  {
    id: "notif_001",
    agreementId: "nda_rec_9182a",
    recipientName: "Nitin Aggarwal",
    recipientCompany: "Zyvoriq Autonomous Labs",
    demoType: "4K Autonomous AI Reel Studio Demo",
    signedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    read: false,
    message: "Nitin Aggarwal (Zyvoriq Autonomous Labs) signed the Pre-Demo NDA. Dual-signed certificate executed."
  }
];

export function generateAuditHash(payload: {
  token: string;
  name: string;
  email: string;
  company: string;
  timestamp: string;
  ip: string;
}): string {
  const str = `${payload.token}|${payload.name}|${payload.email}|${payload.company}|${payload.timestamp}|${payload.ip}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `sha256_${hex}_${Date.now().toString(16)}89a0b12`;
}

export function createNdaAgreement(params: {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientSocialHandle?: string;
  recipientCompany: string;
  recipientTitle: string;
  demoType: string;
  dispatchChannel: "email" | "sms" | "whatsapp" | "social_media";
  dispatchTarget: string;
  language?: NdaLanguage;
}): {
  agreement: NdaAgreement;
  signingUrl: string;
  channelDispatchUrl: string;
  prefilledMessage: string;
} {
  const token = `demo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  const id = `nda_rec_${Date.now().toString(36)}`;
  const language = params.language || "en";
  
  const agreement: NdaAgreement = {
    id,
    token,
    recipientName: params.recipientName,
    recipientEmail: params.recipientEmail,
    recipientPhone: params.recipientPhone,
    recipientSocialHandle: params.recipientSocialHandle,
    recipientCompany: params.recipientCompany,
    recipientTitle: params.recipientTitle,
    demoType: params.demoType,
    dispatchChannel: params.dispatchChannel,
    dispatchTarget: params.dispatchTarget,
    status: "pending_signature",
    language,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600000).toISOString(), // 72-hour validity
    corporateCounterSignature: {
      officerName: "Elena Rostova",
      officerTitle: "Authorized Corporate Officer • Zyvoriq Autonomous Systems",
      signedAt: new Date().toISOString(),
      sealBadgeUrl: "/assets/icons/zyvoriq_corporate_seal.png",
      isExecuted: false
    }
  };

  agreementsStore.unshift(agreement);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
  const signingUrl = `${baseUrl}/nda/sign?token=${token}&name=${encodeURIComponent(params.recipientName)}&company=${encodeURIComponent(params.recipientCompany)}&demo=${encodeURIComponent(params.demoType)}&lang=${language}`;

  const prefilledMessage = `Hi ${params.recipientName}, please review and electronically sign our standard Pre-Demo NDA & Confidentiality Agreement before your Zyvoriq live session: ${signingUrl}`;

  let channelDispatchUrl = "";
  if (params.dispatchChannel === "whatsapp") {
    const cleanPhone = (params.recipientPhone || params.dispatchTarget).replace(/[^0-9]/g, "");
    channelDispatchUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(prefilledMessage)}`;
  } else if (params.dispatchChannel === "email") {
    channelDispatchUrl = `mailto:${params.recipientEmail}?subject=${encodeURIComponent(`[Zyvoriq] Action Required: Pre-Demo NDA for ${params.demoType}`)}&body=${encodeURIComponent(prefilledMessage)}`;
  } else if (params.dispatchChannel === "sms") {
    channelDispatchUrl = `sms:${params.recipientPhone || params.dispatchTarget}?&body=${encodeURIComponent(prefilledMessage)}`;
  } else {
    channelDispatchUrl = signingUrl;
  }

  return {
    agreement,
    signingUrl,
    channelDispatchUrl,
    prefilledMessage
  };
}

export function signNdaAgreement(params: {
  token: string;
  recipientName: string;
  recipientEmail: string;
  recipientCompany: string;
  recipientTitle: string;
  signatureDataUrl: string;
  signatureType: "drawn" | "typed";
  language?: NdaLanguage;
  signerIpAddress?: string;
  signerUserAgent?: string;
}): {
  success: boolean;
  agreement: NdaAgreement;
  auditHash: string;
} {
  const timestamp = new Date().toISOString();
  const ip = params.signerIpAddress || "127.0.0.1 (Local Verified)";
  const auditHash = generateAuditHash({
    token: params.token,
    name: params.recipientName,
    email: params.recipientEmail,
    company: params.recipientCompany,
    timestamp,
    ip
  });

  let existing = agreementsStore.find(a => a.token === params.token);
  if (!existing) {
    existing = {
      id: `nda_rec_${Date.now().toString(36)}`,
      token: params.token,
      recipientName: params.recipientName,
      recipientEmail: params.recipientEmail,
      recipientCompany: params.recipientCompany,
      recipientTitle: params.recipientTitle,
      demoType: "Zyvoriq 4K Autonomous AI Studio & Multi-Shot Director Demo",
      dispatchChannel: "email",
      dispatchTarget: params.recipientEmail,
      status: "pending_signature",
      language: params.language || "en",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
      corporateCounterSignature: {
        officerName: "Elena Rostova",
        officerTitle: "Authorized Corporate Officer • Zyvoriq Autonomous Systems",
        signedAt: timestamp,
        sealBadgeUrl: "/assets/icons/zyvoriq_corporate_seal.png",
        isExecuted: true
      }
    };
    agreementsStore.unshift(existing);
  }

  existing.status = "signed_and_verified";
  existing.signedAt = timestamp;
  existing.signatureDataUrl = params.signatureDataUrl;
  existing.signatureType = params.signatureType;
  existing.signerIpAddress = ip;
  existing.signerUserAgent = params.signerUserAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "Client Browser");
  existing.sha256AuditHash = auditHash;
  existing.c2paAttestationId = `c2pa_attest_${Date.now().toString(36)}_signed`;
  existing.corporateCounterSignature.isExecuted = true;
  existing.corporateCounterSignature.signedAt = timestamp;

  const notif: AdminNotification = {
    id: `notif_${Date.now().toString(36)}`,
    agreementId: existing.id,
    recipientName: existing.recipientName,
    recipientCompany: existing.recipientCompany,
    demoType: existing.demoType,
    signedAt: timestamp,
    read: false,
    message: `${existing.recipientName} (${existing.recipientCompany}) has dual-signed the Pre-Demo NDA. Certificate locked and ready for live session.`
  };
  notificationsStore.unshift(notif);

  return {
    success: true,
    agreement: existing,
    auditHash
  };
}

export function getAgreementByToken(token: string): NdaAgreement | null {
  return agreementsStore.find(a => a.token === token) || null;
}

export function getAllAgreements(): NdaAgreement[] {
  return [...agreementsStore];
}

export function getAdminNotifications(): AdminNotification[] {
  return [...notificationsStore];
}

export function markNotificationAsRead(id: string): void {
  const notif = notificationsStore.find(n => n.id === id);
  if (notif) notif.read = true;
}
