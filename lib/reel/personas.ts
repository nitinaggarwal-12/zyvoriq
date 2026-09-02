export interface PersonaClone {
  id: string;
  name: string;
  role: string;
  avatarEmoji?: string;
  faceImageUrl?: string;
  voiceAudioUrl?: string;
  voiceTimbre?: {
    pitch: number;
    speed: number;
    formantF1: number;
    formantF2: number;
    warmth: number;
  };
  promptDescription: string;
  isCustomClone?: boolean;
  createdAt?: string;
}

export const PRESET_PERSONAS: PersonaClone[] = [
  {
    id: "priya_sharma",
    name: "Priya Sharma (Silicon Valley CTO)",
    role: "Chief AI Officer & Tech Strategist",
    avatarEmoji: "👩‍💼",
    promptDescription: "A confident female executive in her early 30s with dark tied-back hair, wearing a sleek navy tailored blazer, warm studio key lighting, modern glass office background, speaking directly to camera.",
    voiceTimbre: { pitch: 1.05, speed: 1.0, formantF1: 520, formantF2: 1480, warmth: 80 }
  },
  {
    id: "marcus_vance",
    name: "Marcus Vance (Cybersecurity Lead)",
    role: "Principal Security Architect",
    avatarEmoji: "👨‍💻",
    promptDescription: "A focused male cybersecurity architect in his mid 30s, wearing a matte black hoodie, soft cinematic blue rim-lighting, minimal dark tech workstation with out-of-focus server racks in background, speaking directly to camera.",
    voiceTimbre: { pitch: 0.95, speed: 1.0, formantF1: 480, formantF2: 1350, warmth: 75 }
  },
  {
    id: "elena_rostova",
    name: "Elena Rostova (Astrophysicist)",
    role: "Research Director & Science Orator",
    avatarEmoji: "👩‍🔬",
    promptDescription: "A female astrophysicist in her late 20s with glasses and a burgundy sweater, warm laboratory background with out-of-focus optical equipment, soft key lighting, speaking directly to camera.",
    voiceTimbre: { pitch: 1.02, speed: 0.98, formantF1: 540, formantF2: 1520, warmth: 85 }
  },
  {
    id: "carlos_mendez",
    name: "Carlos Mendez (Growth & Founder)",
    role: "Startup Founder & Product Creator",
    avatarEmoji: "🚀",
    promptDescription: "A charismatic male founder in his early 30s, wearing an olive green crewneck shirt, natural daylight loft studio with warm brick textures and plants, conversational hand gestures, speaking directly to camera.",
    voiceTimbre: { pitch: 0.98, speed: 1.05, formantF1: 500, formantF2: 1400, warmth: 70 }
  }
];

export function getStoredCustomPersonas(): PersonaClone[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("zyvoriq_custom_personas");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomPersona(persona: PersonaClone): PersonaClone[] {
  if (typeof window === "undefined") return [];
  const current = getStoredCustomPersonas().filter(p => p.id !== persona.id);
  const updated = [persona, ...current];
  localStorage.setItem("zyvoriq_custom_personas", JSON.stringify(updated));
  return updated;
}

export function deleteCustomPersona(id: string): PersonaClone[] {
  if (typeof window === "undefined") return [];
  const updated = getStoredCustomPersonas().filter(p => p.id !== id);
  localStorage.setItem("zyvoriq_custom_personas", JSON.stringify(updated));
  return updated;
}
