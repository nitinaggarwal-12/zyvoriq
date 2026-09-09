// scripts/seed_libraries.mjs
// Seeds the Character Library and Location Library with pre-validated entries.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { characterLibrary } from "../lib/library/characterLibrary.mjs";
import { locationLibrary } from "../lib/library/locationLibrary.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, "character_catalog.json");
const SEED_CHARACTERS = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

const SEED_LOCATIONS = [
  {
    id: "loc_dubai_monsoon_alley",
    displayName: "Midnight Rain Neon Alley",
    era: "contemporary",
    timeOfDay: "night",
    establishingUri: "/assets/stills/dubai_dance.jpg",
    environmentBlock: "Narrow neon-lit urban alleyway with gleaming wet asphalt, sodium-vapor golden street amber lighting mixed with harsh magenta neon signs, humid monsoon mist rising from ground, weathered concrete walls with subtle stencil street art, no visible logos or readable text, cinematic anamorphic bokeh in distant background."
  },
  {
    id: "loc_cyber_rooftop_shrine",
    displayName: "Neo-Tokyo Rooftop Torii Garden",
    era: "cyberpunk",
    timeOfDay: "dusk",
    establishingUri: "/assets/stills/ren_cyberpunk.jpg",
    environmentBlock: "Elevated high-rise rooftop sanctuary overlooking a sprawling cyberpunk megacity, traditional vermillion torii gate framed against towering holographic glass skyscrapers, polished rain-damp slate tiles reflecting cyan billboard glows, gentle night breeze moving miniature bonsai pine branches."
  },
  {
    id: "loc_swiss_alpine_ridge",
    displayName: "Jungfrau High Alpine Crest",
    era: "contemporary",
    timeOfDay: "golden_hour",
    establishingUri: "/assets/stills/swiss_alpine.jpg",
    environmentBlock: "Dramatic high-altitude snowy alpine ridgeline under crisp golden hour sunlight, sharp granite rock outcroppings emerging from deep wind-swept powder snow, deep cerulean blue sky with thin cirrus clouds, vast glacial valley receding into distant misty mountain peaks."
  },
  {
    id: "loc_desert_monolith_dunes",
    displayName: "Sands of Rub al Khali",
    era: "contemporary",
    timeOfDay: "sunset",
    establishingUri: "/assets/stills/desert_spiral.jpg",
    environmentBlock: "Vast windswept desert sand dunes stretching to infinity, warm terracotta and amber ripples etched by desert wind, deep purple-orange sunset sky gradient, razor-sharp dune crest casting long dramatic diagonal shadows across pristine desert floor."
  },
  {
    id: "loc_deep_space_observatory",
    displayName: "Orbital Deep-Space Cupola",
    era: "sci-fi",
    timeOfDay: "cosmic",
    establishingUri: "/assets/stills/cosmic_nebula.jpg",
    environmentBlock: "Panoramic orbital observatory observation dome with reinforced curved quartz windows, sweeping view of an iridescent stellar nebula with emerald and violet emission gas filaments, subtle matte-grey interior instrument consoles with softly glowing indicator lights."
  },
  {
    id: "loc_golden_sunset_beach",
    displayName: "Golden Sunset Shoreline Beach",
    era: "contemporary",
    timeOfDay: "sunset",
    establishingUri: "/assets/stills/beach_sunset.jpg",
    environmentBlock: "Pristine sun-drenched golden sand beach with rhythmic gentle turquoise ocean waves rolling onto glistening wet sand, warm amber sunset horizon reflecting across water surface, coastal sea breeze, organic driftwood logs, warm cinematic alpenglow."
  },
  {
    id: "loc_luxury_infinity_pool",
    displayName: "Mediterranean Coastal Infinity Pool",
    era: "contemporary",
    timeOfDay: "day",
    establishingUri: "/assets/stills/pool_luxury.jpg",
    environmentBlock: "Sleek modern luxury infinity swimming pool with crystalline aqua water reflecting warm sunlight, minimalist teak wood sun deck, architectural stone pillars, panoramic coastal ocean view, gentle ripples on water."
  },
  {
    id: "loc_modern_fitness_gym",
    displayName: "Metro Performance Fitness Club",
    era: "contemporary",
    timeOfDay: "day",
    establishingUri: "/assets/stills/gym_fitness.jpg",
    environmentBlock: "High-end contemporary fitness studio with matte black Rogue power racks, polished hardwood and rubber flooring, full mirror wall reflecting ambient linear LED overhead fixtures, clean minimalist athletic setting."
  },
  {
    id: "loc_nordic_creative_office",
    displayName: "Copenhagen Minimalist Creative Office",
    era: "contemporary",
    timeOfDay: "day",
    establishingUri: "/assets/stills/copenhagen_office.jpg",
    environmentBlock: "Bright Scandinavian architectural studio in Copenhagen, floor-to-ceiling glass windows overlooking canal, light oak herringbone floors, minimalist white worktables, acoustic felt wall panels, lush fiddle leaf fig plants."
  },
  {
    id: "loc_scandinavian_home_lounge",
    displayName: "Nordic Minimalist Living Room",
    era: "contemporary",
    timeOfDay: "evening",
    establishingUri: "/assets/stills/nordic_home.jpg",
    environmentBlock: "Warm contemporary Scandinavian apartment living room, natural wool rug, minimalist textured sofa, warm 2700K designer floor lamp casting soft golden ambient pools of light, clean shelving with design monographs."
  }
];

async function seed() {
  console.log(`Seeding Character Library from ${catalogPath} (${SEED_CHARACTERS.length} characters)...`);
  let charCount = 0;
  for (const c of SEED_CHARACTERS) {
    try {
      const created = await characterLibrary.create(c);
      charCount++;
      console.log(`[${charCount}/${SEED_CHARACTERS.length}] ✓ Character seeded: ${created.id} (${created.displayName}, ${created.country || "Global"}) - ${created.wardrobe?.length || 1} wardrobes`);
    } catch (err) {
      console.warn(`! Warning seeding ${c.id}:`, err?.message || err);
    }
  }

  console.log("\nSeeding Location Library...");
  for (const l of SEED_LOCATIONS) {
    try {
      const created = await locationLibrary.create(l);
      console.log(`✓ Location seeded: ${created.id} (${created.displayName})`);
    } catch (err) {
      console.warn(`! Warning seeding location ${l.id}:`, err?.message || err);
    }
  }

  console.log(`\nSeeding completed successfully! Total characters: ${SEED_CHARACTERS.length}`);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
