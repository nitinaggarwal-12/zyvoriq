"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Users,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  X,
  Volume2,
  Camera,
  ShieldCheck,
  Layers,
  Sparkle
} from "lucide-react";
import {
  PersonaClone,
  PRESET_PERSONAS,
  getStoredCustomPersonas,
  saveCustomPersona,
  deleteCustomPersona
} from "@/lib/reel/personas";

interface PersonaVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonaId: string;
  onSelectPersona: (persona: PersonaClone) => void;
}

export function PersonaVaultModal({
  isOpen,
  onClose,
  selectedPersonaId,
  onSelectPersona
}: PersonaVaultModalProps) {
  const [customPersonas, setCustomPersonas] = useState<PersonaClone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Creator & Presenter");
  const [newPrompt, setNewPrompt] = useState("");
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [voiceAudioBase64, setVoiceAudioBase64] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomPersonas(getStoredCustomPersonas());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allPersonas = [...customPersonas, ...PRESET_PERSONAS];

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.onloadend = () => setVoiceAudioBase64(reader.result as string);
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            handleStopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access is required to clone your voice.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFaceImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setVoiceAudioBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveClone = () => {
    if (!newName.trim()) {
      alert("Please give your cloned persona a name.");
      return;
    }
    const newPersona: PersonaClone = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || "Virtual Twin",
      avatarEmoji: "👤",
      faceImageUrl: faceImageBase64 || undefined,
      voiceAudioUrl: voiceAudioBase64 || undefined,
      promptDescription:
        newPrompt.trim() ||
        `A photorealistic virtual twin of ${newName.trim()} speaking naturally directly to camera with cinematic key lighting.`,
      isCustomClone: true,
      createdAt: new Date().toISOString()
    };
    const updated = saveCustomPersona(newPersona);
    setCustomPersonas(updated);
    onSelectPersona(newPersona);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName("");
    setNewRole("Creator & Presenter");
    setNewPrompt("");
    setFaceImageBase64(null);
    setVoiceAudioBase64(null);
    setRecordingSeconds(0);
    setIsRecording(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this cloned persona?")) {
      const updated = deleteCustomPersona(id);
      setCustomPersonas(updated);
    }
  };

  const handleAudition = (persona: PersonaClone, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === persona.id) {
      setPlayingId(null);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      return;
    }

    setPlayingId(persona.id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `Hi, I am ${persona.name}. Ready to broadcast your next viral reel with Veo 3.1.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona.voiceTimbre?.speed || 1.0;
      utterance.pitch = persona.voiceTimbre?.pitch || 1.0;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1015] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Persona & Avatar Vault</h2>
              <p className="text-xs text-slate-400">
                Choose a virtual twin or clone your own face & voice (HeyGen / ElevenLabs style)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isCreating ? (
            <div>
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Available Personas & Virtual Twins ({allPersonas.length})
                </span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-black text-pink-300 transition hover:bg-pink-500/20"
                >
                  <Plus className="h-4 w-4" /> Clone My Face & Voice
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {allPersonas.map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        onClose();
                      }}
                      className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition ${
                        isSelected
                          ? "border-pink-500/60 bg-pink-500/[0.08] shadow-lg shadow-pink-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-2xl">
                              {persona.faceImageUrl ? (
                                <img
                                  src={persona.faceImageUrl}
                                  alt={persona.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                persona.avatarEmoji || "👤"
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{persona.name}</h4>
                                {persona.isCustomClone && (
                                  <span className="rounded-md border border-pink-500/30 bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-pink-300">
                                    Custom Clone
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{persona.role}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-300">
                          {persona.promptDescription}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <button
                          onClick={(e) => handleAudition(persona, e)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-pink-300"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{playingId === persona.id ? "Auditioning..." : "Audition Voice"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {persona.isCustomClone && (
                            <button
                              onClick={(e) => handleDelete(persona.id, e)}
                              className="p-1 text-slate-500 hover:text-red-400"
                              title="Delete Persona"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <span className="text-[11px] font-bold text-pink-400">
                            {isSelected ? "Active Persona" : "Select →"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Creation Form */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">🧬 Create Your AI Clone (Face & Voice)</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Step 1: Face Anchor */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                    <Camera className="h-4 w-4" /> 1. FACE IDENTITY ANCHOR
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Upload a clean selfie or headshot to lock your face geometry in Veo.
                  </p>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-slate-500">
                      {faceImageBase64 ? (
                        <img
                          src={faceImageBase64}
                          alt="Face Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-6 w-6" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Photo
                      </button>
                      {faceImageBase64 && (
                        <button
                          onClick={() => setFaceImageBase64(null)}
                          className="text-[11px] font-semibold text-red-400 hover:underline"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Voice Sample */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                    <Mic className="h-4 w-4" /> 2. NEURAL VOICE CLONE SAMPLE
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Record 15 seconds or upload audio to clone your vocal timbre and cadence.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <button
                          onClick={handleStartRecording}
                          className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-pink-600"
                        >
                          <Mic className="h-3.5 w-3.5" /> Record Voice (15s)
                        </button>
                      ) : (
                        <button
                          onClick={handleStopRecording}
                          className="flex animate-pulse items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white"
                        >
                          <MicOff className="h-3.5 w-3.5" /> Stop ({recordingSeconds}s / 15s)
                        </button>
                      )}

                      <input
                        type="file"
                        ref={audioInputRef}
                        onChange={handleAudioUpload}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Audio
                      </button>
                    </div>

                    {voiceAudioBase64 && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                        <Check className="h-4 w-4" /> Voice sample captured & encoded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Persona Details */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-400">CLONE NAME</span>
                    <input
                      type="text"
                      placeholder="e.g. Nitin (Executive Studio)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-pink-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-400">ROLE OR TITLE</span>
                    <input
                      type="text"
                      placeholder="e.g. Founder & AI Architect"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-pink-500"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-bold text-slate-400">
                    VISUAL & ENVIRONMENT PROMPT DIRECTIVE
                  </span>
                  <textarea
                    rows={3}
                    placeholder="Describe your wardrobe and preferred studio setting (e.g. A presenter in a navy t-shirt against a clean grey studio with warm key lighting, looking directly into camera)."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs font-medium text-white outline-none focus:border-pink-500"
                  />
                </label>
              </div>

              {/* Save button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClone}
                  disabled={!newName.trim()}
                  className="flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-2.5 text-xs font-black text-white transition hover:bg-pink-600 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" /> Save Clone to Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
