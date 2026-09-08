export const POSTHOG_HUB_DISTINCT_ID_PARAM = "phDistinctId";

/**
 * Appends opaque Strapi user id for Delivery Hub identify-on-load. Hub must strip param after read.
 */
export function appendPostHogHubDistinctId(hubUrl: string, distinctId: string): string {
  const id = distinctId.trim();
  if (!id) return hubUrl;

  const url = new URL(hubUrl);
  url.searchParams.set(POSTHOG_HUB_DISTINCT_ID_PARAM, id);
  return url.toString();
}
