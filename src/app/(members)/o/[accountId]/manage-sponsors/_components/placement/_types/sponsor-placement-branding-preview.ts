export type SponsorPlacementBrandingPreviewState = {
  showBrandingAssetPreview: boolean;
  showBrandingAssetPreviewSkeleton: boolean;
  assetPreviewPalette: {
    primary: string;
    secondary: string;
  };
  assetPreviewTemplateModeSlug: string | null;
};
