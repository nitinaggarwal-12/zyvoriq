// ============================================================================
// GOOGLE MATERIAL DESIGN 3 (M3) DYNAMIC TONAL COLOR SCHEMES (SHARED SSOT)
// ============================================================================
// Implements Google Material Design 3 dynamic color roles:
// - 6 Tonal Surface Container Elevation Layers (surfaceDim -> surfaceContainerHighest)
// - Primary / Secondary / Tertiary Accent & Container Pairs
// - Outline & OutlineVariant Structural Tokens
// ============================================================================

export interface M3TonalScheme {
  id: string;
  name: string;
  badge: string;
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
    id: "sapphire_emerald",
    name: "M3 Sapphire & Emerald Studio",
    badge: "Google M3 Default Dark",
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
    name: "M3 Royal Amethyst & Gold",
    badge: "M3 Expressive Violet",
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
  {
    id: "crimson_velvet",
    name: "M3 Crimson Velvet & Champagne",
    badge: "M3 Theatrical Cinema",
    primary: "#FFB3B8",
    onPrimary: "#5F111D",
    primaryContainer: "#8E1D2F",
    onPrimaryContainer: "#FFDAD9",
    secondary: "#FDE68A",
    onSecondary: "#422006",
    secondaryContainer: "#713F12",
    onSecondaryContainer: "#FEF9C3",
    tertiary: "#7DD3FC",
    onTertiary: "#082F49",
    tertiaryContainer: "#0C4A6E",
    onTertiaryContainer: "#E0F2FE",
    surfaceDim: "#140B0D",
    surfaceContainerLowest: "#0C0608",
    surfaceContainerLow: "#1E1114",
    surfaceContainer: "#27161A",
    surfaceContainerHigh: "#331D22",
    surfaceContainerHighest: "#40242B",
    onSurface: "#FFF1F2",
    onSurfaceVariant: "#FECDD3",
    outline: "#E11D48",
    outlineVariant: "rgba(255, 179, 184, 0.22)",
  },
  {
    id: "cyan_coral",
    name: "M3 Cyber Cyan & Sunset Coral",
    badge: "M3 High-Contrast Neon",
    primary: "#67E8F9",
    onPrimary: "#083344",
    primaryContainer: "#155E75",
    onPrimaryContainer: "#CFFAFE",
    secondary: "#FDA4AF",
    onSecondary: "#4C0519",
    secondaryContainer: "#881337",
    onSecondaryContainer: "#FFE4E6",
    tertiary: "#A7F3D0",
    onTertiary: "#022C22",
    tertiaryContainer: "#064E3B",
    onTertiaryContainer: "#D1FAE5",
    surfaceDim: "#091217",
    surfaceContainerLowest: "#050B0E",
    surfaceContainerLow: "#0F1C24",
    surfaceContainer: "#14252F",
    surfaceContainerHigh: "#1B303D",
    surfaceContainerHighest: "#233D4D",
    onSurface: "#ECFEFF",
    onSurfaceVariant: "#A5F3FC",
    outline: "#06B6D4",
    outlineVariant: "rgba(103, 232, 249, 0.22)",
  },
  {
    id: "emerald_jade",
    name: "M3 Forest Emerald & Warm Amber",
    badge: "M3 Botanical Studio",
    primary: "#6EE7B7",
    onPrimary: "#022C22",
    primaryContainer: "#065F46",
    onPrimaryContainer: "#D1FAE5",
    secondary: "#FBBF24",
    onSecondary: "#451A03",
    secondaryContainer: "#78350F",
    onSecondaryContainer: "#FEF3C7",
    tertiary: "#93C5FD",
    onTertiary: "#1E3A8A",
    tertiaryContainer: "#1D4ED8",
    onTertiaryContainer: "#DBEAFE",
    surfaceDim: "#08120E",
    surfaceContainerLowest: "#040A07",
    surfaceContainerLow: "#0D1E17",
    surfaceContainer: "#122920",
    surfaceContainerHigh: "#18362A",
    surfaceContainerHighest: "#1F4435",
    onSurface: "#ECFDF5",
    onSurfaceVariant: "#A7F3D0",
    outline: "#10B981",
    outlineVariant: "rgba(110, 231, 183, 0.22)",
  },
];

export function getM3CssVariables(scheme: M3TonalScheme): React.CSSProperties {
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
  } as React.CSSProperties;
}
