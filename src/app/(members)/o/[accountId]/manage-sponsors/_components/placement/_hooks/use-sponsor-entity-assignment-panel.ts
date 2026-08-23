"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { captureUserAction } from "@/lib/analytics";
import { useAccountSponsorAllocationsEntityMutations } from "@/lib/api/hooks/account/useAccountSponsorAllocationsEntityMutations";
import {
  isAccountSponsorEntityTargetsGatewayRedirect,
  useAccountSponsorEntityTargets,
} from "@/lib/api/hooks/account/useAccountSponsorEntityTargets";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { useSponsorPlacementBrandingPreview } from "./use-sponsor-placement-branding-preview";
import {
  buildEntityTargetKey,
  collectEntityTargetAllocations,
} from "../../../_utils/sponsorship-allocation-entity";
import {
  allocationErrorMessage,
  buildClearEntityAssignmentTasks,
  buildEntityAssignmentMetrics,
  buildPrimaryPositionSponsors,
  filterAssignedEntityTargets,
  filterEntityTargets,
  groupTargets,
  targetLabel,
} from "../_utils/sponsor-entity-assignment-panel";
import {
  buildEligibleSponsors,
  buildSponsorByNumericId,
} from "../_utils/sponsor-placement-sponsors";

import type {
  EntityRowFilter,
  EntityTypeFilter,
  SponsorEntityAssignmentHookOptions,
  SponsorEntityAssignmentHookResult,
} from "../_types/sponsor-entity-assignment-panel";
import type { AccountSponsorEntityTarget } from "@/types/api/account";

export function useSponsorEntityAssignmentPanel({
  accountId,
  sponsors,
}: SponsorEntityAssignmentHookOptions): SponsorEntityAssignmentHookResult {
  const segmentOk = isValidAccountIdSegment(accountId);
  const targetsQuery = useAccountSponsorEntityTargets(accountId, { enabled: segmentOk });
  const brandingPreviewState = useSponsorPlacementBrandingPreview({
    accountId,
    enabled: segmentOk,
  });
  const { postAllocation, deleteAllocation, isPending } =
    useAccountSponsorAllocationsEntityMutations(accountId);

  const [rowSelection, setRowSelection] = useState<Record<string, string>>({});
  const [busyTargetKey, setBusyTargetKey] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [entitySearchQuery, setEntitySearchQuery] = useState("");
  const [entityRowFilter, setEntityRowFilter] = useState<EntityRowFilter>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>("all");

  const targetData = useMemo(() => {
    if (!targetsQuery.isSuccess || !targetsQuery.data) return null;
    if (isAccountSponsorEntityTargetsGatewayRedirect(targetsQuery.data)) return null;
    return targetsQuery.data.data;
  }, [targetsQuery.data, targetsQuery.isSuccess]);

  const eligibleSponsors = useMemo(() => buildEligibleSponsors(sponsors), [sponsors]);
  const sponsorByNumericId = useMemo(() => buildSponsorByNumericId(sponsors), [sponsors]);

  const allocationsByTarget = useMemo(() => collectEntityTargetAllocations(sponsors), [sponsors]);

  const primaryPositionSponsors = useMemo(
    () => buildPrimaryPositionSponsors({ sponsors, sponsorByNumericId }),
    [sponsorByNumericId, sponsors],
  );

  const allTargets = useMemo(() => targetData?.targets ?? [], [targetData?.targets]);

  const displayTargets = useMemo(
    () =>
      filterEntityTargets({
        targets: allTargets,
        allocationsByTarget,
        entityRowFilter,
        entityTypeFilter,
        entitySearchQuery,
      }),
    [allocationsByTarget, allTargets, entityRowFilter, entitySearchQuery, entityTypeFilter],
  );

  const groupedTargets = useMemo(() => groupTargets(displayTargets), [displayTargets]);

  const previewTargets = useMemo(
    () => filterAssignedEntityTargets({ targets: allTargets, allocationsByTarget }),
    [allocationsByTarget, allTargets],
  );

  const metrics = useMemo(
    () =>
      buildEntityAssignmentMetrics({
        targets: allTargets,
        allocationsByTarget,
        eligibleSponsors,
      }),
    [allocationsByTarget, allTargets, eligibleSponsors],
  );

  async function assignToTarget(target: AccountSponsorEntityTarget) {
    const key = buildEntityTargetKey(target);
    const existingAssignments = allocationsByTarget.get(key) ?? [];
    if (existingAssignments.length > 0) {
      toast.message("Clear the current sponsor before assigning another one.");
      return;
    }

    const raw = rowSelection[key] ?? "";
    const sponsorId = Number(raw);
    if (!raw || !Number.isFinite(sponsorId) || sponsorId <= 0) {
      toast.error("Choose a sponsor for this target.");
      return;
    }

    const sponsor = sponsorByNumericId.get(sponsorId);
    if (!sponsor?.isActive || !sponsor.hasLogo) {
      toast.error("Choose an active sponsor with a logo.");
      return;
    }

    setBusyTargetKey(key);
    try {
      await postAllocation.mutateAsync({
        sponsorId,
        entityType: target.type,
        entityId: target.id,
        body: { extra: { source: "manage-sponsors-assign-entity" } },
      });
      captureUserAction("sponsor_entity_assigned", { accountId });
      toast.success(`Assigned ${sponsor.name} to ${targetLabel(target)}.`);
      setRowSelection((prev) => ({ ...prev, [key]: "" }));
    } catch (error) {
      toast.error(
        `Could not assign ${target.type} #${target.id}: ${allocationErrorMessage(error)}`,
      );
    } finally {
      setBusyTargetKey(null);
    }
  }

  async function clearTarget(target: AccountSponsorEntityTarget) {
    const key = buildEntityTargetKey(target);
    const assignments = allocationsByTarget.get(key) ?? [];
    if (assignments.length === 0) return;

    setBusyTargetKey(key);
    try {
      for (const assignment of assignments) {
        await deleteAllocation.mutateAsync({
          sponsorId: assignment.sponsorId,
          entityType: target.type,
          entityId: target.id,
          allocationId: assignment.allocationId,
        });
      }
      captureUserAction("sponsor_entity_cleared", { accountId });
      toast.success(`Cleared ${targetLabel(target)}.`);
      setRowSelection((prev) => ({ ...prev, [key]: "" }));
    } catch (error) {
      toast.error(`Could not clear ${target.type} #${target.id}: ${allocationErrorMessage(error)}`);
    } finally {
      setBusyTargetKey(null);
    }
  }

  async function confirmClearAllEntityAssignments() {
    const tasks = buildClearEntityAssignmentTasks(allocationsByTarget);
    if (!tasks.length) return;
    setIsClearingAll(true);
    try {
      for (const task of tasks) {
        await deleteAllocation.mutateAsync(task);
      }
      setRowSelection({});
      setClearAllDialogOpen(false);
      captureUserAction("sponsor_entities_cleared_all", { accountId });
      toast.success(`Cleared ${tasks.length} entity placement${tasks.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setIsClearingAll(false);
    }
  }

  return {
    segmentOk,
    targetsQuery,
    state: {
      groupedTargets,
      allocationsByTarget,
      sponsorByNumericId,
      eligibleSponsors,
      primaryPositionSponsors,
      previewTargets,
      allTargets,
      metrics,
      rowSelection,
      entitySearchQuery,
      entityRowFilter,
      entityTypeFilter,
      mutationState: {
        isPending,
        busyTargetKey,
        isClearingAll,
      },
      clearAllDialogOpen,
      ...brandingPreviewState,
    },
    actions: {
      setEntitySearchQuery,
      setEntityRowFilter,
      setEntityTypeFilter,
      setRowSelection,
      assignToTarget,
      clearTarget,
      setClearAllDialogOpen,
      confirmClearAllEntityAssignments,
    },
  };
}
