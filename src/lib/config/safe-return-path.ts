import { isValidAccountIdSegment, parseAccountScopePath } from "@/lib/config/account-routes";

const SCOPED_SEGMENTS = new Set([
  "dashboard",
  "settings",
  "bundles",
  "template-builder",
  "media-gallery",
  "manage-sponsors",
  "season",
  "account",
]);

/**
 * Validates a relative return path for post-login redirect (`from` query param).
 * Allowlists `/o/{accountId}/...` with a positive integer account id and known segments; rejects open redirects.
 */
export function isSafeAppReturnPath(path: string): boolean {
  if (!path || path.length > 2048) return false;
  if (path.startsWith("//") || path.includes("\\")) return false;
  if (path !== path.trim()) return false;

  let pathname: string;
  try {
    const u = new URL(path, "http://local.invalid");
    pathname = u.pathname;
    if (u.search.length > 1024) return false;
  } catch {
    return false;
  }

  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return false;
  if (!isValidAccountIdSegment(scoped.accountId)) return false;

  const firstSeg = scoped.rest.split("/").filter(Boolean)[0] ?? "";
  if (!firstSeg || !SCOPED_SEGMENTS.has(firstSeg)) return false;

  if (pathname.includes("..")) return false;

  const lower = path.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("data:")) return false;

  return true;
}
