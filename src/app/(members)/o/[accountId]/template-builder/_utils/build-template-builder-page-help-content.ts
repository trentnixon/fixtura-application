import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { PageHelpContent } from "@/components/page-help";

export type TemplateBuilderPageHelpRoute = "template-builder";

export type BuildTemplateBuilderPageHelpContentParams = {
  route: TemplateBuilderPageHelpRoute;
  accountId: string;
};

export function buildTemplateBuilderPageHelpContent(
  params: BuildTemplateBuilderPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "template-builder":
      return buildTemplateBuilderHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildTemplateBuilderHelp({
  accountId,
}: BuildTemplateBuilderPageHelpContentParams): PageHelpContent {
  return {
    title: "Templates",
    summary:
      "Template style, colour layout, contrast, and background live here. Save, and new graphics use them.",
    items: [
      {
        label: "1. Template",
        howTo: "New graphics start from that layout.",
      },
      {
        label: "2. Color pairing",
        howTo: "Maps your brand colours onto the template.",
      },
      {
        label: "3. Contrast",
        howTo: "Sets title colour on your assets.",
      },
      {
        label: "4. Background",
        howTo: "Type first, then the option below. Image pulls from Background images.",
      },
      {
        label: "Save changes",
        howTo: "New graphics use this template. Reset to saved drops edits you have not saved.",
      },
    ],
    related: [
      { label: "Branding", href: accountScopedRoutes.branding(accountId) },
      { label: "Background images", href: accountScopedRoutes.mediaGallery(accountId) },
    ],
  };
}
