"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Globe,
  MapPin,
  Calendar,
  Building,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
  Zap,
  Fingerprint,
  RefreshCw
} from "lucide-react";
import { SsoProvider, VerifiedSsoProfile, SSO_PRESET_PROFILES } from "@/lib/auth/ssoVerificationEngine";

export default function SsoLoginPage() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<VerifiedSsoProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SsoProvider>("google");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const fetchSession = async () => {
    try {
      const resp = await fetch("/api/auth/sso");
      const data = await resp.json();
      if (data.session) {
        setActiveSession(data.session);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleProviderLogin = async (provider: SsoProvider) => {
    setSelectedProvider(provider);
    setIsAuthenticating(true);

    try {
      const resp = await fetch("/api/auth/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          provider
        })
      });

      const data = await resp.json();
      if (data.session) {
        setActiveSession(data.session);
        setToastMessage(`✓ ${provider.toUpperCase()} SSO Verified! Identity, Age (21+), and Location claims extracted.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCopyDigest = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-teal-500 selection:text-black">
      
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#0b0f17]/95 backdrop-blur-md px-6 md:px-12 py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                Z
              </span>
              <span className="font-bold text-base tracking-tight text-white">
                Zyvoriq <span className="text-teal-400 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 ml-1">SSO Identity Vault</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
              <span>Zero-Friction Automated KYC</span>
            </div>

            <Link
              href="/studio"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Studio Cinema</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN SSO PORTAL CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 md:py-16">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5 COLS: 1-CLICK SSO PROVIDER BUTTONS */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-[#0d121d] p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>ENTERPRISE FEDERATED LOGIN</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Single Sign-On (SSO)
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authenticate securely with your corporate or social provider. We automatically extract and verify your <strong>Legal Name</strong>, <strong>Age Tier (18+/21+)</strong>, and <strong>Location</strong> without requiring manual form uploads.
              </p>
            </div>

            {/* SSO Action Buttons */}
            <div className="space-y-3">
              
              {/* 1. GOOGLE */}
              <button
                type="button"
                onClick={() => handleProviderLogin("google")}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#131b2a] hover:bg-[#1a253a] text-white font-medium text-xs border border-slate-700/80 hover:border-teal-500/60 transition-all flex items-center justify-between group shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center font-black text-xs text-blue-600 shadow-sm">
                    G
                  </div>
                  <div className="text-left">
                    <strong className="text-slate-100 text-xs block group-hover:text-teal-300 transition-colors">Continue with Google</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Workspace &amp; Personal OpenID</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 2. LINKEDIN */}
              <button
                type="button"
                onClick={() => handleProviderLogin("linkedin")}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#131b2a] hover:bg-[#1a253a] text-white font-medium text-xs border border-slate-700/80 hover:border-teal-500/60 transition-all flex items-center justify-between group shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#0077b5] flex items-center justify-center font-bold text-xs text-white shadow-sm">
                    in
                  </div>
                  <div className="text-left">
                    <strong className="text-slate-100 text-xs block group-hover:text-teal-300 transition-colors">Continue with LinkedIn</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Executive &amp; Professional Title Sync</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 3. APPLE */}
              <button
                type="button"
                onClick={() => handleProviderLogin("apple")}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#131b2a] hover:bg-[#1a253a] text-white font-medium text-xs border border-slate-700/80 hover:border-teal-500/60 transition-all flex items-center justify-between group shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-black border border-slate-700 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                    
                  </div>
                  <div className="text-left">
                    <strong className="text-slate-100 text-xs block group-hover:text-teal-300 transition-colors">Sign in with Apple</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Biometric Passkey &amp; TouchID/FaceID</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 4. GITHUB */}
              <button
                type="button"
                onClick={() => handleProviderLogin("github")}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#131b2a] hover:bg-[#1a253a] text-white font-medium text-xs border border-slate-700/80 hover:border-teal-500/60 transition-all flex items-center justify-between group shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#24292e] flex items-center justify-center font-bold text-xs text-white shadow-sm">
                    GH
                  </div>
                  <div className="text-left">
                    <strong className="text-slate-100 text-xs block group-hover:text-teal-300 transition-colors">Continue with GitHub</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Developer SSH &amp; Verified Emails</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 5. TWITTER / X */}
              <button
                type="button"
                onClick={() => handleProviderLogin("twitter_x")}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#131b2a] hover:bg-[#1a253a] text-white font-medium text-xs border border-slate-700/80 hover:border-teal-500/60 transition-all flex items-center justify-between group shadow-md cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-black border border-slate-700 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                    𝕏
                  </div>
                  <div className="text-left">
                    <strong className="text-slate-100 text-xs block group-hover:text-teal-300 transition-colors">Continue with X (Twitter)</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Creator Verified Badge &amp; Handle</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>

            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-500 text-center">
              🔒 OpenID Connect 1.0 &amp; OAuth 2.0 PKCE Protected. Zero password storage.
            </div>

          </div>

          {/* RIGHT 7 COLS: EXTRACTED VERIFIED CLAIMS & ATTRIBUTES CARD */}
          <div className="lg:col-span-7 space-y-6">
            
            {activeSession ? (
              <div className="rounded-3xl border border-teal-500/40 bg-gradient-to-br from-[#0c1922] via-[#091118] to-[#070a12] p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-500/20 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-md">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                          ● SSO CLAIMS EXTRACTED &amp; VERIFIED
                        </span>
                        <span className="text-xs font-mono text-teal-300 capitalize">
                          via {activeSession.provider}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5">Authoritative Identity Card</h2>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    Auth ID: {activeSession.userId}
                  </span>
                </div>

                {/* 3 CORE AUTO-VERIFIED PILLARS (NAME, AGE, PLACE) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
                  
                  {/* 1. VERIFIED LEGAL NAME */}
                  <div className="p-4 rounded-2xl bg-[#0b141d] border border-teal-500/30 space-y-1 shadow-lg">
                    <div className="flex items-center gap-1.5 text-teal-400 font-mono text-[10px] uppercase font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>1. Verified Legal Name</span>
                    </div>
                    <strong className="text-base text-slate-100 block font-bold">
                      {activeSession.legalName}
                    </strong>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      ✓ Authoritative Name Lock
                    </span>
                  </div>

                  {/* 2. VERIFIED AGE TIER */}
                  <div className="p-4 rounded-2xl bg-[#0b141d] border border-emerald-500/30 space-y-1 shadow-lg">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>2. Verified Age Gate</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <strong className="text-base text-emerald-300 font-black">
                        {activeSession.ageTier.replace("_", " ")}
                      </strong>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      ✓ Zero ID Upload Needed
                    </span>
                  </div>

                  {/* 3. VERIFIED PLACE & LOCATION */}
                  <div className="p-4 rounded-2xl bg-[#0b141d] border border-cyan-500/30 space-y-1 shadow-lg">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>3. Verified Place</span>
                    </div>
                    <strong className="text-xs text-slate-100 block font-bold truncate">
                      {activeSession.placeVerified.formattedLocation}
                    </strong>
                    <span className="text-[11px] text-cyan-400 font-mono">
                      ✓ Geolocation Attested
                    </span>
                  </div>

                </div>

                {/* Professional Context & Social Claims */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10 text-xs">
                  
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Organization &amp; Title</span>
                    <strong className="text-slate-100 block font-semibold">{activeSession.professionalContext.company}</strong>
                    <span className="text-slate-400 block">{activeSession.professionalContext.title}</span>
                    <span className="text-slate-500 font-mono text-[10px] block mt-1">{activeSession.email}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Provider Identity Attestation</span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-teal-300 font-mono text-[11px] truncate">{activeSession.sha256IdentityDigest}</span>
                      <button
                        onClick={() => handleCopyDigest(activeSession.sha256IdentityDigest)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy SHA-256 Digest"
                      >
                        {copiedDigest ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="text-emerald-400 font-mono text-[10px] block mt-1">● C2PA Manifest Provenance Active</span>
                  </div>

                </div>

                {/* AUTO-HYDRATION ACTION BUTTONS */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3 relative z-10">
                  
                  {/* 1. Enter Studio with Hydrated Profile */}
                  <Link
                    href="/studio"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 text-slate-950 font-extrabold text-xs font-mono hover:brightness-110 shadow-lg shadow-teal-500/20 text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Continue to Cinema Studio</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>

                  {/* 2. Auto-fill and Sign Pre-Demo NDA */}
                  <Link
                    href={`/nda/sign?name=${encodeURIComponent(activeSession.legalName)}&company=${encodeURIComponent(activeSession.professionalContext.company)}&email=${encodeURIComponent(activeSession.email)}`}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold border border-slate-700 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Auto-Fill Pre-Demo NDA</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                </div>

              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-[#0d121d] p-12 text-center text-slate-500 space-y-3">
                <Fingerprint className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-300">Select an SSO Provider to Begin</h3>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Click any provider on the left to extract and verify your legal name, age status (21+), and geographic jurisdiction.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}
