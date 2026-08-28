export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  organization: string;
  location: string;
  avatarEmoji: string;
  regionBadge: string;
  gender: "female" | "male" | "ensemble" | "narrator";
  voiceStyle: string;
  accent: string;
  specialty: string;
  defaultPromptDescription: string;
}

export const GLOBAL_CHARACTERS: CharacterProfile[] = [
  {
    id: "ren_aoi",
    name: "Sensei Ren & Apprentice Aoi",
    role: "Zen Master & Martial Prodigy",
    organization: "Kaizen Dojo Masters",
    location: "Kyoto / Tokyo, Japan",
    avatarEmoji: "🥋",
    regionBadge: "🇯🇵 East Asia",
    gender: "ensemble",
    voiceStyle: "Profound, Poetic & Dynamic",
    accent: "Authentic Kyoto Japanese",
    specialty: "Continuous Kaizen, Mushin Philosophy & Martial Choreography",
    defaultPromptDescription: "Sensei Ren and apprentice Aoi engage in master-student philosophical dialogue with cinematic samurai sword choreography."
  },
  {
    id: "priya",
    name: "Priya Sharma",
    role: "Chief AI Officer & Global CTO",
    organization: "Sovereign Intelligence Labs",
    location: "Silicon Valley, USA / Bangalore, India",
    avatarEmoji: "👩‍💼",
    regionBadge: "🇺🇸 / 🇮🇳 Global Tech",
    gender: "female",
    voiceStyle: "Authoritative, Visionary & High-Energy",
    accent: "Executive Global English",
    specialty: "zk-SNARK Cryptographic Consensus, Enterprise AI & Keynotes",
    defaultPromptDescription: "Priya delivers an authoritative mainstage executive briefing on autonomous enterprise governance with holographic data overlays."
  },
  {
    id: "david",
    name: "David Kim",
    role: "Principal Infrastructure Architect",
    organization: "Alpine Neural Systems",
    location: "Zurich, Switzerland",
    avatarEmoji: "👨‍💼",
    regionBadge: "🇨🇭 Central Europe",
    gender: "male",
    voiceStyle: "Methodical, Commanding & Technical",
    accent: "European Global English",
    specialty: "High-Throughput Clusters, Hardware Enclaves & GPU Kernels",
    defaultPromptDescription: "David provides a rigorous architectural breakdown of low-latency distributed compute clusters."
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "VP Neural Research & Bio-Cybernetics",
    organization: "Neo-Tokyo Cybernetics Institute",
    location: "Tokyo, Japan / Geneva",
    avatarEmoji: "👩‍🔬",
    regionBadge: "🇯🇵 / 🇨🇭 International",
    gender: "female",
    voiceStyle: "Dynamic, Sophisticated & Inspiring",
    accent: "Continental Multilingual Orator",
    specialty: "Cross-Border Neural Networks, ARR Growth & Edge Systems",
    defaultPromptDescription: "Elena presents a visionary keynote on biological neural integration and high-growth technology transformation."
  },
  {
    id: "marcus",
    name: "Marcus Vance",
    role: "Global FinTech Anchor & Macro Strategist",
    organization: "London Market Dispatch",
    location: "London, United Kingdom",
    avatarEmoji: "🇬🇧",
    regionBadge: "🇬🇧 Western Europe",
    gender: "male",
    voiceStyle: "Crisp, Articulate & Prestigious",
    accent: "British Received Pronunciation",
    specialty: "Global Macroeconomics, Sovereign Liquidity & Market Analysis",
    defaultPromptDescription: "Marcus hosts a high-production financial news broadcast breaking down global sovereign markets and macroeconomic policy."
  },
  {
    id: "carlos",
    name: "Carlos Mendoza",
    role: "DeepTech Evangelist & Open Source Pioneer",
    organization: "Iberian Quantum Collective",
    location: "Madrid, Spain / Barcelona",
    avatarEmoji: "🇪🇸",
    regionBadge: "🇪🇸 Southern Europe / LatAm",
    gender: "male",
    voiceStyle: "Passionate, Articulate & Engaging",
    accent: "Castilian / Latin American Bilingual",
    specialty: "Decentralized Protocols, Open Compute & Developer Ecosystems",
    defaultPromptDescription: "Carlos gives an energetic presentation on open-source quantum tooling and next-generation decentralized ecosystems."
  },
  {
    id: "amara",
    name: "Amara Okafor",
    role: "Creative Studio Director & Spatial Storyteller",
    organization: "Afro-Futurism Spatial Lab",
    location: "Lagos, Nigeria",
    avatarEmoji: "🇳🇬",
    regionBadge: "🇳🇬 West Africa",
    gender: "female",
    voiceStyle: "Warm, Expressive & Inspiring",
    accent: "West African English / Multilingual",
    specialty: "Afro-Futuristic Visuals, Spatial Audio & Immersive Culture",
    defaultPromptDescription: "Amara narrates an immersive cultural showcase blending ancient folklore with hyper-modern spatial computing aesthetics."
  },
  {
    id: "meiling",
    name: "Mei-Ling Zhou",
    role: "Quantum Computing Lead & Systems Theorist",
    organization: "Pudong Quantum Accelerator",
    location: "Shanghai, China",
    avatarEmoji: "🇨🇳",
    regionBadge: "🇨🇳 East Asia",
    gender: "female",
    voiceStyle: "Sharp, Precise & Futuristic",
    accent: "Mandarin / International English",
    specialty: "Topological Qubits, Cryogenic Hardware & Complex Simulation",
    defaultPromptDescription: "Mei-Ling explains quantum entanglement architectures and cryogenic supercomputing with clean geometric visualizations."
  },
  {
    id: "gabriel",
    name: "Gabriel Silva",
    role: "Climate Intelligence & Satellite Scientist",
    organization: "Amazonia Planetary Observatory",
    location: "São Paulo, Brazil",
    avatarEmoji: "🇧🇷",
    regionBadge: "🇧🇷 South America",
    gender: "male",
    voiceStyle: "Urgent, Captivating & Grounded",
    accent: "Brazilian Portuguese / Global English",
    specialty: "Earth Observation, Satellite Telemetry & Planetary Ecology",
    defaultPromptDescription: "Gabriel presents real-time satellite telemetry mapping biodiversity corridors and Amazonian canopy restoration."
  },
  {
    id: "sarah",
    name: "Dr. Sarah Campbell",
    role: "Astrobiologist & Deep-Space Exploration Lead",
    organization: "Southern Sky Cosmic Institute",
    location: "Sydney, Australia",
    avatarEmoji: "🇦🇺",
    regionBadge: "🇦🇺 Asia-Pacific",
    gender: "female",
    voiceStyle: "Curious, Wonder-Filled & Authoritative",
    accent: "Australian English",
    specialty: "Exoplanetary Atmospheres, Radio Astronomy & Cosmic Geology",
    defaultPromptDescription: "Dr. Sarah Campbell walks through the latest spectral data from James Webb exoplanet atmospheric transits."
  },
  {
    id: "henrik",
    name: "Dr. Henrik Weber",
    role: "Robotics & Precision Mechanical Engineer",
    organization: "Bavarian Advanced Mechatronics",
    location: "Munich, Germany",
    avatarEmoji: "🇩🇪",
    regionBadge: "🇩🇪 Central Europe",
    gender: "male",
    voiceStyle: "Structured, Analytical & Deep",
    accent: "German English",
    specialty: "Humanoid Actuators, Sub-Micron CNC & Industrial Automation",
    defaultPromptDescription: "Dr. Henrik Weber conducts a live diagnostic on high-torque harmonic robotics actuators in a cleanroom laboratory."
  },
  {
    id: "celeste",
    name: "Céleste Laurent",
    role: "Cognitive Neuroscientist & Ethics Auditor",
    organization: "Sorbonne AI Governance Council",
    location: "Paris, France",
    avatarEmoji: "🇫🇷",
    regionBadge: "🇫🇷 Western Europe",
    gender: "female",
    voiceStyle: "Reflective, Eloquent & Measured",
    accent: "French English",
    specialty: "Neuro-Symbolic Reasoning, Moral Alignment & Privacy Laws",
    defaultPromptDescription: "Céleste delivers a keynote on cognitive alignment benchmarks and mathematical boundaries of synthetic agency."
  },
  {
    id: "narrator_nature",
    name: "Sir David (Wildlife Documentarian)",
    role: "Master Nature & Wildlife Narrator",
    organization: "BBC Earth & National Geographic Heritage",
    location: "Global Savanna & Oceans",
    avatarEmoji: "🦁",
    regionBadge: "🌍 Global Naturalist",
    gender: "narrator",
    voiceStyle: "Reverent, Cinematic & Whisper-Rich",
    accent: "Master Naturalist British English",
    specialty: "Apex Predator Dynamics, Ecosystem Balance & Macro Wildlife",
    defaultPromptDescription: "Sir David provides awe-inspiring natural history narration observing wildlife behavior in undisturbed pristine habitats."
  },
  {
    id: "narrator_epic",
    name: "Apex Cinema Voiceover",
    role: "Hollywood Blockbuster Trailer Narrator",
    organization: "IMAX Theatrical Voice Studios",
    location: "Los Angeles, USA",
    avatarEmoji: "🎬",
    regionBadge: "🎥 Global Cinema",
    gender: "narrator",
    voiceStyle: "Thunderous, Resonant & Epic",
    accent: "Deep Theatrical American Bass",
    specialty: "Blockbuster Trailers, Sci-Fi Teasers & Dramatic Prompts",
    defaultPromptDescription: "A booming theatrical narrator introduces the stakes of a civilization-scale conflict or technological singularity."
  }
];

export const VISUAL_AESTHETICS = [
  {
    id: "photorealistic_keynote",
    label: "🎥 Photorealistic 4K Broadcast",
    description: "BBC/CNN studio lighting, teleprompter eye-line, AR graph projections",
    badge: "Executive / News"
  },
  {
    id: "bbc_earth_8k",
    label: "🌿 BBC Earth 8K Naturalism",
    description: "Volumetric sunrise rays, macro anamorphic bokeh, authentic wildlife realism",
    badge: "Nature / Wildlife"
  },
  {
    id: "ufotable_anime",
    label: "🌸 Ufotable Cinematic Anime",
    description: "Volumetric light shafts, sakura blossom particles, high-octane 24fps motion",
    badge: "Anime / Action"
  },
  {
    id: "ghibli_pastoral",
    label: "🎨 Studio Ghibli Watercolor",
    description: "Lush hand-painted backgrounds, wind-swept meadows, whimsical cel animation",
    badge: "Animation / Heartfelt"
  },
  {
    id: "cyberpunk_noir",
    label: "🌆 Cinematic Cyberpunk Neon",
    description: "Blade Runner rain puddles, holographic billboards, anamorphic blue flare",
    badge: "Sci-Fi / Future"
  },
  {
    id: "ue5_raytraced",
    label: "⚙️ Unreal Engine 5 (Raytraced / 3D CAD)",
    description: "Nanite micro-polygons, Lumen global bounce, metallic reflections",
    badge: "CGI / Industrial"
  },
  {
    id: "imax_70mm",
    label: "🎬 IMAX 70mm Cinematic Film",
    description: "Kodak 5219 film emulsion, 1.43:1 grand vista, organic warm highlights",
    badge: "Hollywood / Epic"
  },
  {
    id: "bollywood_grandeur",
    label: "🇮🇳 Bollywood Grandeur & Dynamic Drama",
    description: "Majestic palace lighting, saturated jewel tones, sweeping low-angle cranes",
    badge: "Drama / Spectacle"
  },
  {
    id: "k_drama_seoul",
    label: "🇰🇷 Neo-Seoul K-Drama Aesthetic",
    description: "Minimalist urban palette, gentle diffuse backlit portraits, high fashion",
    badge: "Drama / Modern"
  },
  {
    id: "french_new_wave",
    label: "🇫🇷 French New Wave Arthouse",
    description: "Natural high-contrast monochrome, handheld jump-cuts, moody atmosphere",
    badge: "Arthouse / Classic"
  },
  {
    id: "interstellar_sci_fi",
    label: "🌌 Interstellar Cosmic Sci-Fi",
    description: "Deep space accretion disks, gravitational lensing, cold starlight contrast",
    badge: "Cosmos / Sci-Fi"
  },
  {
    id: "biomedical_micro",
    label: "🧪 Biomedical 3D Micro-Cellular",
    description: "Cryo-electron microscope illumination, bioluminescent cellular organelles",
    badge: "Biotech / Medical"
  },
  {
    id: "machinery_engineering",
    label: "🏎️ Precision Automotive & Machinery",
    description: "Matte carbon weave, titanium heat tint, mechanical telemetry HUDs",
    badge: "Engineering / Speed"
  }
];
