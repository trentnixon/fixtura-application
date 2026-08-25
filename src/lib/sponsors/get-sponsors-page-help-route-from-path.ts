export type SponsorsPageHelpRoute =
  "pool" | "add-sponsor" | "assign-position" | "assign-entity" | "archive";

/**
 * Map a scoped path rest segment to sponsors page-help content.
 * Returns null when the URL is outside the sponsors area.
 */
export function getSponsorsPageHelpRouteFromPathRest(rest: string): SponsorsPageHelpRoute | null {
  if (rest === "add-sponsor" || rest.startsWith("add-sponsor/")) {
    return "add-sponsor";
  }
  if (rest.startsWith("manage-sponsors/assign/position")) {
    return "assign-position";
  }
  if (rest.startsWith("manage-sponsors/assign/entity")) {
    return "assign-entity";
  }
  if (rest.startsWith("manage-sponsors/archive")) {
    return "archive";
  }
  if (rest === "manage-sponsors" || rest.startsWith("manage-sponsors/")) {
    return "pool";
  }
  return null;
}
