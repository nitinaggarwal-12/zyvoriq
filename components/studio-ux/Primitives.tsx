"use client";

import React, { useState, useId, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Loader2,
  WifiOff,
  Lock,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

// ============================================================================
// 1. BUTTON PRIMITIVE (All states + disabled reason tooltip)
// ============================================================================
export interface StudioButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabledReason?: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

export function StudioButton({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  disabledReason,
  icon,
  badgeCount,
  children,
  className = "",
  ...rest
}: StudioButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  const variantStyle: React.CSSProperties =
    variant === "primary"
      ? {
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-text)",
          border: "1px solid var(--color-primary)",
        }
      : variant === "danger"
      ? {
          backgroundColor: "var(--color-danger)",
          color: "var(--color-primary-text)",
          border: "1px solid var(--color-danger)",
        }
      : variant === "ghost"
      ? {
          backgroundColor: "transparent",
          color: "var(--color-text)",
          border: "1px solid transparent",
        }
      : {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        };

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-sm min-h-[34px]"
      : size === "lg"
      ? "px-5 py-2.5 text-base min-h-[44px]"
      : "px-4 py-2 text-sm min-h-[40px]";

  const btn = (
    <button
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      title={isDisabled && disabledReason ? disabledReason : rest.title}
      style={{
        ...variantStyle,
        borderRadius: "var(--radius-sm)",
        opacity: isDisabled ? 0.55 : 1,
      }}
      className={`inline-flex items-center justify-center gap-2 font-medium studio-transition-micro studio-focus-ring select-none ${
        isDisabled ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.99]"
      } ${sizeClasses} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {typeof badgeCount === "number" && badgeCount > 0 && (
        <span
          className="px-1.5 py-0.5 text-xs font-semibold tabular-nums"
          style={{
            backgroundColor: "var(--color-danger)",
            color: "var(--color-primary-text)",
            borderRadius: "var(--radius-full)",
          }}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );

  if (isDisabled && disabledReason) {
    return (
      <span className="inline-flex items-center" title={disabledReason}>
        {btn}
      </span>
    );
  }
  return btn;
}

// ============================================================================
// 2. INPUT PRIMITIVE (Visible label, inline blur validation, aria-describedby)
// ============================================================================
export interface StudioInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  errorText?: string;
  rightSlot?: React.ReactNode;
  onValidateBlur?: (value: string) => string | undefined;
}

export function StudioInput({
  label,
  helperText,
  errorText,
  rightSlot,
  onValidateBlur,
  id: propId,
  onBlur,
  className = "",
  ...rest
}: StudioInputProps) {
  const autoId = useId();
  const inputId = propId || `studio-input-${autoId}`;
  const descId = `${inputId}-desc`;
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const activeError = errorText || localError;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={inputId}
        className="text-sm font-medium"
        style={{ color: "var(--color-text)" }}
      >
        {label}
      </label>
      <div className="relative flex items-center w-full">
        <input
          id={inputId}
          aria-invalid={Boolean(activeError)}
          aria-describedby={activeError || helperText ? descId : undefined}
          onBlur={(e) => {
            if (onValidateBlur) {
              setLocalError(onValidateBlur(e.target.value));
            }
            onBlur?.(e);
          }}
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            border: `1px solid ${
              activeError ? "var(--color-danger)" : "var(--color-border)"
            }`,
            borderRadius: "var(--radius-sm)",
          }}
          className={`w-full px-3 py-2 text-sm min-h-[40px] studio-focus-ring studio-transition-micro ${
            rightSlot ? "pr-20" : ""
          } ${className}`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute right-2 flex items-center gap-1">
            {rightSlot}
          </div>
        )}
      </div>
      {(activeError || helperText) && (
        <p
          id={descId}
          role={activeError ? "alert" : undefined}
          className="text-sm flex items-center gap-1.5"
          style={{
            color: activeError
              ? "var(--color-danger)"
              : "var(--color-text-muted)",
          }}
        >
          {activeError && (
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span>{activeError || helperText}</span>
        </p>
      )}
    </div>
  );
}

// ============================================================================
// 3. SELECT PRIMITIVE (Semantic <select> with visible label)
// ============================================================================
export interface StudioSelectOption {
  value: string;
  label: string;
}

export interface StudioSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: StudioSelectOption[];
  helperText?: string;
}

export function StudioSelect({
  label,
  options,
  helperText,
  id: propId,
  className = "",
  ...rest
}: StudioSelectProps) {
  const autoId = useId();
  const selectId = propId || `studio-select-${autoId}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={selectId}
        className="text-sm font-medium"
        style={{ color: "var(--color-text)" }}
      >
        {label}
      </label>
      <select
        id={selectId}
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
        }}
        className={`w-full px-3 py-2 text-sm min-h-[40px] studio-focus-ring studio-transition-micro ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && (
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {helperText}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 4. CHIP PRIMITIVE (Never state by color alone — always paired with icon/text)
// ============================================================================
export interface StudioChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "neutral" | "active" | "ai" | "success" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
}

export function StudioChip({
  tone = "neutral",
  icon,
  children,
  className = "",
  ...rest
}: StudioChipProps) {
  const toneStyles: Record<string, React.CSSProperties> = {
    neutral: {
      backgroundColor: "var(--color-surface-2)",
      color: "var(--color-text)",
      border: "1px solid var(--color-border)",
    },
    active: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-primary-text)",
      border: "1px solid var(--color-primary)",
    },
    ai: {
      backgroundColor: "var(--color-ai-subtle)",
      color: "var(--color-text)",
      border: "1px solid var(--color-ai)",
    },
    success: {
      backgroundColor: "var(--color-success-subtle)",
      color: "var(--color-text)",
      border: "1px solid var(--color-success)",
    },
    warning: {
      backgroundColor: "var(--color-warning-subtle)",
      color: "var(--color-text)",
      border: "1px solid var(--color-warning)",
    },
    danger: {
      backgroundColor: "var(--color-danger-subtle)",
      color: "var(--color-text)",
      border: "1px solid var(--color-danger)",
    },
    info: {
      backgroundColor: "var(--color-info-subtle)",
      color: "var(--color-text)",
      border: "1px solid var(--color-info)",
    },
  };

  const defaultIcon =
    tone === "ai" ? (
      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
    ) : tone === "success" ? (
      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
    ) : tone === "warning" ? (
      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
    ) : tone === "danger" ? (
      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
    ) : tone === "info" ? (
      <Info className="w-3.5 h-3.5" aria-hidden="true" />
    ) : null;

  return (
    <button
      type="button"
      style={{
        ...toneStyles[tone],
        borderRadius: "var(--radius-sm)",
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium min-h-[30px] studio-transition-micro studio-focus-ring ${className}`}
      {...rest}
    >
      {(icon || defaultIcon) && (
        <span className="inline-flex shrink-0">{icon || defaultIcon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

// ============================================================================
// 5. TOOLTIP PRIMITIVE (Accessible hover + focus tooltip with shortcut display)
// ============================================================================
export function StudioTooltip({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span
        role="tooltip"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-text)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-sm)",
        }}
        className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 studio-transition-ui absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap z-50 flex items-center gap-1.5"
      >
        <span>{label}</span>
        {shortcut && (
          <kbd
            className="px-1 py-0.5 text-xs font-mono"
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: "4px",
            }}
          >
            {shortcut}
          </kbd>
        )}
      </span>
    </span>
  );
}

// ============================================================================
// 6. TABS PRIMITIVE (Semantic tablist with keyboard navigation)
// ============================================================================
export interface StudioTabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export function StudioTabs({
  tabs,
  activeId,
  onChange,
  ariaLabel,
}: {
  tabs: StudioTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        backgroundColor: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
      }}
      className="inline-flex items-center p-1 gap-1 flex-wrap"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              backgroundColor: isActive ? "var(--color-surface)" : "transparent",
              color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
              borderRadius: "var(--radius-sm)",
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium min-h-[34px] studio-transition-micro studio-focus-ring"
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className="px-1.5 py-0.2 text-xs font-mono tabular-nums"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-surface-2)"
                    : "var(--color-surface)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// 7. DIALOG PRIMITIVE (Accessible modal with Esc key & focus return)
// ============================================================================
export function StudioDialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.55)" }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-md)",
          color: "var(--color-text)",
        }}
        className="w-full max-w-xl p-6 flex flex-col gap-4 studio-transition-panel"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="studio-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 studio-focus-ring"
            style={{
              color: "var(--color-text-muted)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 8. SHEET PRIMITIVE (Mobile Bottom Sheet / Side Drawer)
// ============================================================================
export function StudioSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-end"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          borderLeft: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md) var(--radius-md) 0 0",
          boxShadow: "var(--shadow-md)",
          color: "var(--color-text)",
        }}
        className="w-full md:max-w-md max-h-[82vh] overflow-y-auto p-5 flex flex-col gap-4 studio-transition-panel"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            className="p-1.5 studio-focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 9. TOAST PRIMITIVE (Compact bottom-right non-blocking overlay with Undo)
// ============================================================================
export function StudioToast({
  message,
  actionLabel,
  onAction,
  onDismiss,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
        color: "var(--color-text)",
      }}
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 max-w-sm sm:max-w-[420px] p-3 sm:p-3.5 z-50 flex items-center justify-between gap-3 studio-transition-ui"
    >
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2
          className="w-4 h-4 shrink-0"
          style={{ color: "var(--color-success)" }}
          aria-hidden="true"
        />
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actionLabel && onAction && (
          <StudioButton size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </StudioButton>
        )}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="p-1 text-sm studio-focus-ring"
          style={{ color: "var(--color-text-muted)" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 10. ALL 12 REQUIRED STATES SHOWCASE (Phase 3.7 Compliance Component)
// ============================================================================
export type ComponentStateName =
  | "default"
  | "hover"
  | "focus-visible"
  | "active"
  | "disabled"
  | "loading"
  | "empty"
  | "error"
  | "success"
  | "offline"
  | "long-content"
  | "zero-permission";

export function StateCardPreview({ state }: { state: ComponentStateName }) {
  switch (state) {
    case "default":
      return (
        <div className="studio-surface p-4 flex items-center justify-between gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <div>
            <p className="text-sm font-semibold">Default State</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Ready for direct editing or quick action chips.
            </p>
          </div>
          <StudioButton variant="primary" size="sm">Generate</StudioButton>
        </div>
      );
    case "hover":
      return (
        <div className="studio-surface-2 p-4 flex items-center justify-between gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <div>
            <p className="text-sm font-semibold">Hover / Raised State</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Uses --color-surface-2 with 120ms ease-out transition.
            </p>
          </div>
          <StudioChip tone="active">Select block</StudioChip>
        </div>
      );
    case "focus-visible":
      return (
        <div
          className="studio-surface p-4 flex items-center justify-between gap-3"
          style={{
            borderRadius: "var(--radius-md)",
            outline: "2px solid var(--color-focus)",
            outlineOffset: "2px",
          }}
        >
          <div>
            <p className="text-sm font-semibold">Focus-Visible State</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              High-contrast ≥ 3:1 focus ring (--color-focus) for keyboard navigation.
            </p>
          </div>
          <kbd className="px-2 py-1 text-xs font-mono studio-surface-2" style={{ borderRadius: "var(--radius-sm)" }}>Tab</kbd>
        </div>
      );
    case "active":
      return (
        <div
          className="p-4 flex items-center justify-between gap-3"
          style={{
            backgroundColor: "var(--color-ai-subtle)",
            border: "1px solid var(--color-ai)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div>
            <p className="text-sm font-semibold">Active / Selected Scope</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Currently scoping prompt bar to: Slide 2 Headline.
            </p>
          </div>
          <StudioChip tone="ai">AI Scoped</StudioChip>
        </div>
      );
    case "disabled":
      return (
        <div className="studio-surface p-4 flex items-center justify-between gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <div>
            <p className="text-sm font-semibold">Disabled with Reason Tooltip</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Hover the disabled Publish button to inspect the blocking reason.
            </p>
          </div>
          <StudioButton
            variant="primary"
            size="sm"
            disabled
            disabledReason="Resolve 1 blocking character limit error before publishing"
          >
            Publish
          </StudioButton>
        </div>
      );
    case "loading":
      return (
        <div
          aria-busy="true"
          aria-live="polite"
          className="studio-surface p-4 flex flex-col gap-2.5"
          style={{ borderRadius: "var(--radius-md)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Stage 2 of 4: Drafting 6-shot storyboard…
            </span>
            <span className="text-xs font-mono tabular-nums" style={{ color: "var(--color-text-muted)" }}>0:04 remaining</span>
          </div>
          <div className="h-4 w-3/4 animate-pulse" style={{ backgroundColor: "var(--color-surface-2)", borderRadius: "var(--radius-sm)" }} />
          <div className="h-4 w-1/2 animate-pulse" style={{ backgroundColor: "var(--color-surface-2)", borderRadius: "var(--radius-sm)" }} />
        </div>
      );
    case "empty":
      return (
        <div className="studio-surface p-4 flex items-center justify-between gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">No custom variations yet</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Generate 3 side-by-side variations to compare hooks and pacing.
              </p>
            </div>
          </div>
          <StudioButton variant="secondary" size="sm">Generate 3 variations</StudioButton>
        </div>
      );
    case "error":
      return (
        <div
          role="alert"
          className="p-4 flex items-center justify-between gap-3"
          style={{
            backgroundColor: "var(--color-danger-subtle)",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-danger)" }} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Video segment render timed out</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Why: Upstream model took longer than 30s. Your caption edits are saved—click Retry to resume from Segment 3.
              </p>
            </div>
          </div>
          <StudioButton variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry segment
          </StudioButton>
        </div>
      );
    case "success":
      return (
        <div
          className="p-4 flex items-center justify-between gap-3"
          style={{
            backgroundColor: "var(--color-success-subtle)",
            border: "1px solid var(--color-success)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--color-success)" }} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">All 6 platform & safety checks passed</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Ready to publish to Reels (9:16) and YouTube (16:9).
              </p>
            </div>
          </div>
          <StudioChip tone="success">All good</StudioChip>
        </div>
      );
    case "offline":
      return (
        <div
          className="p-4 flex items-center justify-between gap-3"
          style={{
            backgroundColor: "var(--color-warning-subtle)",
            border: "1px solid var(--color-warning)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-5 h-5 shrink-0" style={{ color: "var(--color-warning)" }} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Offline — editing locally</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Changes are saved to local storage and will sync automatically when connection returns.
              </p>
            </div>
          </div>
          <StudioChip tone="warning">Local queue (2)</StudioChip>
        </div>
      );
    case "long-content":
      return (
        <div className="studio-surface p-4 flex items-center justify-between gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Long Content Overflow & Truncation</p>
            <p
              className="text-sm truncate"
              title="From 0.0s to 60.0s: Continuous 35mm live-action snowy basalt canyon sequence with Kaelen on screen-left and unarmed Lyra on screen-right in cold overcast blue-grey Arctic twilight."
              style={{ color: "var(--color-text-muted)" }}
            >
              From 0.0s to 60.0s: Continuous 35mm live-action snowy basalt canyon sequence with Kaelen on screen-left and unarmed Lyra on screen-right in cold overcast blue-grey Arctic twilight.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums shrink-0" style={{ color: "var(--color-text-muted)" }}>188 / 2,200</span>
        </div>
      );
    case "zero-permission":
      return (
        <div className="studio-surface p-4 flex items-center justify-between gap-3" style={{ borderRadius: "var(--radius-md)" }}>
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 shrink-0" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Read-only viewer role</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                You can preview and export this campaign. Request Editor access from the workspace owner to publish.
              </p>
            </div>
          </div>
          <StudioButton variant="secondary" size="sm">Request access</StudioButton>
        </div>
      );
  }
}
