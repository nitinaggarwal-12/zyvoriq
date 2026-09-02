/**
 * 💬 Zyvoriq Reddit & iMessage Chat Bubble Story Engine (Tier 2)
 * Transforms Reddit threads, scary stories, and text conversations into
 * viral animated iMessage / Reddit chat bubble reels with realistic typing delays,
 * ambient sound effects, and suspenseful music.
 */

export interface ChatMessage {
  id: string;
  sender: "me" | "them" | "system";
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestampSec: number;
  typingDurationSec: number;
  sfx: "imessage_send" | "imessage_receive" | "keyboard_typing" | "suspense_hit" | "none";
}

export interface RedditStoryConfig {
  subreddit: string;
  title: string;
  author: string;
  upvotes: number;
  commentsCount: number;
  storyTheme: "scary_mystery" | "aita_drama" | "wholesome_story" | "confession";
  ambientAudio: "rain_thunder" | "dark_drone" | "lofi_study" | "none";
  messages: ChatMessage[];
  totalDurationSec: number;
}

export const SAMPLE_REDDIT_STORIES: RedditStoryConfig[] = [
  {
    subreddit: "r/TwoSentenceHorror",
    title: "I checked my baby monitor at 3 AM...",
    author: "NightWatcher99",
    upvotes: 48200,
    commentsCount: 1940,
    storyTheme: "scary_mystery",
    ambientAudio: "rain_thunder",
    totalDurationSec: 28,
    messages: [
      {
        id: "m1",
        sender: "them",
        senderName: "Wife",
        text: "Did you go upstairs to check on the baby?",
        timestampSec: 0.5,
        typingDurationSec: 1.0,
        sfx: "imessage_receive"
      },
      {
        id: "m2",
        sender: "me",
        senderName: "Me",
        text: "I thought you were in her room right now...",
        timestampSec: 4.5,
        typingDurationSec: 1.5,
        sfx: "imessage_send"
      },
      {
        id: "m3",
        sender: "them",
        senderName: "Wife",
        text: "I'm downstairs in the kitchen. Look at the camera NOW.",
        timestampSec: 10.0,
        typingDurationSec: 2.0,
        sfx: "suspense_hit"
      },
      {
        id: "m4",
        sender: "me",
        senderName: "Me",
        text: "Someone is standing in the corner staring into the lens.",
        timestampSec: 17.5,
        typingDurationSec: 2.5,
        sfx: "suspense_hit"
      }
    ]
  },
  {
    subreddit: "r/AmItheAsshole",
    title: "AITA for leaving my sister's wedding during the vows?",
    author: "throwaway_wedding21",
    upvotes: 34100,
    commentsCount: 3820,
    storyTheme: "aita_drama",
    ambientAudio: "dark_drone",
    totalDurationSec: 32,
    messages: [
      {
        id: "a1",
        sender: "them",
        senderName: "Sister",
        text: "How could you walk out in front of 200 guests?!",
        timestampSec: 0.8,
        typingDurationSec: 1.2,
        sfx: "imessage_receive"
      },
      {
        id: "a2",
        sender: "me",
        senderName: "Me",
        text: "Your fiancé literally included an insult about my late husband in his vows.",
        timestampSec: 6.0,
        typingDurationSec: 2.0,
        sfx: "imessage_send"
      },
      {
        id: "a3",
        sender: "them",
        senderName: "Sister",
        text: "He was just trying to break the tension with a joke!",
        timestampSec: 14.0,
        typingDurationSec: 1.8,
        sfx: "imessage_receive"
      },
      {
        id: "a4",
        sender: "me",
        senderName: "Me",
        text: "Nobody laughed. Enjoy the reception.",
        timestampSec: 21.0,
        typingDurationSec: 1.5,
        sfx: "suspense_hit"
      }
    ]
  }
];

/**
 * Generates an automated Reddit / iMessage story script from user input.
 */
export function generateRedditStory(
  topicOrTitle: string,
  theme: RedditStoryConfig["storyTheme"] = "scary_mystery"
): RedditStoryConfig {
  const isMystery = theme === "scary_mystery";
  const subreddit = isMystery ? "r/nosleep" : "r/AmItheAsshole";
  const upvotes = Math.floor(25000 + Math.random() * 30000);
  const commentsCount = Math.floor(1200 + Math.random() * 2500);

  const cleanTitle = topicOrTitle.trim() || (isMystery ? "The rule we broke at midnight" : "AITA for confronting my boss publicly?");

  const messages: ChatMessage[] = [
    {
      id: "gen_1",
      sender: "them",
      senderName: isMystery ? "Unknown Number" : "Colleague",
      text: isMystery
        ? `Did you hear the knocking outside your window just now?`
        : `Did you seriously send that reply-all email to the CEO?`,
      timestampSec: 0.8,
      typingDurationSec: 1.2,
      sfx: "imessage_receive"
    },
    {
      id: "gen_2",
      sender: "me",
      senderName: "Me",
      text: isMystery
        ? `I'm on the third floor. That's not possible.`
        : `Every word was 100% verified. Someone had to say it.`,
      timestampSec: 5.5,
      typingDurationSec: 1.8,
      sfx: "imessage_send"
    },
    {
      id: "gen_3",
      sender: "them",
      senderName: isMystery ? "Unknown Number" : "Colleague",
      text: isMystery
        ? `Look through the peephole. I'm right behind you.`
        : `Check Slack right now. Emergency meeting in 2 minutes.`,
      timestampSec: 12.0,
      typingDurationSec: 2.2,
      sfx: "suspense_hit"
    },
    {
      id: "gen_4",
      sender: "me",
      senderName: "Me",
      text: isMystery
        ? `The door was unlocked.`
        : `I'm ready. Let's see what they have to say.`,
      timestampSec: 19.5,
      typingDurationSec: 2.0,
      sfx: "suspense_hit"
    }
  ];

  return {
    subreddit,
    title: cleanTitle,
    author: `u/viral_creator_${Math.floor(Math.random() * 900 + 100)}`,
    upvotes,
    commentsCount,
    storyTheme: theme,
    ambientAudio: isMystery ? "rain_thunder" : "dark_drone",
    messages,
    totalDurationSec: 28
  };
}
