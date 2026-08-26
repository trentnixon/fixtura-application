import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { PageHelpContent } from "@/components/page-help";

export type SortOrderPageHelpRoute = "sort-order";

export type BuildSortOrderPageHelpContentParams = {
  route: SortOrderPageHelpRoute;
  accountId: string;
};

export function buildSortOrderPageHelpContent(
  params: BuildSortOrderPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "sort-order":
      return buildSortOrderHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildSortOrderHelp({ accountId }: BuildSortOrderPageHelpContentParams): PageHelpContent {
  return {
    title: "Sort Order",
    summary: "Set the grade order here. Graphics use it after you save.",
    items: [
      {
        label: "Drag grades",
        howTo: "Drag within a group to set the sequence. Grades stay in their group.",
      },
      {
        label: "Save order",
        howTo: "Save so your graphics use this order.",
      },
      {
        label: "Use default ordering",
        howTo: "Clears your custom order and puts every group back on the default sequence.",
      },
    ],
    related: [
      { label: "Templates", href: accountScopedRoutes.templateBuilder(accountId) },
      { label: "Background images", href: accountScopedRoutes.mediaGallery(accountId) },
    ],
  };
}
