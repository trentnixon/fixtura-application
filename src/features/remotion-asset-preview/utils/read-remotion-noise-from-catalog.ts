import type { TemplateNoiseItem } from "@/types/api/all-template-options";

/** Remotion `NoiseBackground` variant keys (vendor + CMS ui.type). */
export const REMOTION_NOISE_TYPE_KEYS = [
  "default",
  "subtle",
  "grain",
  "wave",
  "fog",
  "static",
  "floatingParticles",
  "dynamicParticles",
  "triangleSwarm",
  "pulsingCircles",
  "digitalRain",
  "gradientGrid",
  "spokes",
  "geometric",
] as const;

export type RemotionNoiseTypeKey = (typeof REMOTION_NOISE_TYPE_KEYS)[number];

const TYPE_WHITELIST = new Set<string>(REMOTION_NOISE_TYPE_KEYS);

function isNoiseTypeKey(value: string): value is RemotionNoiseTypeKey {
  return TYPE_WHITELIST.has(value);
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

function normalizeNoiseLabelForAlias(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function normalizeNoiseLookupToken(value: string): string {
  return value.trim().replace(/[_-]+/g, " ");
}

/** CMS display labels that do not camelCase cleanly to Remotion keys. */
const NOISE_TYPE_LABEL_ALIASES: Record<string, RemotionNoiseTypeKey> = {
  "digital rain": "digitalRain",
  digitalrain: "digitalRain",
  "digital wave": "digitalRain",
  digitalwave: "digitalRain",
  "digital waves": "digitalRain",
  digitalwaves: "digitalRain",
  "gradient grid": "gradientGrid",
  gradientgrid: "gradientGrid",
  "pulsing circles": "pulsingCircles",
  pulsingcircles: "pulsingCircles",
  "floating particles": "floatingParticles",
  floatingparticles: "floatingParticles",
  "floating particle": "floatingParticles",
  floatingparticle: "floatingParticles",
  "dynamic particles": "dynamicParticles",
  dynamicparticles: "dynamicParticles",
  "dynamic particle": "dynamicParticles",
  dynamicparticle: "dynamicParticles",
  "triangle swarm": "triangleSwarm",
  triangleswarm: "triangleSwarm",
  "triangle swarms": "triangleSwarm",
  spoke: "spokes",
  graphics: "geometric",
  geometric: "geometric",
};

function lookupNoiseTypeAlias(candidate: string): RemotionNoiseTypeKey | null {
  const normalized = normalizeNoiseLabelForAlias(candidate);
  return NOISE_TYPE_LABEL_ALIASES[normalized] ?? null;
}

/**
 * Maps a CMS noise `noiseType` or `name` to a Remotion `NoiseBackground` variant key.
 */
export function normalizeTemplateNoiseTypeToRemotionKey(
  candidate: string | null | undefined,
): RemotionNoiseTypeKey | null {
  const trimmed = normalizeNoiseLookupToken(candidate ?? "");
  if (trimmed === "") return null;

  if (isNoiseTypeKey(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  for (const key of REMOTION_NOISE_TYPE_KEYS) {
    if (key.toLowerCase() === lower) return key;
  }

  const alias = lookupNoiseTypeAlias(trimmed);
  if (alias !== null) return alias;

  const camel = spacedLabelToCamelCase(trimmed);
  if (camel !== "" && isNoiseTypeKey(camel)) return camel;

  const camelLower = camel.toLowerCase();
  for (const key of REMOTION_NOISE_TYPE_KEYS) {
    if (key.toLowerCase() === camelLower) return key;
  }

  const aliasFromCamel = lookupNoiseTypeAlias(camel);
  if (aliasFromCamel !== null) return aliasFromCamel;

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") return candidate.trim();
  }
  return null;
}

function resolveNoiseTypeCandidatesFromRow(row: Record<string, unknown>): string[] {
  const ui = asRecord(row["ui"]);
  const candidates = [
    pickString(row["noiseType"]),
    pickString(row["type"]),
    ui ? pickString(ui["type"]) : null,
    pickString(row["name"]),
    pickString(row["value"]),
  ];

  return candidates.filter((candidate): candidate is string => candidate !== null);
}

/** Resolve a CMS noise catalog row or template_option.noise object for Remotion preview. */
export function resolveRemotionNoiseFromCatalogNoise(
  noise: unknown,
): { type: RemotionNoiseTypeKey } | null {
  if (typeof noise === "string") {
    const type = normalizeTemplateNoiseTypeToRemotionKey(noise);
    return type === null ? null : { type };
  }

  const row = asRecord(noise);
  if (row === null) return null;

  for (const candidate of resolveNoiseTypeCandidatesFromRow(row)) {
    const type = normalizeTemplateNoiseTypeToRemotionKey(candidate);
    if (type !== null) return { type };
  }

  return null;
}

export function resolveRemotionNoiseTypeFromCatalogItem(
  item: TemplateNoiseItem,
): RemotionNoiseTypeKey | null {
  return resolveRemotionNoiseFromCatalogNoise(item)?.type ?? null;
}
