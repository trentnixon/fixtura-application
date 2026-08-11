/**
 * Canonical 6-digit hex (`#RRGGBB`). Three-digit `#RGB` from CMS is expanded when parsing.
 */

/** Trim spaces; strips leading `#` for display/typing helpers. */
export function stripHexInput(raw: string): string {
  return raw.trim().replace(/^#/, "");
}

/**
 * Returns canonical `#RRGGBB` uppercase, or `null` if invalid.
 * Accepts optional `#`; expands 3-digit shorthand to 6-digit.
 */
export function tryNormalizeHex(raw: string): string | null {
  const s = raw.trim();
  const withoutHash = s.startsWith("#") ? s.slice(1) : s;
  if (withoutHash.length === 3 && /^[0-9A-Fa-f]{3}$/.test(withoutHash)) {
    const expanded = withoutHash
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }
  if (withoutHash.length !== 6) return null;
  if (!/^[0-9A-Fa-f]{6}$/.test(withoutHash)) return null;
  return `#${withoutHash.toUpperCase()}`;
}

export function isValidHex6(raw: string): boolean {
  return tryNormalizeHex(raw) !== null;
}
