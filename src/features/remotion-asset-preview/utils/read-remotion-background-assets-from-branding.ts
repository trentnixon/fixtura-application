import { resolveRemotionNoiseFromCatalogNoise } from "./read-remotion-noise-from-catalog";
import { readUseBackgroundFromAccountBranding } from "./read-use-background-from-account-branding";
import { resolvePreviewMediaUrl } from "./resolve-preview-media-url";

import type { AccountBrandingData } from "@/types/api/account";

export const REMOTION_BACKGROUND_TV_KEYS = [
  "texture",
  "noise",
  "image",
  "video",
  "particle",
  "animation",
] as const;

export type RemotionBackgroundTvKey = (typeof REMOTION_BACKGROUND_TV_KEYS)[number];

export type RemotionTemplateVariationTexture = {
  name?: string | null;
  url?: string | null;
  repeat?: string;
  scale?: string;
  position?: string | null;
  overlay?: {
    opacity?: number | null;
    blendMode?: string | null;
    color?: string | null;
  };
};

export type RemotionTemplateVariationNoise = {
  type: string;
};

export type RemotionTemplateVariationParticle = {
  type?: string | null;
  particleCount?: number | string | null;
  speed?: number | null;
  direction?: string | null;
  animation?: string | null;
};

export type RemotionTemplateVariationImage = {
  url?: string | null;
  type?: string | null;
  direction?: string | null;
  overlayStyle?: string | null;
  gradientType?: string | null;
  overlayOpacity?: number | null;
  ratio?: string | null;
  width?: number | null;
  height?: number | null;
};

export type RemotionTemplateVariationAnimation = Record<string, unknown> & {
  type: string;
};

export type RemotionTemplateVariationVideo = {
  url?: string | null;
  fallbackUrl?: string | null;
  position?: string | null;
  size?: string | null;
  loop?: boolean | null;
  muted?: boolean | null;
  overlay?: Record<string, unknown> | null;
  useOffthreadVideo?: boolean | null;
  volume?: number | null;
  playbackRate?: number | null;
};

export type RemotionBackgroundAssetsPatch = Partial<Record<RemotionBackgroundTvKey, unknown>>;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readTemplateOptionField(
  branding: AccountBrandingData | null | undefined,
  field: string,
): Record<string, unknown> | null {
  const opt = branding?.template_option;
  if (opt == null || typeof opt !== "object" || Array.isArray(opt)) return null;
  return asRecord((opt as Record<string, unknown>)[field]);
}

function readThemeField(
  branding: AccountBrandingData | null | undefined,
  field: string,
): Record<string, unknown> | null {
  const themeRow = branding?.theme?.theme;
  if (themeRow == null || typeof themeRow !== "object" || Array.isArray(themeRow)) return null;
  return asRecord((themeRow as Record<string, unknown>)[field]);
}

function pickString(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim() !== "") return c.trim();
  }
  return null;
}

function pickNumber(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string" && c.trim() !== "") {
      const n = Number(c);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function pickBoolean(...candidates: unknown[]): boolean | null {
  for (const value of candidates) {
    if (typeof value === "boolean") return value;
  }
  return null;
}

function resolveTextureRow(
  branding: AccountBrandingData | null | undefined,
): Record<string, unknown> | null {
  return readTemplateOptionField(branding, "texture") ?? readThemeField(branding, "texture");
}

export function readRemotionTextureFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationTexture | null {
  const row = resolveTextureRow(branding);
  if (row === null) return null;

  const media = asRecord(row["texture"]);
  const url = resolvePreviewMediaUrl(pickString(media?.["url"], row["url"]));
  const name = pickString(row["name"]);
  if (url === null && name === null) return null;

  const opacity = pickNumber(row["opacity"]);
  const blendMode = pickString(row["blendMode"]);
  const overlay =
    opacity !== null || blendMode !== null
      ? {
          ...(opacity !== null ? { opacity } : {}),
          ...(blendMode !== null ? { blendMode } : {}),
        }
      : undefined;

  return {
    ...(name !== null ? { name } : {}),
    ...(url !== null ? { url } : {}),
    repeat: pickString(row["repeat"]) ?? "cover",
    scale: pickString(row["scale"]) ?? "100%",
    ...(overlay !== undefined ? { overlay } : {}),
  };
}

export function readRemotionNoiseFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationNoise | null {
  const opt = branding?.template_option;
  if (opt != null && typeof opt === "object" && !Array.isArray(opt)) {
    const fromOption = resolveRemotionNoiseFromCatalogNoise(
      (opt as Record<string, unknown>)["noise"],
    );
    if (fromOption !== null) return fromOption;
  }

  const themeRow = branding?.theme?.theme;
  if (themeRow != null && typeof themeRow === "object" && !Array.isArray(themeRow)) {
    const fromTheme = resolveRemotionNoiseFromCatalogNoise(
      (themeRow as Record<string, unknown>)["noise"],
    );
    if (fromTheme !== null) return fromTheme;
  }

  return null;
}

export function readRemotionParticleFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationParticle | null {
  const row = readTemplateOptionField(branding, "particle") ?? readThemeField(branding, "particle");
  if (row === null) return null;

  const type = pickString(row["particleType"], row["type"]);
  const particleCount = row["particleCount"];
  const speed = pickNumber(row["speed"]);
  const direction = pickString(row["direction"]);
  const animation = pickString(row["animationType"], row["animation"]);

  if (
    type === null &&
    particleCount === undefined &&
    speed === null &&
    direction === null &&
    animation === null
  ) {
    return null;
  }

  const countValue =
    typeof particleCount === "number" || typeof particleCount === "string" ? particleCount : null;

  return {
    ...(type !== null ? { type } : {}),
    ...(countValue !== null ? { particleCount: countValue } : {}),
    ...(speed !== null ? { speed } : {}),
    ...(direction !== null ? { direction } : {}),
    ...(animation !== null ? { animation } : {}),
  };
}

export function readRemotionImageFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationImage | null {
  const row = readTemplateOptionField(branding, "image") ?? readThemeField(branding, "image");
  if (row === null) return null;

  const media = asRecord(row["image"]) ?? asRecord(row["media"]);
  const url = pickString(media?.["url"], row["url"]);
  const type = pickString(row["animationType"], row["type"]);
  const direction = pickString(row["animationDirection"], row["direction"]);
  const overlayStyle = pickString(row["overlayStyle"]);
  const gradientType = pickString(row["gradientType"]);
  const overlayOpacity = pickNumber(row["overlayOpacity"]);
  const width = pickNumber(media?.["width"], row["width"]);
  const height = pickNumber(media?.["height"], row["height"]);

  if (
    url === null &&
    type === null &&
    direction === null &&
    overlayStyle === null &&
    gradientType === null &&
    overlayOpacity === null &&
    width === null &&
    height === null
  ) {
    return null;
  }

  return {
    ...(url !== null ? { url } : {}),
    ...(type !== null ? { type } : {}),
    ...(direction !== null ? { direction } : {}),
    ...(overlayStyle !== null ? { overlayStyle } : {}),
    ...(gradientType !== null ? { gradientType } : {}),
    ...(overlayOpacity !== null ? { overlayOpacity } : {}),
    ...(width !== null ? { width } : {}),
    ...(height !== null ? { height } : {}),
  };
}

export function readRemotionVideoFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationVideo | null {
  const row = readTemplateOptionField(branding, "video") ?? readThemeField(branding, "video");
  if (row === null) return null;

  const videoBg = asRecord(row["videoBackground"]);
  const videoIntro = asRecord(row["videoIntro"]);
  const nestedMedia = asRecord(row["video"]) ?? asRecord(row["media"]);
  const url = pickString(videoBg?.["url"], nestedMedia?.["url"], row["url"]);
  const position = pickString(row["position"]);
  const size = pickString(row["size"]);
  const loop = pickBoolean(row["loop"]);
  const muted = pickBoolean(row["muted"]);
  const volume = pickNumber(row["volume"]);
  const playbackRate = pickNumber(row["playbackRate"], row["rate"]);
  const overlayRaw = row["overlay"];
  const overlay =
    overlayRaw != null && typeof overlayRaw === "object" && !Array.isArray(overlayRaw)
      ? (overlayRaw as Record<string, unknown>)
      : typeof overlayRaw === "string"
        ? { color: overlayRaw }
        : null;
  const useOffthreadVideo = pickBoolean(row["offthread"], row["useOffthreadVideo"]);

  if (
    url === null &&
    position === null &&
    size === null &&
    loop === null &&
    muted === null &&
    volume === null &&
    playbackRate === null &&
    overlay === null &&
    useOffthreadVideo === null &&
    videoIntro === null
  ) {
    return null;
  }

  return {
    ...(url !== null ? { url } : {}),
    ...(position !== null ? { position } : {}),
    ...(size !== null ? { size } : {}),
    ...(loop !== null ? { loop } : {}),
    ...(muted !== null ? { muted } : {}),
    ...(volume !== null ? { volume } : {}),
    ...(playbackRate !== null ? { playbackRate } : {}),
    ...(overlay !== null ? { overlay } : {}),
    ...(useOffthreadVideo !== null ? { useOffthreadVideo } : {}),
    ...(videoIntro !== null ? { videoIntro } : {}),
    ...(videoBg !== null && url === null ? { videoBackground: videoBg } : {}),
  };
}

export function readRemotionAnimationFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionTemplateVariationAnimation | null {
  const row =
    readTemplateOptionField(branding, "animation") ?? readThemeField(branding, "animation");
  if (row === null) return null;

  const type = pickString(row["type"]);
  if (type === null) return null;

  return { ...row, type } as RemotionTemplateVariationAnimation;
}

const USE_BACKGROUND_TO_TV_KEY: Partial<Record<string, RemotionBackgroundTvKey>> = {
  Texture: "texture",
  Graphics: "noise",
  Image: "image",
  Video: "video",
  Particle: "particle",
  Animated: "animation",
};

function readAssetForUseBackground(
  branding: AccountBrandingData | null | undefined,
  useBackground: string,
): unknown | null {
  switch (useBackground) {
    case "Texture":
      return readRemotionTextureFromBranding(branding);
    case "Graphics":
      return readRemotionNoiseFromBranding(branding);
    case "Image":
      return readRemotionImageFromBranding(branding);
    case "Video":
      return readRemotionVideoFromBranding(branding);
    case "Particle":
      return readRemotionParticleFromBranding(branding);
    case "Animated":
      return readRemotionAnimationFromBranding(branding);
    default:
      return null;
  }
}

/**
 * Returns at most one `templateVariation` background asset for the active `useBackground`.
 */
export function readRemotionBackgroundAssetsPatch(
  branding: AccountBrandingData | null | undefined,
): RemotionBackgroundAssetsPatch {
  const useBackground = readUseBackgroundFromAccountBranding(branding);
  if (useBackground === null) return {};

  const tvKey = USE_BACKGROUND_TO_TV_KEY[useBackground];
  if (tvKey === undefined) return {};

  const value = readAssetForUseBackground(branding, useBackground);
  if (value === null) return {};

  return { [tvKey]: value };
}
