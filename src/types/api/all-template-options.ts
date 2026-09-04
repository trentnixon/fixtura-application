/**
 * GET /api/template-categories/all-template-options (via BFF /api/accounts/:id/all-template-options).
 * @see .comms/API/handoff-all-template-options.md
 */

import type { TemplateUseBackgroundRead } from "./template-options";

/** Success body from ctx.send */
export interface AllTemplateOptionsResponse {
  data: AllTemplateOptionsPayload;
}

export interface AllTemplateOptionsPayload {
  categories: TemplateCategoryCatalogItem[];
  modes: TemplateModeItem[];
  palettes: TemplatePaletteItem[];
  gradients: TemplateGradientItem[];
  images: TemplateImageItem[];
  noises: TemplateNoiseItem[];
  particles: TemplateParticleItem[];
  patterns: TemplatePatternItem[];
  textures: TemplateTextureCatalogItem[];
  videos: TemplateVideoItem[];
  animations: AnimationPresetCatalogItem[];
  defaultAnimationPresetId: string | null;
  currentSelection: CurrentTemplateSelection | null;
}

export type AnimationSchemaControlType = "number" | "enum" | "unknown";

export interface AnimationSchemaControl {
  type: AnimationSchemaControlType;
  label: string;
  enumValues?: string[];
  affectsRendering?: boolean;
}

export interface TemplateAnimationItem {
  id: number;
  presetId: string;
  name: string | null;
}

export interface AnimationPresetCatalogItem {
  id: number;
  presetId: string;
  name: string | null;
  description: string | null;
  defaultConfiguration: Record<string, unknown>;
  /** Not on aggregate GET — catalogue/operator tooling only. */
  configurationSchema?: Record<string, AnimationSchemaControl | unknown>;
  isDefault: boolean;
  sortOrder: number;
  catalogueVersion: string | null;
}

/** Same as {@link AllTemplateOptionsPayload}; kept for existing imports. */
export type AllTemplateOptionsData = AllTemplateOptionsPayload;

export interface MediaSummary {
  id: number;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
}

export interface AudioOptionItem {
  id: number;
  name: string | null;
  url: string | null;
  compositionId: string | null;
  componentName: string | null;
}

export interface BundleAudioSummary {
  id: number;
  name: string | null;
  audioOptions: AudioOptionItem[];
}

export interface TemplateCategoryCatalogItem {
  id: number;
  name: string | null;
  slug: string | null;
  divideFixturesBy: string | null;
  isPrivate: boolean;
  bundleAudio: BundleAudioSummary | null;
}

/** GET /api/template-categories/list-for-selection (via BFF /api/account/template-categories/list-for-selection). */
export interface TemplateCategoriesForSelectionResponse {
  data: TemplateCategoryCatalogItem[];
}

export interface TemplateModeItem {
  id: number;
  name: string | null;
  slug: string | null;
}

export interface TemplatePaletteItem {
  id: number;
  name: string | null;
  value: string | null;
}

export interface TemplateGradientItem {
  id: number;
  name: string | null;
  type: string | null;
  direction: string | null;
}

export interface TemplateImageItem {
  id: number;
  name: string | null;
  animationType: string | null;
  animationDirection: string | null;
  overlayStyle: string | null;
  gradientType: string | null;
  overlayOpacity: number | null;
}

export interface TemplateNoiseItem {
  id: number;
  name: string | null;
  noiseType: string | null;
}

export interface TemplateParticleItem {
  id: number;
  name: string | null;
  particleType: string | null;
  particleCount: number | null;
  speed: number | null;
  direction: string | null;
  animationType: string | null;
}

export interface TemplatePatternItem {
  id: number;
  name: string | null;
  patternType: string | null;
  animation: string | null;
  scale: number | null;
  rotation: number | null;
  opacity: number | null;
  animationDuration: number | null;
  animationSpeed: number | null;
}

export interface TemplateTextureCatalogItem {
  id: number;
  name: string | null;
  opacity: number | null;
  blendMode: string | null;
  texture: MediaSummary | null;
}

export interface TemplateVideoItem {
  id: number;
  name: string | null;
  position: string | null;
  size: string | null;
  loop: boolean | null;
  muted: boolean | null;
  offthread: boolean | null;
  volume: number | null;
  rate: number | null;
  overlay: string | null;
}

/** Subset of category on template-option (mapCategoryRef) */
export interface TemplateCategoryRef {
  id: number;
  name: string | null;
  slug: string | null;
  divideFixturesBy: string | null;
}

/** Current template-option row for forms (mapCurrentSelection) */
export interface CurrentTemplateSelection {
  id: number;
  /** CMS enum string (includes legacy read values). */
  useBackground: TemplateUseBackgroundRead | null;
  templateAnimation: TemplateAnimationItem | null;
  templateCategory: TemplateCategoryRef | null;
  templatePalette: TemplatePaletteItem | null;
  templateGradient: TemplateGradientItem | null;
  templateImage: TemplateImageItem | null;
  templateNoise: TemplateNoiseItem | null;
  templateParticle: TemplateParticleItem | null;
  templatePattern: TemplatePatternItem | null;
  templateTexture: TemplateTextureCatalogItem | null;
  templateVideo: TemplateVideoItem | null;
  templateMode: TemplateModeItem | null;
}
