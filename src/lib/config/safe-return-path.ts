/**
 * Validates a relative return path for post-login redirect (`from` query param).
 * Allowlists the protected namespace `/app` only; rejects open redirects and traversal.
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

  const allowedPrefixes = [
    "/dashboard",
    "/settings",
    "/bundles",
    "/template-builder",
    "/media-gallery",
    "/manage-sponsors",
    "/season",
    "/account",
  ];

  const isAllowed = allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isAllowed) return false;
  if (pathname.includes("..")) return false;

  const lower = path.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("data:")) return false;

  return true;
}
