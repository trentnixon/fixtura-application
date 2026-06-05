/** Strapi `template-option.useBackground` enum — @see template-builder/.comms/response/handoff-put-template-options.md */
export const TEMPLATE_USE_BACKGROUND_VALUES = [
  "Solid",
  "Gradient",
  "Video",
  "Image",
  "Graphics",
  "Texture",
  "Particle",
] as const;

export type TemplateUseBackground = (typeof TEMPLATE_USE_BACKGROUND_VALUES)[number];

export function isTemplateUseBackground(value: string): value is TemplateUseBackground {
  return (TEMPLATE_USE_BACKGROUND_VALUES as readonly string[]).includes(value);
}

/** Required on every PUT. Optional relation keys may be omitted (preserve) or null (clear). */
export type PutTemplateOptionsBody = {
  templateCategoryId: number;
  templateModeId: number;
  useBackground: TemplateUseBackground;
  templatePaletteId?: number | null;
  templateGradientId?: number | null;
  templateImageId?: number | null;
  templateNoiseId?: number | null;
  templateParticleId?: number | null;
  templatePatternId?: number | null;
  templateTextureId?: number | null;
  templateVideoId?: number | null;
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
