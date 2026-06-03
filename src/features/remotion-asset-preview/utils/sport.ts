/**
 * Normalise sport strings from org/settings APIs for comparisons.
 */
export function normalizeSport(sport: string | null | undefined): string | null {
  if (sport == null) return null;
  const t = sport.trim();
  return t === "" ? null : t;
}

/**
 * True when the account sport is Cricket (case-insensitive).
 */
export function isCricketSport(sport: string | null | undefined): boolean {
  const n = normalizeSport(sport);
  if (n === null) return false;
  return n.toLowerCase() === "cricket";
}
