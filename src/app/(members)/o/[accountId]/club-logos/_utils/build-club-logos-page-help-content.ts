import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { PageHelpContent } from "@/components/page-help";

export type ClubLogosPageHelpRoute = "directory" | "editor";

export type BuildClubLogosPageHelpContentParams = {
  route: ClubLogosPageHelpRoute;
  accountId: string;
};

export function buildClubLogosPageHelpContent(
  params: BuildClubLogosPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "directory":
      return buildDirectoryHelp(params);
    case "editor":
      return buildEditorHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildDirectoryHelp({ accountId }: BuildClubLogosPageHelpContentParams): PageHelpContent {
  return {
    title: "Club logos",
    summary:
      "Manage logos for clubs in your association. They show on that club's graphics, not on your association branding.",
    items: [
      {
        label: "Add logo",
        howTo: "No logo yet? Open the club and upload one.",
      },
      {
        label: "Replace logo",
        howTo: "Already has one? Open it and swap the file.",
      },
    ],
    related: [{ label: "Branding", href: accountScopedRoutes.branding(accountId) }],
  };
}

function buildEditorHelp({ accountId }: BuildClubLogosPageHelpContentParams): PageHelpContent {
  return {
    title: "Club logo",
    summary:
      "Upload and crop this club's logo. Saving updates the club only. Your association branding stays put.",
    items: [
      {
        label: "Upload logo",
        howTo: "Pick a file and crop it. That cropped image is what Save logo uses.",
      },
      {
        label: "Save logo",
        howTo: "Save to put the cropped logo on this club.",
      },
      {
        label: "Remove uploaded logo",
        howTo: "Takes off the Fixtura upload. A PlayHQ or parent logo may still show in the list.",
      },
    ],
    related: [
      { label: "Back to club list", href: accountScopedRoutes.clubLogos(accountId) },
      { label: "Branding", href: accountScopedRoutes.branding(accountId) },
    ],
  };
}
