"use client";

import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { TypographyH3, TypographyP } from "@/components/typography";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountSponsorAllocationsGeneralMutations } from "@/lib/api/hooks/account/useAccountSponsorAllocationsGeneralMutations";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { cn } from "@/lib/utils";

import { SponsorPositionAssetPreview } from "./sponsor-position-asset-preview";
import {
  ALL_GENERAL_POSITION_SLOTS,
  ALL_POSITION_SLOT_IDS,
  INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE,
  MAX_GENERAL_SPONSOR_SLOTS,
  PRIMARY_POSITION_SLOTS,
  PRIMARY_POSITION_SLOT_IDS,
  getSponsorPositionSlotDescription,
  type SponsorPositionSlotDef,
} from "../../_constants/sponsor-position-slots";
import {
  buildGeneralPositionAllocationBody,
  collectPositionSlotOccupants,
  countPositionSlotAllocationsForSponsor,
} from "../../_utils/sponsorship-allocation-general";
import { SponsorSelectOptionLabel } from "../sponsor-select-option-label";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

type AssignmentRowFilter = "all" | "empty" | "filled";
type SlotKindFilter = "all" | "primary" | "general";

/** Segmented rail using theme primary (active tab uses solid primary). */
const tabberSegmentedRailPrimaryListClass =
  "text-muted-foreground grid w-full max-w-md grid-cols-2 border border-primary/25 bg-primary/10 p-1 shadow-none";

const tabberSegmentedRailPrimaryTriggerClass =
  "shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

function allocationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return AUTH_ERROR_MESSAGES.unexpected;
}

function SlotAssignmentPreview({
  sponsor,
  size = "default",
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  size?: "default" | "compact";
}) {
  const box = size === "compact" ? "size-10 rounded-md text-[10px]" : "size-12 rounded-lg text-xs";
  if (!sponsor) {
    return (
      <div
        className={cn(
          "text-muted-foreground border-border flex shrink-0 items-center justify-center border border-dashed bg-white font-medium",
          box,
        )}
        role="img"
        aria-label="No sponsor assigned"
      >
        —
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border bg-white",
        box,
      )}
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

export function SponsorSlotPlacementPanel({
  accountId,
  sponsors,
}: {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
}) {
  const segmentOk = isValidAccountIdSegment(accountId);
  const brandingQuery = useAccountBranding(accountId, { enabled: segmentOk });
  const templateModesQuery = useTemplateModesUi({ enabled: segmentOk });

  const brandingAccountData = useMemo(() => {
    if (!brandingQuery.isSuccess || !brandingQuery.data) return null;
    if (isAccountBrandingGatewayRedirect(brandingQuery.data)) return null;
    return brandingQuery.data.data;
  }, [brandingQuery.isSuccess, brandingQuery.data]);

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

  const { postAllocation, deleteAllocation, isPending } =
    useAccountSponsorAllocationsGeneralMutations(accountId);
  const [busySlotId, setBusySlotId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, string>>({});
  const [generalSlotVisibleCount, setGeneralSlotVisibleCount] = useState(
    INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE,
  );
  const [assignmentRowFilter, setAssignmentRowFilter] = useState<AssignmentRowFilter>("all");
  const [slotKindFilter, setSlotKindFilter] = useState<SlotKindFilter>("all");
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState("");

  const occupants = useMemo(
    () => collectPositionSlotOccupants(sponsors, ALL_POSITION_SLOT_IDS),
    [sponsors],
  );

  const eligible = useMemo(() => buildEligibleSponsors(sponsors), [sponsors]);

  const sponsorByNumericId = useMemo(() => {
    const m = new Map<number, ManageSponsorsWorkspaceSponsor>();
    for (const s of sponsors) {
      if (typeof s.id === "number" && s.id > 0) m.set(s.id, s);
    }
    return m;
  }, [sponsors]);

  useEffect(() => {
    let maxGeneralIndex = 0;
    for (const id of occupants.keys()) {
      const m = /^general_sponsor_(\d+)$/.exec(id);
      if (m) maxGeneralIndex = Math.max(maxGeneralIndex, Number(m[1]));
    }
    setGeneralSlotVisibleCount((current) =>
      Math.min(
        MAX_GENERAL_SPONSOR_SLOTS,
        Math.max(current, INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE, maxGeneralIndex),
      ),
    );
  }, [occupants]);

  const tableSlots = useMemo(
    () => [
      ...PRIMARY_POSITION_SLOTS,
      ...ALL_GENERAL_POSITION_SLOTS.slice(0, generalSlotVisibleCount),
    ],
    [generalSlotVisibleCount],
  );

  const positionMetrics = useMemo(() => {
    const total = tableSlots.length;
    const filled = tableSlots.filter((s) => occupants.has(s.id)).length;
    const empty = total - filled;
    const unassigned = eligible.filter(
      (s) => countPositionSlotAllocationsForSponsor(s) === 0,
    ).length;
    return {
      total,
      filled,
      empty,
      eligibleCount: eligible.length,
      unassigned,
    };
  }, [tableSlots, occupants, eligible]);

  const displaySlots = useMemo(() => {
    const q = sponsorSearchQuery.trim().toLowerCase();
    let slots = tableSlots;
    if (assignmentRowFilter === "empty") {
      slots = slots.filter((s) => !occupants.has(s.id));
    } else if (assignmentRowFilter === "filled") {
      slots = slots.filter((s) => occupants.has(s.id));
    }
    if (slotKindFilter === "primary") {
      slots = slots.filter((s) => PRIMARY_POSITION_SLOT_IDS.has(s.id));
    } else if (slotKindFilter === "general") {
      slots = slots.filter((s) => !PRIMARY_POSITION_SLOT_IDS.has(s.id));
    }
    if (q.length) {
      slots = slots.filter((slot) => {
        const occupant = occupants.get(slot.id);
        if (!occupant) return true;
        const assigned = sponsorByNumericId.get(occupant.sponsorId);
        const label = (assigned?.name ?? `Sponsor #${occupant.sponsorId}`).toLowerCase();
        return label.includes(q);
      });
    }
    return slots;
  }, [
    tableSlots,
    occupants,
    sponsorByNumericId,
    assignmentRowFilter,
    slotKindFilter,
    sponsorSearchQuery,
  ]);

  const eligibleForPicker = useMemo(() => {
    const q = sponsorSearchQuery.trim().toLowerCase();
    if (!q.length) return eligible;
    return eligible.filter((s) => s.name.toLowerCase().includes(q));
  }, [eligible, sponsorSearchQuery]);

  const canAddGeneralRow = generalSlotVisibleCount < MAX_GENERAL_SPONSOR_SLOTS;
  const generalPositionSlotsRemaining = MAX_GENERAL_SPONSOR_SLOTS - generalSlotVisibleCount;

  function addGeneralSlotRow() {
    setGeneralSlotVisibleCount((n) => Math.min(MAX_GENERAL_SPONSOR_SLOTS, n + 1));
  }

  async function assignToSlot(slot: SponsorPositionSlotDef) {
    const raw = rowSelection[slot.id] ?? "";
    const targetId = Number(raw);
    if (!raw || !Number.isFinite(targetId) || targetId <= 0) {
      toast.error("Choose a sponsor for this slot.");
      return;
    }
    const target = sponsorByNumericId.get(targetId);
    if (!target?.isActive || !target.hasLogo) {
      toast.error("Choose an active sponsor with a logo.");
      return;
    }

    const occupant = occupants.get(slot.id);
    if (occupant && occupant.sponsorId === targetId) {
      toast.message("This sponsor is already assigned to the slot.");
      return;
    }

    setBusySlotId(slot.id);
    try {
      if (occupant) {
        await deleteAllocation.mutateAsync({
          sponsorId: occupant.sponsorId,
          allocationId: occupant.allocationId,
        });
      }
      await postAllocation.mutateAsync({
        sponsorId: targetId,
        body: buildGeneralPositionAllocationBody(slot),
      });
      toast.success(`Assigned ${target.name} to ${slot.title}.`);
      setRowSelection((prev) => ({ ...prev, [slot.id]: "" }));
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setBusySlotId(null);
    }
  }

  async function clearSlot(slotId: string) {
    const occupant = occupants.get(slotId);
    if (!occupant) return;
    setBusySlotId(slotId);
    try {
      await deleteAllocation.mutateAsync({
        sponsorId: occupant.sponsorId,
        allocationId: occupant.allocationId,
      });
      toast.success("Removed assignment.");
      setRowSelection((prev) => ({ ...prev, [slotId]: "" }));
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setBusySlotId(null);
    }
  }

  async function confirmClearAllPositionAssignments() {
    const pairs = Array.from(occupants.entries());
    if (!pairs.length) return;
    setIsClearingAll(true);
    try {
      for (const [, occ] of pairs) {
        await deleteAllocation.mutateAsync({
          sponsorId: occ.sponsorId,
          allocationId: occ.allocationId,
        });
      }
      setRowSelection({});
      setClearAllDialogOpen(false);
      toast.success(`Cleared ${pairs.length} position assignment${pairs.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setIsClearingAll(false);
    }
  }

  return (
    <>
      <div
        className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0">
          <div className="mb-4 max-w-3xl space-y-2">
            <TypographyH3 className="text-lg font-semibold tracking-tight">
              Assign sponsors to positions
            </TypographyH3>
            <TypographyP className="text-muted-foreground text-sm leading-relaxed">
              Map your active sponsors to fixed account-wide slots so graphics and videos know who
              to show. <strong className="text-foreground font-medium">Primary</strong> positions
              (up to four) are your headline placements: they can appear throughout your videos and
              images and sit at the top of the sponsor list on end screens.{" "}
              <strong className="text-foreground font-medium">General</strong> positions add more
              sponsors in order—typically on final end screens and in matching images. Use{" "}
              <strong className="text-foreground font-medium">Assign</strong> to fill or change
              slots, and <strong className="text-foreground font-medium">Preview</strong> to see how
              placements look with your branding template.
            </TypographyP>
          </div>
          <Tabs defaultValue="assign" className="w-full">
            <TabsList aria-label="Placement view" className={tabberSegmentedRailPrimaryListClass}>
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
                      <TableHead>Position</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displaySlots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                          No positions match filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displaySlots.map((slot) => {
                        const occupant = occupants.get(slot.id);
                        const assigned = occupant
                          ? (sponsorByNumericId.get(occupant.sponsorId) ?? null)
                          : null;
                        const rowBusy = busySlotId === slot.id || isPending || isClearingAll;
                        const selectValue = rowSelection[slot.id] ?? "";

                        return (
                          <TableRow
                            key={slot.id}
                            className={cn(
                              PRIMARY_POSITION_SLOT_IDS.has(slot.id) &&
                                "bg-brand/10 hover:bg-brand/15 dark:bg-brand/15 dark:hover:bg-brand/20",
                            )}
                          >
                            <TableCell className="whitespace-normal">
                              <div className="flex max-w-xs min-w-0 items-center gap-3">
                                <SlotAssignmentPreview sponsor={assigned} />
                                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                                  <span className="min-w-0 truncate">{slot.title}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-7 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                                        aria-label={`About ${slot.title}`}
                                      >
                                        <Info className="size-3.5" aria-hidden />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      {getSponsorPositionSlotDescription(slot.id)}
                                    </TooltipContent>
                                  </Tooltip>
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-48 whitespace-normal">
                              {occupant ? (
                                <span className="font-medium">
                                  {assigned?.name ?? `Sponsor #${occupant.sponsorId}`}
                                </span>
                              ) : (
                                <Select
                                  value={selectValue}
                                  onValueChange={(v) =>
                                    setRowSelection((prev) => ({ ...prev, [slot.id]: v }))
                                  }
                                  disabled={rowBusy}
                                >
                                  <SelectTrigger className="h-auto min-h-9 w-full max-w-md py-1.5">
                                    <SelectValue placeholder="Select sponsor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {eligibleForPicker.map((sponsor) => (
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
                            </TableCell>
                            <TableCell className="text-right whitespace-normal">
                              <div className="flex justify-end gap-2">
                                {!occupant ? (
                                  <Button
                                    type="button"
                                    variant="brand"
                                    size="sm"
                                    className="h-8"
                                    disabled={rowBusy || !selectValue}
                                    onClick={() => void assignToSlot(slot)}
                                  >
                                    Assign
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="compact"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent shadow-none hover:translate-y-0 hover:border-transparent"
                                  disabled={rowBusy || !occupant}
                                  onClick={() => void clearSlot(slot.id)}
                                >
                                  Clear
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                  <SponsorPositionAssetPreview
                    className="w-full"
                    primaryHex={assetPreviewPalette.primary}
                    secondaryHex={assetPreviewPalette.secondary}
                    templateModeSlug={assetPreviewTemplateModeSlug}
                    occupants={occupants}
                    sponsorByNumericId={sponsorByNumericId}
                    previewSlots={tableSlots}
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
                  Position slots
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full text-center text-xs font-medium">
                      Filled
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {positionMetrics.filled}
                      <span className="text-muted-foreground text-sm font-normal">
                        {" "}
                        / {positionMetrics.total}
                      </span>
                    </span>
                  </div>
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full text-center text-xs font-medium">
                      Empty
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {positionMetrics.empty}
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
                      {positionMetrics.eligibleCount}
                    </span>
                  </div>
                  <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
                    <span className="text-muted-foreground w-full text-center text-xs font-medium">
                      Unassigned
                    </span>
                    <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
                      {positionMetrics.unassigned}
                    </span>
                  </div>
                </div>
              </div>
              {canAddGeneralRow ? (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    className="h-9 w-full"
                    disabled={isClearingAll}
                    onClick={addGeneralSlotRow}
                    aria-label={`Add general position (${generalPositionSlotsRemaining} slot${generalPositionSlotsRemaining === 1 ? "" : "s"} left)`}
                  >
                    + Add general position ({generalPositionSlotsRemaining})
                  </Button>
                </div>
              ) : null}
            </div>
            <Separator />
            <div className="flex flex-col gap-3 px-5 pt-0 pb-4">
              <Input
                type="search"
                value={sponsorSearchQuery}
                onChange={(e) => setSponsorSearchQuery(e.target.value)}
                placeholder="Search by sponsor name…"
                aria-label="Filter positions by assigned sponsor name"
                className="h-9 w-full md:text-sm"
              />
              <Select
                value={assignmentRowFilter}
                onValueChange={(v) => setAssignmentRowFilter(v as AssignmentRowFilter)}
              >
                <SelectTrigger className="h-9 w-full" aria-label="Filter positions by assignment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All positions</SelectItem>
                  <SelectItem value="empty">Empty only</SelectItem>
                  <SelectItem value="filled">Filled only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={slotKindFilter}
                onValueChange={(v) => setSlotKindFilter(v as SlotKindFilter)}
              >
                <SelectTrigger className="h-9 w-full" aria-label="Filter positions by slot type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="general">General</SelectItem>
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
                  occupants.size === 0 ||
                  isPending ||
                  busySlotId !== null ||
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
              {isClearingAll ? "Clearing positions" : "Clear all position assignments?"}
            </DialogTitle>
            <DialogDescription>
              {isClearingAll
                ? "Please wait while assignments are removed."
                : `This removes every sponsor from all ${occupants.size} filled position slot${occupants.size === 1 ? "" : "s"}. You can assign sponsors again afterwards.`}
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
              onClick={() => void confirmClearAllPositionAssignments()}
            >
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
