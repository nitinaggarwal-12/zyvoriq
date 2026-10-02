"use client";

import React from "react";
import {
  Check,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowDown,
  Play,
  ShieldCheck,
  Eye,
  Volume2,
  Layers,
} from "lucide-react";
import { StudioButton, StudioChip } from "./Primitives";

// ============================================================================
// 1. SELECTION TOOLBAR PATTERN (In-Place Quick Actions)
// ============================================================================
export type QuickActionType =
  | "shorter"
  | "punchier"
  | "fix_grammar"
  | "change_tone"
  | "translate"
  | "regenerate";

export const QUICK_ACTIONS: { id: QuickActionType; label: string }[] = [
  { id: "shorter", label: "Shorter" },
  { id: "punchier", label: "Punchier" },
  { id: "fix_grammar", label: "Fix grammar" },
  { id: "change_tone", label: "Change tone" },
  { id: "translate", label: "Translate" },
  { id: "regenerate", label: "Regenerate this" },
];

export function SelectionToolbar({
  scopeLabel,
  onQuickAction,
  onClearSelection,
}: {
  scopeLabel: string;
  onQuickAction: (action: QuickActionType) => void;
  onClearSelection?: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label={`Quick actions for ${scopeLabel}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
      className="p-2.5 flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2">
        <StudioChip tone="ai">Editing: {scopeLabel}</StudioChip>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_ACTIONS.map((act) => (
          <StudioChip
            key={act.id}
            tone="neutral"
            onClick={() => onQuickAction(act.id)}
          >
            {act.label}
          </StudioChip>
        ))}
        {onClearSelection && (
          <StudioButton variant="ghost" size="sm" onClick={onClearSelection}>
            Done
          </StudioButton>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. DIFF VIEW PATTERN (Accessible AI Diff — Never Rely on Color Alone)
// ============================================================================
export interface PendingDiffSuggestion {
  id: string;
  targetKey: string;
  targetLabel: string;
  beforeText: string;
  afterText: string;
  actionName: string;
}

export function DiffView({
  diff,
  onAccept,
  onReject,
  onTryAgain,
  onAcceptAll,
}: {
  diff: PendingDiffSuggestion;
  onAccept: (diff: PendingDiffSuggestion) => void;
  onReject: (id: string) => void;
  onTryAgain: (diff: PendingDiffSuggestion) => void;
  onAcceptAll?: () => void;
}) {
  return (
    <div
      role="region"
      aria-label={`AI suggestion for ${diff.targetLabel}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-ai)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
      className="p-4 flex flex-col gap-3 studio-transition-ui"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <StudioChip tone="ai">AI Suggestion · {diff.actionName}</StudioChip>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Scope: {diff.targetLabel}
          </span>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--color-text-muted)" }}
        >
          Cmd+Enter to accept · Esc to reject
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          className="p-3 flex flex-col gap-1"
          style={{
            backgroundColor: "var(--color-danger-subtle)",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Removed (Original)</span>
          </span>
          <p className="text-sm line-through">
            <span className="sr-only">Removed text: </span>
            {diff.beforeText}
          </p>
        </div>

        <div
          className="p-3 flex flex-col gap-1"
          style={{
            backgroundColor: "var(--color-ai-subtle)",
            border: "1px solid var(--color-ai)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Added (AI Revision)</span>
          </span>
          <p className="text-sm font-medium">
            <span className="sr-only">Added text: </span>
            {diff.afterText}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <StudioButton
          variant="ghost"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => onTryAgain(diff)}
        >
          Try another
        </StudioButton>
        <StudioButton
          variant="secondary"
          size="sm"
          icon={<X className="w-3.5 h-3.5" />}
          onClick={() => onReject(diff.id)}
        >
          Keep original
        </StudioButton>
        <StudioButton
          variant="primary"
          size="sm"
          icon={<Check className="w-3.5 h-3.5" />}
          onClick={() => onAccept(diff)}
        >
          Accept change
        </StudioButton>
        {onAcceptAll && (
          <StudioButton variant="secondary" size="sm" onClick={onAcceptAll}>
            Accept all
          </StudioButton>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. CHECKS & FIXES PATTERN (6 Mandatory Domains + 1-Click Fix + Why)
// ============================================================================
export type CheckCategory =
  | "Platform fit"
  | "Brand"
  | "Quality"
  | "Accessibility"
  | "Safety & compliance"
  | "Links";

export type CheckSeverity = "error" | "warning" | "tip";

export interface ContentCheckIssue {
  id: string;
  category: CheckCategory;
  severity: CheckSeverity;
  title: string;
  why: string;
  targetScope: string;
  fixLabel: string;
  applyFix: () => void;
}

export function CheckItemCard({
  issue,
  onFocusTarget,
  onIgnore,
}: {
  issue: ContentCheckIssue;
  onFocusTarget: (targetScope: string) => void;
  onIgnore: (id: string) => void;
}) {
  const tone =
    issue.severity === "error"
      ? "danger"
      : issue.severity === "warning"
      ? "warning"
      : "info";

  const severityLabel =
    issue.severity === "error"
      ? "Error · Blocks publish"
      : issue.severity === "warning"
      ? "Warning"
      : "Tip";

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
      className="p-3.5 flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <StudioChip tone={tone}>{severityLabel}</StudioChip>
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
          >
            {issue.category}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onFocusTarget(issue.targetScope)}
          className="text-xs font-medium underline studio-focus-ring"
          style={{ color: "var(--color-info)" }}
        >
          Highlight in canvas ({issue.targetScope})
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold">{issue.title}</p>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Why: {issue.why}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        {issue.severity !== "error" && (
          <StudioButton
            variant="ghost"
            size="sm"
            onClick={() => onIgnore(issue.id)}
          >
            Ignore
          </StudioButton>
        )}
        <StudioButton
          variant="secondary"
          size="sm"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={issue.applyFix}
        >
          {issue.fixLabel}
        </StudioButton>
      </div>
    </div>
  );
}

// ============================================================================
// 4. VARIATION GRID PATTERN (Netflix-Style Visual Keyframe Swimlane Cards)
// ============================================================================
export interface PostVariation {
  id: string;
  label: string;
  hook: string;
  body: string;
  hashtags: string;
  videoUrl: string;
  audioLabel: string;
  rationale: string;
}

export function VariationGrid({
  variations,
  activeVariationId,
  onUseVariation,
  onMixHookAndVisual,
  onMoreLikeThis,
}: {
  variations: PostVariation[];
  activeVariationId?: string;
  onUseVariation: (v: PostVariation) => void;
  onMixHookAndVisual: (hookVar: PostVariation, visualVar: PostVariation) => void;
  onMoreLikeThis: (v: PostVariation) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3.5">
        {variations.map((v, idx) => {
          const isCurrent = v.id === activeVariationId;
          const nextVar = variations[(idx + 1) % variations.length];
          const matchScore = idx === 0 ? "99% Fit" : idx === 1 ? "96% Fit" : "94% Fit";
          return (
            <div
              key={v.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: `1px solid ${
                  isCurrent ? "var(--color-focus)" : "var(--color-border)"
                }`,
                borderRadius: "var(--radius-md)",
              }}
              className="overflow-hidden flex flex-col studio-transition-micro"
            >
              {/* Visual Keyframe Preview Header (Netflix Swimlane Poster Card) */}
              <div
                style={{
                  backgroundColor: "var(--color-cinema-stage)",
                  borderBottom: "1px solid var(--color-border)",
                }}
                className="relative w-full h-32 overflow-hidden flex items-center justify-center"
              >
                <video
                  src={`${v.videoUrl}#t=${idx === 0 ? 4 : idx === 1 ? 14 : 8}`}
                  muted
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => {
                    e.currentTarget.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <StudioChip tone="success">{matchScore}</StudioChip>
                </div>
                {isCurrent && (
                  <div className="absolute top-2 right-2">
                    <StudioChip tone="ai">On Stage</StudioChip>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <StudioChip tone="neutral">{v.audioLabel}</StudioChip>
                </div>
              </div>

              <div className="p-3.5 flex flex-col gap-2">
                <span className="text-sm font-semibold">{v.label}</span>
                <p className="text-sm font-medium">&ldquo;{v.hook}&rdquo;</p>
                <p
                  className="text-xs font-mono"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Why it works: {v.rationale}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <StudioButton
                    variant={isCurrent ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => onUseVariation(v)}
                  >
                    {isCurrent ? "Active on Stage" : "Use this"}
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    icon={<Layers className="w-3.5 h-3.5" />}
                    onClick={() => onMixHookAndVisual(v, nextVar)}
                  >
                    Mix Hook {String.fromCharCode(65 + idx)} + Visual{" "}
                    {String.fromCharCode(65 + ((idx + 1) % variations.length))}
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoreLikeThis(v)}
                  >
                    More like this
                  </StudioButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. VIDEO TIMELINE PATTERN (Horizontal 6-Act Filmstrip Scrubber + Focused Act Bar)
// ============================================================================
export interface VideoSegmentSpec {
  id: string;
  index: number;
  timeRange: string;
  startSec: number;
  endSec: number;
  speaker: string;
  captionLine: string;
  visualContinuityLock: string;
  aiGenerated?: boolean;
}

export function VideoTimelineEditor({
  segments,
  selectedSegmentId,
  onSelectSegment,
  onUpdateCaption,
  onMoveSegment,
  onRegenerateSegment,
}: {
  segments: VideoSegmentSpec[];
  selectedSegmentId: string;
  onSelectSegment: (seg: VideoSegmentSpec) => void;
  onUpdateCaption: (id: string, newCaption: string) => void;
  onMoveSegment: (index: number, direction: -1 | 1) => void;
  onRegenerateSegment: (seg: VideoSegmentSpec) => void;
}) {
  const activeIdx = Math.max(
    0,
    segments.findIndex((s) => s.id === selectedSegmentId)
  );
  const activeSegment = segments[activeIdx] || segments[0];

  const firstRange = segments[0]?.timeRange || "00.0s–10.0s";
  const lastRange =
    segments[segments.length - 1]?.timeRange || "50.0s–60.0s";
  const rangeStart = firstRange.split(/[–—-]/)[0]?.trim() || "0:00";
  const rangeEnd = lastRange.split(/[–—-]/)[1]?.trim() || "1:00";
  const totalSec = segments[segments.length - 1]?.endSec || 60;
  const perActSec = Math.round(totalSec / Math.max(1, segments.length));

  return (
    <div
      role="region"
      aria-label={`${segments.length}-act cinema chapter scrubber (${rangeStart} to ${rangeEnd})`}
      className="flex flex-col gap-3"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span data-testid="scrubber-header-title">
            {segments.length}-Act Cinema Chapter Scrubber ({rangeStart} — {rangeEnd})
          </span>
        </span>
        <span
          className="text-xs font-mono tabular-nums"
          style={{ color: "var(--color-text-muted)" }}
        >
          Click any {perActSec}s chapter to scrub player &amp; edit subtitle
        </span>
      </div>

      {/* Horizontal 6-Act Chapter Scrubber Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {segments.map((seg, idx) => {
          const isSelected = seg.id === activeSegment?.id;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => onSelectSegment(seg)}
              style={{
                backgroundColor: isSelected
                  ? "var(--color-surface-2)"
                  : "var(--color-surface)",
                border: `1px solid ${
                  isSelected ? "var(--color-focus)" : "var(--color-border)"
                }`,
                borderRadius: "var(--radius-sm)",
              }}
              className="p-2.5 text-left flex flex-col gap-1.5 studio-transition-micro studio-focus-ring cursor-pointer"
            >
              {/* Chapter Progress Indicator Bar */}
              <div
                className="w-full h-1"
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-focus)"
                    : "var(--color-border)",
                  borderRadius: "var(--radius-full)",
                }}
              />
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-mono font-bold tabular-nums">
                  {seg.timeRange}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Act {idx + 1}
                </span>
              </div>
              <span className="text-xs font-semibold truncate">
                {seg.speaker}
              </span>
              <span
                className="text-xs truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                &ldquo;{seg.captionLine}&rdquo;
              </span>
            </button>
          );
        })}
      </div>

      {/* Single Focused Active Chapter Bar (Zero 6-Input Clutter) */}
      {activeSegment && (
        <div
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
          className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
        >
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <StudioChip tone="active">
                  Act {activeIdx + 1} · {activeSegment.timeRange}
                </StudioChip>
                <span className="text-xs font-semibold">
                  {activeSegment.speaker}
                </span>
                <span
                  className="text-xs font-mono truncate"
                  style={{ color: "var(--color-text-muted)" }}
                  title={activeSegment.visualContinuityLock}
                >
                  Lock: {activeSegment.visualContinuityLock}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                className="sr-only"
                htmlFor={`seg-cap-${activeSegment.id}`}
              >
                Spoken dialogue and subtitle for {activeSegment.timeRange}
              </label>
              <input
                id={`seg-cap-${activeSegment.id}`}
                type="text"
                value={activeSegment.captionLine}
                onChange={(e) =>
                  onUpdateCaption(activeSegment.id, e.target.value)
                }
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                }}
                className="w-full px-3 py-1.5 text-sm studio-focus-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <StudioButton
              variant="secondary"
              size="sm"
              disabled={activeIdx === 0}
              disabledReason="Already at Act 1 (0:00)"
              onClick={() => onMoveSegment(activeIdx, -1)}
              icon={<ArrowUp className="w-3.5 h-3.5" />}
            >
              Move earlier
            </StudioButton>
            <StudioButton
              variant="secondary"
              size="sm"
              disabled={activeIdx === segments.length - 1}
              disabledReason="Already at final Act (60.0s)"
              onClick={() => onMoveSegment(activeIdx, 1)}
              icon={<ArrowDown className="w-3.5 h-3.5" />}
            >
              Move later
            </StudioButton>
            <StudioButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => onRegenerateSegment(activeSegment)}
            >
              Regenerate act
            </StudioButton>
          </div>
        </div>
      )}
    </div>
  );
}
