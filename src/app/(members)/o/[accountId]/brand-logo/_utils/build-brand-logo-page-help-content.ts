import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { PageHelpContent } from "@/components/page-help";

export type BrandLogoPageHelpRoute = "brand-logo";

export type BuildBrandLogoPageHelpContentParams = {
  route: BrandLogoPageHelpRoute;
  accountId: string;
};

export function buildBrandLogoPageHelpContent(
  params: BuildBrandLogoPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "brand-logo":
      return buildBrandLogoHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildBrandLogoHelp({ accountId }: BuildBrandLogoPageHelpContentParams): PageHelpContent {
  return {
    title: "Brand logo",
    summary:
      "Set your organisation logo here. It shows on your graphics and previews once you save.",
    items: [
      {
        label: "Upload logo",
        howTo: "Pick a file and crop it. That cropped image is what Save logo uses.",
      },
      {
        label: "Save logo",
        howTo: "Save to put the cropped logo on your organisation branding.",
      },
      {
        label: "Remove logo",
        howTo: "Clears the saved logo. Assets may show a placeholder until you upload again.",
      },
    ],
    related: [
      { label: "Branding", href: accountScopedRoutes.branding(accountId) },
      { label: "Club logos", href: accountScopedRoutes.clubLogos(accountId) },
    ],
  };
}
