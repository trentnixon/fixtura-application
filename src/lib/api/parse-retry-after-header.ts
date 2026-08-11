/**
 * Parse an HTTP `Retry-After` header value.
 * Prefers integer delay seconds (CMS contract). Defensively supports HTTP-date.
 */
export function parseRetryAfterHeader(
  value: string | null | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
  }

  const dateMs = Date.parse(trimmed);
  if (Number.isNaN(dateMs)) return null;
  const deltaSec = Math.ceil((dateMs - nowMs) / 1000);
  return deltaSec > 0 ? deltaSec : 0;
}
