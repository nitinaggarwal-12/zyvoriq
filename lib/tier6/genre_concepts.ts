export interface GenreConcept {
  id: string;
  genre: string;
  genreEmoji: string;
  title: string;
  hook: string;
  prompt: string;
  characterLock: string;
  visualStyle: string;
  recommendedDuration: number;
  speechSample: string;
}

export const GENRE_CATEGORIES = [
  { id: "all", label: "🎬 All Categories" },
  { id: "executive", label: "🧑‍💼 Humans & Executive Twins" },
  { id: "anime", label: "🌸 Anime & Manga" },
  { id: "cartoon", label: "🎨 Cartoon & Stylized Animation" },
  { id: "cgi_3d", label: "🧊 3D Graphics & CGI Cinematic" },
  { id: "nature", label: "🌿 Nature & Wildlife Documentaries" },
  { id: "space", label: "🌌 Universe, Cosmos & Space" },
  { id: "engineering", label: "⚙️ Machine Building & Engineering" },
  { id: "medical", label: "🩺 Medical Equipment & Healthcare" },
  { id: "security", label: "🛡️ Veritas Trust & Cryptography" }
];

export const GENRE_CONCEPTS: GenreConcept[] = [
  // ==========================================
  // 1. Humans & Executive Digital Twins (6 Unique Templates)
  // ==========================================
  {
    id: "exec_sovereign_ai",
    genre: "executive",
    genreEmoji: "🧑‍💼",
    title: "🏢 Sovereign AI Enterprise Keynote",
    hook: "Priya delivers an authoritative mainstage keynote on autonomous corporate governance.",
    prompt: "Priya Sharma delivers an authoritative 4K keynote on enterprise zk-SNARK cryptographic provenance, deterministic media synthesis, and zero-drift neural broadcasting.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 120,
    speechSample: "Welcome to the frontier of sovereign enterprise intelligence—where every corporate decision is mathematically verifiable and cryptographically guaranteed."
  },
  {
    id: "exec_global_fintech",
    genre: "executive",
    genreEmoji: "🇬🇧",
    title: "📊 London Global Market & Macro Strategy",
    hook: "Marcus Vance breaks down sovereign treasury yields, cross-border liquidity, and algorithmic hedging.",
    prompt: "Marcus Vance in a high-end London broadcasting studio with holographic market depth charts analyzing central bank digital sovereign liquidity.",
    characterLock: "marcus",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "Global liquidity corridors are experiencing structural realignments. Sovereign portfolios must transition to real-time deterministic settlement."
  },
  {
    id: "exec_biocybernetics_growth",
    genre: "executive",
    genreEmoji: "👩‍🔬",
    title: "🧬 Bio-Cybernetic Neural Infrastructure ROI",
    hook: "Elena breaks down cross-border neural infrastructure ROI for institutional shareholders.",
    prompt: "Elena Rostova presents a crisp, data-driven executive briefing on multi-region inference margins, decentralized compute clusters, and 300% ARR growth.",
    characterLock: "elena",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "By transitioning to decentralized sub-millisecond edge clusters, we unlocked 300% ARR expansion with zero latency overhead."
  },
  {
    id: "exec_open_compute",
    genre: "executive",
    genreEmoji: "🇪🇸",
    title: "⚡ Decentralized Open Compute Ecosystems",
    hook: "Carlos Mendoza delivers an impassioned talk on open-weights foundation models and developer autonomy.",
    prompt: "Carlos Mendoza on a minimalist tech summit stage in Madrid, gesturing towards dynamic code architecture projections and open-source compute grids.",
    characterLock: "carlos",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 24,
    speechSample: "Monopolies fall when open compute rises. Today we release full sovereign model weights directly into the hands of the global developer community."
  },
  {
    id: "exec_quantum_accelerator",
    genre: "executive",
    genreEmoji: "🇨🇳",
    title: "💎 Quantum Supremacy & Cloud Superclusters",
    hook: "Mei-Ling Zhou outlines the roadmap for fault-tolerant topological quantum supercomputers.",
    prompt: "Mei-Ling Zhou in a high-tech Shanghai auditorium presenting cryogenic quantum processor roadmaps with floating glowing qubit lattice models.",
    characterLock: "meiling",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "With topological error suppression now exceeding threshold bounds, 10,000 logical qubits will transition from experimental theory to cloud production."
  },
  {
    id: "exec_cognitive_ethics",
    genre: "executive",
    genreEmoji: "🇫🇷",
    title: "⚖️ Cognitive Ethics & Synthetic Alignment",
    hook: "Céleste Laurent presents the moral boundaries and legislative frameworks for autonomous agents.",
    prompt: "Céleste Laurent at a Sorbonne international governance symposium delivering a measured, philosophical keynote on human cognitive sovereignty.",
    characterLock: "celeste",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 24,
    speechSample: "Synthetic agency without verifiable mathematical boundaries is reckless. We must anchor artificial intelligence to immutable ethical consensus."
  },

  // ==========================================
  // 2. Anime & Manga (6 Unique Templates)
  // ==========================================
  {
    id: "anime_mushin_thunder",
    genre: "anime",
    genreEmoji: "🥋",
    title: "⚡ The Thunderstorm of Mushin",
    hook: "A rainy nighttime duel on a tatami balcony exploring the concept of Mind without Mind.",
    prompt: "Sensei Ren teaches Apprentice Aoi the concept of Mushin (Mind without Mind) during a night thunderstorm duel on the wooden dojo balcony.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    recommendedDuration: 24,
    speechSample: "Do not anchor your mind, Aoi. Like falling rain, true mastery strikes only when all conscious hesitation is released."
  },
  {
    id: "anime_wabi_sabi",
    genre: "anime",
    genreEmoji: "🌸",
    title: "🌸 Sakura Wabi-Sabi Garden Duel",
    hook: "Embracing imperfection and transience as cherry blossoms drift across the dojo garden.",
    prompt: "Aoi struggles with perfectionism before Sensei Ren points to imperfect falling cherry blossoms, illustrating beauty in transience with poetic sword forms.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    recommendedDuration: 8,
    speechSample: "Look at the garden, Aoi. Wabi-Sabi teaches that true beauty lives in the transient, the fleeting, and the broken."
  },
  {
    id: "anime_cyber_katana",
    genre: "anime",
    genreEmoji: "🗡️",
    title: "🏙️ Cyber-Katana Protocol: Neo-Shinjuku",
    hook: "A lone swordsman leaps across neon-lit skyscrapers in rain-soaked 2099 Tokyo.",
    prompt: "High-octane Ufotable anime action: a cybernetically enhanced samurai deflects laser gunfire with a glowing plasma katana across holographic Shibuya crossing.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    recommendedDuration: 24,
    speechSample: "In the shadow of synthetic neon, the steel of ancient code remains unbroken."
  },
  {
    id: "anime_spirit_shrine",
    genre: "anime",
    genreEmoji: "⛩️",
    title: "⛩️ The Sacred Torii of Mount Hiei",
    hook: "A mythical spirit fox guardian reveals ancient elemental magic at dawn amidst mountain mist.",
    prompt: "Studio Ghibli watercolor aesthetic: a wandering shrine maiden awakens ancient celestial fox spirits beneath towering cedar trees and crimson Torii gates.",
    characterLock: "ren_aoi",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 56,
    speechSample: "Listen to the mountain wind. The ancient spirits speak not in words, but in the rustling of cedar needles."
  },
  {
    id: "anime_mecha_orbital",
    genre: "anime",
    genreEmoji: "🤖",
    title: "🚀 Mecha Wing: Orbital Stratosphere Dogfight",
    hook: "Giant humanoid combat mechas clash above Earth's glowing curved horizon.",
    prompt: "Cinematic anime mecha sequence: twin supersonic mecha suits engage in high-g laser maneuvering above Earth's aurora borealis with particle afterburners.",
    characterLock: "david",
    visualStyle: "ufotable_anime",
    recommendedDuration: 56,
    speechSample: "All thrusters to maximum overdrive! Synaptic link at 100 percent—orbital strike vector locked!"
  },
  {
    id: "anime_blood_moon",
    genre: "anime",
    genreEmoji: "🌑",
    title: "🌑 Blood Moon Eclipse: Shadow Blade Purge",
    hook: "A dramatic sword master stands atop an ancient fortress as a crimson eclipse awakens demons.",
    prompt: "Dark fantasy anime: glowing red lunar illumination casts deep shadows as a samurai unleashes a flaming circular sword arc against swirling shadow wraiths.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    recommendedDuration: 24,
    speechSample: "When the crimson moon rises, only the purest blade can cut through the creeping veil of darkness."
  },

  // ==========================================
  // 3. Cartoon & Stylized Animation (6 Unique Templates)
  // ==========================================
  {
    id: "cartoon_pancake_rocket",
    genre: "cartoon",
    genreEmoji: "🎨",
    title: "🥞 The Whimsical Gravity Pancake Launcher",
    hook: "A wacky cartoon inventor creates a contraption that turns breakfast pancakes into rocket fuel.",
    prompt: "Classic hand-drawn animation style with bouncy physics: an eccentric cartoon inventor activates a steam-powered pancake catapult in a cluttered whimsical workshop.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 24,
    speechSample: "Hold onto your toast! The Gravitational Batter Propeller is warming up for supersonic syrup ignition!"
  },
  {
    id: "cartoon_pixel_dungeon",
    genre: "cartoon",
    genreEmoji: "👾",
    title: "👾 16-Bit Pixel Dungeon Adventure",
    hook: "A retro pixelated knight jumps over spinning fire traps to rescue a digital princess.",
    prompt: "Vibrant retro pixel-art animation: an 8-bit hero sword-swings through glowing brick dungeons with gold coins popping and bouncy physics.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 8,
    speechSample: "Press Start! One extra life remaining, and the final dungeon boss is right behind that door!"
  },
  {
    id: "cartoon_claymation_noir",
    genre: "cartoon",
    genreEmoji: "🧱",
    title: "🧀 Claymation Detective: The Big Cheese Heist",
    hook: "A stop-motion plasticine detective snoops through a rain-drenched miniature city.",
    prompt: "Tactile claymation stop-motion animation: a miniature trench-coat detective dog with magnifying glass examines cheese crumbs under a flickering street lamp.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 24,
    speechSample: "It was a stormy Tuesday night in Swiss City. The Gouda vault had been cracked wide open, and the culprit left no fingerprints."
  },
  {
    id: "cartoon_forest_bakery",
    genre: "cartoon",
    genreEmoji: "🍞",
    title: "🦔 Woodland Bakery: Morning Sourdough",
    hook: "Cute hand-drawn hedgehog and squirrel bakers preparing fresh honey pies in a giant hollow tree.",
    prompt: "Cozy warm Ghibli pastoral aesthetic: gentle morning sunshine floods a wooden treehouse bakery where cute woodland animals knead fluffy golden bread dough.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 24,
    speechSample: "Fresh out of the stone oven! Warm blueberry scones and clover honey muffins for all forest creatures!"
  },
  {
    id: "cartoon_doodle_universe",
    genre: "cartoon",
    genreEmoji: "✨",
    title: "✏️ Living Doodle: Escape from the Sketchbook",
    hook: "A drawn stickman comes to life and folds the notebook paper into a flying origami spaceship.",
    prompt: "Dynamic mixed-media doodle animation: animated pencil sketch characters leap between ruled notebook lines, turning ink blots into glowing starry galaxies.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 56,
    speechSample: "Quick, fold the page diagonally! If we build this origami glider, we can fly right off the graph paper!"
  },
  {
    id: "cartoon_super_pug",
    genre: "cartoon",
    genreEmoji: "🦸",
    title: "🐶 Super-Pug & The Giant Tennis Ball Catastrophe",
    hook: "A caped cartoon bulldog saves a bustling metropolis from thousands of rolling tennis balls.",
    prompt: "Bright Saturday morning cartoon style: an adorable chubby pug in a red superhero cape flies through a colorful skyscraper city catching giant bouncing balls.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 8,
    speechSample: "Bark of Justice activated! No tennis ball shall bounce unchecked on my watch!"
  },

  // ==========================================
  // 4. 3D Graphics & CGI Cinematic (6 Unique Templates)
  // ==========================================
  {
    id: "cgi_unreal_metropolis",
    genre: "cgi_3d",
    genreEmoji: "🧊",
    title: "🏙️ Unreal Engine 5 Cyber-Metropolis",
    hook: "Photorealistic ray-traced drone flythrough across holographic floating skylanes.",
    prompt: "Hyper-detailed Unreal Engine 5 CGI render with Nanite geometry and Lumen global illumination: camera glides through a bustling futuristic mega-city with flying aero-transits and neon rain.",
    characterLock: "david",
    visualStyle: "ue5_raytraced",
    recommendedDuration: 56,
    speechSample: "Initializing sub-atomic path tracing across Sector 9. Global illumination render lock engaged."
  },
  {
    id: "cgi_hypercar_aerodynamics",
    genre: "cgi_3d",
    genreEmoji: "🏎️",
    title: "💨 2000HP Hypercar Aerodynamic Windtunnel",
    hook: "CFD smoke streams flow over exposed raw carbon fiber monocoque chassis at 400 km/h.",
    prompt: "Ultra-photorealistic 3D automotive engineering render: illuminated neon wind tunnel showing colored air velocity streams carving around an aggressive carbon fiber hypercar.",
    characterLock: "henrik",
    visualStyle: "ue5_raytraced",
    recommendedDuration: 24,
    speechSample: "Ground-effect venturi tunnels generate 1,800 kilograms of downforce without creating parasitic drag."
  },
  {
    id: "cgi_abyssal_subsea_rig",
    genre: "cgi_3d",
    genreEmoji: "🌊",
    title: "⚓ 10,000m Abyssal Subsea Robotic Station",
    hook: "A robotic submarine docks at a colossal glowing geothermal energy node on the ocean floor.",
    prompt: "Cinematic CGI deep ocean render: heavy industrial subsea robotic drone with powerful halogen headlights docking at a glowing underwater geothermal turbine surrounded by swirling currents.",
    characterLock: "david",
    visualStyle: "ue5_raytraced",
    recommendedDuration: 56,
    speechSample: "Atmospheric pressure exceeding 1,000 bar. Titanium docking clamp secured to thermal extraction hub."
  },
  {
    id: "cgi_fractal_prism_temple",
    genre: "cgi_3d",
    genreEmoji: "💎",
    title: "💎 Ray-Traced Fractal Prism Sanctuary",
    hook: "Infinite geometric glass architecture refracting volumetric rainbow caustics.",
    prompt: "Hypnotic 3D CGI procedural mathematical temple made of pure crystalline glass and gold trim, refracting laser light beams into intricate infinite rainbow Mandelbrot fractals.",
    characterLock: "custom",
    visualStyle: "ue5_raytraced",
    recommendedDuration: 24,
    speechSample: "Light folded through infinite recursive dimensions. Every prism reflects the total geometry of the cosmos."
  },
  {
    id: "cgi_ancient_tomb_photoreal",
    genre: "cgi_3d",
    genreEmoji: "🏛️",
    title: "🏛️ Unreal Engine 5 Tomb of the Pharaoh Kings",
    hook: "Photogrammetry 8K scans of hieroglyphic stone corridors illuminated by torchlight.",
    prompt: "Hyper-realistic Unreal Engine 5 archaeology cinematic: cinematic slow push-in through a grand subterranean Egyptian vault with dust motes drifting in golden god-rays.",
    characterLock: "custom",
    visualStyle: "ue5_raytraced",
    recommendedDuration: 56,
    speechSample: "These stone reliefs have remained untouched in pitch darkness for over thirty-five centuries."
  },
  {
    id: "cgi_exoskeleton_forge",
    genre: "cgi_3d",
    genreEmoji: "🛡️",
    title: "🦾 Nanotech Exoskeleton Modular Assembly",
    hook: "Liquid metallic alloy magnetic field forming sleek biomechanical armor plates.",
    prompt: "Cutting-edge 3D CGI industrial visualization: micro-magnetic fields manipulate shimmering liquid titanium into form-fitting robotic armor plates around a testing mannequin.",
    characterLock: "henrik",
    visualStyle: "ue5_raytraced",
    recommendedDuration: 24,
    speechSample: "Lattice hardening complete. Tensile strength exceeds military-grade ballistic tungsten by four hundred percent."
  },

  // ==========================================
  // 5. Nature & Wildlife Documentaries (6 Unique Templates)
  // ==========================================
  {
    id: "nature_serengeti_pride",
    genre: "nature",
    genreEmoji: "🦁",
    title: "🦁 Serengeti Thunderstorm & Lion Pride",
    hook: "BBC Earth-style cinematic documentary following a lion pride during the Great Migration rainstorm.",
    prompt: "Cinematic 8K wildlife documentary: golden hour sunlight breaks through dramatic storm clouds as a lion pride surveys the sweeping Serengeti plains with amber grasses rippling in the wind.",
    characterLock: "narrator_nature",
    visualStyle: "bbc_earth_8k",
    recommendedDuration: 56,
    speechSample: "Across the vast golden plains of the Serengeti, the coming rains signal a dramatic renewal of life and the ancient hunt."
  },
  {
    id: "nature_bioluminescent_deep",
    genre: "nature",
    genreEmoji: "🦑",
    title: "🌊 Mariana Trench: The Bioluminescent Abyssal Ballet",
    hook: "Glowing alien-like jellyfish and siphonophores dancing in the midnight ocean zone.",
    prompt: "Ultra-macro 8K deep-sea documentary: translucent bioluminescent comb jellies and glowing deep-sea squid pulsating with electric neon blue and emerald light in pitch black water.",
    characterLock: "narrator_nature",
    visualStyle: "bbc_earth_8k",
    recommendedDuration: 56,
    speechSample: "In a world of perpetual darkness miles beneath the surface, creatures communicate in silent flashes of living bioluminescent light."
  },
  {
    id: "nature_amazon_dawn",
    genre: "nature",
    genreEmoji: "🦜",
    title: "🦜 Amazonian Canopy: Dawn Chorus of the Rainforest",
    hook: "Misty aerial camera sweeping over endless green canopy as scarlet macaws take flight.",
    prompt: "Spectacular National Geographic drone cinematography: sunrise mist rising above emerald Amazon river bends as flocks of vibrant scarlet macaws burst from towering emergent trees.",
    characterLock: "gabriel",
    visualStyle: "bbc_earth_8k",
    recommendedDuration: 24,
    speechSample: "As the first golden rays pierce the emerald mist, twenty percent of the world's oxygen is exhaled in a glorious symphony of life."
  },
  {
    id: "nature_arctic_ice_odyssey",
    genre: "nature",
    genreEmoji: "❄️",
    title: "🐻‍❄️ Arctic Realm: Polar Bear Mother & Cubs",
    hook: "A mother polar bear guides her twin cubs across glowing blue glacial pack ice.",
    prompt: "Epic BBC Frozen Planet cinematography: mother polar bear and two fluffy cubs traversing massive sapphire-blue sea ice floes with colossal glaciers calving in the background.",
    characterLock: "narrator_nature",
    visualStyle: "bbc_earth_8k",
    recommendedDuration: 56,
    speechSample: "Navigating a world made entirely of frozen water, a mother's endurance is the sole lifeline for the next generation."
  },
  {
    id: "nature_monarch_migration",
    genre: "nature",
    genreEmoji: "🦋",
    title: "🦋 Millions of Monarchs: The Oyamel Fir Sanctuary",
    hook: "Golden clouds of millions of orange monarch butterflies warming their wings in mountain sunbeams.",
    prompt: "High-speed 1000fps macro wildlife footage: millions of monarch butterflies fluttering in golden sunlight through the misty Mexican fir mountain forest.",
    characterLock: "narrator_nature",
    visualStyle: "bbc_earth_8k",
    recommendedDuration: 24,
    speechSample: "Guided by an inherited magnetic compass, millions of fragile wings have journeyed three thousand miles to find this single sacred ridge."
  },
  {
    id: "nature_coral_spawning",
    genre: "nature",
    genreEmoji: "🪸",
    title: "🪸 Great Barrier Reef: The Midnight Coral Eclipse",
    hook: "An underwater macro camera captures the once-a-year synchronized glowing coral spawn.",
    prompt: "Luminescent 8K underwater macro cinema: thousands of fluorescent coral polyps simultaneously releasing millions of glowing pink and pearl spheres into the midnight ocean current.",
    characterLock: "narrator_nature",
    visualStyle: "bbc_earth_8k",
    recommendedDuration: 24,
    speechSample: "Triggered by the full moon's gravitational pull, the entire reef erupts in a mesmerizing snowstorm of underwater life."
  },

  // ==========================================
  // 6. Universe, Cosmos & Space (6 Unique Templates)
  // ==========================================
  {
    id: "space_event_horizon",
    genre: "space",
    genreEmoji: "🌌",
    title: "🌌 Event Horizon: Journey into Gargantua",
    hook: "Interstellar journey navigating the glowing gravitational lensing of a supermassive black hole.",
    prompt: "Photorealistic deep space IMAX cinematography: an exploration starship approaches a supermassive black hole with a blinding gold-orange accretion disk warping starlight in relativistic physics.",
    characterLock: "sarah",
    visualStyle: "interstellar_sci_fi",
    recommendedDuration: 120,
    speechSample: "As we cross the photon sphere, time dilates exponentially. Starlight curves around the gravitational singularity."
  },
  {
    id: "space_mars_colony_sol100",
    genre: "space",
    genreEmoji: "🔴",
    title: "🔴 Martian Sol 100: The Olympus Mons Colony",
    hook: "Pressurized geodesic biodomes glowing beneath twin Martian moons during an ochre dust storm.",
    prompt: "Cinematic hard sci-fi exploration: rover camera panning across massive glass geodesic agricultural biodomes nested in red Martian volcanic canyons as dusk settles.",
    characterLock: "sarah",
    visualStyle: "interstellar_sci_fi",
    recommendedDuration: 56,
    speechSample: "One hundred sols on the Red Planet. Inside these geodesic biospheres, Earth's first interstellar crops are flourishing."
  },
  {
    id: "space_pillars_creation",
    genre: "space",
    genreEmoji: "🔭",
    title: "✨ Pillars of Creation: Inside the Stellar Nursery",
    hook: "James Webb infrared camera flying through towering interstellar gas pillars birthing baby stars.",
    prompt: "Spectacular volumetric space visualization: camera dives through colossal pillars of cosmic dust and interstellar hydrogen, revealing newborn proto-stars bursting with ultraviolet light.",
    characterLock: "sarah",
    visualStyle: "interstellar_sci_fi",
    recommendedDuration: 56,
    speechSample: "These towering columns of interstellar hydrogen stretch four light-years from base to tip—the sacred cosmic forge of new solar systems."
  },
  {
    id: "space_europa_subsurface",
    genre: "space",
    genreEmoji: "🪐",
    title: "🪐 Europa: Under the Alien Ice Sheet of Jupiter",
    hook: "A robotic melt-probe dives into a dark, warm alien ocean beneath 20km of cracked ice.",
    prompt: "Thrilling sci-fi exploration: submarine probe descends through ice crevices into Europa's pitch-black ocean, activating halogen beams to reveal hydrothermal vents teeming with alien microorganisms.",
    characterLock: "sarah",
    visualStyle: "interstellar_sci_fi",
    recommendedDuration: 56,
    speechSample: "We have breached the twenty-kilometer ice shell. Liquid water detected, heated by Jupiter's colossal gravitational tidal flexing."
  },
  {
    id: "space_kilonova_collision",
    genre: "space",
    genreEmoji: "💥",
    title: "💥 Kilonova: Cosmic Forge of Heavy Gold & Platinum",
    hook: "Two dense neutron stars spiral into each other, generating gravitational spacetime waves.",
    prompt: "Relativistic astrophysics simulation: twin ultra-dense neutron stars spinning at relativistic speeds before colliding in a blinding gamma-ray burst that forges gold atoms across spacetime.",
    characterLock: "sarah",
    visualStyle: "interstellar_sci_fi",
    recommendedDuration: 24,
    speechSample: "In a fraction of a millisecond, the collision of these stellar remnants creates a cosmic forge synthesizing every atom of gold in our universe."
  },
  {
    id: "space_hyperspace_gateway",
    genre: "space",
    genreEmoji: "🛸",
    title: "🛸 Alpha Centauri Hyperspace Gateway Transit",
    hook: "A ring-shaped quantum accelerator folds space to transport a fleet to our nearest star system.",
    prompt: "Epic IMAX space opera cinematography: a colossal 10km magnetic ring accelerator powers up in orbit, opening an iridescent shimmering Einstein-Rosen spacetime wormhole.",
    characterLock: "david",
    visualStyle: "interstellar_sci_fi",
    recommendedDuration: 56,
    speechSample: "Gateway ring alignment confirmed. Engaging Einstein-Rosen metric fold—four light years traversed in four seconds."
  },

  // ==========================================
  // 7. Machine Building & Engineering (6 Unique Templates)
  // ==========================================
  {
    id: "eng_scramjet_hypersonic",
    genre: "engineering",
    genreEmoji: "⚙️",
    title: "🚀 Mach 7 Hypersonic Scramjet Engine Assembly",
    hook: "Step-by-step engineering teardown and 5-axis CNC machining of titanium combustion chambers.",
    prompt: "Educational industrial engineering documentary: exploded 3D CAD holographic view showing titanium combustion chambers, ceramic heat shields, and fuel injectors assembling at Mach 7 tolerances.",
    characterLock: "henrik",
    visualStyle: "machinery_engineering",
    recommendedDuration: 56,
    speechSample: "Every micron counts. These titanium-aluminide turbine blades withstand temperatures hotter than volcanic magma while air rushes in at Mach 7."
  },
  {
    id: "eng_bionic_hand_actuator",
    genre: "engineering",
    genreEmoji: "🦾",
    title: "🦾 60-DOF Humanoid Bionic Hand & Tendons",
    hook: "Precision micro-motors and artificial synthetic tendons achieving delicate human dexterity.",
    prompt: "High-tech robotics cleanroom footage: Dr. Henrik Weber tests high-torque brushless harmonic actuators inside a sleek carbon-fiber robotic hand delicately grasping a glass bulb.",
    characterLock: "henrik",
    visualStyle: "machinery_engineering",
    recommendedDuration: 24,
    speechSample: "Sixty degrees of freedom driven by sub-millimeter synthetic tendons, mimicking the exact kinetic responsiveness of human musculature."
  },
  {
    id: "eng_tokamak_fusion_core",
    genre: "engineering",
    genreEmoji: "⚛️",
    title: "⚛️ ITER Magnetic Confinement Tokamak Fusion Core",
    hook: "Superconducting magnetic coils confining 150-million-degree glowing hydrogen plasma.",
    prompt: "Grand industrial engineering showcase: inside a massive silver toroidal vacuum vessel where blinding magenta hydrogen plasma is magnetically suspended in zero-gravity vacuum.",
    characterLock: "david",
    visualStyle: "machinery_engineering",
    recommendedDuration: 56,
    speechSample: "Supercooled to negative 269 degrees, our niobium-tin electromagnets bottle a miniature sun hotter than the core of our own star."
  },
  {
    id: "eng_euv_photolithography",
    genre: "engineering",
    genreEmoji: "🔬",
    title: "🔬 1-Nanometer EUV Photolithography Chamber",
    hook: "Extreme ultraviolet lasers pulsing 50,000 times per second on molten tin droplets to etch quantum chips.",
    prompt: "Ultra-clean semiconductor fabrication suite: laser pulses vaporize micro-droplets of tin, projecting extreme ultraviolet light patterns onto silicon wafers with atomic precision.",
    characterLock: "meiling",
    visualStyle: "machinery_engineering",
    recommendedDuration: 24,
    speechSample: "Printing features smaller than a single strand of human DNA, this EUV optical mirror is the flattest man-made object on planet Earth."
  },
  {
    id: "eng_space_elevator_tether",
    genre: "engineering",
    genreEmoji: "🏗️",
    title: "🏗️ Carbon Nanotube Orbital Space Elevator",
    hook: "A 36,000 km carbon nanotube ribbon climbing from an equatorial ocean platform into orbit.",
    prompt: "Breathtaking macro-engineering documentary: magnetic climber car ascending a gleaming carbon nanotube ribbon from a Pacific ocean floating platform straight into geostationary orbit.",
    characterLock: "henrik",
    visualStyle: "machinery_engineering",
    recommendedDuration: 56,
    speechSample: "With a tensile strength fifty times greater than steel, this 36,000-kilometer carbon ribbon provides zero-emission transport into geostationary space."
  },
  {
    id: "eng_hyperloop_maglev",
    genre: "engineering",
    genreEmoji: "🚄",
    title: "🚄 1200 km/h MagLev Vacuum Tube Transit",
    hook: "A sleek magnetic levitation pod gliding frictionlessly through depressurized steel tubes.",
    prompt: "Futuristic transportation engineering: inside a sleek carbon pod accelerating silently through an illuminated steel vacuum tube across continental distances at airplane speeds.",
    characterLock: "carlos",
    visualStyle: "machinery_engineering",
    recommendedDuration: 24,
    speechSample: "By removing ninety-nine point nine percent of air friction, magnetic levitation pods cruise across continents using a fraction of the energy of commercial flight."
  },

  // ==========================================
  // 8. Medical Equipment & Healthcare (6 Unique Templates)
  // ==========================================
  {
    id: "med_robotic_surgery_mri",
    genre: "medical",
    genreEmoji: "🩺",
    title: "🩺 Da Vinci Robotic Micro-Surgery & 7T MRI",
    hook: "Sub-millimeter robotic suturing guided by real-time intraoperative neural MRI.",
    prompt: "State-of-the-art medical education footage: robotic surgical arms perform sub-millimeter suturing while real-time holographic MRI neural scans illuminate synaptic pathways in the background.",
    characterLock: "elena",
    visualStyle: "biomedical_micro",
    recommendedDuration: 56,
    speechSample: "With 7-Tesla intraoperative neuro-imaging, the robotic needle achieves sub-millimeter precision without disrupting critical vascular pathways."
  },
  {
    id: "med_crispr_dna_repair",
    genre: "medical",
    genreEmoji: "🧬",
    title: "🧬 CRISPR-Cas9 Molecular DNA Strand Editing",
    hook: "Nanoscale visualization of enzyme cutting and inserting corrective genetic sequences.",
    prompt: "Hyper-detailed molecular 3D animation: Cas9 enzyme protein scans along a glowing double-helix DNA strand, precisely cleaving a mutated gene and stitching in healthy nucleotides.",
    characterLock: "elena",
    visualStyle: "biomedical_micro",
    recommendedDuration: 24,
    speechSample: "Targeted guide RNA leads the Cas9 endonuclease to the exact defective codon, replacing congenital mutations with therapeutic sequences."
  },
  {
    id: "med_optical_bci_brain",
    genre: "medical",
    genreEmoji: "🧠",
    title: "🧠 Optical Brain-Computer Interface Mapping",
    hook: "Micro-electrode array mapping million-neuron firing patterns during human thought.",
    prompt: "Advanced neuro-technology laboratory: holographic 3D brain map illuminates in cascading bursts of electric blue and violet light as a paralyzed patient controls a robotic limb with pure thought.",
    characterLock: "celeste",
    visualStyle: "biomedical_micro",
    recommendedDuration: 24,
    speechSample: "Decoding motor cortex neural spike trains at sub-millisecond resolution transforms intended motion into instantaneous physical reality."
  },
  {
    id: "med_titanium_bionic_heart",
    genre: "medical",
    genreEmoji: "❤️",
    title: "❤️ MagLev Continuous-Flow Titanium Bionic Heart",
    hook: "An implantable artificial heart maintaining pulse-free continuous cardiovascular flow.",
    prompt: "High-precision biomedical engineering render: sleek titanium artificial heart with magnetically levitated impeller spinning at 8,000 RPM in clear saline solution without mechanical friction.",
    characterLock: "elena",
    visualStyle: "biomedical_micro",
    recommendedDuration: 24,
    speechSample: "By eliminating mechanical ball bearings, the magnetically levitated impeller eliminates blood shear stress, promising decades of continuous circulatory support."
  },
  {
    id: "med_nanobot_immunotherapy",
    genre: "medical",
    genreEmoji: "🔬",
    title: "🔬 Nanobot Oncology Immunotherapy Swarm",
    hook: "Smart nanoparticles hunting and dissolving metastatic tumor cells in the bloodstream.",
    prompt: "Nanoscale biological thriller: glowing gold-coated nanobots navigate through a red blood cell capillary, attaching to cancerous cell membranes and releasing targeted therapeutic payloads.",
    characterLock: "elena",
    visualStyle: "biomedical_micro",
    recommendedDuration: 56,
    speechSample: "Programmed with tumor-specific aptamers, our nanorobotic swarm delivers localized cytotoxicity with zero collateral damage to healthy tissues."
  },
  {
    id: "med_cellular_telomere_longevity",
    genre: "medical",
    genreEmoji: "⏳",
    title: "⏳ Telomerase Cellular Reversal & Longevity",
    hook: "Molecular biology visualization of reverse aging in human mitochondrial telomeres.",
    prompt: "Stunning scientific visualization: glowing cellular nucleus where telomerase enzymes rebuild and lengthen protective chromosome caps, restoring cellular vitality.",
    characterLock: "elena",
    visualStyle: "biomedical_micro",
    recommendedDuration: 24,
    speechSample: "By extending the protective telomeric caps on chromosome ends, we restore the replicative lifespan of human cells at the foundational genetic tier."
  },

  // ==========================================
  // 9. Veritas Trust & Cryptography (6 Unique Templates)
  // ==========================================
  {
    id: "sec_veritas_zk_snark",
    genre: "security",
    genreEmoji: "🛡️",
    title: "🛡️ Veritas zk-SNARK Cryptographic Shield",
    hook: "Priya explains frame-by-frame deepfake immunity and C2PA provenance signatures.",
    prompt: "Priya Sharma briefs sovereign security auditors on Ed25519 cryptographic seals and claim-level zero-drift grounding protocols.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "In a world flooded with synthetic media, trust is math. Veritas zk-SNARK provides immutable proof for every spoken syllable."
  },
  {
    id: "sec_hardware_enclave_hsm",
    genre: "security",
    genreEmoji: "🔐",
    title: "🔐 Silicon-Anchored Ed25519 Enclave Security",
    hook: "Hardware Root of Trust chips signing broadcast streams with zero tampering.",
    prompt: "David Kim inside a high-security server vault demonstrating tamper-proof cryptographic hardware security modules signing 4K video frames in real-time.",
    characterLock: "david",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 24,
    speechSample: "Keys never leave the physical silicon enclave. Every pixel broadcast to the world carries an unforgeable hardware signature."
  },
  {
    id: "sec_post_quantum_lattice",
    genre: "security",
    genreEmoji: "🕸️",
    title: "🕸️ Post-Quantum Kyber-1024 Lattice Cryptography",
    hook: "Multi-dimensional geometric lattices resisting quantum Shor's algorithm attacks.",
    prompt: "Mei-Ling Zhou demonstrates multi-dimensional cryptographic lattices rotating in 3D holographic space, absorbing quantum interference with mathematical perfection.",
    characterLock: "meiling",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "Lattice-based cryptography transforms encryption into an insolvable geometric problem in thousands of dimensions—impenetrable even to quantum computers."
  },
  {
    id: "sec_zk_private_rollup",
    genre: "security",
    genreEmoji: "⚡",
    title: "⚡ Zero-Knowledge Private Rollup Proofs",
    hook: "Mathematical SNARK verifying billions in transactions without revealing identity data.",
    prompt: "Carlos Mendoza explains recursive zero-knowledge SNARK proof aggregation on an interactive holographic touchscreen displaying decentralized settlement trees.",
    characterLock: "carlos",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 24,
    speechSample: "We can verify the mathematical truth of ten thousand transactions in a single fifty-byte proof without revealing a single private account balance."
  },
  {
    id: "sec_satellite_constellation_ledger",
    genre: "security",
    genreEmoji: "🛰️",
    title: "🛰️ Orbital Cryptographic Validator Constellation",
    hook: "Low-Earth orbit satellites cross-signing global data timestamps via laser links.",
    prompt: "Cinematic aerospace defense visualization: constellation of low-Earth orbit satellites exchanging glowing green laser cryptographic proofs across Earth's night hemisphere.",
    characterLock: "david",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "By decentralizing our consensus clock across thirty orbital satellites, time and truth become immune to terrestrial state censorship."
  },
  {
    id: "sec_deepfake_liveness_detector",
    genre: "security",
    genreEmoji: "🎯",
    title: "🎯 12-Axis Neural Liveness & Vascular Scanner",
    hook: "Sub-surface vascular blood flow analysis detecting synthetic video impersonation in real-time.",
    prompt: "High-tech security forensic interface: side-by-side video screen tracking micro-pulse facial capillaries, iris photometrics, and corneal reflections to verify authentic human presence.",
    characterLock: "elena",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 24,
    speechSample: "AI can generate pixels, but it cannot counterfeit the involuntary micro-vascular pulse of human capillary blood flow beneath the skin."
  }
];
