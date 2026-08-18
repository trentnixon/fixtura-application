/**
 * Normalise POST body before forwarding to Strapi.
 * - Drops null / empty `billingAddress` so online-only clients do not send postal fields.
 * - Rejects partial `billingAddress` (any field set but required set incomplete) with a single message.
 */
export type NormalizeInvoiceRequestPostBodyResult =
  { ok: true; body: Record<string, unknown> } | { ok: false; message: string };

function trimStringField(addr: Record<string, unknown>, key: string): string {
  const v = addr[key];
  if (v == null) return "";
  return String(v).trim();
}

export function normalizeInvoiceRequestPostBody(
  raw: Record<string, unknown>,
): NormalizeInvoiceRequestPostBodyResult {
  const out: Record<string, unknown> = { ...raw };
  const billingAddress = out["billingAddress"];

  if (billingAddress === undefined) {
    return { ok: true, body: out };
  }

  if (billingAddress === null) {
    delete out["billingAddress"];
    return { ok: true, body: out };
  }

  if (
    typeof billingAddress !== "object" ||
    billingAddress === null ||
    Array.isArray(billingAddress)
  ) {
    return { ok: false, message: "billingAddress must be an object, null, or omitted" };
  }

  const addr = billingAddress as Record<string, unknown>;
  const line1 = trimStringField(addr, "line1");
  const city = trimStringField(addr, "city");
  const state = trimStringField(addr, "state");
  const postcode = trimStringField(addr, "postcode");
  const country = trimStringField(addr, "country");
  const line2 = trimStringField(addr, "line2");

  const requiredFilled =
    line1.length > 0 &&
    city.length > 0 &&
    state.length > 0 &&
    postcode.length > 0 &&
    country.length > 0;
  const anyPostal =
    line1.length > 0 ||
    city.length > 0 ||
    state.length > 0 ||
    postcode.length > 0 ||
    country.length > 0 ||
    line2.length > 0;

  if (anyPostal && !requiredFilled) {
    return {
      ok: false,
      message:
        "billingAddress is incomplete: provide line1, city, state, postcode, and country, or omit billingAddress",
    };
  }

  if (!anyPostal) {
    delete out["billingAddress"];
    return { ok: true, body: out };
  }

  const normalized: Record<string, unknown> = {
    line1,
    city,
    state,
    postcode,
    country,
  };
  if (line2.length > 0) {
    normalized["line2"] = line2;
  }

  out["billingAddress"] = normalized;
  return { ok: true, body: out };
}
