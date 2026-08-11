import { ApiError } from "@/lib/api/client/api-error";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import {
  PRIMARY_POSITION_SLOT_IDS,
  PRIMARY_POSITION_SLOTS,
} from "../../../_constants/sponsor-position-slots";
import {
  buildEntityTargetKey,
  countEntityAllocationsForSponsor,
} from "../../../_utils/sponsorship-allocation-entity";
import { collectPositionSlotOccupants } from "../../../_utils/sponsorship-allocation-general";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { EntityTargetAllocation } from "../../../_utils/sponsorship-allocation-entity";
import type {
  BuildEntityAssignmentMetricsOptions,
  BuildEntityAssignmentTableRowsOptions,
  BuildPrimaryPositionSponsorsOptions,
  ClearEntityAssignmentTask,
  EntityAssignmentTableRow,
  EntityAssignmentMetrics,
  EntityTargetWithAllocationsOptions,
  EntityTargetsWithAllocationsOptions,
  FilterEntityTargetsOptions,
  ParsedEntityTargetKey,
  ResolveEntityPreviewTargetsOptions,
  TargetMatchesSearchOptions,
  EntityTargetGroup,
} from "../_types/sponsor-entity-assignment-panel";
import type { AccountSponsorEntityTarget, AccountSponsorEntityType } from "@/types/api/account";

export function parseEntityTargetKey(key: string): ParsedEntityTargetKey | null {
  const idx = key.indexOf(":");
  if (idx <= 0) return null;
  const type = key.slice(0, idx) as AccountSponsorEntityType;
  if (type !== "club" && type !== "team" && type !== "grade") return null;
  const id = Number(key.slice(idx + 1));
  if (!Number.isFinite(id) || id <= 0) return null;
  return { type, id };
}

export function allocationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return AUTH_ERROR_MESSAGES.unexpected;
}

export function targetLabel(target: AccountSponsorEntityTarget) {
  return target.label || target.name || `${target.type} #${target.id}`;
}

export function targetContextLabel(target: AccountSponsorEntityTarget) {
  const parts = [
    target.meta?.competitionName,
    target.meta?.clubName,
    target.meta?.gradeNames?.join(", "),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  return parts.slice(0, 2).join(" / ");
}

export function groupTargets(targets: AccountSponsorEntityTarget[]): EntityTargetGroup[] {
  const groups = new Map<string, { label: string; targets: AccountSponsorEntityTarget[] }>();

  for (const target of targets) {
    const key = target.group ?? "ungrouped";
    const label = target.groupLabel ?? target.group ?? "Other targets";
    const group = groups.get(key);
    if (group) {
      group.targets.push(target);
    } else {
      groups.set(key, { label, targets: [target] });
    }
  }

  return Array.from(groups.entries()).map(([key, group]) => ({ key, ...group }));
}

export function buildClearEntityAssignmentTasks(
  allocationsByTarget: Map<string, EntityTargetAllocation[]>,
): ClearEntityAssignmentTask[] {
  const tasks: ClearEntityAssignmentTask[] = [];

  for (const [targetKey, rows] of allocationsByTarget.entries()) {
    const parsed = parseEntityTargetKey(targetKey);
    if (!parsed) continue;
    for (const row of rows) {
      tasks.push({
        sponsorId: row.sponsorId,
        entityType: parsed.type,
        entityId: parsed.id,
        allocationId: row.allocationId,
      });
    }
  }

  return tasks;
}

export function targetMatchesSearch({
  target,
  query,
  allocationsByTarget,
}: TargetMatchesSearchOptions) {
  return buildTargetSearchHaystack({
    target,
    assignments: allocationsByTarget.get(buildEntityTargetKey(target)) ?? [],
  }).includes(query);
}

export function buildPrimaryPositionSponsors({
  sponsors,
  sponsorByNumericId,
}: BuildPrimaryPositionSponsorsOptions) {
  const primaryOccupants = collectPositionSlotOccupants(sponsors, PRIMARY_POSITION_SLOT_IDS);
  return PRIMARY_POSITION_SLOTS.map((slot) => {
    const occupant = primaryOccupants.get(slot.id);
    return occupant ? (sponsorByNumericId.get(occupant.sponsorId) ?? null) : null;
  }).filter((sponsor): sponsor is ManageSponsorsWorkspaceSponsor => sponsor !== null);
}

export function filterEntityTargets({
  targets,
  allocationsByTarget,
  entityRowFilter,
  entityTypeFilter,
  entitySearchQuery,
}: FilterEntityTargetsOptions) {
  const query = entitySearchQuery.trim().toLowerCase();
  let displayTargets = targets;

  if (entityTypeFilter !== "all") {
    displayTargets = displayTargets.filter((target) => target.type === entityTypeFilter);
  }

  if (entityRowFilter !== "all") {
    displayTargets = displayTargets.filter((target) => {
      const hasAssignments = targetHasEntityAssignments({ target, allocationsByTarget });
      return entityRowFilter === "assigned" ? hasAssignments : !hasAssignments;
    });
  }

  if (!query.length) return displayTargets;

  return displayTargets.filter((target) =>
    targetMatchesSearch({ target, query, allocationsByTarget }),
  );
}

export function filterAssignedEntityTargets({
  targets,
  allocationsByTarget,
}: EntityTargetsWithAllocationsOptions) {
  return targets.filter((target) => targetHasEntityAssignments({ target, allocationsByTarget }));
}

export function buildEntityAssignmentMetrics({
  targets,
  allocationsByTarget,
  eligibleSponsors,
}: BuildEntityAssignmentMetricsOptions): EntityAssignmentMetrics {
  const assignedTargets = filterAssignedEntityTargets({ targets, allocationsByTarget }).length;
  const totalAllocations = Array.from(allocationsByTarget.values()).reduce(
    (sum, rows) => sum + rows.length,
    0,
  );
  const unassigned = eligibleSponsors.filter(
    (sponsor) => countEntityAllocationsForSponsor(sponsor) === 0,
  ).length;

  return {
    totalTargets: targets.length,
    assignedTargets,
    emptyTargets: targets.length - assignedTargets,
    eligibleCount: eligibleSponsors.length,
    unassigned,
    totalAllocations,
  };
}

export function buildEntityAssignmentTableRows({
  groupedTargets,
  allocationsByTarget,
  sponsorByNumericId,
  rowSelection,
  isPending,
  busyTargetKey,
  isClearingAll,
}: BuildEntityAssignmentTableRowsOptions): EntityAssignmentTableRow[] {
  return groupedTargets.flatMap((group) => [
    {
      kind: "group" as const,
      key: `group:${group.key}`,
      label: group.label,
      targetCount: group.targets.length,
    },
    ...group.targets.map((target) => {
      const key = buildEntityTargetKey(target);
      const assignments = allocationsByTarget.get(key) ?? [];
      const firstAssignment = assignments[0] ?? null;
      const previewSponsor =
        firstAssignment != null
          ? (sponsorByNumericId.get(firstAssignment.sponsorId) ?? null)
          : null;

      return {
        kind: "target" as const,
        key,
        target,
        assignments,
        firstAssignment,
        previewSponsor,
        hasAssignment: firstAssignment != null,
        rowBusy: busyTargetKey === key || isPending || isClearingAll,
        selectValue: rowSelection[key] ?? "",
        context: targetContextLabel(target),
        label: targetLabel(target),
      };
    }),
  ]);
}

export function resolveEntityPreviewTargets({
  allTargets,
  previewTargets,
}: ResolveEntityPreviewTargetsOptions) {
  return allTargets.length ? allTargets : previewTargets;
}

function targetHasEntityAssignments({
  target,
  allocationsByTarget,
}: EntityTargetWithAllocationsOptions) {
  return (allocationsByTarget.get(buildEntityTargetKey(target))?.length ?? 0) > 0;
}

function buildTargetSearchHaystack({
  target,
  assignments,
}: {
  target: AccountSponsorEntityTarget;
  assignments: EntityTargetAllocation[];
}) {
  return [
    targetLabel(target),
    target.groupLabel,
    target.group,
    target.meta?.competitionName,
    target.meta?.clubName,
    target.meta?.gradeNames?.join(" "),
    ...assignments.map((row) => row.sponsorName),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
