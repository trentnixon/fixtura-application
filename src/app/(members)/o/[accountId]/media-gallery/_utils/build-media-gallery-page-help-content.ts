import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { PageHelpContent } from "@/components/page-help";

export type MediaGalleryPageHelpRoute = "media-gallery";

export type BuildMediaGalleryPageHelpContentParams = {
  route: MediaGalleryPageHelpRoute;
  accountId: string;
};

export function buildMediaGalleryPageHelpContent(
  params: BuildMediaGalleryPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "media-gallery":
      return buildMediaGalleryHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildMediaGalleryHelp({
  accountId,
}: BuildMediaGalleryPageHelpContentParams): PageHelpContent {
  return {
    title: "Background images",
    summary: "Upload backgrounds here. Category and asset type decide which graphics can use them.",
    items: [
      {
        label: "Image pool",
        howTo:
          "Switch tabs to browse the full pool, by age or competition/grade, or by asset type.",
      },
      {
        label: "Filters",
        howTo:
          "Search by title, or narrow by availability, category, and asset type. Needs attention finds images that look unfinished.",
      },
      {
        label: "Upload background",
        howTo:
          "Pick a file, set category and asset types, then hit Upload. It lands in the pool for new graphics.",
      },
      {
        label: "Edit",
        howTo:
          "Hit Edit on a card to change category, asset types, or availability for new assets.",
      },
    ],
    related: [
      { label: "Templates", href: accountScopedRoutes.templateBuilder(accountId) },
      { label: "Branding", href: accountScopedRoutes.branding(accountId) },
    ],
  };
}
