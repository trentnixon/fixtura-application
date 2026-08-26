export type BrandLogoPageHelpRoute = "brand-logo";

/**
 * Map a scoped path rest segment to brand-logo page-help content.
 * Returns null when the URL is outside the brand logo area.
 */
export function getBrandLogoPageHelpRouteFromPathRest(rest: string): BrandLogoPageHelpRoute | null {
  if (rest === "brand-logo") {
    return "brand-logo";
  }
  return null;
}
