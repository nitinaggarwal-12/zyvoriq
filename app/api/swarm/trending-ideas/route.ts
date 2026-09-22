import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export interface GeneratedTrendIdea {
  id: string;
  badge: string;
  title: string;
  genre: string;
  bpm: number;
  durationSec: number;
  country: string;
  language: string;
  characters: string;
  attire: string;
  wardrobe: string;
  demography: string;
  targetAudience: string;
  platform: string;
  tagline: string;
  act1Wardrobe: string;
  act1Location: string;
  act1Prompt: string;
  act2Wardrobe: string;
  act2Location: string;
  act2Prompt: string;
}

const COUNTRY_SCENES: Record<
  string,
  {
    act1Locs: string[];
    act2Locs: string[];
    vibe: string;
  }
> = {
  India: {
    act1Locs: [
      "Sunlit Cliffside Infinity Pool Villa Terrace in Goa",
      "Udaipur Sheesh Mahal Golden Mirror Palace Courtyard",
      "Mumbai Worli Sea-Link Glass Penthouse Skydeck",
      "Jaipur Amber Fort Royal Sandstone Courtyard",
      "Jodhpur Blue City Rooftop Lounge at Golden Hour",
    ],
    act2Locs: [
      "Twilight Candlelit Luxury Superyacht Deck on Arabian Sea",
      "Moonlit Lake Pichola Marble Pavilion with Floating Diyas",
      "Neon Laser VIP Glass Club Lounge in Bandra",
      "Starlit Thar Desert Luxury Glamping Amphitheater with Fire Pits",
      "Midnight Helipad Overlooking Mumbai Diamond Skyline",
    ],
    vibe: "High-glamour A-list Indian cinema choreography with dholak-trap & sub-bass drops",
  },
  Spain: {
    act1Locs: [
      "Ibiza Cliffside White-Stucco Infinity Pool Cabana",
      "Marbella Golden Mile Luxury Beach Club Deck",
      "Barcelona Gothic Quarter Sunlit Rooftop Terrace",
      "Mallorca Turquoise Cove Catamaran Bow",
      "Seville Royal Alcázar Courtyard with Orange Blossoms",
    ],
    act2Locs: [
      "Twilight Candlelit Superyacht Deck off Formentera",
      "Ibiza Midnight Open-Air Laser Amphitheater",
      "Marbella Fire-Pit Beach Lounge under String Lights",
      "Barcelona W-Hotel Glass Sky Lounge at Night",
      "Candlelit Mediterranean Cliff Cave Club",
    ],
    vibe: "Sun-drenched Mediterranean Euro-Latin pop & reggaeton-house choreography",
  },
  Switzerland: {
    act1Locs: [
      "Sunlit Zermatt Alpine Panorama Glass Terrace facing Matterhorn",
      "St. Moritz Luxury Snow-Capped Mountain Chalet Deck",
      "Lake Lucerne Crystal Promenade Pier at Golden Hour",
      "Interlaken Cliffside Skywalk Panorama Stage",
      "Gstaad Royal Alpine Resort Infinity Spa Deck",
    ],
    act2Locs: [
      "Twilight Candlelit Superyacht Deck on Lake Geneva",
      "St. Moritz Torchlit Ice Amphitheater & Fire Lounge",
      "Zurich Penthouse Glass Conservatory under Starlight",
      "Candlelit Alpine Glass Igloo VIP Club Lounge",
      "Montreux Lakeside Jazz & Neon Yacht Marina",
    ],
    vibe: "Ultra-luxury European high-fashion alpine & lakeside pop spectacle",
  },
  USA: {
    act1Locs: [
      "Beverly Hills Glass Infinity Pool Mansion Overlooking LA",
      "Miami South Beach Art Deco Rooftop Pool Club",
      "Manhattan Billionaires' Row Penthouse Terrace",
      "Malibu Surfrider Golden-Hour Cliffside Deck",
      "Las Vegas Sphere-View Rooftop Sky Villa",
    ],
    act2Locs: [
      "Twilight Biscayne Bay Luxury Superyacht Deck in Miami",
      "Hollywood Hills Candlelit Modernist Courtyard",
      "Brooklyn Waterfront Neon Warehouse Concert Stage",
      "Las Vegas Strip Midnight Helicopter Pad",
      "Malibu Moonlit Private Beach Fire Lounge",
    ],
    vibe: "Billboard Hot 100 stadium-grade pop choreography & cinematic camera tracking",
  },
  UAE: {
    act1Locs: [
      "Dubai Palm Jumeirah Atlantis Royal Sky Pool Terrace",
      "Burj Khalifa View Downtown Glass Penthouse Deck",
      "Abu Dhabi Louvre Dome Sunlit Waterfront Promenade",
      "Dubai Marina Golden-Hour Pier & Promenade",
      "Al Maha Desert Infinity Pool Oasis",
    ],
    act2Locs: [
      "Twilight Candlelit Superyacht Cruising Dubai Marina Skyline",
      "Downtown Dubai Rooftop Helipad under Laser Beams",
      "Starlit Arabian Desert Royal Majlis with Fire Torches",
      "Palm Jumeirah Private Beach Club Fire-Pit Deck",
      "DIFC Neon Luxury Penthouse Club Lounge",
    ],
    vibe: "Ultra-opulent Dubai billionaire lifestyle & high-fashion global pop fusion",
  },
  "South Korea": {
    act1Locs: [
      "Seoul Gangnam Neo-Futuristic Glass Atrium Stage",
      "Han River Floating Crystal Pavilion at Sunset",
      "Incheon Paradise City Luxury Plaza Courtyard",
      "Seoul Itaewon Rooftop Neon Panorama Deck",
      "Busan Haeundae Oceanfront Sky Terrace",
    ],
    act2Locs: [
      "Twilight Luxury Yacht Deck on Han River with Rainbow Bridge Lights",
      "Seoul Cyber-Neon Holographic Soundstage",
      "Jeju Island Cliffside Torchlit Resort Deck",
      "Gangnam Midnight Penthouse VIP Lounge",
      "Busan Gwangan Bridge Starlit Yacht Marina",
    ],
    vibe: "Razor-sharp K-Pop synchronized formation choreography & dynamic snap zooms",
  },
};

const SONG_HOOK_BANK = [
  { suffix: "Electric", hookConcept: "Viral Shoulder-Drop Hook & Transition Spin", bpm: 122 },
  { suffix: "Midnight Fever", hookConcept: "Synchronized Hair-Flip & Bass-Drop Footwork", bpm: 126 },
  { suffix: "Velvet Crown", hookConcept: "Slow-Motion Glamour Walk into High-Speed Chorus", bpm: 118 },
  { suffix: "Supernova", hookConcept: "360-Degree Steadicam Orbit Dance Formation", bpm: 128 },
  { suffix: "Mirage", hookConcept: "Clap-Sync Beat Drop & Dual-Line Formation Split", bpm: 120 },
  { suffix: "Diamond Rush", hookConcept: "High-Energy Wrist-Roll Hook & Camera Push-In", bpm: 130 },
  { suffix: "Obsession", hookConcept: "Whisper Close-Up Lip-Sync into Explosive Dance Break", bpm: 116 },
  { suffix: "Euphoria", hookConcept: "Hands-Up Festival Anthem Jump & Confetti Spin", bpm: 124 },
  { suffix: "Hypnotic", hookConcept: "Isolations Beat-Lock & Synchronized Formation Wave", bpm: 122 },
  { suffix: "Royalty", hookConcept: "Regal Crown Pose into High-Tempo Club Drop", bpm: 125 },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const country = String(body.country || "India");
    const language = String(body.language || "Hindi");
    const characters = String(
      body.characters ||
        "Lead Heroine & Lead Male Duo + 10 Backup Dancers (5 male, 5 female)"
    );
    const durationSec = Number(body.durationSec || 60);
    const attire = String(
      body.attire || "Crimson-Rose & Champagne-Gold Couture Resort Lehenga"
    );
    const wardrobe = String(
      body.wardrobe || "Royal Emerald-Sapphire & Silver-Crystal Evening Couture"
    );
    const demography = String(body.demography || "Gen Z & Millennial (18–34)");
    const targetAudience = String(
      body.targetAudience || "Viral Dance Challenge & Pop Music Fans"
    );
    const platform = String(body.platform || body.socialPlatform || "Instagram Reels (9:16 Viral)");

    const halfDur = Math.round(durationSec / 2);
    const scenePack = COUNTRY_SCENES[country] || COUNTRY_SCENES["India"];
    const stamp = Date.now();

    const ideas: GeneratedTrendIdea[] = SONG_HOOK_BANK.map((item, idx) => {
      const rank = idx + 1;
      const act1Loc = scenePack.act1Locs[idx % scenePack.act1Locs.length];
      const act2Loc = scenePack.act2Locs[idx % scenePack.act2Locs.length];

      const title = `#${rank} ${country} • ${language}: "${item.suffix}" (${durationSec}s • ${item.bpm} BPM)`;
      const tagline = `${item.hookConcept} | Cast: ${characters} | Audience: ${targetAudience} (${demography}) on ${platform}`;

      const act1Prompt =
        `Act I (00:00–00:${halfDur}): ${characters} performing a viral ${language} hit song at ${item.bpm} BPM tailored for ${demography} ${targetAudience} on ${platform}. ` +
        `Lead wears ${attire} at a ${act1Loc}. ` +
        `Features ${item.hookConcept} with expressive natural ${language} vocal lip sync, 24fps Steadicam tracking, and ${scenePack.vibe}.`;

      const act2Prompt =
        `Act II (00:${halfDur}–00:${durationSec}): CRITICAL FACE IDENTITY LOCK — Feature the EXACT SAME lead performer face & identity from Act I, ` +
        `now transformed into ${wardrobe} with ${characters} at a ${act2Loc}. ` +
        `High-energy ${language} chorus climax at ${item.bpm} BPM engineered for maximum retention on ${platform} (${demography} / ${targetAudience}) with flawless native vocal lip sync.`;

      return {
        id: `trend_${country}_${language}_${rank}_${stamp}`,
        badge: `#${rank} • ${country} • ${language} • ${durationSec}s`,
        title,
        genre: `${language} ${platform.split(" ")[0]} Pop`,
        bpm: item.bpm,
        durationSec,
        country,
        language,
        characters,
        attire,
        wardrobe,
        demography,
        targetAudience,
        platform,
        tagline,
        act1Wardrobe: attire,
        act1Location: act1Loc,
        act1Prompt,
        act2Wardrobe: wardrobe,
        act2Location: act2Loc,
        act2Prompt,
      };
    });

    return NextResponse.json({
      ok: true,
      count: ideas.length,
      ideas,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
