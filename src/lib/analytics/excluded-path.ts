/** Paths that must not emit analytics (dev sandboxes, internal admin tools). */
const EXCLUDED_PATH_PREFIXES = ["/sandbox", "/admin/system"] as const;

export function pathnameFromAnalyticsUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "/";
  if (trimmed.startsWith("/")) {
    return trimmed.split("?")[0] ?? trimmed;
  }
  try {
    return new URL(trimmed).pathname;
  } catch {
    return trimmed.split("?")[0] ?? trimmed;
  }
}

export function isAnalyticsExcludedPath(path: string): boolean {
  const pathname = pathnameFromAnalyticsUrl(path);
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
