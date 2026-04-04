/**
 * Coerce Strapi/BFF-style error fields (string | object | nested) into a single display string.
 * Avoids `String(object)` → "[object Object]" leaking to clients.
 */
export function normalizeErrorFieldToString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "" || t === "[object Object]") return undefined;
    return t;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o["message"] === "string") {
      const nested = normalizeErrorFieldToString(o["message"]);
      if (nested) return nested;
    }
    if (typeof o["error"] === "string") {
      const nested = normalizeErrorFieldToString(o["error"]);
      if (nested) return nested;
    }
    if (o["message"] !== null && typeof o["message"] === "object") {
      const nested = normalizeErrorFieldToString(o["message"]);
      if (nested) return nested;
    }
    if (o["error"] !== null && typeof o["error"] === "object") {
      const nested = normalizeErrorFieldToString(o["error"]);
      if (nested) return nested;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return "Request failed";
    }
  }
  return undefined;
}
