/** CMS enumeration values exposed through the UI contract */
export type TemplateVideoPosition = "center" | "left" | "right" | "top" | "bottom";

export type TemplateVideoSize = "cover" | "contain";

/**
 * Arbitrary overlay payload from CMS JSON.
 * Narrow this when the app defines a fixed overlay schema.
 */
export type TemplateVideoOverlay = Record<string, unknown>;

export type TemplateVideoUiSettings = {
  position: TemplateVideoPosition | null;
  size: TemplateVideoSize | null;
  loop: boolean | null;
  muted: boolean | null;
  overlay: TemplateVideoOverlay;
  useOffthreadVideo: boolean | null;
  /** Strapi decimal — coerce if the UI needs a number */
  volume: string | number | null;
  /** Strapi decimal — coerce if the UI needs a number */
  playbackRate: string | number | null;
};

export type TemplateVideoUiItem = {
  id: number;
  name: string | null;
  ui: TemplateVideoUiSettings;
};

export type GetTemplateVideosForUiResponse = {
  data: TemplateVideoUiItem[];
};

export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
