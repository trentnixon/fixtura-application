"use client";

import { MapPinned } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountReadOnly } from "@/lib/support/use-account-read-only";
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
import {
  MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME,
  ManageSponsorsContainerHeaderTitle,
} from "../shared/manage-sponsors-container-header-title";

import type {
  SponsorSlotPlacementActions,
  SponsorSlotPlacementPanelProps,
  SponsorSlotPlacementState,
} from "./_types/sponsor-slot-placement-panel";

export function SponsorSlotPlacementPanel({ accountId, sponsors }: SponsorSlotPlacementPanelProps) {
  const readOnly = useAccountReadOnly();
  const { state, actions } = useSponsorSlotPlacementPanel({ accountId, sponsors });

  return (
    <>
      <div
        className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="bg-card text-card-foreground ring-border w-full min-w-0 overflow-hidden rounded-2xl border-none shadow-xl ring-1">
          <SponsorSlotPlacementPanelHeader />
          <div className="p-5">
            <SponsorSlotPlacementTabs state={state} actions={actions} readOnly={readOnly} />
          </div>
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
          readOnly={readOnly}
        />
      </div>

      {!readOnly ? (
        <ClearAllPositionAssignmentsDialog
          open={state.clearAllDialogOpen}
          isClearingAll={state.mutationState.isClearingAll}
          metrics={state.metrics}
          onOpenChange={actions.setClearAllDialogOpen}
          onConfirm={() => void actions.confirmClearAllPositionAssignments()}
        />
      ) : null}
    </>
  );
}

function SponsorSlotPlacementPanelHeader() {
  return (
    <div className={MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME}>
      <ManageSponsorsContainerHeaderTitle
        icon={<MapPinned className="size-5" aria-hidden />}
        title="Assign sponsors to positions"
        description="Map active sponsors to fixed account-wide slots for graphics and videos."
      />
    </div>
  );
}

function SponsorSlotPlacementTabs({
  state,
  actions,
  readOnly = false,
}: {
  state: SponsorSlotPlacementState;
  actions: SponsorSlotPlacementActions;
  readOnly?: boolean;
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
          readOnly={readOnly}
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
