import type { AccountBrandingData } from "@/types/api/account";

/** Palette gradient keys on `palette.background.gradient` (GradientBackground path). */
export const REMOTION_GRADIENT_TYPE_KEYS = [
  "primary",
  "secondary",
  "primaryToSecondary",
  "secondaryToPrimary",
  "primaryAdvanced",
  "secondaryAdvanced",
  "primaryRadial",
  "secondaryRadial",
  "conicGradient",
  "meshGradient",
  "hardStopGradient",
] as const;

export type RemotionGradientTypeKey = (typeof REMOTION_GRADIENT_TYPE_KEYS)[number];

/** Direction keys into `palette.background.gradient[type].css` (vendor GRADIENT_DIRECTIONS). */
export const REMOTION_GRADIENT_DIRECTION_KEYS = [
  "HORIZONTAL",
  "HORIZONTAL_REVERSE",
  "VERTICAL",
  "VERTICAL_REVERSE",
  "DIAGONAL",
  "DIAGONAL_REVERSE",
  "CONIC",
] as const;

export type RemotionGradientDirectionKey = (typeof REMOTION_GRADIENT_DIRECTION_KEYS)[number];

export type RemotionTemplateVariationGradient = {
  type: RemotionGradientTypeKey;
  direction: RemotionGradientDirectionKey;
};

const TYPE_WHITELIST = new Set<string>(REMOTION_GRADIENT_TYPE_KEYS);
const DIRECTION_WHITELIST = new Set<string>(REMOTION_GRADIENT_DIRECTION_KEYS);

const CSS_DIRECTION_TO_KEY: Record<string, RemotionGradientDirectionKey> = {
  "to right": "HORIZONTAL",
  "to left": "HORIZONTAL_REVERSE",
  "to bottom": "VERTICAL",
  "to top": "VERTICAL_REVERSE",
  "to bottom right": "DIAGONAL",
  "to top left": "DIAGONAL_REVERSE",
};

function isGradientTypeKey(value: string): value is RemotionGradientTypeKey {
  return TYPE_WHITELIST.has(value);
}

function isGradientDirectionKey(value: string): value is RemotionGradientDirectionKey {
  return DIRECTION_WHITELIST.has(value);
}

function spacedLabelToCamelCase(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

function normalizeGradientLabelForAlias(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** CMS display labels that do not camelCase to Remotion keys (e.g. Radial Primary → primaryRadial). */
const GRADIENT_TYPE_LABEL_ALIASES: Record<string, RemotionGradientTypeKey> = {
  radialprimary: "primaryRadial",
  "radial primary": "primaryRadial",
  radialsecondary: "secondaryRadial",
  "radial secondary": "secondaryRadial",
  conic: "conicGradient",
  "conic gradient": "conicGradient",
  mesh: "meshGradient",
  "mesh gradient": "meshGradient",
  hardstop: "hardStopGradient",
  "hard stop": "hardStopGradient",
  "hard stop gradient": "hardStopGradient",
  primaryadvanced: "primaryAdvanced",
  "primary advanced": "primaryAdvanced",
  secondaryadvanced: "secondaryAdvanced",
  "secondary advanced": "secondaryAdvanced",
};

function lookupGradientTypeAlias(candidate: string): RemotionGradientTypeKey | null {
  const normalized = normalizeGradientLabelForAlias(candidate);
  return GRADIENT_TYPE_LABEL_ALIASES[normalized] ?? null;
}

/**
 * Maps a CMS gradient `type` or `name` to a Remotion `templateVariation.gradient.type` key.
 * Does not accept CSS gradient kinds (`linear`, `radial`, `conic`) — those belong on Texture overlay path.
 */
export function normalizeTemplateGradientTypeToRemotionKey(
  candidate: string | null | undefined,
): RemotionGradientTypeKey | null {
  const trimmed = candidate?.trim() ?? "";
  if (trimmed === "") return null;

  const lowerCssType = trimmed.toLowerCase();
  if (lowerCssType === "linear" || lowerCssType === "radial" || lowerCssType === "conic") {
    return null;
  }

  if (isGradientTypeKey(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  for (const key of REMOTION_GRADIENT_TYPE_KEYS) {
    if (key.toLowerCase() === lower) return key;
  }

  const camel = spacedLabelToCamelCase(trimmed);
  if (camel !== "" && isGradientTypeKey(camel)) return camel;

  const camelLower = camel.toLowerCase();
  for (const key of REMOTION_GRADIENT_TYPE_KEYS) {
    if (key.toLowerCase() === camelLower) return key;
  }

  const alias = lookupGradientTypeAlias(trimmed);
  if (alias !== null) return alias;

  return null;
}

/**
 * Maps CMS `direction` to Remotion `templateVariation.gradient.direction` enum key.
 */
export function normalizeTemplateGradientDirectionToRemotionKey(
  candidate: string | null | undefined,
): RemotionGradientDirectionKey | null {
  const trimmed = candidate?.trim() ?? "";
  if (trimmed === "") return null;

  if (isGradientDirectionKey(trimmed)) return trimmed;

  const upper = trimmed.toUpperCase();
  if (isGradientDirectionKey(upper)) return upper;

  const fromCss = CSS_DIRECTION_TO_KEY[trimmed.toLowerCase()];
  if (fromCss !== undefined) return fromCss;

  const spacedUpper = trimmed.replace(/\s+/g, "_").toUpperCase();
  if (isGradientDirectionKey(spacedUpper)) return spacedUpper;

  return null;
}

function resolveTypeFromGradientField(gradient: unknown): RemotionGradientTypeKey | null {
  if (typeof gradient === "string") {
    return normalizeTemplateGradientTypeToRemotionKey(gradient);
  }

  if (gradient == null || typeof gradient !== "object" || Array.isArray(gradient)) {
    return null;
  }

  const record = gradient as Record<string, unknown>;
  const typeRaw = typeof record["type"] === "string" ? record["type"].trim() : "";
  if (typeRaw !== "") {
    const fromType = normalizeTemplateGradientTypeToRemotionKey(typeRaw);
    if (fromType !== null) return fromType;
  }

  const name = typeof record["name"] === "string" ? record["name"].trim() : "";
  if (name !== "") {
    return normalizeTemplateGradientTypeToRemotionKey(name);
  }

  return null;
}

function resolveDirectionFromGradientField(gradient: unknown): RemotionGradientDirectionKey | null {
  if (typeof gradient === "string") {
    return "HORIZONTAL";
  }

  if (gradient == null || typeof gradient !== "object" || Array.isArray(gradient)) {
    return null;
  }

  const record = gradient as Record<string, unknown>;
  const direction = typeof record["direction"] === "string" ? record["direction"].trim() : "";
  if (direction === "") return null;

  return normalizeTemplateGradientDirectionToRemotionKey(direction);
}

function resolveFromGradientField(gradient: unknown): RemotionTemplateVariationGradient | null {
  const type = resolveTypeFromGradientField(gradient);
  if (type === null) return null;

  const direction = resolveDirectionFromGradientField(gradient) ?? "HORIZONTAL";

  return { type, direction };
}

/** Resolve a CMS gradient catalog row or template_option.gradient object for Remotion preview. */
export function resolveRemotionGradientFromCatalogGradient(
  gradient: unknown,
): RemotionTemplateVariationGradient | null {
  return resolveFromGradientField(gradient);
}

/**
 * Reads Remotion `templateVariation.gradient` from account branding (`template_option` first, then theme JSON).
 */
export function readRemotionGradientFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationGradient | null {
  const opt = branding?.template_option;
  if (opt != null && typeof opt === "object" && !Array.isArray(opt)) {
    const fromOption = resolveFromGradientField((opt as Record<string, unknown>)["gradient"]);
    if (fromOption !== null) return fromOption;
  }

  const themeRow = branding?.theme?.theme;
  if (themeRow != null && typeof themeRow === "object" && !Array.isArray(themeRow)) {
    const fromTheme = resolveFromGradientField((themeRow as Record<string, unknown>)["gradient"]);
    if (fromTheme !== null) return fromTheme;
  }

  return null;
}
