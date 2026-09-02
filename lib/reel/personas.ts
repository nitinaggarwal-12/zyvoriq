/**
 * 🌍 ZYVORIQ GLOBAL DEI-COMPLIANT PERSONA & AVATAR ENGINE
 * 
 * Comprehensive representation across genders, ethnicities, age demographics (Seniors to Kids/Toddlers),
 * cultural attire, regional accents, and localized vocal formants.
 */

export type DemographicGender = "female" | "male" | "non_binary";
export type DemographicAgeTier = "senior" | "mature_adult" | "young_adult" | "teen" | "child_animated" | "toddler_animated" | "infant_animated";
export type DemographicRegion = "north_america" | "latin_america" | "europe" | "south_asia" | "east_asia" | "middle_east" | "africa" | "oceania";

export interface PersonaClone {
  id: string;
  name: string;
  role: string;
  gender?: DemographicGender;
  ageTier?: DemographicAgeTier;
  region?: DemographicRegion;
  ethnicity?: string;
  accent?: string;
  culturalStyle?: string;
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
  // 1. South Asian Female Executive (Young Adult)
  {
    id: "priya_sharma",
    name: "Priya Sharma",
    role: "Chief AI Officer & Tech Strategist",
    gender: "female",
    ageTier: "young_adult",
    region: "south_asia",
    ethnicity: "South Asian / Indian",
    accent: "Indian English (Clear Tech Neutral)",
    culturalStyle: "Sleek navy tailored blazer with subtle silk dupatta texture",
    avatarEmoji: "👩‍💼",
    promptDescription: "A confident South Asian female executive in her early 30s with dark tied-back hair, wearing a sleek navy tailored blazer, warm studio key lighting, modern glass office background, speaking directly to camera.",
    voiceTimbre: { pitch: 1.05, speed: 1.0, formantF1: 520, formantF2: 1480, warmth: 80 }
  },

  // 2. African American Male Security Lead (Mature Adult)
  {
    id: "marcus_vance",
    name: "Marcus Vance",
    role: "Principal Security Architect",
    gender: "male",
    ageTier: "mature_adult",
    region: "north_america",
    ethnicity: "African American / Black",
    accent: "US General Deep Baritone",
    culturalStyle: "Minimalist matte black technical hoodie",
    avatarEmoji: "👨‍💻",
    promptDescription: "A focused African American male cybersecurity architect in his mid 30s, wearing a matte black hoodie, soft cinematic blue rim-lighting, minimal dark tech workstation with out-of-focus server racks in background, speaking directly to camera.",
    voiceTimbre: { pitch: 0.95, speed: 1.0, formantF1: 480, formantF2: 1350, warmth: 75 }
  },

  // 3. East Asian Female Roboticist (Young Adult)
  {
    id: "mei_ling_chen",
    name: "Mei-Ling Chen",
    role: "Autonomous Robotics Lead",
    gender: "female",
    ageTier: "young_adult",
    region: "east_asia",
    ethnicity: "East Asian / Taiwanese",
    accent: "Mandarin / East Asian English",
    culturalStyle: "Clean contemporary minimalist studio turtleneck",
    avatarEmoji: "👩‍🔬",
    promptDescription: "A bright East Asian female robotics engineer in her late 20s with short modern bob hairstyle, wearing a crisp charcoal turtleneck, clean high-tech lab studio with warm ambient lighting, speaking directly to camera.",
    voiceTimbre: { pitch: 1.08, speed: 1.02, formantF1: 530, formantF2: 1550, warmth: 82 }
  },

  // 4. Hispanic / Latino Founder (Young Adult)
  {
    id: "carlos_mendez",
    name: "Carlos Mendez",
    role: "Startup Founder & Growth Creator",
    gender: "male",
    ageTier: "young_adult",
    region: "latin_america",
    ethnicity: "Hispanic / Latino",
    accent: "Latin American / Mexican English",
    culturalStyle: "Earthy olive green crewneck shirt in loft studio",
    avatarEmoji: "🚀",
    promptDescription: "A charismatic Latino male founder in his early 30s, wearing an olive green crewneck shirt, natural daylight loft studio with warm brick textures and plants, conversational hand gestures, speaking directly to camera.",
    voiceTimbre: { pitch: 0.98, speed: 1.05, formantF1: 500, formantF2: 1400, warmth: 70 }
  },

  // 5. West African Female Biotech Director (Mature Adult)
  {
    id: "amara_okafor",
    name: "Dr. Amara Okafor",
    role: "Global Health & Biotech Director",
    gender: "female",
    ageTier: "mature_adult",
    region: "africa",
    ethnicity: "West African / Nigerian",
    accent: "West African / Nigerian English",
    culturalStyle: "Vibrant emerald green Ankara tailored jacket with gold accents",
    avatarEmoji: "👑",
    promptDescription: "A distinguished West African female doctor and biotech leader in her early 40s, wearing an elegant emerald green Ankara pattern jacket with gold necklace, warm cinematic portrait lighting, modern medical research studio, speaking directly to camera.",
    voiceTimbre: { pitch: 1.02, speed: 0.98, formantF1: 510, formantF2: 1460, warmth: 90 }
  },

  // 6. Middle Eastern Female AI Ethicist (Young Adult - Modest Wear)
  {
    id: "layla_al_mansoor",
    name: "Layla Al-Mansoor",
    role: "AI Ethics & Public Policy Fellow",
    gender: "female",
    ageTier: "young_adult",
    region: "middle_east",
    ethnicity: "Middle Eastern / Emirati",
    accent: "Gulf / Arabic English",
    culturalStyle: "Elegant midnight blue hijab with contemporary slate blazer",
    avatarEmoji: "🧕",
    promptDescription: "A poised Middle Eastern female AI ethics researcher in her early 30s wearing a stylish midnight blue hijab and tailored slate blazer, contemporary university library background with warm architectural lighting, speaking directly to camera.",
    voiceTimbre: { pitch: 1.04, speed: 0.97, formantF1: 525, formantF2: 1490, warmth: 85 }
  },

  // 7. European Senior Professor & Historian (Senior 60+)
  {
    id: "arthur_pendleton",
    name: "Prof. Arthur Pendleton",
    role: "Senior Economist & Chair Emeritus",
    gender: "male",
    ageTier: "senior",
    region: "europe",
    ethnicity: "European / British",
    accent: "British Received Pronunciation (Distinguished)",
    culturalStyle: "Classic tweed waistcoat with pocket watch and reading glasses",
    avatarEmoji: "👴",
    promptDescription: "A distinguished senior British male professor in his late 60s with silver hair, wire-rimmed glasses, wearing a classic brown tweed waistcoat over a crisp white shirt, warm wood-paneled library background with bookshelves, speaking directly to camera.",
    voiceTimbre: { pitch: 0.88, speed: 0.92, formantF1: 440, formantF2: 1280, warmth: 92 }
  },

  // 8. Non-Binary Creative Director (Young Adult)
  {
    id: "jordan_kai",
    name: "Jordan Kai",
    role: "3D Motion Designer & Art Director",
    gender: "non_binary",
    ageTier: "young_adult",
    region: "north_america",
    ethnicity: "Mixed-Heritage / Asian-American",
    accent: "US West Coast Conversational",
    culturalStyle: "Asymmetrical avant-garde violet kimono wrap",
    avatarEmoji: "🧑‍🎨",
    promptDescription: "A creative non-binary artist in their late 20s with stylish silver-streaked hair, wearing an avant-garde violet drape top, colorful neon design studio background with 3D render displays, speaking directly to camera.",
    voiceTimbre: { pitch: 1.00, speed: 1.03, formantF1: 505, formantF2: 1420, warmth: 78 }
  },

  // 9. Animated Kid Storyteller (Child Demographic - 3D Pixar Style)
  {
    id: "leo_and_maya_animated",
    name: "Leo (Curious Kid Explorer)",
    role: "STEM Discovery & Storybook Guide",
    gender: "male",
    ageTier: "child_animated",
    region: "north_america",
    ethnicity: "Multi-Racial (Stylized Animated)",
    accent: "Enthusiastic Youthful Kid Voice",
    culturalStyle: "Bright yellow space-cadet hoodie with astronaut patch",
    avatarEmoji: "🧒",
    promptDescription: "A vibrant 3D stylized animated character of an 8-year-old boy named Leo with big expressive eyes, a warm smile, wearing a yellow space explorer hoodie, standing in a colorful floating 3D planetarium room, waving hands enthusiastically, speaking to camera.",
    voiceTimbre: { pitch: 1.25, speed: 1.10, formantF1: 650, formantF2: 1850, warmth: 85 }
  },

  // 10. Animated Toddler & Baby Nursery Mascot (Toddler / Infant - 3D Friendly Character)
  {
    id: "pip_the_penguin_toddler",
    name: "Pip & Luna (Toddler Learning)",
    role: "Nursery Rhymes & Alphabet Tutor",
    gender: "non_binary",
    ageTier: "toddler_animated",
    region: "global" as any,
    ethnicity: "3D Animated Mascot",
    accent: "Sweet Melodic Nursery Voice",
    culturalStyle: "Soft pastel knitted winter scarf",
    avatarEmoji: "🐧",
    promptDescription: "An adorable 3D animated baby penguin character named Pip with big sparkling eyes, gentle pastel baby room background with floating wooden alphabet blocks and soft cloud lamps, smiling warmly, speaking in cheerful baby-friendly cadence.",
    voiceTimbre: { pitch: 1.35, speed: 0.95, formantF1: 720, formantF2: 2100, warmth: 95 }
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
