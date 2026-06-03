/**
 * External bundle / asset hub (client). Base from `NEXT_PUBLIC_BUNDLES_HUBS_URL`.
 *
 * Account hub: `{base}/{accountId}`
 * Render hub: `{base}/{accountId}/{sport}/{renderId}` — sport is lowercased for the path segment.
 * Group hub: `{base}/{accountId}/{sport}/{renderId}/{groupingCategory}` — category is the CMS grouping label (e.g. `01 - women's competition`).
 */
export function getBundlesHubBaseUrl(): string | null {
  const raw = process.env["NEXT_PUBLIC_BUNDLES_HUBS_URL"];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  return trimmed.replace(/\/+$/, "");
}

export function sportSegmentForBundlesHub(sport: string | null | undefined): string | null {
  if (sport == null) return null;
  const trimmed = sport.trim();
  if (trimmed === "") return null;
  return trimmed.toLowerCase();
}

export function buildBundlesHubAccountUrl(accountId: string): string | null {
  const base = getBundlesHubBaseUrl();
  if (!base) return null;
  return `${base}/${encodeURIComponent(accountId)}`;
}

export function buildBundlesHubRenderUrl(
  accountId: string,
  sport: string | null | undefined,
  renderId: string | number,
): string | null {
  const base = getBundlesHubBaseUrl();
  const sportSegment = sportSegmentForBundlesHub(sport);
  if (!base || !sportSegment) return null;
  return `${base}/${encodeURIComponent(accountId)}/${encodeURIComponent(sportSegment)}/${encodeURIComponent(String(renderId))}`;
}

export function buildBundlesHubRenderGroupUrl(
  accountId: string,
  sport: string | null | undefined,
  renderId: string | number,
  groupingCategory: string | null | undefined,
): string | null {
  const renderUrl = buildBundlesHubRenderUrl(accountId, sport, renderId);
  const category = groupingCategory?.trim();
  if (!renderUrl || !category) return null;
  return `${renderUrl}/${encodeURIComponent(category)}`;
}
