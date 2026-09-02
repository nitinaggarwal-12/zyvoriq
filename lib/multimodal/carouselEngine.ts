/**
 * 📊 ZYVORIQ VISUAL CAROUSEL & SLIDE DECK ENGINE
 * 
 * Compiles multi-slide visual decks, LinkedIn swipe carousels (4:5), and widescreen presentation slides (16:9)
 * with structured typography, stat callouts, and brand gradient themes.
 */

export type CarouselFormat = "4:5_portrait" | "1:1_square" | "16:9_widescreen";

export type SlideThemeId = "cyber_dark" | "emerald_growth" | "sunset_amber" | "clean_minimal";

export interface CarouselSlide {
  id: string;
  order: number;
  slideType: "hook_cover" | "point_card" | "stat_callout" | "framework" | "cta_outro";
  eyebrow: string;
  headline: string;
  bodyText: string;
  badge?: string;
  statNumber?: string;
  statLabel?: string;
  bullets?: string[];
}

export interface CarouselDeck {
  id: string;
  title: string;
  topic: string;
  format: CarouselFormat;
  theme: SlideThemeId;
  totalSlides: number;
  slides: CarouselSlide[];
  createdAt: string;
}

export const SLIDE_THEMES: Record<SlideThemeId, { name: string; bgGradient: string; accentColor: string; textColor: string }> = {
  cyber_dark: {
    name: "Cyber Neon Dark",
    bgGradient: "from-slate-950 via-purple-950/40 to-slate-950",
    accentColor: "text-pink-400",
    textColor: "text-white"
  },
  emerald_growth: {
    name: "Emerald Growth",
    bgGradient: "from-slate-950 via-emerald-950/40 to-slate-950",
    accentColor: "text-emerald-400",
    textColor: "text-white"
  },
  sunset_amber: {
    name: "Sunset Amber",
    bgGradient: "from-slate-950 via-amber-950/40 to-slate-950",
    accentColor: "text-amber-400",
    textColor: "text-white"
  },
  clean_minimal: {
    name: "Clean Monochrome",
    bgGradient: "from-slate-900 via-slate-800/40 to-slate-900",
    accentColor: "text-cyan-300",
    textColor: "text-white"
  }
};

/**
 * Procedurally compiles a viral 6-slide carousel deck for any topic.
 */
export function generateCarouselDeck(
  topic: string,
  format: CarouselFormat = "4:5_portrait",
  theme: SlideThemeId = "cyber_dark"
): CarouselDeck {
  const cleanTopic = topic.trim() || "3 Habits Killing Your Focus";

  const slides: CarouselSlide[] = [
    {
      id: "slide_1",
      order: 1,
      slideType: "hook_cover",
      eyebrow: "THE BLUEPRINT",
      headline: `The Masterclass on ${cleanTopic}`,
      bodyText: "99% of people get this in reverse. Here is the exact playbook to master it in 2026.",
      badge: "Swipe to read →"
    },
    {
      id: "slide_2",
      order: 2,
      slideType: "point_card",
      eyebrow: "MISTAKE #1",
      headline: "Confusing Activity with Velocity",
      bodyText: "Busywork feels productive, but without high-leverage leverage, you're running on a treadmill that goes nowhere.",
      bullets: [
        "Audit where 80% of your output actually originates",
        "Ruthlessly eliminate low-ROI micro-tasks",
        "Protect 90 minutes of daily deep focus"
      ]
    },
    {
      id: "slide_3",
      order: 3,
      slideType: "stat_callout",
      eyebrow: "INDUSTRY DATA",
      headline: "The Cost of Context Switching",
      bodyText: "Every interruption costs up to 23 minutes of cognitive reload time before regaining peak flow state.",
      statNumber: "23 min",
      statLabel: "Average focus recovery delay per ping"
    },
    {
      id: "slide_4",
      order: 4,
      slideType: "framework",
      eyebrow: "THE 3-STEP SYSTEM",
      headline: "The Compound Execution Matrix",
      bodyText: "Adopt these 3 core operating principles immediately:",
      bullets: [
        "1. Asynchronous first: minimize synchronous meeting drag",
        "2. Single-task batching: group similar cognitive loads",
        "3. Automated feedback: measure output, not hours"
      ]
    },
    {
      id: "slide_5",
      order: 5,
      slideType: "point_card",
      eyebrow: "EXECUTIVE PERSPECTIVE",
      headline: "Systems Always Outperform Willpower",
      bodyText: "You do not rise to the level of your goals. You fall to the level of your systems. Design friction out of your day.",
      badge: "Key Mindset"
    },
    {
      id: "slide_6",
      order: 6,
      slideType: "cta_outro",
      eyebrow: "SUMMARY & ACTION",
      headline: "Save This For Your Next Sprint",
      bodyText: "Repost this to help your network work smarter. Follow @zyvoriq for daily high-craft creator workflows.",
      badge: "Save & Repost 🚀"
    }
  ];

  return {
    id: `deck_${crypto.randomUUID().slice(0, 8)}`,
    title: `${cleanTopic} · Slide Deck`,
    topic: cleanTopic,
    format,
    theme,
    totalSlides: slides.length,
    slides,
    createdAt: new Date().toISOString()
  };
}
