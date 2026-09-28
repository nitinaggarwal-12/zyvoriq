// ============================================================================
// GOOGLE MATERIAL DESIGN 3 (M3) DYNAMIC TONAL COLOR SCHEMES (LIGHT & DARK SSOT)
// ============================================================================
// Implements Google Material Design 3 dynamic color roles across both:
// - Consumer Daylight Light Themes (Default: crisp alabaster/porcelain surfaces)
// - Cinema Studio Dark Themes (Optional dark room grading mode)
// ============================================================================

export interface M3TonalScheme {
  id: string;
  name: string;
  badge: string;
  mode: "light" | "dark";
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  surfaceDim: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
}

export const M3_TONAL_SCHEMES: M3TonalScheme[] = [
  {
    id: "daylight_cobalt_mint",
    name: "☀️ Daylight Studio — Cobalt & Mint (Default Light)",
    badge: "Consumer Daylight Light",
    mode: "light",
    primary: "#2563EB",
    onPrimary: "#FFFFFF",
    primaryContainer: "#DBEAFE",
    onPrimaryContainer: "#1E3A8A",
    secondary: "#059669",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D1FAE5",
    onSecondaryContainer: "#064E3B",
    tertiary: "#D97706",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FEF3C7",
    onTertiaryContainer: "#78350F",
    surfaceDim: "#F1F5F9",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F8FAFC",
    surfaceContainer: "#FFFFFF",
    surfaceContainerHigh: "#F1F5F9",
    surfaceContainerHighest: "#E2E8F0",
    onSurface: "#0F172A",
    onSurfaceVariant: "#475569",
    outline: "#94A3B8",
    outlineVariant: "rgba(15, 23, 42, 0.10)",
  },
  {
    id: "daylight_warm_ivory",
    name: "☀️ Editorial Daylight — Warm Ivory & Coral",
    badge: "Warm Editorial Light",
    mode: "light",
    primary: "#E11D48",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFE4E6",
    onPrimaryContainer: "#881337",
    secondary: "#0D9488",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#CCFBF1",
    onSecondaryContainer: "#115E59",
    tertiary: "#B45309",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FEF3C7",
    onTertiaryContainer: "#78350F",
    surfaceDim: "#F5F2EB",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#FDFBF7",
    surfaceContainer: "#FFFFFF",
    surfaceContainerHigh: "#F5F2EB",
    surfaceContainerHighest: "#E7E2D8",
    onSurface: "#1C1917",
    onSurfaceVariant: "#57534E",
    outline: "#A8A29E",
    outlineVariant: "rgba(28, 25, 23, 0.11)",
  },
  {
    id: "daylight_lavender_sky",
    name: "☀️ Creator Pastel — Royal Violet & Sky",
    badge: "Creator Pastel Light",
    mode: "light",
    primary: "#6D28D9",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EDE9FE",
    onPrimaryContainer: "#2E1065",
    secondary: "#0284C7",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E0F2FE",
    onSecondaryContainer: "#0C4A6E",
    tertiary: "#DB2777",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FCE7F3",
    onTertiaryContainer: "#831843",
    surfaceDim: "#F3F1FA",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F9F8FF",
    surfaceContainer: "#FFFFFF",
    surfaceContainerHigh: "#F3F1FA",
    surfaceContainerHighest: "#E5E1F5",
    onSurface: "#1E1B4B",
    onSurfaceVariant: "#4C496E",
    outline: "#9CA3AF",
    outlineVariant: "rgba(30, 27, 75, 0.10)",
  },
  {
    id: "sapphire_emerald",
    name: "🌙 Cinema Dark — Sapphire & Emerald",
    badge: "Google M3 Dark",
    mode: "dark",
    primary: "#A8C7FA",
    onPrimary: "#062E6F",
    primaryContainer: "#1D4ED8",
    onPrimaryContainer: "#D3E3FD",
    secondary: "#6EE7B7",
    onSecondary: "#022C22",
    secondaryContainer: "#065F46",
    onSecondaryContainer: "#D1FAE5",
    tertiary: "#FCD34D",
    onTertiary: "#451A03",
    tertiaryContainer: "#78350F",
    onTertiaryContainer: "#FEF3C7",
    surfaceDim: "#0B0E14",
    surfaceContainerLowest: "#07090E",
    surfaceContainerLow: "#111622",
    surfaceContainer: "#171D2B",
    surfaceContainerHigh: "#1E2638",
    surfaceContainerHighest: "#263046",
    onSurface: "#F1F5F9",
    onSurfaceVariant: "#94A3B8",
    outline: "#64748B",
    outlineVariant: "rgba(168, 199, 250, 0.22)",
  },
  {
    id: "amethyst_gold",
    name: "🌙 Cinema Dark — Royal Amethyst & Gold",
    badge: "M3 Expressive Violet",
    mode: "dark",
    primary: "#D0BCFF",
    onPrimary: "#381E72",
    primaryContainer: "#4F378B",
    onPrimaryContainer: "#EADDFF",
    secondary: "#FCD34D",
    onSecondary: "#451A03",
    secondaryContainer: "#78350F",
    onSecondaryContainer: "#FEF3C7",
    tertiary: "#F472B6",
    onTertiary: "#500724",
    tertiaryContainer: "#831843",
    onTertiaryContainer: "#FCE7F3",
    surfaceDim: "#0E0B16",
    surfaceContainerLowest: "#09070E",
    surfaceContainerLow: "#161224",
    surfaceContainer: "#1D182E",
    surfaceContainerHigh: "#26203B",
    surfaceContainerHighest: "#31294B",
    onSurface: "#F5F3FF",
    onSurfaceVariant: "#C4B5FD",
    outline: "#7C3AED",
    outlineVariant: "rgba(208, 188, 255, 0.22)",
  },
];

export function getM3CssVariables(scheme: M3TonalScheme): Record<string, string> {
  return {
    "--m3-primary": scheme.primary,
    "--m3-on-primary": scheme.onPrimary,
    "--m3-primary-container": scheme.primaryContainer,
    "--m3-on-primary-container": scheme.onPrimaryContainer,
    "--m3-secondary": scheme.secondary,
    "--m3-on-secondary": scheme.onSecondary,
    "--m3-secondary-container": scheme.secondaryContainer,
    "--m3-on-secondary-container": scheme.onSecondaryContainer,
    "--m3-tertiary": scheme.tertiary,
    "--m3-on-tertiary": scheme.onTertiary,
    "--m3-tertiary-container": scheme.tertiaryContainer,
    "--m3-on-tertiary-container": scheme.onTertiaryContainer,
    "--m3-surface-dim": scheme.surfaceDim,
    "--m3-surface-lowest": scheme.surfaceContainerLowest,
    "--m3-surface-low": scheme.surfaceContainerLow,
    "--m3-surface": scheme.surfaceContainer,
    "--m3-surface-high": scheme.surfaceContainerHigh,
    "--m3-surface-highest": scheme.surfaceContainerHighest,
    "--m3-on-surface": scheme.onSurface,
    "--m3-on-surface-variant": scheme.onSurfaceVariant,
    "--m3-outline": scheme.outline,
    "--m3-outline-variant": scheme.outlineVariant,
  };
}
