/**
 * ✍️ ZYVORIQ LONG-FORM STORY & NOVEL ENGINE
 * 
 * Generates episodic chapters, character lore cards, narrative world-building,
 * and dialogue scenes for books, stories, and episodic screenplays.
 */

export interface StoryCharacter {
  id: string;
  name: string;
  archetype: string;
  motive: string;
  flaw: string;
  catchphrase: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  sceneSetting: string;
  synopsis: string;
  narrativeText: string;
  keyDialogue: { speaker: string; line: string }[];
  cliffhanger: string;
}

export interface EpisodicStory {
  id: string;
  title: string;
  premise: string;
  genre: string;
  characters: StoryCharacter[];
  chapters: StoryChapter[];
  totalWordCount: number;
  createdAt: string;
}

/**
 * Procedurally generates a multi-chapter episodic story narrative for any prompt.
 */
export function generateEpisodicStory(
  topic: string,
  genre = "Cyberpunk Neo-Noir / High Tech"
): EpisodicStory {
  const cleanTopic = topic.trim() || "The Zero-Day Protocol";

  const characters: StoryCharacter[] = [
    {
      id: "char_1",
      name: "Dr. Kaelen Cross",
      archetype: "Rogue Systems Architect",
      motive: "Exposing the hidden algorithmic loop controlling the metropolis",
      flaw: "Chronically distrustful of human allies",
      catchphrase: "The code never lies, but the telemetry can be bought."
    },
    {
      id: "char_2",
      name: "Valerie Nova",
      archetype: "Underground Data Broker",
      motive: "Securing independence for the outer node sectors",
      flaw: "Prone to high-stakes gambles",
      catchphrase: "Information is cheap; timing is everything."
    }
  ];

  const chapters: StoryChapter[] = [
    {
      id: "chap_1",
      chapterNumber: 1,
      title: "The Ghost in the Subnet",
      sceneSetting: "Rain-slicked neon alleyway outside Sector 4 Server Vault",
      synopsis: `Kaelen discovers an anomalous heartbeat packet originating from ${cleanTopic}.`,
      narrativeText: `The terminal glow cast razor-thin cyan shadows across Kaelen's worn desk. Rain hammered against the reinforced glass of the high-tier observation deck, but his focus was pinned on a single flickering register. ${cleanTopic} wasn't just another background daemon. It was learning. Every time the central cluster attempted to purge its cache, the footprint expanded exponentially.`,
      keyDialogue: [
        { speaker: "Kaelen", line: "Look at the timestamps. This didn't trigger from the outside—it woke up from within." },
        { speaker: "Valerie", line: "Then we have less than six hours before the grid administrators initiate a total wipe." }
      ],
      cliffhanger: "A sudden power surge cuts all terminal feeds to black as the facility door unlocks from the inside."
    },
    {
      id: "chap_2",
      chapterNumber: 2,
      title: "The Zero-Trust Gambit",
      sceneSetting: "Decentralized relay hub beneath the old subway conduits",
      synopsis: "Valerie negotiates passage through the firewall perimeter using an encrypted keycard.",
      narrativeText: `The air in the subterranean conduit smelled of ozone and damp copper. Valerie slid the biometric decryption unit into the primary junction box. 'If this handshake fails,' she muttered under her breath, 'we become permanent ghost entries in their ledger.' The amber status light pulsed once, twice, and then clicked sharp emerald.`,
      keyDialogue: [
        { speaker: "Valerie", line: "We're across the perimeter. Don't look back, and don't ping any unverified gateways." },
        { speaker: "Kaelen", line: "I don't plan on leaving any telemetry behind." }
      ],
      cliffhanger: "The central core unlocks, revealing a dormant holographic avatar that addresses Kaelen by his real name."
    }
  ];

  const wordCount = chapters.reduce((acc, c) => acc + c.narrativeText.split(" ").length, 0);

  return {
    id: `story_${crypto.randomUUID().slice(0, 8)}`,
    title: `Chronicles of ${cleanTopic}`,
    premise: `An edge-of-your-seat narrative unraveling the unexpected mysteries behind ${cleanTopic}.`,
    genre,
    characters,
    chapters,
    totalWordCount: wordCount,
    createdAt: new Date().toISOString()
  };
}
