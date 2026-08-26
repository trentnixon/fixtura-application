export type ClubLogosPageHelpRoute = "directory" | "editor";

/**
 * Map a scoped path rest segment to club-logos page-help content.
 * Returns null when the URL is outside the club logos area.
 */
export function getClubLogosPageHelpRouteFromPathRest(rest: string): ClubLogosPageHelpRoute | null {
  if (rest === "club-logos") {
    return "directory";
  }
  if (rest.startsWith("club-logos/")) {
    return "editor";
  }
  return null;
}
