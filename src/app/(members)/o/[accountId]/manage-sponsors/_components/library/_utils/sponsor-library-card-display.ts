import { countEntityAllocationsForSponsor } from "../../../_utils/sponsorship-allocation-entity";
import {
  countPositionSlotAllocationsForSponsor,
  sponsorHasPoolPlacement,
} from "../../../_utils/sponsorship-allocation-general";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export type SponsorLibraryStatusBadge = {
  key: string;
  label: string;
  variant: "default" | "secondary" | "outline";
  className?: string;
};

const PLACED_BADGE_CLASS_NAME =
  "border-[color-mix(in_oklab,var(--success)_35%,transparent)] bg-[color-mix(in_oklab,var(--success)_12%,transparent)] text-[color-mix(in_oklch,var(--success-600),black_10%)]";

const UNASSIGNED_BADGE_CLASS_NAME =
  "text-muted-foreground border-dashed border-border/80 bg-muted/30";

const NO_LOGO_BADGE_CLASS_NAME =
  "border-[color-mix(in_oklab,var(--warning)_40%,transparent)] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] text-[color-mix(in_oklch,var(--warning),black_12%)]";

export function getSponsorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function formatCountLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

/** Placement summary aligned with pool filters (`sponsorHasPoolPlacement`) and footer stats. */
export function getSponsorLibraryPlacementBadge(
  sponsor: ManageSponsorsWorkspaceSponsor,
): SponsorLibraryStatusBadge {
  if (!sponsorHasPoolPlacement(sponsor)) {
    return {
      key: "placement",
      label: "Unassigned",
      variant: "outline",
      className: UNASSIGNED_BADGE_CLASS_NAME,
    };
  }

  const positionCount = countPositionSlotAllocationsForSponsor(sponsor);
  const assignmentCount = countEntityAllocationsForSponsor(sponsor);

  let label = "Placed";

  if (positionCount > 0 && assignmentCount > 0) {
    label = `${formatCountLabel(positionCount, "position", "positions")} · ${formatCountLabel(assignmentCount, "assignment", "assignments")}`;
  } else if (positionCount > 0) {
    label = formatCountLabel(positionCount, "position", "positions");
  } else if (assignmentCount > 0) {
    label = formatCountLabel(assignmentCount, "assignment", "assignments");
  } else if (sponsor.isPrimary) {
    label = "Primary placement";
  } else if (sponsor.rank != null) {
    label = `Rank ${sponsor.rank}`;
  }

  return {
    key: "placement",
    label,
    variant: "outline",
    className: PLACED_BADGE_CLASS_NAME,
  };
}

export function getSponsorLibraryStatusBadges(
  sponsor: ManageSponsorsWorkspaceSponsor,
): SponsorLibraryStatusBadge[] {
  const badges: SponsorLibraryStatusBadge[] = [];

  if (sponsor.isDraft) {
    badges.push({ key: "draft", label: "Draft", variant: "secondary" });
  }

  if (!sponsor.logoUrl?.trim()) {
    badges.push({
      key: "no-logo",
      label: "No logo",
      variant: "outline",
      className: NO_LOGO_BADGE_CLASS_NAME,
    });
  }

  if (!sponsor.isDraft) {
    badges.push(getSponsorLibraryPlacementBadge(sponsor));
  }

  return badges;
}
