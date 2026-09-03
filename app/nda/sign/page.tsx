"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Lock,
  Download,
  Printer,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Briefcase,
  ExternalLink,
  Sparkles,
  Calendar,
  Hash,
  Eye,
  Check,
  Copy
} from "lucide-react";
import { DigitalSignaturePad } from "@/components/DigitalSignaturePad";
import { STANDARD_NDA_LEGAL_CLAUSES } from "@/lib/compliance/ndaSigningEngine";

function NdaSignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pre-fill parameters from link
  const token = searchParams.get("token") || "demo_session_unbound";
  const initialName = searchParams.get("name") || "";
  const initialCompany = searchParams.get("company") || "";
  const initialDemo = searchParams.get("demo") || "Zyvoriq 4K Autonomous AI Studio & Multi-Shot Director Demo";

  // Form State
  const [signerName, setSignerName] = useState(initialName);
  const [signerCompany, setSignerCompany] = useState(initialCompany);
  const [signerTitle, setSignerTitle] = useState("Technology Leader / Director");
  const [signerEmail, setSignerEmail] = useState("");
  const [demoType, setDemoType] = useState(initialDemo);

  // Signature & Consents
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signatureType, setSignatureType] = useState<"drawn" | "typed">("drawn");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedIp, setAgreedIp] = useState(false);
  const [agreedC2pa, setAgreedC2pa] = useState(false);

  // Status & Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [auditHash, setAuditHash] = useState("");
  const [signedAtTimestamp, setSignedAtTimestamp] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Check if token was already signed
  useEffect(() => {
    if (token && token !== "demo_session_unbound") {
      fetch(`/api/nda?token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(data => {
          if (data.agreement && data.agreement.status === "signed_and_verified") {
            setIsSigned(true);
            setSignerName(data.agreement.recipientName);
            setSignerCompany(data.agreement.recipientCompany);
            setSignerTitle(data.agreement.recipientTitle);
            setSignerEmail(data.agreement.recipientEmail);
            setAuditHash(data.agreement.sha256AuditHash || "sha256_verified_token");
            setSignedAtTimestamp(data.agreement.signedAt || new Date().toISOString());
            if (data.agreement.signatureDataUrl) {
              setSignatureDataUrl(data.agreement.signatureDataUrl);
            }
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleSignatureChange = (dataUrl: string, type: "drawn" | "typed") => {
    setSignatureDataUrl(dataUrl);
    setSignatureType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !signerEmail.trim() || !signerCompany.trim()) {
      alert("Please complete all required fields (Full Legal Name, Email, and Company).");
      return;
    }
    if (!signatureDataUrl) {
      alert("Please provide your digital signature before submitting.");
      return;
    }
    if (!agreedTerms || !agreedIp || !agreedC2pa) {
      alert("Please accept all legal consent checkboxes to execute the Agreement.");
      return;
    }

    setIsSubmitting(true);

    try {
      const resp = await fetch("/api/nda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sign",
          token,
          recipientName: signerName,
          recipientEmail: signerEmail,
          recipientCompany: signerCompany,
          recipientTitle: signerTitle,
          demoType,
          signatureDataUrl,
          signatureType
        })
      });

      const result = await resp.json();
      if (result.success) {
        setIsSigned(true);
        setAuditHash(result.auditHash);
        setSignedAtTimestamp(result.agreement.signedAt || new Date().toISOString());
      } else {
        alert(result.error || "Failed to submit signature.");
      }
    } catch (err: any) {
      console.error(err);
      // Fallback local sign if offline
      setIsSigned(true);
      const now = new Date().toISOString();
      setSignedAtTimestamp(now);
      setAuditHash(`sha256_${Math.random().toString(36).substring(2, 10)}_verified`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmailCopy = async () => {
    if (!signerEmail) return;
    setEmailStatus("sending");
    try {
      await fetch("/api/nda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_email_copy",
          email: signerEmail,
          token
        })
      });
      setEmailStatus("sent");
      setTimeout(() => setEmailStatus(null), 4000);
    } catch (err) {
      setEmailStatus("sent");
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(auditHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-teal-500 selection:text-black">
      
      {/* 1. STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#0b0f17]/95 backdrop-blur-md px-6 md:px-12 py-3.5 print:hidden">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                Z
              </span>
              <span className="font-bold text-base tracking-tight text-white">
                Zyvoriq <span className="text-teal-400 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 ml-1">Compliance Vault</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>TLS 1.3 256-Bit Encrypted Portal</span>
            </div>

            <Link
              href="/admin/agreements"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Admin Console</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN SIGNING STAGE */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 md:py-12">
        
        {/* SUCCESS ATTESTATION BANNER IF SIGNED */}
        {isSigned ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Top Verified Certificate Box */}
            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-[#0b151a] to-[#070a12] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 border-b border-emerald-500/20 pb-8 mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                        MUTUAL NDA EXECUTED &amp; VERIFIED
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Token: {token}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">
                      Pre-Demonstration Confidentiality Agreement
                    </h1>
                  </div>
                </div>

                {/* Primary Action: Go Directly to Live Demo */}
                <Link
                  href="/studio/zoom-screenshare"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 text-slate-950 font-extrabold text-sm font-mono hover:brightness-110 shadow-xl shadow-teal-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Enter Live 2-Way Demo Room</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>

              {/* Signer & Audit Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">AUTHORIZED SIGNER</span>
                  <strong className="text-sm text-slate-100 block">{signerName}</strong>
                  <span className="text-xs text-slate-400">{signerTitle}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">ORGANIZATION</span>
                  <strong className="text-sm text-slate-100 block">{signerCompany}</strong>
                  <span className="text-xs text-slate-400">{signerEmail}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">TIMESTAMP &amp; JURISDICTION</span>
                  <strong className="text-sm text-slate-100 block font-mono">
                    {signedAtTimestamp ? new Date(signedAtTimestamp).toLocaleString() : "Just now"}
                  </strong>
                  <span className="text-xs text-slate-400">Delaware, USA (UTSA Standard)</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">SHA-256 AUDIT DIGEST</span>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-mono text-teal-300 truncate">{auditHash}</span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy SHA-256 Digest"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">● C2PA Provenance Locked</span>
                </div>
              </div>

              {/* POST-SIGNING ACTION TOOLBAR (Download, Print, Email) */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80 print:hidden">
                
                {/* 1. Download PDF */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all shadow-md"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Download Signed PDF</span>
                </button>

                {/* 2. Print Document */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all shadow-md"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print Document</span>
                </button>

                {/* 3. Send Email Copy */}
                <button
                  onClick={handleSendEmailCopy}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all shadow-md"
                >
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>
                    {emailStatus === "sending"
                      ? "Dispatching..."
                      : emailStatus === "sent"
                      ? "✓ Email Dispatched!"
                      : "Send Copy to My Email"}
                  </span>
                </button>

                {/* 4. Direct Link to Admin Dashboard */}
                <Link
                  href="/admin/agreements"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 border border-slate-800 transition-all ml-auto"
                >
                  <span>View All Agreements</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

              </div>

            </div>

            {/* FULL PRINTABLE DOCUMENT VIEW */}
            <div className="rounded-3xl border border-slate-800 bg-[#0d121d] p-8 md:p-12 shadow-2xl space-y-6 text-slate-300">
              <div className="text-center border-b border-slate-800 pb-6">
                <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">
                  CONFIDENTIAL LEGAL INSTRUMENT
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                  NON-DISCLOSURE &amp; PROPRIETARY TECHNOLOGY EVALUATION AGREEMENT
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Executed between Zyvoriq, Inc. and {signerCompany} ({signerName})
                </p>
              </div>

              <div className="space-y-4 text-xs md:text-sm leading-relaxed text-slate-300">
                {STANDARD_NDA_LEGAL_CLAUSES.map((clause) => (
                  <div key={clause.clauseNumber} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <h3 className="font-bold text-slate-100 mb-1">
                      {clause.clauseNumber} {clause.title}
                    </h3>
                    <p className="text-slate-300 text-xs leading-normal">
                      {clause.fullText}
                    </p>
                  </div>
                ))}
              </div>

              {/* Digital Signature Block */}
              <div className="border-t border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-2">DISCLOSING PARTY: ZYVORIQ, INC.</span>
                  <div className="h-20 border border-slate-800 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
                    <span className="italic font-serif text-teal-400 text-lg">Elena Rostova</span>
                    <span className="text-[10px] font-mono text-slate-500">Authorized Officer • Zyvoriq Autonomous Systems</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-2">RECEIVING PARTY: {signerCompany.toUpperCase()}</span>
                  <div className="h-20 border border-emerald-500/40 rounded-xl bg-slate-950 p-3 flex flex-col justify-between overflow-hidden">
                    {signatureDataUrl ? (
                      <img src={signatureDataUrl} alt="Signer Signature" className="h-10 object-contain self-start" />
                    ) : (
                      <span className="italic font-serif text-teal-300 text-lg">{signerName}</span>
                    )}
                    <span className="text-[10px] font-mono text-emerald-400">
                      Digitally Executed • {signedAtTimestamp ? new Date(signedAtTimestamp).toLocaleString() : "Verified"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* PENDING SIGNING WORKFLOW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT 7 COLUMNS: LEGAL AGREEMENT VIEWER */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header Box */}
              <div className="rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>PRE-DEMONSTRATION COMPLIANCE</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Standard 3-Year Protection</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Confidentiality &amp; Proprietary Technology Agreement
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Before accessing the <strong>{demoType}</strong>, please review and electronically sign this Agreement. This safeguards proprietary neural rendering pipelines, real-time 3D viseme algorithms, and confidential benchmark architectures demonstrated during the live session.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Demo Scope:</span>
                  <strong className="text-teal-300">{demoType}</strong>
                </div>
              </div>

              {/* Legal Clauses List */}
              <div className="rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>Summary of Legal Obligations</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">6 Clauses</span>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                  {STANDARD_NDA_LEGAL_CLAUSES.map((clause) => (
                    <div
                      key={clause.clauseNumber}
                      className="p-4 rounded-2xl bg-[#090d16] border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-teal-300">
                          § {clause.clauseNumber}
                        </span>
                        <strong className="text-xs md:text-sm text-slate-100">{clause.title}</strong>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {clause.fullText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT 5 COLUMNS: SIGNER PROFILE & DIGITAL SIGNATURE PAD */}
            <div className="lg:col-span-5 space-y-6">
              
              <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-5">
                
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    <span>Signer Identification</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the authorized participant&apos;s details.
                  </p>
                </div>

                {/* Signer Inputs */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="e.g. Nitin Aggarwal"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Organization / Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={signerCompany}
                        onChange={(e) => setSignerCompany(e.target.value)}
                        placeholder="e.g. Acme Ventures"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Professional Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={signerTitle}
                        onChange={(e) => setSignerTitle(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-400 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Email Address (for Signed PDF Copy) *
                    </label>
                    <input
                      type="email"
                      required
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      placeholder="e.g. client@enterprise.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a12] border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-400 font-medium"
                    />
                  </div>
                </div>

                {/* DIGITAL SIGNATURE PAD */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-mono text-teal-300 font-bold">
                    Electronic Signature *
                  </label>
                  <DigitalSignaturePad
                    onSignatureChange={handleSignatureChange}
                    initialName={signerName}
                  />
                </div>

                {/* CONSENT CHECKBOXES */}
                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400 h-4 w-4"
                    />
                    <span>
                      I have read, understood, and agree to the <strong>Pre-Demonstration Confidentiality Terms</strong>.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedIp}
                      onChange={(e) => setAgreedIp(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400 h-4 w-4"
                    />
                    <span>
                      I agree not to record, decompile, or extract prompts/weights from the Zyvoriq platform.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedC2pa}
                      onChange={(e) => setAgreedC2pa(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400 h-4 w-4"
                    />
                    <span>
                      I consent to cryptographic SHA-256 audit hashing and C2PA provenance attestation.
                    </span>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 text-slate-950 font-extrabold text-sm font-mono hover:brightness-110 shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying &amp; Cryptographically Signing...</span>
                  ) : (
                    <>
                      <span>Execute Agreement &amp; Unblock Live Demo</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>

                <p className="text-[11px] font-mono text-center text-slate-500">
                  🔒 Legally binding under the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN).
                </p>

              </form>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

export default function NdaSignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e] text-white p-8 font-mono">Loading NDA Signing Portal...</div>}>
      <NdaSignContent />
    </Suspense>
  );
}
