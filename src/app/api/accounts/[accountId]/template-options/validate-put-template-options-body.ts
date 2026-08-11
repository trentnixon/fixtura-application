import {
  TEMPLATE_USE_BACKGROUND_VALUES,
  isTemplateUseBackground,
  type PutTemplateOptionsBody,
} from "@/types/api/template-options";

const RELATION_KEYS = [
  "templateCategoryId",
  "templateModeId",
  "templatePaletteId",
  "templateGradientId",
  "templateImageId",
  "templateNoiseId",
  "templateParticleId",
  "templatePatternId",
  "templateTextureId",
  "templateVideoId",
] as const;

const REQUIRED_KEYS = ["templateCategoryId", "templateModeId", "useBackground"] as const;

function isValidRequiredRelationId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isValidOptionalRelationId(value: unknown): value is number | null {
  if (value === null) return true;
  return isValidRequiredRelationId(value);
}

/** Unwrap optional Strapi `{ data: { … } }` wrapper before validation. */
export function unwrapPutTemplateOptionsPayload(body: unknown): unknown {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return body;
  const raw = body as Record<string, unknown>;
  if (
    "data" in raw &&
    typeof raw["data"] === "object" &&
    raw["data"] !== null &&
    !Array.isArray(raw["data"])
  ) {
    return raw["data"];
  }
  return body;
}

export function validatePutTemplateOptionsBody(body: unknown):
  | {
      ok: true;
      data: PutTemplateOptionsBody;
    }
  | { ok: false; error: string } {
  const unwrapped = unwrapPutTemplateOptionsPayload(body);

  if (typeof unwrapped !== "object" || unwrapped === null || Array.isArray(unwrapped)) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const raw = unwrapped as Record<string, unknown>;
  const allowed = new Set([...RELATION_KEYS, "useBackground"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in raw)) {
      return { ok: false, error: `Missing required field: ${key}` };
    }
  }

  if (!isValidRequiredRelationId(raw["templateCategoryId"])) {
    return { ok: false, error: "Invalid templateCategoryId" };
  }
  if (!isValidRequiredRelationId(raw["templateModeId"])) {
    return { ok: false, error: "Invalid templateModeId" };
  }

  const useBackground = raw["useBackground"];
  if (typeof useBackground !== "string" || !isTemplateUseBackground(useBackground)) {
    return {
      ok: false,
      error: `useBackground must be one of: ${TEMPLATE_USE_BACKGROUND_VALUES.join(", ")}`,
    };
  }

  for (const key of RELATION_KEYS) {
    if (key === "templateCategoryId" || key === "templateModeId") continue;
    if (!(key in raw)) continue;
    if (!isValidOptionalRelationId(raw[key])) {
      return { ok: false, error: `Invalid ${key}` };
    }
  }

  return {
    ok: true,
    data: raw as PutTemplateOptionsBody,
  };
}
