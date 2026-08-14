import type { ThumbnailFrameTarget } from "./utils/build-thumbnail-frame-targets";
import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export type { ThumbnailFrameTarget };

export type AssetPreviewDisplayMode = "thumbnails" | "video";

export type RemotionAssetPreviewInput = {
  sport: string | null;
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
  /** Resolves `template_option.categoryId` when GET branding omits nested category slug. */
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
  /** Bundled cricket example matching lab `CompositionID` (e.g. `CricketLadder`). */
  exampleCompositionId?: string | null;
  /** When null, merge clears example `videoMeta.club.sponsors` until sponsors load. */
  accountSponsors?: AccountSponsorDto[] | null;
  /** Cap carousel slides after dataset `frames` are resolved (omit = show all). */
  maxFrameTargets?: number;
  enabled?: boolean;
};

export type RemotionAssetPreviewStatus =
  "idle" | "loading" | "ready" | "error" | "unsupported-sport";

export type RemotionAssetPreviewState = {
  status: RemotionAssetPreviewStatus;
  data: FixturaDataset | null;
  durationInFrames: number;
  frameTargets: ThumbnailFrameTarget[];
  fromDatasetFrames: boolean;
  loadError: string | null;
  usedTemplateFallback: boolean;
  datasetPath: string | null;
};
