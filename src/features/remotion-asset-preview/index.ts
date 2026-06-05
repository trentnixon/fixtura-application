export { AssetPreviewCarousel } from "./components/asset-preview-carousel";
export type { AssetPreviewCarouselProps } from "./components/asset-preview-carousel";
export { RemotionThumbnailStill } from "./components/remotion-thumbnail-still";
export type { RemotionThumbnailStillProps } from "./components/remotion-thumbnail-still";
export { useRemotionAssetPreview } from "./hooks/use-remotion-asset-preview";
export type {
  RemotionAssetPreviewInput,
  RemotionAssetPreviewState,
  RemotionAssetPreviewStatus,
  ThumbnailFrameTarget,
} from "./types";

export { buildThumbnailFrameTargets } from "./utils/build-thumbnail-frame-targets";
export {
  CRICKET_DEFAULT_EXAMPLE_DATASET_PATH,
  getExampleDatasetPathForSport,
} from "./utils/example-dataset-loader";
export { mergeAccountBrandingIntoDataset } from "./utils/merge-account-branding-into-dataset";
export type { MergeAccountBrandingInput } from "./utils/merge-account-branding-into-dataset";
export { buildClubSponsorsPayloadFromAccountSponsors } from "./utils/build-club-sponsors-payload-from-account-sponsors";
export type {
  ClubSponsorsPayload,
  RemotionClubSponsorRow,
} from "./utils/build-club-sponsors-payload-from-account-sponsors";
export { resolveTemplateModeSlugFromBranding } from "./utils/resolve-template-mode-slug-from-branding";
export { isCricketSport, normalizeSport } from "./utils/sport";
export { readRemotionModeFromBrandingThemeJson } from "./utils/read-remotion-mode-from-branding-theme";
export {
  normalizeTemplateGradientDirectionToRemotionKey,
  normalizeTemplateGradientTypeToRemotionKey,
  readRemotionGradientFromBranding,
} from "./utils/read-remotion-gradient-from-branding";
export type { RemotionTemplateVariationGradient } from "./utils/read-remotion-gradient-from-branding";
export {
  normalizeTemplatePaletteNameToRemotionKey,
  readRemotionPaletteKeyFromBranding,
} from "./utils/read-remotion-palette-key-from-branding";
export {
  buildRemotionPaletteLayoutColorPairs,
  remotionPaletteLayoutSplitBackground,
  resolveRemotionPaletteLayoutColors,
  resolveRemotionPaletteLayoutColorsFromKey,
} from "./utils/resolve-remotion-palette-layout-colors";
export type { RemotionPaletteLayoutColors } from "./utils/resolve-remotion-palette-layout-colors";
export {
  readRemotionBackgroundAssetsPatch,
  readRemotionImageFromBranding,
  readRemotionNoiseFromBranding,
  readRemotionParticleFromBranding,
  readRemotionTextureFromBranding,
  readRemotionVideoFromBranding,
  REMOTION_BACKGROUND_TV_KEYS,
} from "./utils/read-remotion-background-assets-from-branding";
export type {
  RemotionBackgroundAssetsPatch,
  RemotionBackgroundTvKey,
  RemotionTemplateVariationImage,
  RemotionTemplateVariationNoise,
  RemotionTemplateVariationParticle,
  RemotionTemplateVariationTexture,
  RemotionTemplateVariationVideo,
} from "./utils/read-remotion-background-assets-from-branding";
export { readUseBackgroundFromAccountBranding } from "./utils/read-use-background-from-account-branding";
export { templateModeSlugToRemotionMode } from "./utils/template-mode-to-remotion-mode";
