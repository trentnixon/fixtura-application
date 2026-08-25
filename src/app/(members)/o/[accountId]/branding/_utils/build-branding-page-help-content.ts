import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { PageHelpContent } from "@/components/page-help";

export type BrandingPageHelpRoute = "branding";

export type BuildBrandingPageHelpContentParams = {
  route: BrandingPageHelpRoute;
  accountId: string;
};

export function buildBrandingPageHelpContent(
  params: BuildBrandingPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "branding":
      return buildBrandingHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildBrandingHelp({ accountId }: BuildBrandingPageHelpContentParams): PageHelpContent {
  return {
    title: "Branding",
    summary:
      "Colours and contrast for your organisation live here. Save them, and they show on graphics and template previews.",
    items: [
      {
        label: "Brand colours",
        howTo:
          "Hit Create your brand colours to set primary and secondary. Or open Preset themes and pick one.",
      },
      {
        label: "Contrast selector",
        howTo: "Choose a preset. It sets title colour and container background on your assets.",
      },
      {
        label: "Save branding",
        howTo: "Save to put colours and contrast on your organisation profile.",
      },
    ],
    related: [
      { label: "Brand logo", href: accountScopedRoutes.brandLogo(accountId) },
      { label: "Templates", href: accountScopedRoutes.templateBuilder(accountId) },
    ],
  };
}
