export type BrandingPageHelpRoute = "branding";

/**
 * Map a scoped path rest segment to branding page-help content.
 * Returns null when the URL is outside the branding area.
 */
export function getBrandingPageHelpRouteFromPathRest(rest: string): BrandingPageHelpRoute | null {
  if (rest === "branding") {
    return "branding";
  }
  return null;
}
