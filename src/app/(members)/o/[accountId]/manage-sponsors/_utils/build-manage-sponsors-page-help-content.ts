import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { SponsorAssignmentTargetCopy } from "./sponsor-assignment-target-copy";
import type { PageHelpContent } from "@/components/page-help";

export type ManageSponsorsPageHelpRoute =
  "pool" | "add-sponsor" | "assign-position" | "assign-entity" | "archive";

export type BuildManageSponsorsPageHelpContentParams = {
  route: ManageSponsorsPageHelpRoute;
  accountId: string;
  targetCopy: SponsorAssignmentTargetCopy;
};

export function buildManageSponsorsPageHelpContent(
  params: BuildManageSponsorsPageHelpContentParams,
): PageHelpContent {
  switch (params.route) {
    case "pool":
      return buildPoolHelp(params);
    case "add-sponsor":
      return buildAddSponsorHelp(params);
    case "assign-position":
      return buildAssignPositionHelp(params);
    case "assign-entity":
      return buildAssignEntityHelp(params);
    case "archive":
      return buildArchiveHelp(params);
    default: {
      const _exhaustive: never = params.route;
      return _exhaustive;
    }
  }
}

function buildPoolHelp({
  accountId,
  targetCopy,
}: BuildManageSponsorsPageHelpContentParams): PageHelpContent {
  return {
    title: "Sponsor pool",
    summary:
      "This is where your sponsor logos live. Assign them to a position or a target before they show up on graphics.",
    items: [
      {
        label: "Sponsor cards",
        howTo: "Open a card to check the logo, visibility, and whether it is placed yet.",
      },
      {
        label: "Add sponsor",
        howTo:
          "Missing a logo? Hit Add sponsor in the header, save it, then come back here to place it.",
      },
      {
        label: "Assign actions",
        howTo:
          "Assign to position sets account-wide slots. The other assign button targets specific graphics.",
      },
    ],
    related: [
      { label: "Add a sponsor", href: accountScopedRoutes.addSponsor(accountId) },
      {
        label: "Assign to positions",
        href: accountScopedRoutes.manageSponsorsAssignPosition(accountId),
      },
      {
        label: targetCopy.buttonLabel,
        href: accountScopedRoutes.manageSponsorsAssignEntity(accountId),
      },
    ],
  };
}

function buildAddSponsorHelp({
  accountId,
}: BuildManageSponsorsPageHelpContentParams): PageHelpContent {
  return {
    title: "Add a sponsor",
    summary:
      "Add the name and logo once. It lands in the pool, and it only shows on graphics after you assign it.",
    items: [
      {
        label: "Logo upload",
        howTo: "Upload the logo here. Crop it if asked. That file is what goes into the pool.",
      },
      {
        label: "Save",
        howTo:
          "Save to put the sponsor in the pool. Then assign it to a position or target so it can appear on graphics.",
      },
    ],
    related: [
      { label: "Back to sponsor pool", href: accountScopedRoutes.manageSponsors(accountId) },
      {
        label: "Assign to positions",
        href: accountScopedRoutes.manageSponsorsAssignPosition(accountId),
      },
    ],
  };
}

function buildAssignPositionHelp({
  accountId,
  targetCopy,
}: BuildManageSponsorsPageHelpContentParams): PageHelpContent {
  return {
    title: "Assign to positions",
    summary:
      "Put sponsors into the primary and general slots. Those slots drive the shared sponsor layout on your graphics.",
    items: [
      {
        label: "Position table",
        howTo:
          "Each row is a slot. Pick a sponsor from the pool, or clear the slot if it should stay empty.",
      },
      {
        label: "Preview",
        howTo: "Use the preview on this page to check the layout before you leave.",
      },
    ],
    related: [
      { label: "Sponsor pool", href: accountScopedRoutes.manageSponsors(accountId) },
      {
        label: targetCopy.buttonLabel,
        href: accountScopedRoutes.manageSponsorsAssignEntity(accountId),
      },
    ],
  };
}

function buildAssignEntityHelp({
  accountId,
  targetCopy,
}: BuildManageSponsorsPageHelpContentParams): PageHelpContent {
  const { singular, plural } = targetCopy;
  return {
    title: `Assign to ${plural}`,
    summary: `Pick a sponsor for each ${singular}. That logo shows on that ${singular}'s graphics, not the account-wide layout.`,
    items: [
      {
        label: `${singular} list`,
        howTo: `Select a ${singular} to edit. Changes here apply to that ${singular} only.`,
      },
      {
        label: "Sponsor assignment",
        howTo: `Choose which pool sponsor belongs on that ${singular}, then move to the next one.`,
      },
    ],
    related: [
      { label: "Sponsor pool", href: accountScopedRoutes.manageSponsors(accountId) },
      {
        label: "Assign to positions",
        href: accountScopedRoutes.manageSponsorsAssignPosition(accountId),
      },
    ],
  };
}

function buildArchiveHelp({
  accountId,
}: BuildManageSponsorsPageHelpContentParams): PageHelpContent {
  return {
    title: "Archived sponsors",
    summary:
      "Archive a sponsor to take it out of the pool without deleting the logo. It stops showing on graphics until you restore it.",
    items: [
      {
        label: "Archived list",
        howTo: "These sponsors are out of the active pool and off your graphics.",
      },
      {
        label: "Restore",
        howTo:
          "Restore puts the sponsor back in the pool. Assign it again if you want it on graphics.",
      },
    ],
    related: [
      { label: "Back to sponsor pool", href: accountScopedRoutes.manageSponsors(accountId) },
    ],
  };
}
