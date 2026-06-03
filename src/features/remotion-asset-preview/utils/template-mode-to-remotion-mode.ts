/**
 * Map CMS template-mode slug (hyphenated) to Remotion dataset `templateVariation.mode` (camelCase).
 */
export function templateModeSlugToRemotionMode(slug: string | null | undefined): string | null {
  if (slug == null || slug.trim() === "") return null;
  const s = slug.trim().toLowerCase().replace(/_/g, "-");

  if (s === "light-alt" || (s.includes("light") && s.includes("alt"))) {
    return "lightAlt";
  }
  if (s === "dark-alt" || (s.includes("dark") && s.includes("alt"))) {
    return "darkAlt";
  }
  if (s === "light" || s.includes("light")) {
    return "light";
  }
  if (s === "dark" || s.includes("dark")) {
    return "dark";
  }

  return null;
}
