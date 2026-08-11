import { parseGeneralAccountGroup } from "../../../_utils/sponsorship-allocation-general";

import type { SponsorTargetingPlacementKind } from "../_types/sponsor-targeting";

export function allocationKind(allocation: unknown): SponsorTargetingPlacementKind {
  if (!allocation || typeof allocation !== "object") return "unknown";

  const allocationRecord = allocation as Record<string, unknown>;

  if (parseGeneralAccountGroup(allocation)) return "general";
  if (allocationRecord["entity"] != null && typeof allocationRecord["entity"] === "object") {
    return "entity";
  }

  return "unknown";
}

export function placementCountLabel(count: number): string {
  return `${count} placement${count === 1 ? "" : "s"}`;
}

export function accountWidePositionLabel(count: number): string {
  return `account-wide position${count === 1 ? "" : "s"}`;
}
