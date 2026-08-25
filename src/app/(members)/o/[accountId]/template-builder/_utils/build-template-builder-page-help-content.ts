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
        howTo: "Pick a template style. New graphics start from that layout.",
      },
      {
        label: "2. Color pairing",
        howTo: "Pick a Color Layout. It maps your brand colours onto the template.",
      },
      {
        label: "3. Contrast",
        howTo: "Choose a contrast mode. It sets title colour on your assets.",
      },
      {
        label: "4. Background",
        howTo:
          "Set Background type, then pick the option below. Image pulls from Background images.",
      },
      {
        label: "Save changes",
        howTo:
          "Save so new graphics use this template. Reset to saved drops edits you have not saved.",
      },
    ],
    related: [
      { label: "Branding", href: accountScopedRoutes.branding(accountId) },
      { label: "Background images", href: accountScopedRoutes.mediaGallery(accountId) },
    ],
  };
}
