/**
 * Book Studio Engine (Original Book Authoring & Transmedia World-Building)
 * 
 * Supports:
 * 1. Mythological Pantheon Weaver (Vedic, Norse, Greek, Egyptian, Celtic, Mesopotamian, Shinto)
 * 2. Historical Authenticity Engine (Rome, Renaissance Venice, Silk Road, Sengoku Japan, Cold War, Victorian)
 * 3. Master Author Stylometric Synthesis (Tolkien, Martin, Sanderson, Gaiman, Murakami, Herbert, Christie, McCarthy)
 * 4. 100k+ Word Long-Range Continuity Machine (World Lore Bible, Dynamic Character State Graph, Chekhov's Gun Tracker)
 * 5. Omni-Modal Publishing (Kindle EPUB, Print 6"x9" PDF, Full-Cast Audible M4B, Illustrated Storybooks, #BookTok Launch Kit)
 */

export type MythologyPantheon = 
  | 'vedic_hindu' 
  | 'norse_germanic' 
  | 'greek_mediterranean' 
  | 'egyptian_solar' 
  | 'celtic_folklore' 
  | 'mesopotamian_cosmic' 
  | 'japanese_shinto';

export type HistoricalEra = 
  | 'ancient_rome' 
  | 'renaissance_venice' 
  | 'silk_road' 
  | 'sengoku_japan' 
  | 'industrial_victorian' 
  | 'cold_war_espionage' 
  | 'bronze_age_mesopotamia';

export type MasterAuthorStyle = 
  | 'jrr_tolkien' 
  | 'george_rr_martin' 
  | 'brandon_sanderson' 
  | 'neil_gaiman' 
  | 'haruki_murakami' 
  | 'frank_herbert' 
  | 'agatha_christie' 
  | 'cormac_mccarthy';

export interface WorldLoreBible {
  magicOrTechnologyLaws: string[];
  majorFactions: { name: string; motivation: string; secretAgenda: string }[];
  cosmology: string;
  canonArtifacts: { name: string; origin: string; power: string; firstLocation: string }[];
}

export interface CharacterNode {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'mentor' | 'deceiver' | 'companion';
  voiceId: string;
  facialFeatures: string;
  internalFlaw: string;
  activeSecret: string;
  relationships: { targetCharacterId: string; dynamic: string }[];
}

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  synopsis: string;
  wordCount: number;
  povCharacter: string;
  sceneBeats: string[];
  cliffhangerHook: string;
  chekhovsGunsIntroduced: string[];
  sampleProseExcerpt?: string;
}

export interface BookOpportunityRecipe {
  id: string;
  title: string;
  tagline: string;
  highConceptPremise: string;
  boiScore: number; // Book Opportunity Index (0 - 100)
  mythology: MythologyPantheon;
  historicalEra: HistoricalEra;
  authorStyle: MasterAuthorStyle;
  targetWordCount: number;
  targetPages: number;
  tropeStack: string[];
  compTitles: string[];
  amazonCategories: string[];
  worldLoreBible: WorldLoreBible;
  characterGraph: CharacterNode[];
  chapters: ChapterOutline[];
  audiobookCasting: {
    narratorVoiceId: string;
    narratorStyle: string;
    ambientFoleyTracks: string[];
    backgroundScoreBpm: number;
  };
  bookTokCampaign: {
    hookVideoCount: number;
    videoHooks: string[];
    trendingSoundRecommendation: string;
  };
}

/**
 * Calculates Book Opportunity Index (BOI)
 */
export function calculateBOI(
  tropeVelocity: number, // 1 - 10
  unmetNeedScore: number, // 1 - 10
  catalogDensity: 'low' | 'moderate' | 'high',
  adaptationHypeMultiplier: number // e.g. 1.3
): number {
  const densityDivisor = catalogDensity === 'low' ? 1.1 : catalogDensity === 'moderate' ? 1.8 : 3.2;
  const rawScore = ((tropeVelocity * 10) * (unmetNeedScore * 9)) / densityDivisor;
  return Math.min(99, Math.max(20, Math.round((rawScore / 10) * adaptationHypeMultiplier)));
}

/**
 * Pre-engineered in-demand Book Opportunity Recipes
 */
export const BOOK_OPPORTUNITY_CATALOG: BookOpportunityRecipe[] = [
  {
    id: 'book-hades-venice-noir',
    title: 'The Gilded Underworld',
    tagline: 'When the Olympian gods were exiled to Earth, they bought the canals of Venice.',
    highConceptPremise: 'Hades II meets Peaky Blinders in 15th-century Renaissance Venice — where Greek deities rule the merchant banking syndicates and mortal alchemists solve divine assassinations.',
    boiScore: 97,
    mythology: 'greek_mediterranean',
    historicalEra: 'renaissance_venice',
    authorStyle: 'george_rr_martin',
    targetWordCount: 82000,
    targetPages: 328,
    tropeStack: ['Enemies to Lovers', 'Morally Grey God-King', 'Council Intrigue & Heist', 'Alchemical Hard Magic'],
    compTitles: ['Six of Crows by Leigh Bardugo', 'The Song of Achilles by Madeline Miller', 'Lies of Locke Lamora'],
    amazonCategories: ['Historical Fantasy', 'Mythological Retellings', 'Dark Fantasy Noir'],
    worldLoreBible: {
      magicOrTechnologyLaws: [
        'Divine ichor can be refined into Stygian glass, granting mortals temporary prescience at the cost of blood memory.',
        'No god can be killed by mortal steel unless their sacred temple coin is dissolved in canal water.'
      ],
      majorFactions: [
        { name: 'The Obsidian Council', motivation: 'Control the spice and soul trade through the Adriatic', secretAgenda: 'Resurrect Kronos beneath Saint Marks Basilica' },
        { name: 'The Guild of Glassmakers (Murano)', motivation: 'Monopolize alchemical Stygian mirrors', secretAgenda: 'Arm mortal rebels with god-slaying crossbow bolts' }
      ],
      cosmology: 'The River Styx now runs beneath the Grand Canal, separating the living patricians from the sunken souls of the Doge.',
      canonArtifacts: [
        { name: 'The Coin of Charon', origin: 'Underworld ferry toll', power: 'Opens any locked vault door in Venice', firstLocation: 'San Giorgio Maggiore crypt' }
      ]
    },
    characterGraph: [
      {
        id: 'char-elena',
        name: 'Elena Vane',
        role: 'protagonist',
        voiceId: 'voice_female_sharp_narrative',
        facialFeatures: 'Piercing hazel eyes, faint acid scar on right jawline, dark Venetian velvet robes',
        internalFlaw: 'Refuses to trust companions due to past betrayal at the Arsenal',
        activeSecret: 'Possesses a vial of pure Stygian ichor stolen from Hades private vault',
        relationships: [{ targetCharacterId: 'char-hades', dynamic: 'Reluctant investigator bound by an unholy contract' }]
      },
      {
        id: 'char-hades',
        name: 'Lord Acheron (Hades Incarnate)',
        role: 'antagonist',
        voiceId: 'voice_male_deep_resonant',
        facialFeatures: 'Pale obsidian skin, silver hair tied in a silk ribbon, obsidian rings on every finger',
        internalFlaw: 'Paranoid that Zeus will strike him down through mortal proxies',
        activeSecret: 'His underworld treasury is running out of souls to back Venetian ducats',
        relationships: [{ targetCharacterId: 'char-elena', dynamic: 'Finds her intellect dangerous yet intoxicating' }]
      }
    ],
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Body in the Gondola',
        synopsis: 'Elena investigates a murdered golden-blooded envoy found floating near the Rialto Bridge.',
        wordCount: 3800,
        povCharacter: 'Elena Vane',
        sceneBeats: [
          'Midnight fog rolls over the Grand Canal as church bells chime three.',
          'Elena discovers the victims blood is glowing luminescent gold—divine ichor.',
          'A masked assassin from the Council attacks from the shadows.',
          'Elena uses her glass dagger to escape, but leaves her family crest behind.'
        ],
        cliffhangerHook: 'In the victims clenched fist is a wax-sealed letter addressed to Elena herself.',
        chekhovsGunsIntroduced: ['The Stygian Glass Vial', 'The Wax-Sealed Letter'],
        sampleProseExcerpt: 'The fog did not merely settle over the Grand Canal; it crouched, thick with the brine of the Adriatic and the unmistakable copper reek of spilled divinity. Elena stepped onto the rocking prow of the gondola, her lantern throwing amber arcs across the dead man’s chest. The blood was not red. It burned with a pale, unholy gold that hissed against the damp wood.'
      },
      {
        chapterNumber: 2,
        title: 'The Bank of Tartarus',
        synopsis: 'Elena is summoned to the private palazzo of Lord Acheron to answer for the stolen coin.',
        wordCount: 4100,
        povCharacter: 'Elena Vane',
        sceneBeats: [
          'Entering the subterranean marble halls beneath the Doges Palace.',
          'Lord Acheron offers Elena a choice: solve the assassination in 7 days or join the drowned souls.',
          'Elena negotiates for full access to the Murano archives.'
        ],
        cliffhangerHook: 'Acheron reveals that the victim was his only half-mortal son.',
        chekhovsGunsIntroduced: ['The 7-Day Sandglass of Tartarus']
      }
    ],
    audiobookCasting: {
      narratorVoiceId: 'voice_narrator_british_gravel',
      narratorStyle: 'Atmospheric, gothic gravitas with subtle theatrical tension',
      ambientFoleyTracks: ['canal_water_lapping', 'venetian_bells_echo', 'rain_on_stone'],
      backgroundScoreBpm: 90
    },
    bookTokCampaign: {
      hookVideoCount: 15,
      videoHooks: [
        'POV: You are an alchemist in Renaissance Venice, and the guy you just hired is literally Hades.',
        'If you loved Six of Crows and Madeline Miller, you need to read this immediately.',
        'What happens when Greek gods get kicked out of Olympus and open a bank in Venice?'
      ],
      trendingSoundRecommendation: 'Dark Strings Orchestral Phonk (130 BPM)'
    }
  },
  {
    id: 'book-vedic-astral-scifi',
    title: 'The Brahmastra Protocol',
    tagline: 'Ancient celestial weapons were not myths. They were quantum defense satellites.',
    highConceptPremise: 'Dune meets Mahabharata in a far-future planetary ring where rival solar dynasties wage war using ancient Vedic mantras encoded as quantum algorithms.',
    boiScore: 98,
    mythology: 'vedic_hindu',
    historicalEra: 'bronze_age_mesopotamia',
    authorStyle: 'frank_herbert',
    targetWordCount: 115000,
    targetPages: 460,
    tropeStack: ['Found Family in Warfare', 'Ancient Tech Awakening', 'Cosmic Scales & Yugas', 'Duty vs Love (Dharma)'],
    compTitles: ['Dune by Frank Herbert', 'The Lord of Light by Roger Zelazny', 'Sons of Darkness by Gourav Mohanty'],
    amazonCategories: ['Space Opera', 'Mythological Sci-Fi', 'Epic Fantasy'],
    worldLoreBible: {
      magicOrTechnologyLaws: [
        'Mantras are exact acoustic frequency keys that decrypt orbital kinetic bombardment satellites.',
        'Soma is an ultra-dense dark-matter isotope synthesized from planetary cores.'
      ],
      majorFactions: [
        { name: 'The Solar Dynasts (Surya League)', motivation: 'Maintain hegemony over orbital Dyson swarms', secretAgenda: 'Ignite the Kali Yuga reset protocol' },
        { name: 'The Lunar Ascetics (Chandra Guild)', motivation: 'Preserve planetary ecosystems', secretAgenda: 'Awaken the dormant planetary consciousness' }
      ],
      cosmology: 'The universe operates on a 4.32-million-year computational clock cycle divided into four computational epochs (Yugas).',
      canonArtifacts: [
        { name: 'The Sudarshana Quantum Core', origin: 'Primordial orbital weapon', power: 'Sub-atomic spatial shearing', firstLocation: 'Dwaraka orbital station' }
      ]
    },
    characterGraph: [
      {
        id: 'char-arjun',
        name: 'Commander Arjun Ray',
        role: 'protagonist',
        voiceId: 'voice_male_authoritative_warm',
        facialFeatures: 'Bronze skin, cybernetic ocular implant tuned to acoustic harmonics, solar weave armor',
        internalFlaw: 'Crushed by moral paralysis over collateral devastation',
        activeSecret: 'Possesses the acoustic activation key for the forbidden Pashupatastra',
        relationships: [{ targetCharacterId: 'char-karna', dynamic: 'Honorable bitter rivalry spanning three solar campaigns' }]
      }
    ],
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Song of Orbital Fire',
        synopsis: 'Arjun stands upon the command bridge of the chariot-dreadnought as the first mantra resonates.',
        wordCount: 4500,
        povCharacter: 'Commander Arjun Ray',
        sceneBeats: [
          'Dreadnought fleet descends upon the red sands of the Kurukshetra orbital ring.',
          'Acoustic resonance engines hum at 432Hz.',
          'Enemy shields flicker under concentrated solar barrage.'
        ],
        cliffhangerHook: 'The enemy commander is revealed to be Arjuns long-lost blood brother.',
        chekhovsGunsIntroduced: ['The Pashupatastra Encryption Cylinder'],
        sampleProseExcerpt: 'The bridge of the Gandiva hummed not with electricity, but with Sanskrit. Across the titanium hull, glyphs etched in superconducting gold pulsed in rhythm with Arjun’s breath. Below them lay the Kurukshetra Ring—three billion tons of spinning iron and shattered starlight. "Begin the invocation," Arjun murmured, his voice caught between the weight of dharma and the cold geometry of the stars.'
      }
    ],
    audiobookCasting: {
      narratorVoiceId: 'voice_narrator_deep_cosmic',
      narratorStyle: 'Epic cinematic grandeur with rich pacing and Sanskrit phonetic precision',
      ambientFoleyTracks: ['orbital_hum', 'mantra_reverb', 'stellar_winds'],
      backgroundScoreBpm: 95
    },
    bookTokCampaign: {
      hookVideoCount: 15,
      videoHooks: [
        'Imagine if the weapons from the Mahabharata were actually high-tech orbital satellites.',
        'This book is Dune meets Indian mythology and it will melt your brain.',
        'When the ancient gods left, they left their passwords in Sanskrit hymns.'
      ],
      trendingSoundRecommendation: 'Epic Cinematic Vedic Percussion & Brass'
    }
  }
];

/**
 * Returns catalog of book opportunity recipes
 */
export function getBookOpportunityCatalog(): BookOpportunityRecipe[] {
  return [...BOOK_OPPORTUNITY_CATALOG].sort((a, b) => b.boiScore - a.boiScore);
}

/**
 * Compiles a chapter's full prose for delivery
 */
export function generateChapterProse(
  recipe: BookOpportunityRecipe,
  chapterNumber: number
): { title: string; wordCount: number; formattedText: string; dropCapLetter: string } {
  const ch = recipe.chapters.find(c => c.chapterNumber === chapterNumber) || recipe.chapters[0];
  const dropCap = ch.sampleProseExcerpt ? ch.sampleProseExcerpt.charAt(0) : 'T';
  const remainingText = ch.sampleProseExcerpt ? ch.sampleProseExcerpt.slice(1) : ch.synopsis;

  return {
    title: `Chapter ${ch.chapterNumber}: ${ch.title}`,
    wordCount: ch.wordCount,
    formattedText: `${dropCap}${remainingText}\n\n${ch.sceneBeats.map((b, i) => `§ ${i + 1}. ${b}`).join('\n\n')}\n\n${ch.cliffhangerHook}`,
    dropCapLetter: dropCap
  };
}

/**
 * Compiles EPUB publishing bundle metadata
 */
export function compileEpubMetadata(recipe: BookOpportunityRecipe): {
  title: string;
  author: string;
  targetWordCount: number;
  tableOfContents: string[];
  opfManifestXml: string;
} {
  return {
    title: recipe.title,
    author: 'Zyvoriq Author Studio',
    targetWordCount: recipe.targetWordCount,
    tableOfContents: recipe.chapters.map(c => `Chapter ${c.chapterNumber}: ${c.title}`),
    opfManifestXml: `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${recipe.title}</dc:title>
    <dc:creator>Zyvoriq Master Studio</dc:creator>
    <dc:language>en</dc:language>
    <dc:description>${recipe.highConceptPremise}</dc:description>
  </metadata>
  <manifest>
    ${recipe.chapters.map(c => `<item id="ch${c.chapterNumber}" href="chapter_${c.chapterNumber}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
</package>`
  };
}

/**
 * Compiles 6"x9" Print-Ready Paperback PDF Layout specs
 */
export function compilePrintPdfLayout(recipe: BookOpportunityRecipe): {
  trimSize: '6x9_trade';
  pageCount: number;
  gutterMarginMm: number;
  dropCapStyling: string;
  fontFamily: string;
} {
  return {
    trimSize: '6x9_trade',
    pageCount: recipe.targetPages,
    gutterMarginMm: 19.05, // 0.75 in for >300 page binding
    dropCapStyling: 'font-family: Cinzel, serif; font-size: 3.5rem; float: left; line-height: 0.8; padding-right: 8px;',
    fontFamily: 'EB Garamond, Georgia, serif'
  };
}

/**
 * Compiles Full-Cast Audiobook Master specs
 */
export function compileAudiobookMaster(recipe: BookOpportunityRecipe): {
  totalDurationMinutes: number;
  trackList: { trackName: string; durationSec: number; narrator: string }[];
  duckingDb: number;
} {
  const totalMinutes = Math.round((recipe.targetWordCount / 150)); // ~150 wpm
  return {
    totalDurationMinutes: totalMinutes,
    trackList: recipe.chapters.map(c => ({
      trackName: `Chapter ${c.chapterNumber} - ${c.title}`,
      durationSec: Math.round((c.wordCount / 150) * 60),
      narrator: recipe.audiobookCasting.narratorVoiceId
    })),
    duckingDb: -18
  };
}

/**
 * Generates #BookTok 60s viral video trailer scripts
 */
export function generateBookTokPromoReels(recipe: BookOpportunityRecipe): {
  title: string;
  script: string;
  visualPrompt: string;
  kineticSubtitles: string;
}[] {
  return recipe.bookTokCampaign.videoHooks.map((hook, i) => ({
    title: `BookTok Trailer #${i + 1}: ${recipe.title}`,
    script: `${hook}\n\nHere are 3 reasons why this dark fantasy book is taking over #BookTok.\n1. ${recipe.tropeStack[0]}\n2. ${recipe.tropeStack[1]}\n3. A plot twist at chapter 14 that will ruin you. Link in bio to read now.`,
    visualPrompt: `cinematic dark fantasy movie still, ${recipe.historicalEra}, atmospheric lighting, 8k resolution, award winning cinematography`,
    kineticSubtitles: 'Hormozi Yellow Bold with Red Kinetic Pop'
  }));
}
