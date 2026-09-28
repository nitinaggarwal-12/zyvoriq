// ============================================================================
// ZYVORIQ STITCH STUDIO — STRUCTURED CATALOG (ZERO REGEX SELECTION)
// Every entity (Persona, Wardrobe, Country, Region, Language, Demography,
// Platform, ContentType, Duration, Reel) is keyed by an explicit ID and
// structured properties. No regex or substring heuristics are used anywhere.
// ============================================================================

export type PersonaCategory =
  | "female_lead"
  | "male_lead"
  | "supporting"
  | "background"
  | "audience";

export interface WardrobeItem {
  id: string;
  category: PersonaCategory;
  act: 1 | 2 | "both";
  group: string;
  label: string;
  promptSpec: string;
}

export interface AccessoryItem {
  id: string;
  label: string;
  promptSpec: string;
}

export interface PersonaDefinition {
  id: string;
  category: PersonaCategory;
  name: string;
  roleTitle: string;
  ethnicity: string;
  facialSpec: string;
  photoUrl: string;
  defaultAct1WardrobeId: string;
  defaultAct2WardrobeId: string;
  defaultAccessoryId: string;
}

export interface CatalogOption {
  id: string;
  label: string;
  regionId?: string;
  promptSpec: string;
}

export interface DurationOption {
  id: string;
  seconds: number;
  shotsCount: number;
  label: string;
}

export interface ShotSpec {
  shotId: string;
  shotNumber: number;
  timecode: string;
  act: 1 | 2;
  cameraMoveId: string;
  actionPrompt: string;
  wardrobeSummary: string;
  lyricLine: string;
  previewPhotoUrl: string;
}

export interface StudioReelRecord {
  id: string;
  title: string;
  status: "published" | "wip" | "draft" | "failed";
  progress: number;
  errorReason?: string;
  videoUrl: string;
  durationId: string;
  countryId: string;
  regionId: string;
  languageId: string;
  demographyId: string;
  platformId: string;
  contentTypeId: string;
  genreId: string;
  vocalId: string;
  venueId: string;
  lightingId: string;
  selectedPersonaIds: Record<PersonaCategory, string[]>;
  wardrobeOverrides: Record<string, { act1Id: string; act2Id: string; accessoryId: string }>;
  shots: ShotSpec[];
  updatedAt: string;
}

// ============================================================================
// 1. EXHAUSTIVE TREND FILTER DIMENSIONS (BY ID)
// ============================================================================

export const REGIONS_CATALOG: CatalogOption[] = [
  { id: "reg_south_asia", label: "South Asia (India, Punjab, Mumbai, Udaipur)", promptSpec: "South Asian royal palace & modern luxury metropolitan aesthetic" },
  { id: "reg_mediterranean", label: "Mediterranean & Iberia (Spain, Italy, Greece, French Riviera)", promptSpec: "Sun-drenched Mediterranean coastal villa, infinity pool & superyacht aesthetic" },
  { id: "reg_north_america", label: "North America (USA, Miami, LA, NYC, Toronto)", promptSpec: "High-gloss Beverly Hills, Miami South Beach & Manhattan penthouse cinema" },
  { id: "reg_middle_east", label: "Middle East & GCC (Dubai, Abu Dhabi, Riyadh, Doha)", promptSpec: "Ultra-luxury Arabian sky-helipad, desert oasis lounge & gold architecture" },
  { id: "reg_east_asia", label: "East Asia (Seoul, Tokyo, Shanghai, Hong Kong)", promptSpec: "High-energy neon cyber-metropolis, floating river stage & glass sky-deck" },
  { id: "reg_western_europe", label: "Western & Alpine Europe (Paris, London, Swiss Alps)", promptSpec: "Haute couture Parisian rooftop, Mayfair ballroom & Zermatt alpine glass terrace" },
  { id: "reg_west_africa", label: "West & Sub-Saharan Africa (Lagos, Accra, Cape Town)", promptSpec: "Vibrant Victoria Island oceanfront beach club & contemporary luxury arena" },
  { id: "reg_latin_america", label: "Latin America & Caribbean (Rio, Tulum, Mexico City, Medellin)", promptSpec: "Tropical architectural jungle villa, torchlit cenote & beachfront fiesta" },
];

export const COUNTRIES_CATALOG: CatalogOption[] = [
  { id: "cnt_spain", regionId: "reg_mediterranean", label: "Spain — Marbella, Ibiza & Seville", promptSpec: "Sunlit Marbella infinity pool club transitioning to Seville candlelit courtyard" },
  { id: "cnt_india_mumbai", regionId: "reg_south_asia", label: "India — Mumbai VIP Nightclub & Retro-Glam Studio Stage", promptSpec: "Glamorous Mumbai underground VIP retro-glam nightclub with crimson velvet booths, mirror-work dance floor & high-voltage concert stage" },
  { id: "cnt_india_chanderi", regionId: "reg_south_asia", label: "India — Chanderi Nighttime Street-Festival Stage & Mumbai", promptSpec: "Nighttime fairy-lit Chanderi town open-air street & rustic stone courtyard stage with hanging lanterns and festive Bollywood party atmosphere" },
  { id: "cnt_india_royal", regionId: "reg_south_asia", label: "India — Udaipur Palace, Goa & Mumbai", promptSpec: "Udaipur Lake Pichola sandstone palace & Mumbai Worli rooftop helipad" },
  { id: "cnt_india_haveli", regionId: "reg_south_asia", label: "India — Ancient Torchlit Haveli, Rajasthan & Temple Sanctum", promptSpec: "Ancient carved stone Indian haveli courtyard, torchlit temple pillars & misty moonlit sanctum arena" },
  { id: "cnt_india_punjab", regionId: "reg_south_asia", label: "India — Chandigarh & Amritsar Heritage", promptSpec: "Luxury Chandigarh modernist farmhouse & illuminated heritage haveli courtyard" },
  { id: "cnt_usa", regionId: "reg_north_america", label: "USA — Miami South Beach & Beverly Hills", promptSpec: "Biscayne Bay superyacht deck & Beverly Hills glass infinity mansion" },
  { id: "cnt_italy", regionId: "reg_mediterranean", label: "Italy — Positano Cliffside & Capri Sea Grotto", promptSpec: "Positano lemon pergola terrace & candlelit Capri turquoise sea cave" },
  { id: "cnt_uae", regionId: "reg_middle_east", label: "UAE — Dubai Burj Helipad & Desert Oasis", promptSpec: "Burj Al Arab sky helipad & starlit Arabian desert fire-pit amphitheater" },
  { id: "cnt_south_korea", regionId: "reg_east_asia", label: "South Korea — Seoul Han River & Gangnam", promptSpec: "Seoul floating LED glass stage & Gangnam penthouse sky lounge" },
  { id: "cnt_japan", regionId: "reg_east_asia", label: "Japan — Tokyo Shibuya Sky & Kyoto Shrine", promptSpec: "Shibuya neon panoramic sky-deck & Kyoto bamboo lantern courtyard" },
  { id: "cnt_france", regionId: "reg_western_europe", label: "France — Paris Eiffel Terrace & Cannes Yacht", promptSpec: "Parisian Haussmann rooftop overlooking Eiffel Tower & Cannes superyacht" },
  { id: "cnt_uk", regionId: "reg_western_europe", label: "United Kingdom — London Mayfair & Thames", promptSpec: "London Mayfair candlelit Regency ballroom & glass Thames skybar" },
  { id: "cnt_greece", regionId: "reg_mediterranean", label: "Greece — Santorini Caldera & Mykonos Beach", promptSpec: "Santorini whitewashed cliffside infinity pool & Mykonos torchlit beach club" },
  { id: "cnt_switzerland", regionId: "reg_western_europe", label: "Switzerland — Zermatt Alps & Lake Geneva", promptSpec: "Zermatt Matterhorn glass chalet deck & Lake Geneva twilight superyacht" },
  { id: "cnt_nigeria", regionId: "reg_west_africa", label: "Nigeria — Lagos Victoria Island Ocean Club", promptSpec: "Lagos oceanfront VIP cabana deck & illuminated concert stage" },
  { id: "cnt_brazil", regionId: "reg_latin_america", label: "Brazil — Rio Ipanema Penthouse & Yacht", promptSpec: "Rio oceanfront modernist penthouse & Guanabara Bay sunset yacht" },
  { id: "cnt_mexico", regionId: "reg_latin_america", label: "Mexico — Tulum Jungle Villa & Torchlit Beach", promptSpec: "Tulum architectural travertine pool villa & torchlit Caribbean beach stage" },
];

export const LANGUAGES_CATALOG: CatalogOption[] = [
  { id: "lang_english", label: "English (Global Pop, Synthwave & R&B)", promptSpec: "English Billboard dance-pop vocals with crisp studio articulation" },
  { id: "lang_punjabi", label: "Punjabi (Bhangra, Urban Desi & Folk-Trap)", promptSpec: "Authentic Punjabi vocals with dholak, tumbi & modern sub-bass groove" },
  { id: "lang_hindi", label: "Hindi (Bollywood Glam, Club & Cinema)", promptSpec: "Expressive Hindi playback vocals with lush orchestral, dhol-brass & electronic club production" },
  { id: "lang_spanish", label: "Spanish (Reggaeton, Latin Pop & Flamenco Fusion)", promptSpec: "Passionate Spanish vocals with Mediterranean acoustic guitar & dembow beat" },
  { id: "lang_punjabi_english", label: "Punjabi + English (Bilingual Global Crossover)", promptSpec: "Seamless bilingual Punjabi hook and English verse duet trade-offs" },
  { id: "lang_hindi_punjabi", label: "Hindi + Punjabi (Sangeet & Celebration Crossover)", promptSpec: "Festive Hindi-Punjabi wedding & club celebration anthem" },
  { id: "lang_korean", label: "Korean + English (K-Pop High-Energy Idol Group)", promptSpec: "Tight Korean-English group harmonies, rap break & high-note chorus" },
  { id: "lang_arabic", label: "Arabic (Khaleeji & Habibi Luxury Club)", promptSpec: "Melodic Arabic vocals with darbouka percussion & deep synth bass" },
  { id: "lang_french", label: "French (Riviera Electro-Chic & Nu-Disco)", promptSpec: "Breathless French electro-pop vocals with slap-bass & analog synths" },
  { id: "lang_japanese", label: "Japanese (Tokyo City-Pop & Future Bass)", promptSpec: "Crisp Japanese city-pop vocals with brass stabs & neon synth chords" },
  { id: "lang_portuguese", label: "Portuguese (Brazilian Funk & Bossa House)", promptSpec: "Rhythmic Brazilian Portuguese vocals with tropical house percussion" },
];

export const DEMOGRAPHIES_CATALOG: CatalogOption[] = [
  { id: "demo_genz_festival", label: "Gen-Z (18–24) • Viral Dance, College & Festival", promptSpec: "High-energy 18-24 youth cast, kinetic choreography & festival vibrancy" },
  { id: "demo_millennial_luxury", label: "Millennials (25–34) • Jet-Set Luxury, Yacht & Resort", promptSpec: "Sophisticated 25-34 international supermodel cast, resort & superyacht glamour" },
  { id: "demo_wedding_sangeet", label: "Family & Royal Wedding • Sangeet, Bridal & Heritage", promptSpec: "Multi-generational royal wedding celebration with bride, groom & family entourage" },
  { id: "demo_bollywood_classic", label: "Classic Bollywood Cinema & Folk Drama • Mythological & Iconic Retro", promptSpec: "Dramatic 35mm Indian cinema storytelling, expressive classical abhinaya & iconic theatrical staging" },
  { id: "demo_high_fashion", label: "Haute Couture & Editorial • Runway & Red Carpet", promptSpec: "Avant-garde runway models, architectural lighting & Met Gala couture styling" },
  { id: "demo_club_nightlife", label: "VIP Nightlife & Club • DJ, Bottle Sparklers & Rooftop", promptSpec: "Electric VIP rooftop nightlife crowd, laser beams & champagne sparklers" },
];

export const PLATFORMS_CATALOG: CatalogOption[] = [
  { id: "plat_ig_reels", label: "Instagram Reels (9:16 Vertical • High-Gloss Luxury)", promptSpec: "9:16 vertical framing optimized for Instagram Reels aesthetic & color grade" },
  { id: "plat_tiktok", label: "TikTok Viral (9:16 Vertical • Fast Hook & Choreography)", promptSpec: "9:16 vertical framing with immediate 0.00s visual hook & synchronized dance" },
  { id: "plat_yt_shorts", label: "YouTube Shorts (9:16 Vertical • High-Retention Story)", promptSpec: "9:16 vertical cinema with strong narrative progression & clear vocal close-ups" },
  { id: "plat_yt_music", label: "YouTube 4K Music Video (9:16 / Anamorphic Cinema)", promptSpec: "35mm anamorphic music video depth-of-field, crane sweeps & concert lighting" },
  { id: "plat_snap_spotlight", label: "Snapchat Spotlight (9:16 Vertical • Dynamic POV)", promptSpec: "Close-proximity handheld gimble energy & vibrant color contrast" },
];

export const CONTENT_TYPES_CATALOG: CatalogOption[] = [
  { id: "ctype_music_video", label: "Music Video & Synchronized Choreography", promptSpec: "Full lip-synced musical performance with beat-matched ensemble dance" },
  { id: "ctype_wardrobe_transition", label: "Couture Wardrobe Transformation (Act I → Act II)", promptSpec: "Dramatic mid-reel outfit & venue transformation preserving exact facial identity" },
  { id: "ctype_luxury_travel", label: "Luxury Destination, Poolside & Superyacht Reel", promptSpec: "Cinematic lifestyle showcase across iconic architectural landmarks" },
  { id: "ctype_wedding_film", label: "Royal Bridal & Sangeet Celebration Film", promptSpec: "Grand bridal entry, couple chemistry & choreographed family celebration" },
  { id: "ctype_brand_campaign", label: "High-Fashion Brand & Fragrance Commercial", promptSpec: "Editorial slow-motion hero shots, luxury texture close-ups & signature pose" },
];

export const DURATIONS_CATALOG: DurationOption[] = [
  { id: "dur_15s", seconds: 15, shotsCount: 2, label: "15 Seconds (2 Shots • Quick Viral Hook)" },
  { id: "dur_30s", seconds: 30, shotsCount: 3, label: "30 Seconds (3 Shots • Single-Act Reel)" },
  { id: "dur_60s", seconds: 60, shotsCount: 6, label: "60 Seconds (6 Shots • Full Act I + Act II Master)" },
  { id: "dur_90s", seconds: 90, shotsCount: 9, label: "90 Seconds (9 Shots • Extended Three-Act Cut)" },
  { id: "dur_120s", seconds: 120, shotsCount: 12, label: "120 Seconds (12 Shots • Complete Music Video)" },
];

export const GENRES_CATALOG: CatalogOption[] = [
  { id: "gen_dance_pop", label: "Billboard Dance-Pop & Synthwave (124 BPM)", promptSpec: "124 BPM dance-pop synthwave" },
  { id: "gen_punjabi_bhangra", label: "Punjabi Bhangra & Urban Desi Club (128 BPM)", promptSpec: "128 BPM Punjabi dholak & sub-bass club anthem" },
  { id: "gen_bollywood_glam_party", label: "Bollywood Glam Dance & Dhol-Bass Party Anthem (124 BPM)", promptSpec: "124 BPM high-energy Bollywood item-pop & street-dhol party anthem with punchy folk shehnai-synth brass hook, live dhol-tasha percussion, handclaps & deep electronic sub-bass drop" },
  { id: "gen_bollywood_royal", label: "Bollywood Royal Orchestra & Modern Pop (122 BPM)", promptSpec: "122 BPM grand Bollywood dance number" },
  { id: "gen_bollywood_folk_classical", label: "Bollywood Classical Pungi-Been, Dholak & Temple Orchestra (122 BPM)", promptSpec: "122 BPM hypnotic Indian classical been-flute, dholak, tabla, ghungroo & dramatic orchestral score" },
  { id: "gen_spanish_latin", label: "Spanish Reggaeton & Mediterranean Pop (120 BPM)", promptSpec: "120 BPM Spanish reggaeton & acoustic pop" },
  { id: "gen_kpop_idol", label: "K-Pop High-Energy Group Anthem (128 BPM)", promptSpec: "128 BPM K-pop crisp synth & bass drop" },
  { id: "gen_arabic_club", label: "Arabic Khaleeji & Luxury Club Groove (122 BPM)", promptSpec: "122 BPM Arabic percussion & electronic groove" },
  { id: "gen_afrobeats", label: "Afrobeats & Lagos Amapiano Log-Drum (118 BPM)", promptSpec: "118 BPM Afrobeats & Amapiano groove" },
  { id: "gen_french_disco", label: "French Riviera Nu-Disco & Electro (120 BPM)", promptSpec: "120 BPM French nu-disco slap-bass" },
];

export const VOCALS_CATALOG: CatalogOption[] = [
  { id: "voc_duet", label: "Romantic Male + Female Duet Call-and-Response", promptSpec: "Synchronized male and female duet vocal trade-offs" },
  { id: "voc_female_solo", label: "Solo Female Lead Vocalist + Backup Harmonies", promptSpec: "Lead female vocalist center stage with layered harmonies" },
  { id: "voc_male_solo", label: "Solo Male Lead Vocalist + Crowd Chant", promptSpec: "Lead male vocalist center stage with energetic crowd response" },
  { id: "voc_girl_group", label: "4-Part All-Female Group Harmonies", promptSpec: "4 female vocalists trading lines in synchronized formation" },
  { id: "voc_boy_band", label: "4-Part All-Male Group Harmonies", promptSpec: "4 male vocalists singing in tight choreographed formation" },
];

export const AUDIO_ENGINES_CATALOG: CatalogOption[] = [
  {
    id: "omni_lyria3",
    label: "Omni 1.1 + Lyria-3-pro-preview (Closed-Lips Eye/Body Acting + Continuous Studio Song)",
    promptSpec:
      "Dual-Mode Vocal & Ensemble Pipeline: models/lyria-3-pro-preview generates the continuous 60.0s 48,000 Hz studio vocal & instrumental master first; models/gemini-omni-1.1-flash locks active vocalists to beat-synced phoneme visemes (r >= 0.72) while enforcing 100% closed-lips Nayan-Abhinaya eye-acting (RMS <= 0.015) on all non-singing dancers and ensemble tiers",
  },
  {
    id: "omni_native",
    label: "Omni 1.1 Only (Single-Model Native Video + Lip-Sync Audio)",
    promptSpec:
      "Single-Model Pipeline: models/gemini-omni-1.1-flash (POST /v1beta/interactions 24/1 CFR Video + Native 48,000 Hz stereo vocal lip-sync per 10s turn)",
  },
];

export const VENUES_CATALOG: CatalogOption[] = [
  { id: "ven_pool_to_courtyard", label: "Marble Infinity Pool Deck → Torchlit Palace Courtyard", promptSpec: "Sunlit marble infinity pool deck in Act I (0:00–0:30), candlelit & torchlit Andalusian palace courtyard in Act II (0:30–1:00)" },
  { id: "ven_palace_to_yacht", label: "Royal Sandstone Palace → Twilight Superyacht Helipad", promptSpec: "Royal sandstone palace in Act I (0:00–0:30), luxury superyacht deck at twilight in Act II (0:30–1:00)" },
  { id: "ven_penthouse_to_club", label: "Glass Sky-Penthouse → Underground Laser VIP Arena", promptSpec: "Panoramic glass penthouse in Act I (0:00–0:30), neon laser VIP club in Act II (0:30–1:00)" },
  { id: "ven_pergola_to_grotto", label: "Coastal Lemon Pergola → Candlelit Sea Cave Grotto", promptSpec: "Cliffside lemon pergola in Act I (0:00–0:30), turquoise sea cave grotto in Act II (0:30–1:00)" },
  { id: "ven_stadium_arena", label: "Sunset Amphitheater → 360-Degree Holographic LED Concert Stadium", promptSpec: "Open-air sunset architectural amphitheater in Act I (0:00–0:30) transforming into a 360-degree holographic LED concert stadium with pyrotechnics in Act II (0:30–1:00)" },
];

export const LIGHTING_CATALOG: CatalogOption[] = [
  { id: "lit_golden_to_midnight", label: "Golden Sunlight (Act I) → Midnight Neon & Fireworks (Act II)", promptSpec: "Warm golden hour sunbeams transitioning to midnight neon & fireworks" },
  { id: "lit_club_amber_to_neon_lasers", label: "Retro-Glam Club Amber & Chandeliers (Act I) → Multi-Spectrum Laser & Strobe Arena (Act II)", promptSpec: "Warm indoor club amber key lights, crystal chandelier reflections & stage haze in Act I transitioning to multi-spectrum concert lasers, cyan-magenta strobes & volumetric beams in Act II" },
  { id: "lit_fairylight_party", label: "Nighttime Fairy-Lights & Lanterns (Act I) → Neon Party Spotlights & Sparklers (Act II)", promptSpec: "Warm overhead canopy of glowing nighttime street fairy-lights, paper lanterns & stage haze transitioning to vibrant amber-magenta concert spotlights & golden sparkler fountains" },
  { id: "lit_palace_to_chandeliers", label: "Warm Daylight & Marigolds (Act I) → Crystal Chandeliers (Act II)", promptSpec: "Natural palace sunlight transitioning to warm crystal chandeliers & floating diyas" },
  { id: "lit_torchlit_haveli", label: "Flickering Mashaal Fire-Torches & Mist (Act I) → Moonlit Brazier Sanctum (Act II)", promptSpec: "Dramatic chiaroscuro brass mashaal torchlight & ground mist transitioning to full-moon silver rim-lighting & roaring fire braziers" },
  { id: "lit_coastal_to_lasers", label: "Turquoise Coastal Sun (Act I) → Ultraviolet Club Lasers (Act II)", promptSpec: "Bright coastal reflections transitioning to high-contrast club lasers" },
  { id: "lit_anamorphic_cinema", label: "35mm Anamorphic Cinema Rim-Light & Wet Reflections", promptSpec: "High-contrast 35mm anamorphic rim lighting with specular floor reflections" },
];

export const CAMERA_MOVES_CATALOG: CatalogOption[] = [
  { id: "cam_push_in", label: "Low-Angle Steadicam Push-In (35mm)", promptSpec: "Low-angle 35mm anamorphic steadicam push-in" },
  { id: "cam_orbit_360", label: "360-Degree Orbiting Gimbal", promptSpec: "Smooth 360-degree orbiting gimbal shot around performers" },
  { id: "cam_crane_sweep", label: "Sweeping Jib Crane Rise", promptSpec: "Elevating jib crane sweep revealing full stage & ensemble" },
  { id: "cam_dolly_track", label: "Beat-Matched Dolly Tracking Shot", promptSpec: "Lateral dolly tracking synchronized to choreography footwork" },
  { id: "cam_closeup_85mm", label: "Intimate 85mm Vocal Lip-Sync Close-Up", promptSpec: "Shallow depth-of-field 85mm portrait lens close-up on vocal expression" },
  { id: "cam_drone_finale", label: "Drone Pull-Back Grand Finale Reveal", promptSpec: "Wide aerial pull-back revealing fireworks, venue & entire cast formation" },
];

// ============================================================================
// 2. EXHAUSTIVE WARDROBE LIBRARY FOR ALL 5 CHARACTER TIERS
// ============================================================================

export const WARDROBE_CATALOG: WardrobeItem[] = [
  // ---- FEMALE LEADS: ACT I ----
  { id: "w_f1_sabyasachi_crimson", category: "female_lead", act: 1, group: "South Asian Couture", label: "Royal Heritage Crimson & Gold Zardosi Bridal Lehenga", promptSpec: "Royal heritage crimson silk lehenga with heavy gold zardosi embroidery and sheer dupatta" },
  { id: "w_f1_manish_ivory", category: "female_lead", act: 1, group: "South Asian Couture", label: "Designer Ivory & Silver Chikankari Crystal Lehenga", promptSpec: "Couture ivory organza lehenga encrusted with silver crystals and chikankari threadwork" },
  { id: "w_f1_punjabi_phulkari", category: "female_lead", act: 1, group: "South Asian Couture", label: "Punjabi Rani-Pink Phulkari Patiala Suit & Paranda", promptSpec: "Vibrant rani-pink Punjabi Patiala salwar suit with gold phulkari embroidery and paranda braid" },
  { id: "w_f1_indo_western_saree", category: "female_lead", act: 1, group: "South Asian Couture", label: "Indo-Western Metallic Gold Pre-Draped Cocktail Saree", promptSpec: "Modern sculpted corset blouse with pre-draped liquid-gold metallic silk saree" },
  { id: "w_f1_ruby_sequin_mini", category: "female_lead", act: 1, group: "Mediterranean Resort", label: "Ruby Red Sequin Resort Mini-Dress & Gold Waist Chain", promptSpec: "Sun-catching ruby-red sequin halter mini-dress with layered gold waist chain" },
  { id: "w_f1_ibiza_crochet", category: "female_lead", act: 1, group: "Mediterranean Resort", label: "Ibiza Ivory Crochet Poolside Cover-Up & Pearl Bikini", promptSpec: "Luxury ivory hand-knit resort cover-up over mother-of-pearl bikini with gold cuffs" },
  { id: "w_f1_amalfi_silk_halter", category: "female_lead", act: 1, group: "Mediterranean Resort", label: "Amalfi Lemon-Print Silk Halter Sundress", promptSpec: "Flowing Italian silk halter sundress with botanical lemon-and-gold print" },
  { id: "w_f1_kyoto_kimono", category: "female_lead", act: 1, group: "Global Heritage", label: "Kyoto Hand-Painted Sakura Silk Kimono & Gold Obi", promptSpec: "Hand-painted blush sakura silk kimono with structured gold brocade obi sash" },
  { id: "w_f1_shanghai_qipao", category: "female_lead", act: 1, group: "Global Heritage", label: "Shanghai Ruby Brocade High-Slit Cheongsam / Qipao", promptSpec: "Tailored ruby silk brocade qipao with gold phoenix motifs and pearl buttons" },
  { id: "w_f1_seoul_hanbok", category: "female_lead", act: 1, group: "Global Heritage", label: "Modern Pastel Silk Korean Hanbok Couture", promptSpec: "Contemporary pastel organza Korean hanbok with gold-leaf jeogori jacket" },
  { id: "w_f1_seville_flamenco", category: "female_lead", act: 1, group: "Global Heritage", label: "Seville Crimson Ruffled Flamenco Gown & Fringe Shawl", promptSpec: "Form-fitting crimson Spanish flamenco dress with cascading ruffles and silk manton shawl" },
  { id: "w_f1_kpop_holographic", category: "female_lead", act: 1, group: "Pop & Streetwear", label: "K-Pop Holographic Cropped Bomber & Pleated Mini-Skirt", promptSpec: "Iridescent holographic cropped jacket, high-waisted pleated mini-skirt and platform boots" },
  { id: "w_f1_milan_powersuit", category: "female_lead", act: 1, group: "Editorial Luxury", label: "Milanese CEO Tailored Ivory Double-Breasted Power Suit", promptSpec: "Sharp tailored ivory silk double-breasted blazer and wide-leg trousers with gold heels" },

  // ---- FEMALE LEADS: ACT II FINALE ----
  { id: "w_f2_versace_chainmail", category: "female_lead", act: 2, group: "High-Glamour Finale", label: "Liquid-Gold Metallic Chainmail Backless Evening Gown", promptSpec: "Floor-length liquid-gold metallic chainmail couture gown with draped open back" },
  { id: "w_f2_emerald_ballgown", category: "female_lead", act: 2, group: "High-Glamour Finale", label: "Emerald Silk Couture Ballgown with High Slit & Tiara", promptSpec: "Regal emerald satin ballgown with crystal bodice, thigh-high slit and diamond tiara" },
  { id: "w_f2_sapphire_swarovski", category: "female_lead", act: 2, group: "High-Glamour Finale", label: "Midnight Sapphire Crystal Bodysuit & Feather Cape", promptSpec: "Sparkling midnight-sapphire crystal bodysuit with sweeping ostrich-feather cape" },
  { id: "w_f2_banarasi_maharani", category: "female_lead", act: 2, group: "South Asian Finale", label: "Royal Gold & Ruby Banarasi Silk Maharani Saree", promptSpec: "Heirloom gold-zari Banarasi silk saree with temple diamond jewelry" },
  { id: "w_f2_mirrorwork_silver", category: "female_lead", act: 2, group: "South Asian Finale", label: "Mirror-Work Silver Metallic Lehenga with Cape Sleeves", promptSpec: "Handcrafted silver sheesha mirror-work lehenga choli with floor-sweeping sheer cape" },
  { id: "w_f2_cyber_fiberoptic", category: "female_lead", act: 2, group: "Futuristic Couture", label: "Cyber Fiber-Optic Illuminated Couture Evening Gown", promptSpec: "Sculpted architectural gown woven with glowing luminous fiber-optic threads" },

  // ---- MALE LEADS: ACT I ----
  { id: "w_m1_ivory_bandhgala", category: "male_lead", act: 1, group: "South Asian Royal", label: "Royal Ivory & Gold Hand-Embroidered Bandhgala Suit", promptSpec: "Bespoke ivory silk Jodhpuri bandhgala jacket with gold threadwork and tailored trousers" },
  { id: "w_m1_punjabi_kurta_nehru", category: "male_lead", act: 1, group: "South Asian Royal", label: "Punjabi Black Silk Kurta & Gold Velvet Nehru Jacket", promptSpec: "Jet-black silk kurta pajama paired with gold-embroidered velvet Nehru jacket and mojari" },
  { id: "w_m1_emerald_sherwani", category: "male_lead", act: 1, group: "South Asian Royal", label: "Royal Heritage Emerald Velvet Sherwani & Pearl Mala", promptSpec: "Regal emerald velvet sherwani with layered pearl necklace and silk safa turban" },
  { id: "w_m1_linen_resort", category: "male_lead", act: 1, group: "Mediterranean Resort", label: "Sky-Blue Open Linen Resort Shirt & Tailored White Chinos", promptSpec: "Breezy sky-blue Italian linen shirt open at collar with crisp white tailored chinos" },
  { id: "w_m1_positano_knit", category: "male_lead", act: 1, group: "Mediterranean Resort", label: "Positano Striped Knit Polo & Pleated Ivory Trousers", promptSpec: "Vintage Riviera striped knit polo with high-waisted pleated ivory trousers and loafers" },
  { id: "w_m1_kpop_tweed", category: "male_lead", act: 1, group: "Pop & Streetwear", label: "K-Pop Embellished Cropped Tweed Jacket & Leather Pants", promptSpec: "Crystal-trimmed cropped tweed stage jacket with slim black leather trousers" },
  { id: "w_m1_savile_row", category: "male_lead", act: 1, group: "Editorial Luxury", label: "Savile Row Charcoal Double-Breasted Pinstripe Suit", promptSpec: "Bespoke charcoal pinstripe double-breasted suit with silk pocket square" },

  // ---- MALE LEADS: ACT II FINALE ----
  { id: "w_m2_midnight_tuxedo", category: "male_lead", act: 2, group: "Black-Tie Finale", label: "Midnight-Velvet Tuxedo with Crystal Lapels", promptSpec: "Custom midnight-blue velvet dinner jacket with Swarovski crystal lapels and black silk shirt" },
  { id: "w_m2_gold_sherwani", category: "male_lead", act: 2, group: "South Asian Finale", label: "Metallic Gold Brocade Royal Reception Sherwani", promptSpec: "Handwoven metallic gold brocade sherwani with emerald brooch" },
  { id: "w_m2_monaco_white_tux", category: "male_lead", act: 2, group: "Black-Tie Finale", label: "All-White Monaco Superyacht Dinner Tuxedo", promptSpec: "Sharp all-white shawl-lapel dinner tuxedo with gold chronograph watch" },
  { id: "w_m2_crimson_velvet", category: "male_lead", act: 2, group: "Black-Tie Finale", label: "Crimson Velvet Double-Breasted Headliner Suit", promptSpec: "Deep crimson velvet double-breasted stage suit with gold chain detailing" },

  // ---- SUPPORTING CAST WARDROBE (ACT I -> ACT II EVOLUTION) ----
  { id: "w_sup_chrome_dj", category: "supporting", act: "both", group: "Supporting Stage", label: "Supporting Musicians Act I Linen/Chrome → Act II Illuminated Stage Ensemble", promptSpec: "Act I: Tailored white resort linen & brushed-silver stage vest with live acoustic guitar/cajón straps → Act II: Reflective silver-chrome DJ & horn-section jacket with LED visor and gold-piped cuffs" },
  { id: "w_sup_gold_musician", category: "supporting", act: "both", group: "Supporting Stage", label: "Virtuoso Musicians Act I Silk → Act II Gold-Brocade Finale Attire", promptSpec: "Act I: Tailored charcoal silk musician attire with brass horn & percussion harnesses → Act II: Jet-black velvet & metallic gold-brocade concert ensemble" },
  { id: "w_sup_bridesmaid_pastel", category: "supporting", act: "both", group: "Supporting Stage", label: "Coordinated Pastel Rose (Act I) → Champagne Mirror-Work (Act II) Ensemble", promptSpec: "Act I: Coordinated pastel rose-gold silk lehengas and bandhgalas → Act II: Shimmering champagne mirror-work finale ensembles" },

  // ---- BACKGROUND PERFORMERS WARDROBE (ACT I -> ACT II EVOLUTION) ----
  { id: "w_bg_monochrome_black", category: "background", act: "both", group: "Choreography Uniform", label: "8-Dancer Crew Act I Matte Street-Couture → Act II Chrome-Harness Uniform", promptSpec: "Act I: Coordinated matte-black technical streetwear dance uniform → Act II: High-contrast obsidian & reflective silver-harness V-formation finale uniform" },
  { id: "w_bg_bhangra_gold", category: "background", act: "both", group: "Choreography Uniform", label: "8-Dancer Bhangra Crew Act I Crimson → Act II Gold Zari Troupe Attire", promptSpec: "Act I: Vibrant crimson Punjabi bhangra vests, lungis, and pagris → Act II: Royal metallic-gold zari & mirror-work finale bhangra uniform" },
  { id: "w_bg_white_riviera", category: "background", act: "both", group: "Choreography Uniform", label: "8-Dancer Mediterranean Crew Act I White Silk → Act II Gold-Trimmed Midnight Ensemble", promptSpec: "Act I: Synchronized all-white flowing silk and linen resort choreography outfits → Act II: Midnight-navy & liquid-gold trimmed V-formation finale dancewear" },
  { id: "w_bg_flamenco_red", category: "background", act: "both", group: "Choreography Uniform", label: "8-Dancer Seville Crew Act I Scarlet → Act II Black-Gold Flamenco Troupe", promptSpec: "Act I: Coordinated scarlet ruffled flamenco performance attire → Act II: High-contrast obsidian & gold-embroidered midnight flamenco finale attire" },

  // ---- AUDIENCE & CROWD WARDROBE (ACT I -> ACT II EVOLUTION) ----
  { id: "w_aud_yacht_glam", category: "audience", act: "both", group: "Crowd Dress Code", label: "VIP Entourage Act I Pool Club Linen → Act II Midnight Gala Dress Code", promptSpec: "Act I: Chic Mediterranean VIP crowd in sunlit silk resort dresses, linen suits and sunglasses → Act II: Torchlit midnight cocktail gowns, velvet dinner jackets and golden sparklers" },
  { id: "w_aud_sangeet_royal", category: "audience", act: "both", group: "Crowd Dress Code", label: "Royal Sangeet Crowd Act I Pastel Silk → Act II Jewel-Tone Finale Attire", promptSpec: "Act I: Festive courtyard audience in pastel silk sarees and kurtas → Act II: Grand reception jewel-toned Banarasi silk lehengas and embroidered sherwanis" },
  { id: "w_aud_black_tie_gala", category: "audience", act: "both", group: "Crowd Dress Code", label: "VIP Gala Crowd Act I Cocktail → Act II Met-Gala Black-Tie Ballgowns", promptSpec: "Act I: Upscale architectural lounge guests in tailored cocktail attire → Act II: Full Met-Gala black-tie tuxedos and crystal evening ballgowns" },
  { id: "w_aud_festival_neon", category: "audience", act: "both", group: "Crowd Dress Code", label: "Festival Crowd Act I Streetwear → Act II Holographic Neon & LED Wristbands", promptSpec: "Act I: High-energy concert crowd in graphic streetwear → Act II: Illuminated holographic festival fashion with synchronized DMX LED wristbands" },
];

export const ACCESSORIES_CATALOG: AccessoryItem[] = [
  { id: "acc_gold_stilettos_waves", label: "Gold Stilettos + Hollywood Waves + Diamond Chandeliers", promptSpec: "Strappy gold metallic stilettos, glossy waves and diamond chandelier earrings" },
  { id: "acc_tiara_crystal_heels", label: "Diamond Tiara + Sleek High Ponytail + Crystal Heels", promptSpec: "Royal diamond tiara, sleek high ponytail and Swarovski crystal heels" },
  { id: "acc_punjabi_juttis_jhumka", label: "Punjabi Paranda Braid + Kundan Jhumkas + Gold Juttis", promptSpec: "Traditional paranda tassel braid, heavy kundan jhumka earrings and embroidered juttis" },
  { id: "acc_aviators_chrono", label: "Gold Aviator Sunglasses + Wet-Look Hair + Luxury Watch", promptSpec: "Gold rimmed aviator sunglasses, sculpted wet-look hair and gold chronograph watch" },
  { id: "acc_cyber_chrome", label: "Chrome Visor + Sleek Braids + Metallic Platform Boots", promptSpec: "Futuristic chrome eyewear, sculpted braids and silver platform boots" },
];

// ============================================================================
// 3. EXHAUSTIVE PERSONAS ROSTER ACROSS ALL 5 TIERS (FEMALE, MALE, SUPPORTING, BG, AUDIENCE)
// ============================================================================

export const PERSONAS_CATALOG: PersonaDefinition[] = [
  // ---- 1. FEMALE LEADS ----
  {
    id: "p_fem_ananya",
    category: "female_lead",
    name: "Ananya Roy",
    roleTitle: "Lead Female Vocalist & Star",
    ethnicity: "South Asian / Indian",
    facialSpec: "24yo South Asian lead heroine, expressive hazel-brown eyes, sculpted cheekbones, glossy jet-black waves",
    photoUrl: "/assets/characters/ananya_roy_in.jpg",
    defaultAct1WardrobeId: "w_f1_sabyasachi_crimson",
    defaultAct2WardrobeId: "w_f2_versace_chainmail",
    defaultAccessoryId: "acc_gold_stilettos_waves",
  },
  {
    id: "p_fem_elena",
    category: "female_lead",
    name: "Elena Navarro",
    roleTitle: "Mediterranean Pop Lead",
    ethnicity: "Spanish / Mediterranean",
    facialSpec: "23yo Spanish singer, sun-kissed olive skin, warm amber eyes, voluminous dark espresso curls",
    photoUrl: "/assets/characters/valentina_castillo.jpg",
    defaultAct1WardrobeId: "w_f1_ruby_sequin_mini",
    defaultAct2WardrobeId: "w_f2_emerald_ballgown",
    defaultAccessoryId: "acc_gold_stilettos_waves",
  },
  {
    id: "p_fem_amara",
    category: "female_lead",
    name: "Amara Okonjo",
    roleTitle: "Afrobeats & Couture Lead",
    ethnicity: "West African / Nigerian",
    facialSpec: "24yo Nigerian star, radiant deep ebony skin, high cheekbones, regal braided crown",
    photoUrl: "/assets/characters/amara_okonjo_ng.jpg",
    defaultAct1WardrobeId: "w_f1_ibiza_crochet",
    defaultAct2WardrobeId: "w_f2_sapphire_swarovski",
    defaultAccessoryId: "acc_tiara_crystal_heels",
  },
  {
    id: "p_fem_aoi",
    category: "female_lead",
    name: "Aoi Takahashi",
    roleTitle: "K-Pop / J-Pop Visual Center",
    ethnicity: "East Asian",
    facialSpec: "22yo East Asian idol, luminous glass skin, almond dark eyes, sleek waist-length raven hair",
    photoUrl: "/assets/characters/aoi_takahashi_jp.jpg",
    defaultAct1WardrobeId: "w_f1_kpop_holographic",
    defaultAct2WardrobeId: "w_f2_cyber_fiberoptic",
    defaultAccessoryId: "acc_cyber_chrome",
  },
  {
    id: "p_fem_maya",
    category: "female_lead",
    name: "Maya Lin-Vance",
    roleTitle: "Soprano & Runway Lead",
    ethnicity: "Eurasian / Global",
    facialSpec: "25yo supermodel vocalist, sharp jawline, emerald-hazel eyes, honey-chestnut waves",
    photoUrl: "/assets/characters/freja_moller_pool.jpg",
    defaultAct1WardrobeId: "w_f1_amalfi_silk_halter",
    defaultAct2WardrobeId: "w_f2_versace_chainmail",
    defaultAccessoryId: "acc_gold_stilettos_waves",
  },
  {
    id: "p_fem_priya",
    category: "female_lead",
    name: "Priya Gill",
    roleTitle: "Punjabi & Urban Desi Lead",
    ethnicity: "Punjabi / North Indian",
    facialSpec: "23yo Punjabi star, radiant golden skin, kohl-rimmed dark eyes, long braided hair",
    photoUrl: "/assets/characters/harleen_kaur_pb.jpg",
    defaultAct1WardrobeId: "w_f1_punjabi_phulkari",
    defaultAct2WardrobeId: "w_f2_mirrorwork_silver",
    defaultAccessoryId: "acc_punjabi_juttis_jhumka",
  },

  // ---- 2. MALE LEADS ----
  {
    id: "p_male_aarav",
    category: "male_lead",
    name: "Aarav Kapoor",
    roleTitle: "Lead Male Vocalist & Co-Star",
    ethnicity: "South Asian / Punjabi",
    facialSpec: "26yo Indian male lead, chiseled jawline, warm bronze skin, thick styled dark hair, light stubble",
    photoUrl: "/assets/characters/aarav_kapoor_in.jpg",
    defaultAct1WardrobeId: "w_m1_ivory_bandhgala",
    defaultAct2WardrobeId: "w_m2_midnight_tuxedo",
    defaultAccessoryId: "acc_aviators_chrono",
  },
  {
    id: "p_male_julian",
    category: "male_lead",
    name: "Julian Sterling",
    roleTitle: "Pop Crooner & Co-Lead",
    ethnicity: "European / Mediterranean",
    facialSpec: "27yo Mediterranean male star, sculpted cheekbones, golden tan, tousled espresso waves",
    photoUrl: "/assets/characters/soren_lindberg_pool.jpg",
    defaultAct1WardrobeId: "w_m1_linen_resort",
    defaultAct2WardrobeId: "w_m2_monaco_white_tux",
    defaultAccessoryId: "acc_aviators_chrono",
  },
  {
    id: "p_male_jonathan",
    category: "male_lead",
    name: "Mateo Silva",
    roleTitle: "Latin & Rap Vocalist",
    ethnicity: "Latin / Iberian",
    facialSpec: "25yo Iberian performer, sharp dark eyes, clean fade haircut, athletic build",
    photoUrl: "/assets/characters/javier_navarro_es.jpg",
    defaultAct1WardrobeId: "w_m1_positano_knit",
    defaultAct2WardrobeId: "w_m2_crimson_velvet",
    defaultAccessoryId: "acc_aviators_chrono",
  },
  {
    id: "p_male_andrei",
    category: "male_lead",
    name: "Kabir Randhawa",
    roleTitle: "Punjabi Bhangra & Club Star",
    ethnicity: "Punjabi",
    facialSpec: "26yo charismatic Punjabi vocalist, sharp beard, athletic frame, intense gaze",
    photoUrl: "/assets/characters/gurpreet_singh_pb.jpg",
    defaultAct1WardrobeId: "w_m1_punjabi_kurta_nehru",
    defaultAct2WardrobeId: "w_m2_gold_sherwani",
    defaultAccessoryId: "acc_aviators_chrono",
  },

  // ---- 3. SUPPORTING CAST ----
  {
    id: "p_sup_dj_aria",
    category: "supporting",
    name: "DJ Aria Vance",
    roleTitle: "Supporting Turntablist & Producer",
    ethnicity: "Global",
    facialSpec: "Charismatic female DJ on elevated glass booth with custom LED headphones",
    photoUrl: "/assets/characters/devika_varma_party.jpg",
    defaultAct1WardrobeId: "w_sup_chrome_dj",
    defaultAct2WardrobeId: "w_sup_chrome_dj",
    defaultAccessoryId: "acc_cyber_chrome",
  },
  {
    id: "p_sup_violinist_victoria",
    category: "supporting",
    name: "Victoria Laurent",
    roleTitle: "Supporting Electric Violinist",
    ethnicity: "European",
    facialSpec: "Virtuoso electric violinist performing dramatic solo beside the lead singers",
    photoUrl: "/assets/characters/giulia_romano_it.jpg",
    defaultAct1WardrobeId: "w_sup_gold_musician",
    defaultAct2WardrobeId: "w_sup_gold_musician",
    defaultAccessoryId: "acc_tiara_crystal_heels",
  },
  {
    id: "p_sup_best_friends",
    category: "supporting",
    name: "Best Friends Trio (Co-Stars)",
    roleTitle: "Supporting Bridal / VIP Entourage",
    ethnicity: "Multi-Ethnic",
    facialSpec: "3 expressive supporting co-stars sharing champagne toasts and reaction close-ups",
    photoUrl: "/assets/characters/anwita_gowda_ka.jpg",
    defaultAct1WardrobeId: "w_sup_bridesmaid_pastel",
    defaultAct2WardrobeId: "w_sup_bridesmaid_pastel",
    defaultAccessoryId: "acc_gold_stilettos_waves",
  },

  // ---- 4. BACKGROUND PERFORMERS ----
  {
    id: "p_bg_hiphop_8",
    category: "background",
    name: "8 Synchronized Tour Dancers",
    roleTitle: "Precision V-Formation Choreography Crew",
    ethnicity: "Global Dance Crew",
    facialSpec: "8 athletic male and female backup dancers executing razor-sharp beat-matched choreography",
    photoUrl: "/assets/australia_punjabi_beach_60s/model_anchor_04.jpg",
    defaultAct1WardrobeId: "w_bg_monochrome_black",
    defaultAct2WardrobeId: "w_bg_monochrome_black",
    defaultAccessoryId: "acc_cyber_chrome",
  },
  {
    id: "p_bg_bhangra_12",
    category: "background",
    name: "12 Punjabi Bhangra & Dhol Troupe",
    roleTitle: "Traditional Dhol & Bhangra Formation",
    ethnicity: "Punjabi Folk & Modern",
    facialSpec: "12 high-energy Punjabi bhangra dancers and live dhol drummers in synchronized formation",
    photoUrl: "/assets/australia_punjabi_beach_60s/model_anchor_05.jpg",
    defaultAct1WardrobeId: "w_bg_bhangra_gold",
    defaultAct2WardrobeId: "w_bg_bhangra_gold",
    defaultAccessoryId: "acc_punjabi_juttis_jhumka",
  },
  {
    id: "p_bg_riviera_dancers",
    category: "background",
    name: "6 Mediterranean Poolside Dancers",
    roleTitle: "Resort & Yacht Choreography Ensemble",
    ethnicity: "Mediterranean",
    facialSpec: "6 sun-kissed contemporary dancers flanking the infinity pool and superyacht deck",
    photoUrl: "/assets/australia_punjabi_beach_60s/model_anchor_06.jpg",
    defaultAct1WardrobeId: "w_bg_white_riviera",
    defaultAct2WardrobeId: "w_bg_white_riviera",
    defaultAccessoryId: "acc_gold_stilettos_waves",
  },

  // ---- 5. AUDIENCE & CROWD PERSONAS ----
  {
    id: "p_aud_yacht_vip",
    category: "audience",
    name: "Marbella & Monaco VIP Yacht Guests",
    roleTitle: "Interactive Poolside & Superyacht Crowd",
    ethnicity: "International Jet-Set",
    facialSpec: "40+ stylish VIP guests cheering, raising champagne flutes and holding golden sparklers",
    photoUrl: "/assets/australia_punjabi_beach_60s/bg_anchor_01.jpg",
    defaultAct1WardrobeId: "w_aud_yacht_glam",
    defaultAct2WardrobeId: "w_aud_yacht_glam",
    defaultAccessoryId: "acc_aviators_chrono",
  },
  {
    id: "p_aud_royal_wedding",
    category: "audience",
    name: "Royal Udaipur Sangeet Wedding Guests",
    roleTitle: "Celebratory Palace Courtyard Audience",
    ethnicity: "South Asian Royal",
    facialSpec: "60+ wedding guests showering rose petals, clapping on beat around floating lotus candles",
    photoUrl: "/assets/australia_punjabi_beach_60s/bg_anchor_02.jpg",
    defaultAct1WardrobeId: "w_aud_sangeet_royal",
    defaultAct2WardrobeId: "w_aud_sangeet_royal",
    defaultAccessoryId: "acc_punjabi_juttis_jhumka",
  },
  {
    id: "p_aud_stadium_fans",
    category: "audience",
    name: "Arena Concert Crowd with LED Wristbands",
    roleTitle: "360-Degree Stadium Audience",
    ethnicity: "Global Music Fans",
    facialSpec: "Thousands of concert fans waving synchronized glowing LED wristbands around the stage",
    photoUrl: "/assets/australia_punjabi_beach_60s/bg_anchor_03.jpg",
    defaultAct1WardrobeId: "w_aud_festival_neon",
    defaultAct2WardrobeId: "w_aud_festival_neon",
    defaultAccessoryId: "acc_cyber_chrome",
  },
];

// ============================================================================
// 4. INITIAL REELS REPOSITORY (PUBLISHED, WIP/DRAFTS, FAILED)
// ============================================================================

export const INITIAL_REELS_REPOSITORY: StudioReelRecord[] = [
  {
    id: "reel_spain_girls_60s",
    title: "Spain Marbella Golden Hour to Midnight Fiesta (60s Master)",
    status: "published",
    progress: 100,
    videoUrl: "/assets/swarm/punjabi_spain_girls_group_60s_omni_1_1_flash_flawless.mp4",
    durationId: "dur_60s",
    countryId: "cnt_spain",
    regionId: "reg_mediterranean",
    languageId: "lang_spanish",
    demographyId: "demo_millennial_luxury",
    platformId: "plat_ig_reels",
    contentTypeId: "ctype_wardrobe_transition",
    genreId: "gen_spanish_latin",
    vocalId: "voc_girl_group",
    venueId: "ven_pool_to_courtyard",
    lightingId: "lit_golden_to_midnight",
    selectedPersonaIds: {
      female_lead: ["p_fem_elena", "p_fem_ananya", "p_fem_amara", "p_fem_maya"],
      male_lead: [],
      supporting: ["p_sup_dj_aria"],
      background: ["p_bg_riviera_dancers"],
      audience: ["p_aud_yacht_vip"],
    },
    wardrobeOverrides: {},
    shots: [],
    updatedAt: "2026-09-21 22:15",
  },
  {
    id: "reel_bollywood_masterB_60s",
    title: "Ishq Tera Electric — Udaipur Pool Villa to Superyacht (60s Master)",
    status: "published",
    progress: 100,
    videoUrl: "/assets/swarm/masterB_v2/masterB_v2_combined_60s.mp4",
    durationId: "dur_60s",
    countryId: "cnt_india_royal",
    regionId: "reg_south_asia",
    languageId: "lang_hindi",
    demographyId: "demo_wedding_sangeet",
    platformId: "plat_ig_reels",
    contentTypeId: "ctype_music_video",
    genreId: "gen_bollywood_royal",
    vocalId: "voc_duet",
    venueId: "ven_palace_to_yacht",
    lightingId: "lit_palace_to_chandeliers",
    selectedPersonaIds: {
      female_lead: ["p_fem_ananya"],
      male_lead: ["p_male_aarav"],
      supporting: ["p_sup_best_friends"],
      background: ["p_bg_bhangra_12"],
      audience: ["p_aud_royal_wedding"],
    },
    wardrobeOverrides: {},
    shots: [],
    updatedAt: "2026-09-21 21:40",
  },
  {
    id: "reel_punjabi_spain_60s",
    title: "Chandigarh x Marbella Punjabi Poolside Anthem (60s Master)",
    status: "published",
    progress: 100,
    videoUrl: "/assets/swarm/punjabi_spain_poolside_full_60s_omni_1_1_flash.mp4",
    durationId: "dur_60s",
    countryId: "cnt_india_punjab",
    regionId: "reg_south_asia",
    languageId: "lang_punjabi_english",
    demographyId: "demo_genz_festival",
    platformId: "plat_tiktok",
    contentTypeId: "ctype_music_video",
    genreId: "gen_punjabi_bhangra",
    vocalId: "voc_duet",
    venueId: "ven_pool_to_courtyard",
    lightingId: "lit_golden_to_midnight",
    selectedPersonaIds: {
      female_lead: ["p_fem_priya"],
      male_lead: ["p_male_andrei"],
      supporting: ["p_sup_dj_aria"],
      background: ["p_bg_bhangra_12"],
      audience: ["p_aud_yacht_vip"],
    },
    wardrobeOverrides: {},
    shots: [],
    updatedAt: "2026-09-21 20:55",
  },
];

// Helper Lookups by Exact ID (Zero Regex)
export function getById<T extends { id: string }>(list: T[], id: string): T {
  return list.find((item) => item.id === id) || list[0];
}

export function getWardrobeForCategory(
  category: PersonaCategory,
  act?: 1 | 2
): WardrobeItem[] {
  return WARDROBE_CATALOG.filter(
    (w) =>
      w.category === category &&
      (act === undefined || w.act === act || w.act === "both")
  );
}
