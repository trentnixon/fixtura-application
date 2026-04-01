import { Buffer } from "node:buffer";

/**
 * Best-effort JWT payload read (no signature verification).
 * Used only to read `exp` for session UX; authorization remains server/API-side.
 *
 * - Malformed token → treat as invalid (expired).
 * - Valid token with no `exp` claim → not expired (rely on API 401 later).
 */
export function isJwtExpiredOrInvalid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = parts[1];
    if (!payload) return true;
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { exp?: unknown };
    if (typeof parsed.exp !== "number") return false;
    return Date.now() >= parsed.exp * 1000;
  } catch {
    return true;
  }
}
