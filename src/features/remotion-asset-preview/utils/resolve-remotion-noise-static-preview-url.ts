import type { RemotionNoiseTypeKey } from "./read-remotion-noise-from-catalog";

/** Variants rendered via ParticleNoise or SVG graphics in Remotion (static tile thumbs). */
export const REMOTION_NOISE_STATIC_PREVIEW_TYPES = [
  "floatingParticles",
  "dynamicParticles",
  "triangleSwarm",
  "digitalRain",
  "spokes",
  "geometric",
] as const;

export type RemotionNoiseStaticPreviewType = (typeof REMOTION_NOISE_STATIC_PREVIEW_TYPES)[number];

const STATIC_PREVIEW_TYPE_SET = new Set<string>(REMOTION_NOISE_STATIC_PREVIEW_TYPES);

export function isRemotionNoiseStaticPreviewType(
  type: RemotionNoiseTypeKey,
): type is RemotionNoiseStaticPreviewType {
  return STATIC_PREVIEW_TYPE_SET.has(type);
}

const NOISE_STATIC_PREVIEW_BASE_PATH = "/template-builder/noise-previews";

export function resolveRemotionNoiseStaticPreviewUrl(type: RemotionNoiseTypeKey): string | null {
  if (!isRemotionNoiseStaticPreviewType(type)) return null;
  return `${NOISE_STATIC_PREVIEW_BASE_PATH}/${type}.svg`;
}
