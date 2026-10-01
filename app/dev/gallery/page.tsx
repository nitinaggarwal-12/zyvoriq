"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Sliders,
  Layers,
  Eye,
  Film,
} from "lucide-react";
import {
  StudioButton,
  StudioInput,
  StudioSelect,
  StudioChip,
  StudioTooltip,
  StudioTabs,
  StudioDialog,
  StudioSheet,
  StudioToast,
  StateCardPreview,
  ComponentStateName,
} from "@/components/studio-ux/Primitives";
import {
  SelectionToolbar,
  DiffView,
  CheckItemCard,
  VariationGrid,
  VideoTimelineEditor,
  PendingDiffSuggestion,
  ContentCheckIssue,
  PostVariation,
  VideoSegmentSpec,
} from "@/components/studio-ux/Patterns";

const ALL_12_STATES: ComponentStateName[] = [
  "default",
  "hover",
  "focus-visible",
  "active",
  "disabled",
  "loading",
  "empty",
  "error",
  "success",
  "offline",
  "long-content",
  "zero-permission",
];

export default function ComponentGalleryPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("states");
  const [sampleInput, setSampleInput] = useState(
    "A 60-second 35mm live-action confrontation in a snowy basalt canyon"
  );
  const [samplePlatform, setSamplePlatform] = useState("reels_9_16");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [sampleDiff, setSampleDiff] = useState<PendingDiffSuggestion>({
    id: "diff-gallery-1",
    targetKey: "hook",
    targetLabel: "Opening Hook (0:00–0:03)",
    beforeText:
      "Watch Kaelen and Lyra confront the ancient shadow curse inside the frozen canyon.",
    afterText:
      "The curse took his voice at dusk—now she has 60 seconds before the canyon seals forever.",
    actionName: "Punchier",
  });

  const [sampleSegments, setSampleSegments] = useState<VideoSegmentSpec[]>([
    {
      id: "seg-1",
      index: 0,
      timeRange: "00.0s–10.0s",
      startSec: 0,
      endSec: 10,
      speaker: "Kaelen (Baritone)",
      captionLine: "Turn back, Lyra. The basalt pass remembers every blade.",
      visualContinuityLock:
        "Kaelen screen-left, unarmed Lyra screen-right, cold blue-grey twilight",
      aiGenerated: true,
    },
    {
      id: "seg-2",
      index: 1,
      timeRange: "10.0s–20.0s",
      startSec: 10,
      endSec: 20,
      speaker: "Lyra (Mezzo)",
      captionLine: "I came with empty hands so you would listen.",
      visualContinuityLock:
        "Unarmed open-palm gesture, no weapon drawn, snow wind left-to-right",
      aiGenerated: true,
    },
  ]);

  const sampleIssue: ContentCheckIssue = {
    id: "chk-gallery-1",
    category: "Platform fit",
    severity: "error",
    title: "LinkedIn / X caption exceeds 280-character short-feed limit (312 / 280)",
    why: "X truncates posts over 280 characters on standard tiers, cutting off your call-to-action link.",
    targetScope: "Caption Body",
    fixLabel: "Trim to 260 chars",
    applyFix: () =>
      setToastMsg("Trimmed caption to 254 characters · Undo available"),
  };

  const sampleVariations: PostVariation[] = [
    {
      id: "var-a",
      label: "Variation A · High-Tension Hook",
      hook: "The curse took his voice at dusk—now she has 60 seconds before the canyon seals.",
      body: "Shot on 35mm anamorphic lens with synchronized Omni 1.1 dialogue + Lyria 3 Pro orchestral swells.",
      hashtags: "#CinemaReel #LiveAction35mm #SoundDesign",
      videoUrl:
        "/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4",
      audioLabel: "Omni 1.1 + Dynamic Score",
      rationale: "Opens with an immediate countdown stake in the first 2.5 seconds.",
    },
    {
      id: "var-b",
      label: "Variation B · Director's Craft Breakdown",
      hook: "How we locked 60 seconds of continuous Arctic twilight across 6 shots with zero seams.",
      body: "Every cut preserves 180-degree spatial blocking and -14 LUFS dialogue ducking.",
      hashtags: "#Filmmaking #PostProduction #ColorGrading",
      videoUrl:
        "/assets/swarm/comparisons/10_option1_lyria3pro_symphonic_60s_master.mp4",
      audioLabel: "Symphonic Trailer Mix",
      rationale: "Appeals to creators and technical directors on LinkedIn & YouTube.",
    },
  ];

  return (
    <div
      data-theme={theme}
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        minHeight: "100vh",
      }}
      className="w-full max-w-none flex flex-col"
    >
      {/* Sticky Full-Width Top Bar */}
      <header
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="sticky top-0 z-30 w-full px-6 md:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium studio-focus-ring px-2.5 py-1.5"
            style={{
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Studio</span>
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Content Studio UX — Component &amp; 12-State Gallery
            </h1>
            <p
              className="text-xs font-mono"
              style={{ color: "var(--color-text-muted)" }}
            >
              Phase 2 Tokens · Phase 3.7 All 12 States · Phase 4 Primitives &amp; Patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StudioTabs
            ariaLabel="Filter gallery section"
            activeId={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: "all", label: "All Sections" },
              { id: "states", label: "12 States", badge: 12 },
              { id: "primitives", label: "Primitives", badge: 9 },
              { id: "patterns", label: "Studio Patterns", badge: 5 },
            ]}
          />

          <StudioButton
            variant="secondary"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            icon={
              theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )
            }
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </StudioButton>
        </div>
      </header>

      <main className="w-full max-w-none px-6 md:px-10 py-8 flex flex-col gap-10">
        {/* SECTION 1: ALL 12 REQUIRED STATES (PHASE 3.7) */}
        {(activeTab === "all" || activeTab === "states") && (
          <section aria-labelledby="heading-12-states" className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 id="heading-12-states" className="text-xl font-semibold">
                  1. All 12 Required Component States (Section 3.7)
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Every interactive surface in Content Studio implements these 12 explicit states in both Light and Dark themes.
                </p>
              </div>
              <StudioChip tone="success">12 / 12 Verified</StudioChip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ALL_12_STATES.map((st) => (
                <div key={st} className="flex flex-col gap-1.5">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    State: {st}
                  </span>
                  <StateCardPreview state={st} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: CORE PRIMITIVES */}
        {(activeTab === "all" || activeTab === "primitives") && (
          <section aria-labelledby="heading-primitives" className="flex flex-col gap-4">
            <div>
              <h2 id="heading-primitives" className="text-xl font-semibold">
                2. Core Primitives (Button, Input, Select, Chip, Tooltip, Tabs, Dialog, Sheet, Toast)
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Zero raw hex values, semantic focus rings, visible form labels, and inline validation on blur.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buttons & Tooltips */}
              <div
                className="studio-surface p-5 flex flex-col gap-4"
                style={{ borderRadius: "var(--radius-md)" }}
              >
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Sliders className="w-4 h-4" aria-hidden="true" />
                  <span>Buttons, Disabled Reason Tooltips &amp; Chips</span>
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <StudioButton variant="primary">Primary Action</StudioButton>
                  <StudioButton variant="secondary">Secondary</StudioButton>
                  <StudioButton variant="ghost">Ghost</StudioButton>
                  <StudioButton variant="danger">Delete</StudioButton>
                  <StudioButton variant="primary" loading>
                    Generating
                  </StudioButton>
                  <StudioButton
                    variant="primary"
                    disabled
                    disabledReason="Resolve 1 blocking error before publishing"
                  >
                    Publish (Disabled + Why)
                  </StudioButton>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <StudioChip tone="neutral">Neutral Chip</StudioChip>
                  <StudioChip tone="active">Selected Scope</StudioChip>
                  <StudioChip tone="ai">AI Generated</StudioChip>
                  <StudioChip tone="success">Check Passed</StudioChip>
                  <StudioChip tone="warning">Safe-Zone Warning</StudioChip>
                  <StudioChip tone="danger">Over Character Limit</StudioChip>
                  <StudioTooltip label="Undo last change" shortcut="Cmd+Z">
                    <StudioButton variant="secondary" size="sm">
                      Hover for Shortcut Tooltip
                    </StudioButton>
                  </StudioTooltip>
                </div>
              </div>

              {/* Inputs & Selects */}
              <div
                className="studio-surface p-5 flex flex-col gap-4"
                style={{ borderRadius: "var(--radius-md)" }}
              >
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4" aria-hidden="true" />
                  <span>Labeled Inputs, Select &amp; Overlay Triggers</span>
                </h3>
                <StudioInput
                  label="Post Brief (Required)"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  helperText="Describe your topic in one sentence. Tab out with empty text to test inline blur validation."
                  onValidateBlur={(val) =>
                    !val.trim()
                      ? "Enter a 1-sentence brief so the studio can draft your post."
                      : undefined
                  }
                />
                <StudioSelect
                  label="Target Platform Preview"
                  value={samplePlatform}
                  onChange={(e) => setSamplePlatform(e.target.value)}
                  options={[
                    { value: "reels_9_16", label: "9:16 Reels / TikTok (2,200 chars)" },
                    { value: "youtube_16_9", label: "16:9 YouTube Cinema (5,000 chars)" },
                    { value: "carousel_4_5", label: "4:5 Instagram Carousel (10 slides)" },
                    { value: "linkedin_1_1", label: "1:1 LinkedIn / X (280 chars)" },
                  ]}
                />
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setDialogOpen(true)}
                  >
                    Open Accessible Dialog
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setSheetOpen(true)}
                  >
                    Open Bottom/Side Sheet
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setToastMsg("Saved checkpoint · Undo available for 10s")
                    }
                  >
                    Trigger Undo Toast
                  </StudioButton>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: STUDIO PATTERNS */}
        {(activeTab === "all" || activeTab === "patterns") && (
          <section aria-labelledby="heading-patterns" className="flex flex-col gap-6">
            <div>
              <h2 id="heading-patterns" className="text-xl font-semibold">
                3. Content Studio Patterns (In-Place Toolbar, DiffView, Checks, Variations, Video Timeline)
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Reusable domain patterns for selecting, fixing, comparing, and scrubbing social content in place.
              </p>
            </div>

            <SelectionToolbar
              scopeLabel="Opening Hook (0:00–0:03)"
              onQuickAction={(action) =>
                setSampleDiff({
                  ...sampleDiff,
                  actionName: action,
                  afterText: `[${action.toUpperCase()}] The curse took his voice at dusk—now she has 60 seconds before the pass seals.`,
                })
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DiffView
                diff={sampleDiff}
                onAccept={() => setToastMsg("Accepted AI change")}
                onReject={() => setToastMsg("Kept original text")}
                onTryAgain={() =>
                  setSampleDiff({
                    ...sampleDiff,
                    afterText:
                      "Sixty seconds in the snowy basalt pass—unarmed against the cursed blade.",
                  })
                }
              />
              <CheckItemCard
                issue={sampleIssue}
                onFocusTarget={(scope) =>
                  setToastMsg(`Highlighted ${scope} in canvas`)
                }
                onIgnore={() => setToastMsg("Ignored check")}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VariationGrid
                variations={sampleVariations}
                activeVariationId="var-a"
                onUseVariation={(v) => setToastMsg(`Loaded ${v.label}`)}
                onMixHookAndVisual={(h, vis) =>
                  setToastMsg(`Mixed hook from ${h.label} + visual from ${vis.label}`)
                }
                onMoreLikeThis={(v) =>
                  setToastMsg(`Generating 3 more like ${v.label}`)
                }
              />

              <VideoTimelineEditor
                segments={sampleSegments}
                selectedSegmentId="seg-1"
                onSelectSegment={(seg) =>
                  setToastMsg(`Scrubbed to ${seg.timeRange}`)
                }
                onUpdateCaption={(id, text) =>
                  setSampleSegments((prev) =>
                    prev.map((s) =>
                      s.id === id ? { ...s, captionLine: text } : s
                    )
                  )
                }
                onMoveSegment={(idx, dir) => {
                  const next = [...sampleSegments];
                  const target = idx + dir;
                  if (target < 0 || target >= next.length) return;
                  const [moved] = next.splice(idx, 1);
                  next.splice(target, 0, moved);
                  setSampleSegments(next);
                }}
                onRegenerateSegment={(seg) =>
                  setToastMsg(`Regenerating ${seg.timeRange} with continuity lock`)
                }
              />
            </div>
          </section>
        )}
      </main>

      <StudioDialog
        open={dialogOpen}
        title="Pre-Flight Publish Checklist"
        description="Review platform checks before publishing or exporting."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </StudioButton>
            <StudioButton
              variant="primary"
              size="sm"
              onClick={() => {
                setDialogOpen(false);
                setToastMsg("Published campaign package");
              }}
            >
              Confirm Publish
            </StudioButton>
          </>
        }
      >
        <p className="text-sm">
          Focus is trapped inside this modal and returns to the trigger button when dismissed with <kbd className="font-mono">Esc</kbd>.
        </p>
      </StudioDialog>

      <StudioSheet
        open={sheetOpen}
        title="Mobile Context Sheet Preview"
        onClose={() => setSheetOpen(false)}
      >
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          On viewports below 768px, right-hand inspector panels collapse into this accessible bottom sheet so the post preview canvas stays unobstructed.
        </p>
      </StudioSheet>

      <StudioToast
        message={toastMsg}
        actionLabel="Undo"
        onAction={() => setToastMsg("")}
        onDismiss={() => setToastMsg("")}
      />
    </div>
  );
}
