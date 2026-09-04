export { AssetPreviewCarousel } from "./components/asset-preview-carousel";
export type { AssetPreviewCarouselProps } from "./components/asset-preview-carousel";
export { AssetPreviewDisplayModeToggle } from "./components/asset-preview-display-mode-toggle";
export type { AssetPreviewDisplayModeToggleProps } from "./components/asset-preview-display-mode-toggle";
export { AssetPreviewStage } from "./components/asset-preview-stage";
export type { AssetPreviewStageProps } from "./components/asset-preview-stage";
export { RemotionThumbnailStill } from "./components/remotion-thumbnail-still";
export type { RemotionThumbnailStillProps } from "./components/remotion-thumbnail-still";
export { RemotionVideoPlayer } from "./components/remotion-video-player";
export type { RemotionVideoPlayerProps } from "./components/remotion-video-player";
export { useRemotionAssetPreview } from "./hooks/use-remotion-asset-preview";
export type {
  AssetPreviewDisplayMode,
  RemotionAssetPreviewInput,
  RemotionAssetPreviewState,
  RemotionAssetPreviewStatus,
  RemotionPreviewDraft,
  ThumbnailFrameTarget,
  AssembleAccountRemotionPreviewSource,
} from "./types";

export { buildThumbnailFrameTargets } from "./utils/build-thumbnail-frame-targets";
export {
  CRICKET_DEFAULT_EXAMPLE_DATASET_PATH,
  getExampleDatasetPathForSport,
} from "./utils/example-dataset-loader";
export { assembleAccountRemotionPreview } from "./utils/assemble-account-remotion-preview";
export type {
  AssembleAccountRemotionPreviewDraftSource,
  AssembleAccountRemotionPreviewInput,
  AssembleAccountRemotionPreviewResult,
  AssembleAccountRemotionPreviewSavedSource,
} from "./utils/assemble-account-remotion-preview";
export { buildClubSponsorsPayloadFromAccountSponsors } from "./utils/build-club-sponsors-payload-from-account-sponsors";
export type {
  ClubSponsorsPayload,
  RemotionClubSponsorRow,
} from "./utils/build-club-sponsors-payload-from-account-sponsors";
export {
  EMPTY_CLUB_SPONSORS,
  EMPTY_ROW_ASSIGN_SPONSORS,
  emptyDemoContentRowSponsorFields,
} from "./utils/sponsors-payload-v2";
export type { DemoContentRowSponsorFields, RowAssignSponsors } from "./utils/sponsors-payload-v2";
export { resolveTemplateModeSlugFromBranding } from "./utils/resolve-template-mode-slug-from-branding";
export { isCricketSport, normalizeSport } from "./utils/sport";
export { readRemotionModeFromBrandingThemeJson } from "./utils/read-remotion-mode-from-branding-theme";
export {
  normalizeTemplateGradientDirectionToRemotionKey,
  normalizeTemplateGradientTypeToRemotionKey,
  readRemotionGradientFromBranding,
  resolveRemotionGradientFromCatalogGradient,
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
  determineGradientTypeForPaletteKey,
  resolveRemotionGradientFromTemplateItem,
  resolveRemotionGradientPreviewBackground,
} from "./utils/resolve-remotion-gradient-preview-background";
export {
  normalizeTemplateNoiseTypeToRemotionKey,
  resolveRemotionNoiseFromCatalogNoise,
  resolveRemotionNoiseTypeFromCatalogItem,
  REMOTION_NOISE_TYPE_KEYS,
} from "./utils/read-remotion-noise-from-catalog";
export type { RemotionNoiseTypeKey } from "./utils/read-remotion-noise-from-catalog";
export {
  drawGridNoisePreviewToCanvas,
  drawGridNoisePreviewToDataUrl,
  drawGraphicsPreviewToCanvas,
  drawParticleNoisePreviewToCanvas,
  drawRemotionNoisePreviewToDataUrl,
  isGridNoiseRemotionVariant,
} from "./utils/resolve-remotion-noise-grid-preview";
export {
  isRemotionNoiseStaticPreviewType,
  resolveRemotionNoiseStaticPreviewUrl,
  REMOTION_NOISE_STATIC_PREVIEW_TYPES,
} from "./utils/resolve-remotion-noise-static-preview-url";
export type { RemotionNoiseStaticPreviewType } from "./utils/resolve-remotion-noise-static-preview-url";
export { resolveRemotionNoisePreviewBackground } from "./utils/resolve-remotion-noise-preview-background";
export type { RemotionNoisePreviewColors } from "./utils/resolve-remotion-noise-preview-background";
export {
  REMOTION_TEXTURE_DEFAULT_BLEND_MODE,
  REMOTION_TEXTURE_DEFAULT_OVERLAY_OPACITY,
  resolveRemotionTexturePreviewLayers,
} from "./utils/resolve-remotion-texture-preview-background";
export type { RemotionTexturePreviewLayers } from "./utils/resolve-remotion-texture-preview-background";
export {
  readRemotionAnimationFromBranding,
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
  RemotionTemplateVariationAnimation,
  RemotionTemplateVariationImage,
  RemotionTemplateVariationNoise,
  RemotionTemplateVariationParticle,
  RemotionTemplateVariationTexture,
  RemotionTemplateVariationVideo,
} from "./utils/read-remotion-background-assets-from-branding";
export { readUseBackgroundFromAccountBranding } from "./utils/read-use-background-from-account-branding";
export { templateModeSlugToRemotionMode } from "./utils/template-mode-to-remotion-mode";
