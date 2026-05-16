"use client";

import { TypographyH3, TypographyP } from "@/components/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ClearAllPositionAssignmentsDialog } from "./_components/clear-all-position-assignments-dialog";
import { SponsorPositionPreviewSkeleton } from "./_components/sponsor-position-preview-skeleton";
import { SponsorSlotPlacementSidebar } from "./_components/sponsor-slot-placement-sidebar";
import { SponsorSlotPlacementTable } from "./_components/sponsor-slot-placement-table";
import {
  TABBER_SEGMENTED_RAIL_PRIMARY_LIST_CLASS,
  TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS,
} from "./_constants/sponsor-slot-placement-panel";
import { useSponsorSlotPlacementPanel } from "./_hooks/use-sponsor-slot-placement-panel";
import { SponsorPositionAssetPreview } from "./sponsor-position-asset-preview";

import type {
  SponsorSlotPlacementActions,
  SponsorSlotPlacementPanelProps,
  SponsorSlotPlacementState,
} from "./_types/sponsor-slot-placement-panel";

export function SponsorSlotPlacementPanel({ accountId, sponsors }: SponsorSlotPlacementPanelProps) {
  const { state, actions } = useSponsorSlotPlacementPanel({ accountId, sponsors });

  return (
    <>
      <div
        className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0">
          <SponsorSlotPlacementPanelHeader />
          <SponsorSlotPlacementTabs state={state} actions={actions} />
        </div>

        <SponsorSlotPlacementSidebar
          metrics={state.metrics}
          mutationState={state.mutationState}
          clearAllDialogOpen={state.clearAllDialogOpen}
          sponsorSearchQuery={state.sponsorSearchQuery}
          assignmentRowFilter={state.assignmentRowFilter}
          slotKindFilter={state.slotKindFilter}
          canAddGeneralRow={state.canAddGeneralRow}
          generalPositionSlotsRemaining={state.generalPositionSlotsRemaining}
          setSponsorSearchQuery={actions.setSponsorSearchQuery}
          setAssignmentRowFilter={actions.setAssignmentRowFilter}
          setSlotKindFilter={actions.setSlotKindFilter}
          onAddGeneralRow={actions.addGeneralSlotRow}
          onClearAll={() => actions.setClearAllDialogOpen(true)}
        />
      </div>

      <ClearAllPositionAssignmentsDialog
        open={state.clearAllDialogOpen}
        isClearingAll={state.mutationState.isClearingAll}
        metrics={state.metrics}
        onOpenChange={actions.setClearAllDialogOpen}
        onConfirm={() => void actions.confirmClearAllPositionAssignments()}
      />
    </>
  );
}

function SponsorSlotPlacementPanelHeader() {
  return (
    <div className="mb-4 max-w-3xl space-y-2">
      <TypographyH3 className="text-lg font-semibold tracking-tight">
        Assign sponsors to positions
      </TypographyH3>
      <TypographyP className="text-muted-foreground text-sm leading-relaxed">
        Map your active sponsors to fixed account-wide slots so graphics and videos know who to
        show. <strong className="text-foreground font-medium">Primary</strong> positions (up to
        four) are your headline placements: they can appear throughout your videos and images and
        sit at the top of the sponsor list on end screens.{" "}
        <strong className="text-foreground font-medium">General</strong> positions add more sponsors
        in order, typically on final end screens and in matching images. Use{" "}
        <strong className="text-foreground font-medium">Assign</strong> to fill or change slots, and{" "}
        <strong className="text-foreground font-medium">Preview</strong> to see how placements look
        with your branding template.
      </TypographyP>
    </div>
  );
}

function SponsorSlotPlacementTabs({
  state,
  actions,
}: {
  state: SponsorSlotPlacementState;
  actions: SponsorSlotPlacementActions;
}) {
  return (
    <Tabs defaultValue="assign" className="w-full">
      <TabsList aria-label="Placement view" className={TABBER_SEGMENTED_RAIL_PRIMARY_LIST_CLASS}>
        <TabsTrigger value="assign" className={TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS}>
          Assign
        </TabsTrigger>
        <TabsTrigger value="preview" className={TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS}>
          Preview
        </TabsTrigger>
      </TabsList>
      <TabsContent value="assign" className="mt-4">
        <SponsorSlotPlacementTable
          displaySlots={state.displaySlots}
          occupants={state.occupants}
          sponsorByNumericId={state.sponsorByNumericId}
          eligibleForPicker={state.eligibleForPicker}
          rowSelection={state.rowSelection}
          mutationState={state.mutationState}
          setRowSelection={actions.setRowSelection}
          assignToSlot={actions.assignToSlot}
          clearSlot={actions.clearSlot}
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-4">
        <SponsorSlotPlacementPreview state={state} />
      </TabsContent>
    </Tabs>
  );
}

function SponsorSlotPlacementPreview({ state }: { state: SponsorSlotPlacementState }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {state.showBrandingAssetPreviewSkeleton ? <SponsorPositionPreviewSkeleton /> : null}
      {state.showBrandingAssetPreview ? (
        <SponsorPositionAssetPreview
          className="w-full"
          primaryHex={state.assetPreviewPalette.primary}
          secondaryHex={state.assetPreviewPalette.secondary}
          templateModeSlug={state.assetPreviewTemplateModeSlug}
          occupants={state.occupants}
          sponsorByNumericId={state.sponsorByNumericId}
          previewSlots={state.tableSlots}
        />
      ) : null}
    </div>
  );
}
