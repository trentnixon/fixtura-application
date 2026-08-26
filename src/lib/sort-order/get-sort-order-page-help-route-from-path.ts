export type SortOrderPageHelpRoute = "sort-order";

/**
 * Map a scoped path rest segment to sort-order page-help content.
 * Returns null when the URL is outside the sort order area.
 */
export function getSortOrderPageHelpRouteFromPathRest(rest: string): SortOrderPageHelpRoute | null {
  if (rest === "sort-order") {
    return "sort-order";
  }
  return null;
}
