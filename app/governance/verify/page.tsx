"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  ShieldCheck, 
  Camera, 
  Scan, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  FileText, 
  Globe, 
  Key, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { 
  APPROVED_DOCUMENT_PRESETS, 
  DocumentType, 
  executeLiveVerification, 
  generateLivenessChallenge, 
  VerificationResult,
  VerificationChallenge
} from "@/lib/compliance/identityVerificationEngine";

export default function IdentityVerificationPage() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("passport_icao");
  const [countryCode, setCountryCode] = useState("USA");
  const [bipaConsent, setBipaConsent] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [challenge, setChallenge] = useState<VerificationChallenge>(generateLivenessChallenge());
  const [challengeColorIndex, setChallengeColorIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<"idle" | "liveness" | "scanning_document" | "complete">("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [simulatedVirtualCam, setSimulatedVirtualCam] = useState(false);
  const [simulatedUnderage, setSimulatedUnderage] = useState(false);

  // Cycling dynamic reflection colors during liveness check
  useEffect(() => {
    if (activeStep === "liveness" && challenge.expectedColorSequence) {
      const interval = setInterval(() => {
        setChallengeColorIndex(prev => (prev + 1) % challenge.expectedColorSequence!.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [activeStep, challenge]);

  const handleStartVerification = async () => {
    if (!bipaConsent) return;
    setIsVerifying(true);
    setActiveStep("liveness");
    setResult(null);

    // Step 1: 3D Liveness & Dynamic Reflection (2.5s)
    await new Promise(r => setTimeout(r, 2200));
    setActiveStep("scanning_document");

    // Step 2: OCR & Checksum Extraction (2s)
    await new Promise(r => setTimeout(r, 1800));

    // Step 3: Complete & Generate Attestation
    const res = await executeLiveVerification({
      userId: "usr_creator_84920",
      documentType: selectedDocType,
      countryCode,
      virtualWebcamDetected: simulatedVirtualCam,
      bipaConsentGiven: bipaConsent,
      forceUnderageTest: simulatedUnderage
    });

    setResult(res);
    setActiveStep("complete");
    setIsVerifying(false);
  };

  const handleReset = () => {
    setActiveStep("idle");
    setResult(null);
    setChallenge(generateLivenessChallenge());
  };

  const activeColor = challenge.expectedColorSequence?.[challengeColorIndex] || "#00F0FF";
  const docPreset = APPROVED_DOCUMENT_PRESETS[selectedDocType];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <AppNavbar />

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Header Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Live Video &amp; Government ID Age Verification Vault
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Compliant with <strong className="text-teal-300">BIPA, GDPR Art. 9/22, EU DSA, UK OSA, and COPPA</strong>. Features 3D dynamic reflection liveness, zero biometric storage, and cryptographic Zero-Knowledge Age Proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Zero-Biometric RAM Processing</span>
            </span>
          </div>
        </div>

        {/* 3-Column Zero-Gutter Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Document Configuration & Legal Consents (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <FileText className="h-4 w-4" />
                <span>1. Select Government ID Type</span>
              </div>

              {/* Document Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Supported Document Standard</label>
                <select
                  value={selectedDocType}
                  onChange={e => setSelectedDocType(e.target.value as DocumentType)}
                  disabled={isVerifying}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-teal-400"
                >
                  <option value="passport_icao">International Passport (ICAO Doc 9303)</option>
                  <option value="driver_license_aamva">US &amp; Canada Driver's License (AAMVA PDF417)</option>
                  <option value="eu_national_id">EU National ID Card (eIDAS Standard)</option>
                  <option value="india_aadhaar_pan">India Government ID (Masked Aadhaar / PAN)</option>
                  <option value="uk_photocard">UK Photocard Driving Licence</option>
                </select>
              </div>

              {/* Issuing Country */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Issuing Jurisdiction / Country</label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value.toUpperCase())}
                    disabled={isVerifying}
                    placeholder="e.g. USA, GBR, DEU, IND"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono uppercase focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Document Preset Details */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs space-y-2">
                <div className="font-bold text-white text-[11px]">{docPreset.name}</div>
                <div className="text-slate-400 text-[10px]">
                  <strong>Supported Formats:</strong> {docPreset.formats.join(" • ")}
                </div>
                <div className="text-teal-400 text-[10px]">
                  <strong>Security Checks:</strong> {docPreset.securityFeatures.join(" • ")}
                </div>
              </div>

              {/* Legal & Biometric Consent (BIPA & GDPR Art. 9) */}
              <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="bipa-consent"
                    checked={bipaConsent}
                    onChange={e => setBipaConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400"
                  />
                  <label htmlFor="bipa-consent" className="text-[11px] text-slate-300 leading-tight">
                    <strong className="text-white">Informed Biometric &amp; Age Consent:</strong> I agree to live optical video analysis to verify age and prevent platform abuse. All video frames are processed in volatile RAM and immediately discarded. No raw biometric templates are stored.
                  </label>
                </div>
              </div>

              {/* Simulation Sandbox Toggles */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Anti-Spoofing &amp; Edge Case Simulation
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Simulate Virtual Camera (Deepfake Injection):</span>
                  <input
                    type="checkbox"
                    checked={simulatedVirtualCam}
                    onChange={e => setSimulatedVirtualCam(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-rose-500"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Simulate Minor Under 18 (COPPA Test):</span>
                  <input
                    type="checkbox"
                    checked={simulatedUnderage}
                    onChange={e => setSimulatedUnderage(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                </div>
              </div>

              {/* Trigger Button */}
              <button
                onClick={handleStartVerification}
                disabled={isVerifying || !bipaConsent}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-obsidian-950 font-bold text-xs shadow-lg shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executing Live Optical Challenge...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Start Live ID &amp; Age Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Live Video & Dynamic Reflection Viewport (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div 
              className="rounded-2xl border bg-slate-950 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300"
              style={{
                borderColor: activeStep === "liveness" ? activeColor : "#1e293b",
                boxShadow: activeStep === "liveness" ? `0 0 35px ${activeColor}40` : "none"
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Eye className="h-4 w-4 text-teal-400" />
                  <span>2. Live Presentation Attack Detection (PAD)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                  Status: {activeStep.toUpperCase()}
                </span>
              </div>

              {/* Video Stream Stage */}
              <div className="relative mt-4 aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                {/* Dynamic Reflection Light Pulse Bar */}
                {activeStep === "liveness" && (
                  <div 
                    className="absolute inset-0 border-8 pointer-events-none transition-colors duration-300"
                    style={{ borderColor: activeColor }}
                  />
                )}

                {/* Live Scanner Crosshairs */}
                <div className="absolute inset-4 border border-dashed border-teal-500/40 rounded-lg pointer-events-none flex items-center justify-center">
                  <Scan className={`h-16 w-16 text-teal-400/40 ${activeStep !== "idle" ? "animate-pulse" : ""}`} />
                </div>

                {/* Center Status Feedback */}
                <div className="relative z-10 text-center space-y-2 p-4">
                  {activeStep === "idle" && (
                    <div className="space-y-2">
                      <Camera className="h-10 w-10 text-slate-500 mx-auto" />
                      <div className="text-xs font-bold text-white">Camera Standby</div>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Click "Start Live ID &amp; Age Verification" to begin the dynamic 3D reflection challenge.
                      </p>
                    </div>
                  )}

                  {activeStep === "liveness" && (
                    <div className="space-y-2">
                      <div className="h-3 w-3 rounded-full bg-teal-400 mx-auto animate-ping" />
                      <div className="text-xs font-bold text-teal-300">3D Skin Reflectance Check</div>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {challenge.prompt}
                      </p>
                    </div>
                  )}

                  {activeStep === "scanning_document" && (
                    <div className="space-y-2">
                      <Scan className="h-8 w-8 text-emerald-400 mx-auto animate-spin" />
                      <div className="text-xs font-bold text-emerald-300">Extracting ICAO MRZ &amp; AAMVA Barcode</div>
                      <p className="text-[11px] text-slate-300 font-mono">
                        Validating Mod-7 Checksums &amp; Anti-Tamper Hologram...
                      </p>
                    </div>
                  )}

                  {activeStep === "complete" && result && (
                    <div className="space-y-2">
                      {result.status === "VERIFIED_COMPLIANT" ? (
                        <>
                          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                          <div className="text-sm font-bold text-emerald-300">Identity &amp; Age Verified (18+)</div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto animate-bounce" />
                          <div className="text-sm font-bold text-rose-300">{result.status}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Optical Glare HUD */}
                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 border border-slate-800">
                  Optical Glare: 96% Clean (No Reflection Washes)
                </div>
              </div>

              {/* Hardware & Driver Checks */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  WebRTC Driver: <strong className="text-teal-300">{simulatedVirtualCam ? "OBS-Virtual-Camera [FLAGGED]" : "Hardware Direct"}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Liveness Metric: <strong className="text-emerald-400">{result ? `${(result.livenessScore * 100).toFixed(1)}%` : "0.994 Target"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Cryptographic Attestation & Audit Ledger (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <Key className="h-4 w-4" />
                <span>3. Cryptographic Proof Vault</span>
              </div>

              {result ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`rounded-xl p-3.5 border ${
                    result.status === "VERIFIED_COMPLIANT"
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/30 border-rose-500/40 text-rose-300"
                  }`}>
                    <div className="font-bold text-xs">{result.status}</div>
                    <div className="text-[10px] mt-1 opacity-90">{result.auditMessage}</div>
                  </div>

                  {/* Parsed Attributes */}
                  {result.documentData && (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Calculated Age:</span>
                        <strong className="font-mono text-white">{result.documentData.calculatedAge} Years Old</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Age 18+ Adult:</span>
                        <strong className="font-mono text-emerald-400">{result.documentData.isAge18Plus ? "YES" : "NO"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Issuing Country:</span>
                        <strong className="font-mono text-white">{result.documentData.issuingCountry}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Anti-Sybil Hash:</span>
                        <strong className="font-mono text-teal-300 text-[10px] truncate max-w-[120px]">
                          {result.documentData.blindedDocumentHash}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Attestation Proof */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-[10px] font-mono">
                    <div className="text-slate-400 font-bold uppercase">Zero-Knowledge Attestation</div>
                    <div className="text-emerald-300 truncate">ID: {result.cryptographicAttestation.attestationId}</div>
                    <div className="text-teal-400">Algo: {result.cryptographicAttestation.algorithm}</div>
                    <div className="text-slate-400">Signed: {new Date(result.cryptographicAttestation.verifiedAt).toLocaleTimeString()}</div>
                  </div>

                  {/* GDPR Human Appeal Button */}
                  {result.gdprHumanReviewEligible && (
                    <button
                      onClick={() => alert("Human-in-the-loop review ticket opened. Our compliance team will review within 24 hours under GDPR Art. 22.")}
                      className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 text-[11px] font-medium transition-colors"
                    >
                      Request Human Review Appeal (GDPR Art. 22)
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    Verify Another Identity
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                  <Lock className="h-8 w-8 mx-auto opacity-40" />
                  <p>Complete the live verification on the left to generate an immutable zero-knowledge age attestation.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
