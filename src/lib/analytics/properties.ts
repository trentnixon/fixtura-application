import { ANALYTICS_SURFACE_APP } from "./constants";

const BLOCKED_PROPERTY_KEYS = new Set(["email", "password", "identifier", "token", "jwt"]);

export function withAppSurface(properties?: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { surface: ANALYTICS_SURFACE_APP };

  if (!properties) return safe;

  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_PROPERTY_KEYS.has(key.toLowerCase())) continue;
    safe[key] = value;
  }

  return safe;
}
