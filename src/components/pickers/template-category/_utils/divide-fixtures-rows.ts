/** CMS may send a JSON object; types may still say string | null. */
export function divideFixturesRows(value: unknown): { key: string; display: string }[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === "string") {
    return [{ key: "(value)", display: value }];
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).map(([key, val]) => ({
      key,
      display:
        typeof val === "number" || typeof val === "string" ? String(val) : JSON.stringify(val),
    }));
  }
  return [];
}
