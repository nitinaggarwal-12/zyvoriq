export interface GenreConcept {
  id: string;
  genre: string;
  cluster: "media_entertainment" | "culture_community" | "lifestyle_living" | "knowledge_enterprise";
  genreEmoji: string;
  title: string;
  hook: string;
  prompt: string;
  characterLock: string;
  visualStyle: string;
  musicPreset?: string;
  recommendedDuration: number;
  speechSample: string;
}

export interface GenreCluster {
  id: "all" | "media_entertainment" | "culture_community" | "lifestyle_living" | "knowledge_enterprise";
  name: string;
  badge: string;
  description: string;
  categoryIds: string[];
}

export const GENRE_CLUSTERS: GenreCluster[] = [
  {
    id: "all",
    name: "🌐 All Clusters (24 Pillars)",
    badge: "Universal Catalog",
    description: "Browse the complete 24-pillar universal spectrum across entertainment, culture, lifestyle, and enterprise sciences.",
    categoryIds: ["all"]
  },
  {
    id: "media_entertainment",
    name: "🎬 Media & Entertainment",
    badge: "Pillars 1–8",
    description: "Music production, gaming, comedy, cinema drama, high fantasy, kinetic action, horror, and family animation.",
    categoryIds: ["music", "gaming", "comedy", "cinema", "fantasy_scifi", "action_stunts", "horror_mystery", "kids_animation"]
  },
  {
    id: "culture_community",
    name: "🎙️ Culture & Community",
    badge: "Pillars 9–12",
    description: "Podcasts, video essays, lifestyle vlogs, investigative news, and true crime forensic mysteries.",
    categoryIds: ["podcasts_essays", "vlogs_lifestyle", "news_investigative", "true_crime"]
  },
  {
    id: "lifestyle_living",
    name: "🌿 Lifestyle & Living",
    badge: "Pillars 13–19",
    description: "Culinary arts, haute couture, athletic performance, sacred Vedanta & wellness, pets, real estate, and DIY craft.",
    categoryIds: ["culinary", "beauty_fashion", "fitness_sports", "wellness_faith", "pets_animals", "real_estate", "maker_diy"]
  },
  {
    id: "knowledge_enterprise",
    name: "👑 Knowledge, Enterprise & Science",
    badge: "Pillars 20–24",
    description: "Tech dev, global finance, Rajarshi leadership, AlphaFold deep science, and geopolitical world history.",
    categoryIds: ["tech_hardware", "finance_wealth", "leadership_masterclass", "science_space", "history_geopolitics"]
  }
];

export const GENRE_CATEGORIES = [
  { id: "all", label: "🌐 All 24 Pillars", cluster: "all" },
  
  // Cluster 1: Media & Entertainment (1-8)
  { id: "music", label: "🎵 Music & Sound Production", cluster: "media_entertainment" },
  { id: "gaming", label: "🎮 Gaming & Esports", cluster: "media_entertainment" },
  { id: "comedy", label: "😂 Comedy & Satire", cluster: "media_entertainment" },
  { id: "cinema", label: "🎭 Cinema, Fiction & Drama", cluster: "media_entertainment" },
  { id: "fantasy_scifi", label: "🏰 High Fantasy & Sci-Fi", cluster: "media_entertainment" },
  { id: "action_stunts", label: "💥 Action & Martial Stunts", cluster: "media_entertainment" },
  { id: "horror_mystery", label: "🌑 Horror & Cosmic Mystery", cluster: "media_entertainment" },
  { id: "kids_animation", label: "🧒 Kids & Family Animation", cluster: "media_entertainment" },

  // Cluster 2: Culture & Community (9-12)
  { id: "podcasts_essays", label: "🎙️ Podcasts & Video Essays", cluster: "culture_community" },
  { id: "vlogs_lifestyle", label: "📺 Vlogs & Lifestyle Doc", cluster: "culture_community" },
  { id: "news_investigative", label: "🔴 News & Investigative", cluster: "culture_community" },
  { id: "true_crime", label: "🕵️ True Crime & Forensics", cluster: "culture_community" },

  // Cluster 3: Lifestyle & Living (13-19)
  { id: "culinary", label: "🍳 Culinary Arts & Gastronomy", cluster: "lifestyle_living" },
  { id: "beauty_fashion", label: "💄 Beauty, Fashion & Aesthetics", cluster: "lifestyle_living" },
  { id: "fitness_sports", label: "🏋️ Fitness & Performance", cluster: "lifestyle_living" },
  { id: "wellness_faith", label: "🧘 Wellness, Vedanta & Sacred Faith", cluster: "lifestyle_living" },
  { id: "pets_animals", label: "🐾 Pets & Animal Care", cluster: "lifestyle_living" },
  { id: "real_estate", label: "🏡 Real Estate & Architecture", cluster: "lifestyle_living" },
  { id: "maker_diy", label: "🔨 Maker, DIY & Renovation", cluster: "lifestyle_living" },

  // Cluster 4: Knowledge, Enterprise & Science (20-24)
  { id: "tech_hardware", label: "💻 Tech, Dev & Hardware", cluster: "knowledge_enterprise" },
  { id: "finance_wealth", label: "💼 Finance, Wealth & Markets", cluster: "knowledge_enterprise" },
  { id: "leadership_masterclass", label: "👑 Leadership & Masterclasses", cluster: "knowledge_enterprise" },
  { id: "science_space", label: "🔬 Hard Science, Space & Bio", cluster: "knowledge_enterprise" },
  { id: "history_geopolitics", label: "🌍 History, Geopolitics & Nature", cluster: "knowledge_enterprise" }
];

export const GENRE_CONCEPTS: GenreConcept[] = [
  // ==========================================
  // CLUSTER 1: MEDIA & ENTERTAINMENT (1-8)
  // ==========================================
  {
    id: "music_lofi_cyberpunk",
    genre: "music",
    cluster: "media_entertainment",
    genreEmoji: "🎵",
    title: "🎧 2099 Cyberpunk Synthwave Beat Lab",
    hook: "Live studio session building a high-octane 128 BPM analog synth anthem with neon holographic instruments.",
    prompt: "A neon-lit Tokyo music studio at night where an electronic music producer crafts a driving cyberpunk synthwave track with glowing Moog synths, modular patch cables, and holographic spectrum analyzers.",
    characterLock: "kenji",
    visualStyle: "cyberpunk_noir",
    musicPreset: "cyberpunk_synth",
    recommendedDuration: 24,
    speechSample: "Every synthesizer frequency tells a story of the neon city. Let the 128 BPM analog pulse drive the night."
  },
  {
    id: "gaming_esports_championship",
    genre: "gaming",
    cluster: "media_entertainment",
    genreEmoji: "🎮",
    title: "🏆 Grand Finals: Nexus Arena Championship",
    hook: "High-stakes 5v5 tactical esports clutch moment in a massive illuminated stadium with cheering holographic crowds.",
    prompt: "Massive illuminated esports arena stadium in Seoul with roaring crowds, giant 8K holographic game replay screens, neon laser lighting, and cinematic tracking camera following intense pro-gamers executing a championship winning move.",
    characterLock: "aoi",
    visualStyle: "ue5_raytraced",
    musicPreset: "precision_industrial",
    recommendedDuration: 24,
    speechSample: "Three seconds left on the match clock. One shot, one perfect tactical flank, and the championship is sealed!"
  },
  {
    id: "comedy_corporate_satire",
    genre: "comedy",
    cluster: "media_entertainment",
    genreEmoji: "😂",
    title: "👔 The Absurd 'AI Alignment' Meeting",
    hook: "Witty stand-up comedy sketch roasting corporate buzzwords, infinite calendar invites, and unaligned coffee machines.",
    prompt: "Witty, energetic comedy club performance where a stand-up comedian roasts modern corporate buzzwords with hilarious facial expressions, comedic timing, and responsive laughing crowd.",
    characterLock: "david",
    visualStyle: "photorealistic_keynote",
    musicPreset: "executive_ambient",
    recommendedDuration: 16,
    speechSample: "We circled back so many times we accidentally invented a particle accelerator! Can we please just send an email?"
  },
  {
    id: "cinema_noir_rain",
    genre: "cinema",
    cluster: "media_entertainment",
    genreEmoji: "🎭",
    title: "🌧️ Midnight Shadow: The Last Detective",
    hook: "Cinematic 35mm film noir detective scene in rainy 1940s Chicago with trenchcoats, vintage cars, and amber lamplight.",
    prompt: "Cinematic 35mm film grain detective scene on wet reflective city streets with steam rising from manholes, vintage sedans, and high-contrast dramatic Rembrandt lighting.",
    characterLock: "marcus",
    visualStyle: "imax_70mm",
    musicPreset: "adaptive_cinematic",
    recommendedDuration: 24,
    speechSample: "In this city, the rain doesn't wash away secrets—it only reflects them on the wet asphalt."
  },
  {
    id: "fantasy_dragon_citadel",
    genre: "fantasy_scifi",
    cluster: "media_entertainment",
    genreEmoji: "🏰",
    title: "🐉 Citadel of the Starlight Wyrm",
    hook: "Epic high fantasy vista with floating monolithic fortresses, glowing rune portals, and soaring crystal dragons.",
    prompt: "Breathtaking high fantasy landscape with majestic mountain citadels, glowing arcane spires, volumetric golden dawn sunbeams, and a crystalline dragon gliding through misty cloud valleys.",
    characterLock: "elena",
    visualStyle: "ghibli_pastoral",
    musicPreset: "adaptive_cinematic",
    recommendedDuration: 24,
    speechSample: "The ancient starlight runes have awakened. For a thousand years they slept, but today the citadel takes flight."
  },
  {
    id: "action_samurai_thunder",
    genre: "action_stunts",
    cluster: "media_entertainment",
    genreEmoji: "💥",
    title: "⚡ The Thunderstorm of Mushin",
    hook: "Sensei Ren and Apprentice Aoi duel on a rain-slicked cedar balcony with sparks flying from wooden bokken blades.",
    prompt: "Sensei Ren teaches Apprentice Aoi the concept of Mushin during an intense night thunderstorm duel on a wooden dojo balcony with volumetric rain, lightning flashes, and 24fps kinetic camera movement.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    musicPreset: "zen_shakuhachi",
    recommendedDuration: 24,
    speechSample: "Mushin is not emptiness—it is the total presence of mind where the storm and the blade become one."
  },
  {
    id: "horror_cosmic_abyss",
    genre: "horror_mystery",
    cluster: "media_entertainment",
    genreEmoji: "🌑",
    title: "🌌 The Whispering Trench of Eldoria",
    hook: "Psychological cosmic mystery in a deep-sea research lab when an ancient non-human signal starts pulsing from the ocean floor.",
    prompt: "Moody atmospheric deep-sea submarine station interior with flickering emergency amber lights, bioluminescent teal glow, volumetric god rays through dark ocean portholes, and cinematic slow tracking camera pushing into claustrophobic suspense.",
    characterLock: "david",
    visualStyle: "imax_70mm",
    musicPreset: "interstellar_drone",
    recommendedDuration: 24,
    speechSample: "The sonar isn't detecting an echo... it's detecting a voice that has been waiting in the abyss for ten million years."
  },
  {
    id: "kids_magical_forest",
    genre: "kids_animation",
    cluster: "media_entertainment",
    genreEmoji: "🧒",
    title: "🦊 The Little Fox & The Glowing Acorn",
    hook: "Heartwarming Pixar/Ghibli-style animated fable about a curious fox discovering a glowing acorn that heals the enchanted woods.",
    prompt: "Vibrant, whimsical 3D animated forest with glowing moss, friendly woodland creatures, warm golden afternoon sunbeams, ambient starlight lighting, and a cinematic close-up shot of a charming fox exploring a magical ancient tree.",
    characterLock: "aoi",
    visualStyle: "ghibli_pastoral",
    musicPreset: "adaptive_cinematic",
    recommendedDuration: 16,
    speechSample: "When you share a small spark of kindness, the whole forest lights up with magic!"
  },

  // ==========================================
  // CLUSTER 2: CULTURE & COMMUNITY (9-12)
  // ==========================================
  {
    id: "podcasts_dual_host_ai",
    genre: "podcasts_essays",
    cluster: "culture_community",
    genreEmoji: "🎙️",
    title: "🧠 The Sovereign Architect Podcast (Dual Host)",
    hook: "Priya and David engage in a fast-paced, insightful debate on whether AGI will decentralize or centralize global power.",
    prompt: "Modern broadcast podcast studio with high-end Shure microphones, acoustic wood paneling, warm Edison bulb lighting, and two intelligent hosts trading sharp counter-arguments.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    musicPreset: "executive_ambient",
    recommendedDuration: 56,
    speechSample: "If intelligence becomes infinite and zero-marginal-cost, the only scarce asset left is cryptographic truth."
  },
  {
    id: "vlogs_tokyo_night_walk",
    genre: "vlogs_lifestyle",
    cluster: "culture_community",
    genreEmoji: "📺",
    title: "🏮 Tokyo Midnight Neon: A Solitary Walk",
    hook: "Immersive 4K first-person lifestyle documentary walking through glowing Shinjuku alleyways in gentle spring rain.",
    prompt: "Cinematic handheld 4K walk through Tokyo side-streets with glowing paper lanterns, steam from ramen stalls, neon reflections on wet cobblestone, and serene ambient city sounds.",
    characterLock: "kenji",
    visualStyle: "cyberpunk_noir",
    musicPreset: "zen_shakuhachi",
    recommendedDuration: 24,
    speechSample: "In a city of fourteen million people, midnight brings a quiet solitude that feels like a temple."
  },
  {
    id: "news_investigative_water",
    genre: "news_investigative",
    cluster: "culture_community",
    genreEmoji: "🔴",
    title: "💧 The Global Desalination Supergrid",
    hook: "Investigative documentary on how solar-powered reverse osmosis is turning arid coastlines into green breadbaskets.",
    prompt: "Investigative documentary news broadcast with aerial drone footage over massive coastal solar desalination facilities and automated robotic irrigation pipelines.",
    characterLock: "elena",
    visualStyle: "photorealistic_keynote",
    musicPreset: "savannah_orchestral",
    recommendedDuration: 56,
    speechSample: "By pairing unlimited solar radiation with modern graphene membranes, fresh water scarcity is no longer an inevitability."
  },
  {
    id: "true_crime_art_heist",
    genre: "true_crime",
    cluster: "culture_community",
    genreEmoji: "🕵️",
    title: "🖼️ The Vanishing of the Vermeer Canvas",
    hook: "Gripping forensic breakdown of the unsolved 1990 Isabella Stewart Gardner Museum heist with archival evidence boards.",
    prompt: "Dramatic investigative noir room with a massive pinned evidence board, red string connecting suspect photos, vintage blueprints, focused overhead halogen spotlight with golden dust motes, and a cinematic slow tracking camera shot.",
    characterLock: "david",
    visualStyle: "imax_70mm",
    musicPreset: "interstellar_drone",
    recommendedDuration: 24,
    speechSample: "Eighty-one minutes inside the vault. Thirteen masterpieces vanished. Thirty-four years later, the frames still hang empty."
  },

  // ==========================================
  // CLUSTER 3: LIFESTYLE & LIVING (13-19)
  // ==========================================
  {
    id: "culinary_michelin_wagyu",
    genre: "culinary",
    cluster: "lifestyle_living",
    genreEmoji: "🍳",
    title: "🥩 The Art of A5 Miyazaki Wagyu Searing",
    hook: "Sensory Michelin-star culinary masterclass showcasing the precise 54°C sear, Binchotan charcoal, and truffle glaze.",
    prompt: "Ultra-high-definition macro culinary cinematography of A5 Wagyu beef sizzling on hot Binchotan charcoal with macro salt crystals melting, warm golden ambient kitchen lighting, and aromatic smoke rising in 120fps slow motion close-up.",
    characterLock: "kenji",
    visualStyle: "imax_70mm",
    musicPreset: "zen_shakuhachi",
    recommendedDuration: 24,
    speechSample: "True culinary mastery is not adding ingredients—it is respecting the fire, the fat, and the exact second of caramelized perfection."
  },
  {
    id: "beauty_haute_couture",
    genre: "beauty_fashion",
    cluster: "lifestyle_living",
    genreEmoji: "💄",
    title: "👗 Paris Runway: The Titanium Silk Collection",
    hook: "Avant-garde haute couture fashion runway spectacle featuring flowing iridescent fabrics, architectural silhouettes, and starlight lighting.",
    prompt: "Paris high-fashion runway inside a historic glass palace with supermodels walking to driving electronic beats, dramatic architectural lighting, and 4K macro fabric textures.",
    characterLock: "elena",
    visualStyle: "photorealistic_keynote",
    musicPreset: "cyberpunk_synth",
    recommendedDuration: 24,
    speechSample: "Fashion is the architecture of human presence—where structural titanium meets the fluidity of raw silk."
  },
  {
    id: "fitness_vo2max_triathlon",
    genre: "fitness_sports",
    cluster: "lifestyle_living",
    genreEmoji: "🏋️",
    title: "⚡ VO2 Max & The Human Endurance Threshold",
    hook: "High-performance athletic breakdown of aerobic threshold training, lactate clearance, and biomechanical running efficiency.",
    prompt: "Intense athletic training montage featuring elite marathon runners sprinting at dawn on misty mountain trails with biometric heart-rate HUD overlays and macro sweat droplet physics.",
    characterLock: "marcus",
    visualStyle: "imax_70mm",
    musicPreset: "precision_industrial",
    recommendedDuration: 24,
    speechSample: "Your body does not stop when you are tired—it stops when your mind yields. Train the mind, and the lungs will follow."
  },
  {
    id: "wellness_vedanta_nondual",
    genre: "wellness_faith",
    cluster: "lifestyle_living",
    genreEmoji: "🧘",
    title: "🕉️ Advaita Vedanta: The Observer & The Observed",
    hook: "A deep philosophical journey through the Mandukya Upanishad revealing the illusion of separation and the peace of pure awareness.",
    prompt: "Serene sacred Himalayan river bank at dawn with golden sunlight reflecting on sacred waters, floating lotus flowers, and a wise teacher sitting in peaceful meditation surrounded by volumetric starlight.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    musicPreset: "bollywood_fusion",
    recommendedDuration: 56,
    speechSample: "Tat Tvam Asi. You are not a drop in the ocean; you are the entire ocean in a single drop of conscious awareness."
  },
  {
    id: "pets_snow_leopard_cubs",
    genre: "pets_animals",
    cluster: "lifestyle_living",
    genreEmoji: "🐾",
    title: "🐆 Snow Leopard Cubs of the High Karakoram",
    hook: "Heartwarming and rare 8K wildlife footage of newborn snow leopard cubs playing on rocky Himalayan ledges.",
    prompt: "Breathtaking BBC Earth style 8K wildlife documentary footage of an elusive snow leopard mother playing with two cubs on snow-dusted cliffs in the high Karakoram mountains.",
    characterLock: "narrator",
    visualStyle: "bbc_earth",
    musicPreset: "savannah_orchestral",
    recommendedDuration: 24,
    speechSample: "In the highest mountains on Earth, life finds a way to flourish with playful grace amidst the freezing winds."
  },
  {
    id: "real_estate_cliffside_villa",
    genre: "real_estate",
    cluster: "lifestyle_living",
    genreEmoji: "🏡",
    title: "🌊 Sovereign Glass Villa on the Amalfi Cliffs",
    hook: "Architectural 4K cinematic tour of a minimalist glass and travertine cliffside estate overlooking the Mediterranean Sea.",
    prompt: "Ultra-luxury architectural sweeping drone shot of a modern cliffside villa in Amalfi with infinity pool merging into azure sea, cantilevered marble terraces, and dramatic Mediterranean golden hour sunset lighting with ambient warm interior glow.",
    characterLock: "elena",
    visualStyle: "imax_70mm",
    musicPreset: "executive_ambient",
    recommendedDuration: 24,
    speechSample: "Designed to blur the line between architecture and nature—where Italian travertine meets the infinite Mediterranean horizon."
  },
  {
    id: "maker_bespoke_acoustic_guitar",
    genre: "maker_diy",
    cluster: "lifestyle_living",
    genreEmoji: "🔨",
    title: "🎸 Crafting a Master Brazilian Rosewood Guitar",
    hook: "Mesmerizing artisan masterclass showing the hand-carving of spruce soundboards, bone nut fitting, and French polish lacquering.",
    prompt: "Artisan woodcrafting workshop with fine spruce wood shavings falling in slow motion, precise chisel carving on guitar bracing, and warm golden workshop lamp illumination.",
    characterLock: "marcus",
    visualStyle: "imax_70mm",
    musicPreset: "zen_shakuhachi",
    recommendedDuration: 24,
    speechSample: "A great guitar is not made by machines. It is carved by listening to how the wood vibrates under the chisel."
  },

  // ==========================================
  // CLUSTER 4: KNOWLEDGE, ENTERPRISE & SCIENCE (20-24)
  // ==========================================
  {
    id: "tech_quantum_teleportation",
    genre: "tech_hardware",
    cluster: "knowledge_enterprise",
    genreEmoji: "💻",
    title: "⚛️ Quantum State Teleportation & Entangled Logic",
    hook: "Deep visual breakdown of Bell state measurement, photonic entanglement, and optical quantum repeaters.",
    prompt: "Futuristic cryogenic quantum computing laboratory with glowing dilution refrigerators, laser optical tables, and 3D volumetric representations of entangled qubit Bloch spheres.",
    characterLock: "david",
    visualStyle: "ue5_raytraced",
    musicPreset: "interstellar_drone",
    recommendedDuration: 56,
    speechSample: "By entangling two photons across kilometers of fiber, information travels without traversing the space between."
  },
  {
    id: "finance_liquidity_corridors",
    genre: "finance_wealth",
    cluster: "knowledge_enterprise",
    genreEmoji: "💼",
    title: "📈 Central Bank Sovereign Liquidity & Gold Reserves",
    hook: "Institutional macroeconomic breakdown of cross-border settlement, currency basket realignment, and bond yield curves.",
    prompt: "Sleek institutional trading floor with multi-screen Bloomberg terminal arrays, real-time global capital flow heatmaps, and sharp macroeconomic analysis.",
    characterLock: "marcus",
    visualStyle: "photorealistic_keynote",
    musicPreset: "executive_ambient",
    recommendedDuration: 56,
    speechSample: "Sovereign reserves are undergoing the most significant diversification in fifty years. Liquidity must settle deterministically."
  },
  {
    id: "leadership_rajarshi_sovereign",
    genre: "leadership_masterclass",
    cluster: "knowledge_enterprise",
    genreEmoji: "👑",
    title: "🏛️ The Rajarshi: Dharmic Sovereign Leadership",
    hook: "Executive masterclass on ethical governance, detached decision-making (Nishkama Karma), and long-term institutional stewardship.",
    prompt: "Commanding executive keynote stage where Priya Sharma breaks down the principles of the Rajarshi (Sage-King) leadership in the age of autonomous artificial intelligence.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    musicPreset: "executive_ambient",
    recommendedDuration: 120,
    speechSample: "True leadership is not the exercise of authority—it is the courageous stewardship of truth without attachment to personal ego."
  },
  {
    id: "science_alphafold_cancer_cures",
    genre: "science_space",
    cluster: "knowledge_enterprise",
    genreEmoji: "🔬",
    title: "🧬 AlphaFold 3: Designing Atomic Targeted Medicines",
    hook: "Revolutionary medical documentary on how DeepMind's AlphaFold 3 designs custom molecular binders to neutralize oncogenic mutations.",
    prompt: "Photorealistic 3D molecular simulation rendered in 4K showing an AlphaFold designed synthetic protein locking perfectly onto an oncogenic receptor site with glowing atomic bond physics.",
    characterLock: "elena",
    visualStyle: "ue5_raytraced",
    musicPreset: "interstellar_drone",
    recommendedDuration: 56,
    speechSample: "For fifty years, protein folding was a biological grand mystery. Today, we design life-saving molecular keys in seconds."
  },
  {
    id: "history_indus_valley_megacity",
    genre: "history_geopolitics",
    cluster: "knowledge_enterprise",
    genreEmoji: "🌍",
    title: "🏺 Mohenjo-Daro: The Bronze Age Urban Utopia",
    hook: "Archaeological 4K reconstruction of the Indus Valley Civilization featuring advanced sanitation grids, dockyards, and trade seals.",
    prompt: "Magnificent 4K archaeological aerial tracking shot of Mohenjo-Daro in 2500 BCE with baked-brick multistory avenues, granaries, public baths, and merchants trading carnelian beads under warm golden hour sunlight with volumetric dust.",
    characterLock: "priya",
    visualStyle: "imax_70mm",
    musicPreset: "bollywood_fusion",
    recommendedDuration: 56,
    speechSample: "Five thousand years ago, an entire civilization built a metropolis without palaces or weapons of war—centered entirely on civic engineering."
  }
];
