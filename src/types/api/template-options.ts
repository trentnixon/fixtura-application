/** Allowed on PUT — @see .comms/handoff/2026-08-28-app-handoff-animated-backgrounds.md */
export const TEMPLATE_USE_BACKGROUND_WRITE_VALUES = [
  "Solid",
  "Gradient",
  "Video",
  "Image",
  "Texture",
  "Animated",
] as const;

/** Legacy modes returned on GET for existing accounts; rejected on write. */
export const TEMPLATE_USE_BACKGROUND_LEGACY_READ_VALUES = [
  "Graphics",
  "Particle",
  "Pattern",
  "Noise",
  "Generated",
] as const;

/** Full enum as returned by CMS GET `currentSelection.useBackground`. */
export const TEMPLATE_USE_BACKGROUND_READ_VALUES = [
  ...TEMPLATE_USE_BACKGROUND_WRITE_VALUES,
  ...TEMPLATE_USE_BACKGROUND_LEGACY_READ_VALUES,
] as const;

/** @deprecated Prefer {@link TEMPLATE_USE_BACKGROUND_WRITE_VALUES} for editor pickers. */
export const TEMPLATE_USE_BACKGROUND_VALUES = TEMPLATE_USE_BACKGROUND_WRITE_VALUES;

export type TemplateUseBackgroundWrite = (typeof TEMPLATE_USE_BACKGROUND_WRITE_VALUES)[number];
export type TemplateUseBackgroundLegacyRead =
  (typeof TEMPLATE_USE_BACKGROUND_LEGACY_READ_VALUES)[number];
export type TemplateUseBackgroundRead = (typeof TEMPLATE_USE_BACKGROUND_READ_VALUES)[number];

/** Editor / PUT body background mode. */
export type TemplateUseBackground = TemplateUseBackgroundWrite;

export function isTemplateUseBackgroundWrite(value: string): value is TemplateUseBackgroundWrite {
  return (TEMPLATE_USE_BACKGROUND_WRITE_VALUES as readonly string[]).includes(value);
}

export function isTemplateUseBackgroundRead(value: string): value is TemplateUseBackgroundRead {
  return (TEMPLATE_USE_BACKGROUND_READ_VALUES as readonly string[]).includes(value);
}

export function isForbiddenLegacyUseBackground(
  value: string,
): value is TemplateUseBackgroundLegacyRead {
  return (TEMPLATE_USE_BACKGROUND_LEGACY_READ_VALUES as readonly string[]).includes(value);
}

/** @deprecated Use {@link isTemplateUseBackgroundWrite} for PUT validation. */
export function isTemplateUseBackground(value: string): value is TemplateUseBackground {
  return isTemplateUseBackgroundWrite(value);
}

/** Client-side preview shape (`{ type: presetId, ...defaultConfiguration }`). Not on GET `currentSelection`. */
export type TemplateAnimationConfig = Record<string, unknown> & {
  type: string;
};

/** Required on every PUT. Optional relation keys may be omitted (preserve) or null (clear). */
export type PutTemplateOptionsBody = {
  templateCategoryId: number;
  templateModeId: number;
  useBackground: TemplateUseBackgroundWrite;
  templatePaletteId?: number | null;
  templateGradientId?: number | null;
  templateImageId?: number | null;
  templateNoiseId?: number | null;
  templateParticleId?: number | null;
  templatePatternId?: number | null;
  templateTextureId?: number | null;
  templateVideoId?: number | null;
  /** Relation catalogue id when selecting/switching Animated; omit on later saves to preserve link. */
  templateAnimationId?: number | null;
  /** Legacy — ignored by CMS; omit on new saves. */
  animation?: TemplateAnimationConfig;
};

export type PutTemplateOptionsErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

/** BFF success (201 create / 200 update). */
export type PutTemplateOptionsSuccess = {
  data: {
    templateOptionId: number;
  };
};
