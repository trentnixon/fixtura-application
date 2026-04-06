/**
 * Organisation-scoped members URLs: `/o/[accountId]/...` (Strapi account id).
 */

export const ACCOUNT_SCOPE_PREFIX = "/o" as const;

const SEG = {
  dashboard: "dashboard",
  settings: "settings",
  bundles: "bundles",
  branding: "branding",
  templateBuilder: "template-builder",
  mediaGallery: "media-gallery",
  manageSponsors: "manage-sponsors",
  season: "season",
  account: "account",
} as const;

function scoped(accountId: string | number, segment: string) {
  return `${ACCOUNT_SCOPE_PREFIX}/${accountId}/${segment}`;
}

export const accountScopedRoutes = {
  dashboard: (accountId: string | number) => scoped(accountId, SEG.dashboard),
  settings: (accountId: string | number) => scoped(accountId, SEG.settings),
  bundles: (accountId: string | number) => scoped(accountId, SEG.bundles),
  branding: (accountId: string | number) => scoped(accountId, SEG.branding),
  templateBuilder: (accountId: string | number) => scoped(accountId, SEG.templateBuilder),
  mediaGallery: (accountId: string | number) => scoped(accountId, SEG.mediaGallery),
  manageSponsors: (accountId: string | number) => scoped(accountId, SEG.manageSponsors),
  season: (accountId: string | number) => scoped(accountId, SEG.season),
  account: (accountId: string | number) => scoped(accountId, SEG.account),
} as const;

/** Positive integer Strapi account id (path segment). */
export function isValidAccountIdSegment(segment: string): boolean {
  if (!segment || segment.length > 20) return false;
  if (!/^\d+$/.test(segment)) return false;
  const n = Number(segment);
  return Number.isInteger(n) && n > 0;
}

/** Positive integer render id (path segment under `/renders/:renderId`). */
export function isValidRenderIdSegment(segment: string): boolean {
  return isValidAccountIdSegment(segment);
}

/**
 * Parse `/o/{accountId}/...` → accountId or null if not a scoped members path.
 */
export function parseAccountScopePath(
  pathname: string,
): { accountId: string; rest: string } | null {
  if (!pathname.startsWith(`${ACCOUNT_SCOPE_PREFIX}/`)) return null;
  const parts = pathname.slice(ACCOUNT_SCOPE_PREFIX.length + 1).split("/");
  const accountId = parts[0] ?? "";
  if (!isValidAccountIdSegment(accountId)) return null;
  const rest = parts.slice(1).join("/");
  return { accountId, rest };
}
