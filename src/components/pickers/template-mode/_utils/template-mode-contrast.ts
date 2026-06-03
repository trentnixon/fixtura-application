/**
 * Maps CMS template mode slug → contrast preset for row/card preview styling
 * (titles vs container backgrounds).
 */

export type TemplateModeContrastVariant = "light" | "light-alt" | "dark" | "dark-alt" | "unknown";

const TITLE_WHITE_ON_GRADIENT = "font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]";
const TITLE_WHITE_ON_LIGHT_SURFACE =
  "font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]";
const TITLE_BLACK = "font-medium text-zinc-950";
const TITLE_BLACK_ON_DARK_SURFACE =
  "font-medium text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.35)]";
const TITLE_WHITE_ON_DARK = "font-medium text-white";

/** Infer preset from Strapi slug (hyphens; underscores normalised). */
export function templateModeContrastVariant(slug: string | null): TemplateModeContrastVariant {
  const s = slug?.trim().toLowerCase().replace(/_/g, "-") ?? "";
  if (!s) return "unknown";

  if (s === "light-alt" || (s.includes("light") && s.includes("alt"))) return "light-alt";
  if (s === "dark-alt" || (s.includes("dark") && s.includes("alt"))) return "dark-alt";
  if (s === "light" || s.includes("light")) return "light";
  if (s === "dark" || s.includes("dark")) return "dark";

  return "unknown";
}

/** Logo strip on gradient: dark presets use black backing; light presets use translucent white (+ unknown → light). */
export function templateModeUsesDarkLogoBackdrop(slug: string | null | undefined): boolean {
  const v = templateModeContrastVariant(slug ?? null);
  return v === "dark" || v === "dark-alt";
}

/** Hero lines on brand gradient: dark titles for Light + Dark Alt; white for Light Alt + Dark (+ unknown). */
export function templateModeUsesDarkTitlesOnGradient(slug: string | null | undefined): boolean {
  const v = templateModeContrastVariant(slug ?? null);
  return v === "light" || v === "dark-alt";
}

/** Copy on white/light row surfaces: dark for Light (+ unknown); light for Light Alt. */
export function templateModeUsesDarkCopyOnLightSurface(slug: string | null | undefined): boolean {
  const v = templateModeContrastVariant(slug ?? null);
  return v === "light" || v === "unknown";
}

/** Copy on dark row surfaces: light for Dark; dark for Dark Alt. */
export function templateModeUsesDarkCopyOnDarkSurface(slug: string | null | undefined): boolean {
  const v = templateModeContrastVariant(slug ?? null);
  return v === "dark-alt";
}

/** Primary label style — matches contrast semantics with optional brand gradient behind. */
export function templateModeContrastTitleClass(
  variant: TemplateModeContrastVariant,
  gradientFill: boolean,
): string {
  switch (variant) {
    case "light":
      return TITLE_BLACK;
    case "light-alt":
      return gradientFill ? TITLE_WHITE_ON_GRADIENT : TITLE_WHITE_ON_LIGHT_SURFACE;
    case "dark":
      return gradientFill ? TITLE_WHITE_ON_GRADIENT : TITLE_WHITE_ON_DARK;
    case "dark-alt":
      return gradientFill ? TITLE_BLACK : TITLE_BLACK_ON_DARK_SURFACE;
    default:
      return gradientFill ? TITLE_WHITE_ON_GRADIENT : "font-medium text-foreground";
  }
}

/** Row/card surface when not using brand gradient (lists + cards). */
export function templateModeContrastSurfaceClass(variant: TemplateModeContrastVariant): string {
  switch (variant) {
    case "light":
    case "light-alt":
      return "bg-white";
    case "dark":
    case "dark-alt":
      return "bg-zinc-950";
    default:
      return "";
  }
}

/** Border between stacked rows — tuned for light vs dark surfaces. */
export function templateModeContrastRowDividerClass(variant: TemplateModeContrastVariant): string {
  switch (variant) {
    case "dark":
    case "dark-alt":
      return "border-zinc-800";
    default:
      return "border-border/80";
  }
}

/** “Selected” affordance — readable on brand gradient or flat surfaces. */
export function templateModeContrastSelectedLabelClass(
  variant: TemplateModeContrastVariant,
  gradientFill: boolean,
): string {
  if (gradientFill) {
    if (variant === "light" || variant === "dark-alt") return "text-xs font-medium text-zinc-950";
    return "text-xs font-medium text-white/95";
  }
  if (variant === "dark-alt") return "text-xs font-medium text-zinc-400";
  if (variant === "dark") return "text-xs font-medium text-emerald-400";
  return "text-xs font-medium text-primary";
}
