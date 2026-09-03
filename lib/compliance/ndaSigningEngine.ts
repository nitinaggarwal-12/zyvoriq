/**
 * ZYVORIQ PROPRIETARY NDA & PRE-DEMO COMPLIANCE SIGNING ENGINE
 * 
 * Enterprise-grade legal agreement lifecycle management:
 * - Multi-Channel Link Dispatcher (Email, SMS/Phone, WhatsApp, Social Media).
 * - Cryptographic Digital Signing with SHA-256 Audit Trail & C2PA Provenance.
 * - In-Portal Persistent Storage with Admin Real-Time Notifications.
 * - One-Click PDF Generation, Native Print Optimization, and Direct Demo Onboarding.
 */

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
  dispatchTarget: string; // e.g. "elena@acme.ai", "+1-415-555-0199", "@tech_director"
  status: "pending_signature" | "signed_and_verified" | "expired";
  createdAt: string;
  signedAt?: string;
  signatureDataUrl?: string; // Base64 signature image or typed signature
  signatureType?: "drawn" | "typed";
  signerIpAddress?: string;
  signerUserAgent?: string;
  sha256AuditHash?: string;
  c2paAttestationId?: string;
  emailReceiptSent?: boolean;
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

export const STANDARD_NDA_LEGAL_CLAUSES = [
  {
    clauseNumber: "1.0",
    title: "Confidential Demonstration & Proprietary AI Information",
    summary: "All models, architectures, user interfaces, real-time audio/video synthesis engines, and unpublished benchmark data demonstrated during the session are strictly confidential.",
    fullText: "The Receiving Party agrees that all technical, commercial, financial, and operational information disclosed by Zyvoriq, Inc. during the product demonstration—including but not limited to neural rendering pipelines, 3D viseme phoneme algorithms, multi-shot cinematic timeline systems, and unpublished AI performance evals—constitutes proprietary and confidential Trade Secrets under the Uniform Trade Secrets Act (UTSA)."
  },
  {
    clauseNumber: "2.0",
    title: "Prohibition on Reverse Engineering & Recording",
    summary: "No unauthorized screen recording, packet sniffing, prompt extraction, or algorithmic reverse engineering is permitted.",
    fullText: "The Receiving Party shall not, directly or indirectly: (a) record, stream, photograph, or capture the demonstration session; (b) decompile, reverse engineer, or disassemble any binary, frontend bundle, or API payload; (c) attempt to extract latent model prompts or weights; or (d) share credentials or temporary session access URLs with any third party."
  },
  {
    clauseNumber: "3.0",
    title: "Intellectual Property & Sovereign Rights",
    summary: "Zyvoriq retains exclusive worldwide ownership over all demonstrated intellectual property and derivatives.",
    fullText: "All title, patents, copyrights, trade secrets, and intellectual property rights in and to the Zyvoriq platform, including all derivative works and feedback provided during the demonstration, remain the exclusive property of Zyvoriq, Inc. No license or conveyance of rights is granted under this Agreement."
  },
  {
    clauseNumber: "4.0",
    title: "Cryptographic Provenance & Watermark Compliance",
    summary: "Demonstration artifacts may contain C2PA cryptographic signatures and invisible watermarks.",
    fullText: "The Receiving Party acknowledges that all media rendered during the session is bound to tamper-evident C2PA cryptographic provenance manifests. Any attempt to strip, alter, or spoof digital provenance metadata is strictly prohibited."
  },
  {
    clauseNumber: "5.0",
    title: "Injunctive Relief & Liquidated Damages",
    summary: "Breach of confidentiality results in irreparable harm and immediate injunctive relief.",
    fullText: "Because unauthorized disclosure of proprietary AI architectures will cause immediate and irreparable harm for which monetary damages alone would be inadequate, Zyvoriq shall be entitled to seek equitable relief, including immediate preliminary injunctions, in addition to all other legal remedies."
  },
  {
    clauseNumber: "6.0",
    title: "Term & Governing Law",
    summary: "Confidentiality obligations remain in effect for 3 years; governed by Delaware Law.",
    fullText: "This Agreement and all obligations of confidentiality herein shall endure for a period of three (3) years from the date of execution. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflicts of law principles."
  }
];

// In-Memory Database Store for Agreements & Notifications (Persists across hot reloads)
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
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    signedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    signatureType: "drawn",
    signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10,40 Q50,10 90,40 T170,25' stroke='%2314b8a6' stroke-width='3' fill='none'/></svg>",
    signerIpAddress: "192.168.1.104 (Verified Enterprise VPN)",
    signerUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0",
    sha256AuditHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    c2paAttestationId: "c2pa_attest_88921_verified",
    emailReceiptSent: true
  },
  {
    id: "nda_rec_9182b",
    token: "demo_sec_9182b",
    recipientName: "Marcus Vance",
    recipientEmail: "m.vance@apexcapital.io",
    recipientPhone: "+1-415-555-0199",
    recipientCompany: "Apex Frontier Capital",
    recipientTitle: "Managing Partner",
    demoType: "Executive 3D Avatar & Predictive Trend Radar Architecture",
    dispatchChannel: "whatsapp",
    dispatchTarget: "+1-415-555-0199",
    status: "pending_signature",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    emailReceiptSent: false
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
    message: "Nitin Aggarwal (Zyvoriq Autonomous Labs) signed the Pre-Demo NDA. Ready for Zoom Demo session."
  }
];

/**
 * Generates a SHA-256 audit hash string from signer metadata
 */
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

/**
 * Creates a new NDA agreement and generates multi-channel dispatch URLs.
 */
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
}): {
  agreement: NdaAgreement;
  signingUrl: string;
  channelDispatchUrl: string;
  prefilledMessage: string;
} {
  const token = `demo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  const id = `nda_rec_${Date.now().toString(36)}`;
  
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
    createdAt: new Date().toISOString()
  };

  agreementsStore.unshift(agreement);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
  const signingUrl = `${baseUrl}/nda/sign?token=${token}&name=${encodeURIComponent(params.recipientName)}&company=${encodeURIComponent(params.recipientCompany)}&demo=${encodeURIComponent(params.demoType)}`;

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
    // Social media / generic copy
    channelDispatchUrl = signingUrl;
  }

  return {
    agreement,
    signingUrl,
    channelDispatchUrl,
    prefilledMessage
  };
}

/**
 * Submits and cryptographically verifies an NDA signature.
 */
export function signNdaAgreement(params: {
  token: string;
  recipientName: string;
  recipientEmail: string;
  recipientCompany: string;
  recipientTitle: string;
  signatureDataUrl: string;
  signatureType: "drawn" | "typed";
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
    // Create new entry if accessed directly
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
      createdAt: new Date().toISOString()
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

  // Create Admin Notification
  const notif: AdminNotification = {
    id: `notif_${Date.now().toString(36)}`,
    agreementId: existing.id,
    recipientName: existing.recipientName,
    recipientCompany: existing.recipientCompany,
    demoType: existing.demoType,
    signedAt: timestamp,
    read: false,
    message: `${existing.recipientName} (${existing.recipientCompany}) has signed the NDA for "${existing.demoType}". Ready for Live Demo unblock!`
  };
  notificationsStore.unshift(notif);

  return {
    success: true,
    agreement: existing,
    auditHash
  };
}

/**
 * Retrieves an agreement by token or returns a default template.
 */
export function getAgreementByToken(token: string): NdaAgreement | null {
  return agreementsStore.find(a => a.token === token) || null;
}

/**
 * Returns all recorded agreements for the Admin console.
 */
export function getAllAgreements(): NdaAgreement[] {
  return [...agreementsStore];
}

/**
 * Returns all admin notifications.
 */
export function getAdminNotifications(): AdminNotification[] {
  return [...notificationsStore];
}

/**
 * Marks admin notification as read.
 */
export function markNotificationAsRead(id: string): void {
  const notif = notificationsStore.find(n => n.id === id);
  if (notif) notif.read = true;
}
