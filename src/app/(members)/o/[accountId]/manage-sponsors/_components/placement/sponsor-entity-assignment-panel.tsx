"use client";

import { Layers } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { TypographyH3, TypographyP } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountSponsorAllocationsEntityMutations } from "@/lib/api/hooks/account/useAccountSponsorAllocationsEntityMutations";
import {
  isAccountSponsorEntityTargetsGatewayRedirect,
  useAccountSponsorEntityTargets,
} from "@/lib/api/hooks/account/useAccountSponsorEntityTargets";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { cn } from "@/lib/utils";

import { SponsorEntityAssetPreview } from "./sponsor-entity-asset-preview";
import {
  PRIMARY_POSITION_SLOT_IDS,
  PRIMARY_POSITION_SLOTS,
} from "../../_constants/sponsor-position-slots";
import {
  buildEntityTargetKey,
  collectEntityTargetAllocations,
  countEntityAllocationsForSponsor,
} from "../../_utils/sponsorship-allocation-entity";
import { collectPositionSlotOccupants } from "../../_utils/sponsorship-allocation-general";
import { SponsorSelectOptionLabel } from "../sponsor-select-option-label";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";
import type { AccountSponsorEntityTarget, AccountSponsorEntityType } from "@/types/api/account";

/** Segmented rail using theme primary (active tab uses solid primary). */
const tabberSegmentedRailPrimaryListClass =
  "text-muted-foreground grid w-full max-w-md grid-cols-2 border border-primary/25 bg-primary/10 p-1 shadow-none";

const tabberSegmentedRailPrimaryTriggerClass =
  "shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

type EntityRowFilter = "all" | "assigned" | "unassigned";
type EntityTypeFilter = "all" | AccountSponsorEntityType;

function parseEntityTargetKey(key: string): {
  type: AccountSponsorEntityType;
  id: number;
} | null {
  const idx = key.indexOf(":");
  if (idx <= 0) return null;
  const type = key.slice(0, idx) as AccountSponsorEntityType;
  if (type !== "club" && type !== "team" && type !== "grade") return null;
  const id = Number(key.slice(idx + 1));
  if (!Number.isFinite(id) || id <= 0) return null;
  return { type, id };
}

function allocationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return AUTH_ERROR_MESSAGES.unexpected;
}

function buildEligibleSponsors(sponsors: ManageSponsorsWorkspaceSponsor[]) {
  return sponsors.filter(
    (sponsor) =>
      sponsor.isActive &&
      sponsor.hasLogo &&
      typeof sponsor.id === "number" &&
      Number.isFinite(sponsor.id) &&
      sponsor.id > 0,
  );
}

function EntityAssignmentPreview({ sponsor }: { sponsor: ManageSponsorsWorkspaceSponsor | null }) {
  if (!sponsor) {
    return (
      <div
        className="text-muted-foreground border-border flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed bg-white text-xs font-medium"
        role="img"
        aria-label="No sponsor assigned"
      >
        -
      </div>
    );
  }

  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white"
      title={sponsor.name}
    >
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.logoAlt ?? sponsor.name}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="text-muted-foreground text-[9px] font-medium uppercase">No logo</span>
      )}
    </div>
  );
}

function targetLabel(target: AccountSponsorEntityTarget) {
  return target.label || target.name || `${target.type} #${target.id}`;
}

function targetContextLabel(target: AccountSponsorEntityTarget) {
  const parts = [
    target.meta?.competitionName,
    target.meta?.clubName,
    target.meta?.gradeNames?.join(", "),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  return parts.slice(0, 2).join(" / ");
}

function groupTargets(targets: AccountSponsorEntityTarget[]) {
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

export function SponsorEntityAssignmentPanel({
  accountId,
  sponsors,
}: {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
}) {
  const segmentOk = isValidAccountIdSegment(accountId);
  const targetsQuery = useAccountSponsorEntityTargets(accountId, { enabled: segmentOk });
  const brandingQuery = useAccountBranding(accountId, { enabled: segmentOk });
  const templateModesQuery = useTemplateModesUi({ enabled: segmentOk });
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

  const brandingAccountData = useMemo(() => {
    if (!brandingQuery.isSuccess || !brandingQuery.data) return null;
    if (isAccountBrandingGatewayRedirect(brandingQuery.data)) return null;
    return brandingQuery.data.data;
  }, [brandingQuery.data, brandingQuery.isSuccess]);

  const assetPreviewPalette = useMemo(
    () => themeColoursFromAccountBrandingTheme(brandingAccountData?.theme ?? null),
    [brandingAccountData?.theme],
  );

  const assetPreviewTemplateModeSlug = useMemo(() => {
    const savedId = readTemplateModeId(brandingAccountData?.template_option ?? null);
    if (savedId === null) return null;
    const modes = templateModesQuery.data?.data ?? [];
    return modes.find((m) => m.id === savedId)?.slug ?? null;
  }, [brandingAccountData?.template_option, templateModesQuery.data]);

  const showBrandingAssetPreview =
    segmentOk && brandingQuery.isSuccess && brandingAccountData !== null;
  const showBrandingAssetPreviewSkeleton = segmentOk && brandingQuery.isPending;

  const eligible = useMemo(() => buildEligibleSponsors(sponsors), [sponsors]);

  const sponsorByNumericId = useMemo(() => {
    const m = new Map<number, ManageSponsorsWorkspaceSponsor>();
    for (const s of sponsors) {
      if (typeof s.id === "number" && s.id > 0) m.set(s.id, s);
    }
    return m;
  }, [sponsors]);

  const allocationsByTarget = useMemo(() => collectEntityTargetAllocations(sponsors), [sponsors]);

  const primaryPositionSponsors = useMemo(() => {
    const primaryOccupants = collectPositionSlotOccupants(sponsors, PRIMARY_POSITION_SLOT_IDS);
    return PRIMARY_POSITION_SLOTS.map((slot) => {
      const occupant = primaryOccupants.get(slot.id);
      return occupant ? (sponsorByNumericId.get(occupant.sponsorId) ?? null) : null;
    }).filter((sponsor): sponsor is ManageSponsorsWorkspaceSponsor => sponsor !== null);
  }, [sponsorByNumericId, sponsors]);

  const displayTargets = useMemo(() => {
    const q = entitySearchQuery.trim().toLowerCase();
    let targets = targetData?.targets ?? [];

    if (entityTypeFilter !== "all") {
      targets = targets.filter((target) => target.type === entityTypeFilter);
    }

    if (entityRowFilter !== "all") {
      targets = targets.filter((target) => {
        const hasAssignments =
          (allocationsByTarget.get(buildEntityTargetKey(target))?.length ?? 0) > 0;
        return entityRowFilter === "assigned" ? hasAssignments : !hasAssignments;
      });
    }

    if (q.length) {
      targets = targets.filter((target) => {
        const assigned = allocationsByTarget.get(buildEntityTargetKey(target)) ?? [];
        const haystack = [
          targetLabel(target),
          target.groupLabel,
          target.group,
          target.meta?.competitionName,
          target.meta?.clubName,
          target.meta?.gradeNames?.join(" "),
          ...assigned.map((row) => row.sponsorName),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return targets;
  }, [
    allocationsByTarget,
    entityRowFilter,
    entitySearchQuery,
    entityTypeFilter,
    targetData?.targets,
  ]);

  const groupedTargets = useMemo(() => groupTargets(displayTargets), [displayTargets]);

  const previewTargets = useMemo(
    () =>
      (targetData?.targets ?? []).filter(
        (target) => (allocationsByTarget.get(buildEntityTargetKey(target))?.length ?? 0) > 0,
      ),
    [allocationsByTarget, targetData?.targets],
  );

  const metrics = useMemo(() => {
    const targets = targetData?.targets ?? [];
    const assigned = targets.filter(
      (target) => (allocationsByTarget.get(buildEntityTargetKey(target))?.length ?? 0) > 0,
    ).length;
    const totalAllocations = Array.from(allocationsByTarget.values()).reduce(
      (sum, rows) => sum + rows.length,
      0,
    );
    const unassigned = eligible.filter(
      (sponsor) => countEntityAllocationsForSponsor(sponsor) === 0,
    ).length;

    return {
      totalTargets: targets.length,
      assignedTargets: assigned,
      emptyTargets: targets.length - assigned,
      eligibleCount: eligible.length,
      unassigned,
      totalAllocations,
    };
  }, [allocationsByTarget, eligible, targetData?.targets]);

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
      toast.success(`Cleared ${targetLabel(target)}.`);
      setRowSelection((prev) => ({ ...prev, [key]: "" }));
    } catch (error) {
      toast.error(`Could not clear ${target.type} #${target.id}: ${allocationErrorMessage(error)}`);
    } finally {
      setBusyTargetKey(null);
    }
  }

  async function confirmClearAllEntityAssignments() {
    const tasks: Array<{
      sponsorId: number;
      entityType: AccountSponsorEntityType;
      entityId: number;
      allocationId: number;
    }> = [];
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
    if (!tasks.length) return;
    setIsClearingAll(true);
    try {
      for (const task of tasks) {
        await deleteAllocation.mutateAsync(task);
      }
      setRowSelection({});
      setClearAllDialogOpen(false);
      toast.success(`Cleared ${tasks.length} entity placement${tasks.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setIsClearingAll(false);
    }
  }

  if (targetsQuery.isPending) {
    return (
      <div className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]")}>
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full max-w-md" aria-hidden />
          <Skeleton className="h-72 w-full rounded-xl" aria-hidden />
        </div>
        <Skeleton className="h-72 w-full rounded-lg" aria-hidden />
      </div>
    );
  }

  if (targetsQuery.isError) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-destructive text-sm">
          {targetsQuery.error instanceof Error
            ? targetsQuery.error.message
            : "Could not load sponsor entity targets."}
        </p>
      </div>
    );
  }

  if (isAccountSponsorEntityTargetsGatewayRedirect(targetsQuery.data)) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-muted-foreground text-sm">
          Sponsor entity targets redirected: {targetsQuery.data.reason}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0">
          <div className="mb-4 max-w-3xl space-y-2">
            <TypographyH3 className="text-lg font-semibold tracking-tight">
              Assign sponsors to entities
            </TypographyH3>
            <TypographyP className="text-muted-foreground text-sm leading-relaxed">
              Sponsors you assign to a club, team, or grade are used whenever that entity appears on
              screen in your graphics and videos. Use{" "}
              <strong className="text-foreground font-medium">Assign</strong> to pick sponsors per
              row, and <strong className="text-foreground font-medium">Preview</strong> to check the
              look with your branding template.
            </TypographyP>
          </div>
          <Tabs defaultValue="assign" className="w-full">
            <TabsList
              aria-label="Entity targeting view"
              className={tabberSegmentedRailPrimaryListClass}
            >
              <TabsTrigger value="assign" className={tabberSegmentedRailPrimaryTriggerClass}>
                Assign
              </TabsTrigger>
              <TabsTrigger value="preview" className={tabberSegmentedRailPrimaryTriggerClass}>
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="assign" className="mt-4">
              <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted/55">
                      <TableHead>Entity</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTargets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                          No entity targets match filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupedTargets.flatMap((group) => [
                        <TableRow
                          key={`group:${group.key}`}
                          className="bg-muted/35 hover:bg-muted/35"
                        >
                          <TableCell colSpan={3} className="h-10 py-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Layers className="text-muted-foreground size-4" aria-hidden />
                              <span>{group.label}</span>
                              <Badge variant="outline" className="ml-1">
                                {group.targets.length}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>,
                        ...group.targets.map((target) => {
                          const key = buildEntityTargetKey(target);
                          const assignments = allocationsByTarget.get(key) ?? [];
                          const rowBusy = busyTargetKey === key || isPending || isClearingAll;
                          const selectValue = rowSelection[key] ?? "";
                          const context = targetContextLabel(target);
                          const firstAssignment = assignments[0] ?? null;
                          const previewSponsor =
                            firstAssignment != null
                              ? (sponsorByNumericId.get(firstAssignment.sponsorId) ?? null)
                              : null;
                          const hasAssignment = firstAssignment != null;

                          return (
                            <TableRow key={key}>
                              <TableCell className="whitespace-normal">
                                <div className="flex max-w-md min-w-0 items-center gap-3">
                                  <EntityAssignmentPreview sponsor={previewSponsor} />
                                  <div className="grid min-w-0 gap-1">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      <span className="min-w-0 font-medium">
                                        {targetLabel(target)}
                                      </span>
                                      <Badge variant="secondary">{target.type}</Badge>
                                    </div>
                                    {context ? (
                                      <p className="text-muted-foreground text-xs">{context}</p>
                                    ) : null}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="min-w-56 whitespace-normal">
                                <div className="grid gap-2">
                                  {hasAssignment ? (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-medium">
                                        {previewSponsor?.name ?? firstAssignment.sponsorName}
                                      </span>
                                      {assignments.length > 1 ? (
                                        <Badge variant="destructive">
                                          +{assignments.length - 1}
                                        </Badge>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <Select
                                      value={selectValue}
                                      onValueChange={(v) =>
                                        setRowSelection((prev) => ({ ...prev, [key]: v }))
                                      }
                                      disabled={rowBusy}
                                    >
                                      <SelectTrigger className="h-auto min-h-9 w-full max-w-md py-1.5">
                                        <SelectValue placeholder="Select sponsor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {eligible.map((sponsor) => (
                                          <SelectItem
                                            key={sponsor.id}
                                            value={String(sponsor.id)}
                                            textValue={sponsor.name}
                                          >
                                            <SponsorSelectOptionLabel
                                              name={sponsor.name}
                                              logoUrl={sponsor.logoUrl}
                                              logoAlt={sponsor.logoAlt}
                                            />
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right whitespace-normal">
                                <div className="flex justify-end gap-2">
                                  {!hasAssignment ? (
                                    <Button
                                      type="button"
                                      variant="brand"
                                      size="sm"
                                      className="h-8"
                                      disabled={rowBusy || !selectValue}
                                      onClick={() => void assignToTarget(target)}
                                    >
                                      Assign
                                    </Button>
                                  ) : null}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="compact"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent shadow-none hover:translate-y-0 hover:border-transparent"
                                    disabled={rowBusy || !hasAssignment}
                                    onClick={() => void clearTarget(target)}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }),
                      ])
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="flex min-w-0 flex-col gap-6">
                {showBrandingAssetPreviewSkeleton ? (
                  <div className="bg-card text-card-foreground ring-border w-full overflow-hidden rounded-2xl shadow-xl ring-1">
                    <div className="border-border space-y-2 border-b px-6 py-5">
                      <Skeleton className="h-3 w-28" aria-hidden />
                      <Skeleton className="h-9 w-full max-w-sm" aria-hidden />
                    </div>
                    <Skeleton className="aspect-4/5 w-full rounded-none" aria-hidden />
                  </div>
                ) : null}
                {showBrandingAssetPreview ? (
                  <SponsorEntityAssetPreview
                    className="w-full"
                    primaryHex={assetPreviewPalette.primary}
                    secondaryHex={assetPreviewPalette.secondary}
                    templateModeSlug={assetPreviewTemplateModeSlug}
                    allocationsByTarget={allocationsByTarget}
                    sponsorByNumericId={sponsorByNumericId}
                    primarySponsors={primaryPositionSponsors}
                    previewTargets={targetData?.targets ?? previewTargets}
                  />
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
          <div className="bg-background overflow-hidden rounded-lg border">
            <div className="bg-muted flex flex-col gap-2.5 px-3 py-2.5">
              <div className="space-y-1">
                <p className="text-muted-foreground text-center text-[11px] font-semibold tracking-wide uppercase">
                  Entity targets
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full text-center text-xs font-medium">
                      Targeted
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {metrics.assignedTargets}
                      <span className="text-muted-foreground text-sm font-normal">
                        {" "}
                        / {metrics.totalTargets}
                      </span>
                    </span>
                  </div>
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full text-center text-xs font-medium">
                      Empty
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {metrics.emptyTargets}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-center text-[11px] font-semibold tracking-wide uppercase">
                  Sponsors
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full max-w-full text-center text-xs leading-snug font-medium">
                      Available sponsors
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {metrics.eligibleCount}
                    </span>
                  </div>
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full text-center text-xs font-medium">
                      Unassigned
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {metrics.unassigned}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 px-5 pt-0 pb-4">
              <Input
                type="search"
                value={entitySearchQuery}
                onChange={(e) => setEntitySearchQuery(e.target.value)}
                placeholder="Search clubs, teams, or grades…"
                aria-label="Filter entities by name"
                className="h-9 w-full md:text-sm"
              />
              <Select
                value={entityRowFilter}
                onValueChange={(v) => setEntityRowFilter(v as EntityRowFilter)}
              >
                <SelectTrigger className="h-9 w-full" aria-label="Filter entities by assignment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  <SelectItem value="assigned">Targeted only</SelectItem>
                  <SelectItem value="unassigned">Empty only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={entityTypeFilter}
                onValueChange={(v) => setEntityTypeFilter(v as EntityTypeFilter)}
              >
                <SelectTrigger className="h-9 w-full" aria-label="Filter entities by type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="grade">Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="bg-muted/25 px-5 pt-0 pb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive h-9 w-full"
                disabled={
                  metrics.totalAllocations === 0 ||
                  isPending ||
                  busyTargetKey !== null ||
                  clearAllDialogOpen ||
                  isClearingAll
                }
                onClick={() => setClearAllDialogOpen(true)}
              >
                Clear all
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={clearAllDialogOpen}
        onOpenChange={(open) => {
          if (!open && isClearingAll) return;
          if (!open) setClearAllDialogOpen(false);
        }}
      >
        <DialogContent
          showCloseButton={!isClearingAll}
          onPointerDownOutside={(event) => {
            if (isClearingAll) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isClearingAll) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isClearingAll ? "Clearing entity placements" : "Clear all entity placements?"}
            </DialogTitle>
            <DialogDescription>
              {isClearingAll
                ? "Please wait while placements are removed."
                : `This removes every sponsor from all ${metrics.totalAllocations} entity placement${metrics.totalAllocations === 1 ? "" : "s"}. You can assign sponsors again afterwards.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="brandPrimaryOutline"
              disabled={isClearingAll}
              onClick={() => setClearAllDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isClearingAll}
              loading={isClearingAll}
              loadingText="Clearing…"
              onClick={() => void confirmClearAllEntityAssignments()}
            >
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
