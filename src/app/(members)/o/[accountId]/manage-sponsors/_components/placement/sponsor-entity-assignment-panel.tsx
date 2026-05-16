"use client";

import { TypographyH3, TypographyP } from "@/components/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAccountSponsorEntityTargetsGatewayRedirect } from "@/lib/api/hooks/account/useAccountSponsorEntityTargets";
import { cn } from "@/lib/utils";

import { ClearAllEntityAssignmentsDialog } from "./_components/clear-all-entity-assignments-dialog";
import { SponsorEntityAssignmentError } from "./_components/sponsor-entity-assignment-error";
import { SponsorEntityAssignmentLoading } from "./_components/sponsor-entity-assignment-loading";
import { SponsorEntityAssignmentRedirect } from "./_components/sponsor-entity-assignment-redirect";
import { SponsorEntityAssignmentSidebar } from "./_components/sponsor-entity-assignment-sidebar";
import { SponsorEntityAssignmentTable } from "./_components/sponsor-entity-assignment-table";
import { SponsorEntityPreviewSkeleton } from "./_components/sponsor-entity-preview-skeleton";
import {
  TABBER_SEGMENTED_RAIL_PRIMARY_LIST_CLASS,
  TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS,
} from "./_constants/sponsor-entity-assignment-panel";
import { useSponsorEntityAssignmentPanel } from "./_hooks/use-sponsor-entity-assignment-panel";
import { resolveEntityPreviewTargets } from "./_utils/sponsor-entity-assignment-panel";
import { SponsorEntityAssetPreview } from "./sponsor-entity-asset-preview";

import type {
  SponsorEntityAssignmentActions,
  SponsorEntityAssignmentPanelProps,
  SponsorEntityAssignmentState,
} from "./_types/sponsor-entity-assignment-panel";

export function SponsorEntityAssignmentPanel({
  accountId,
  sponsors,
}: SponsorEntityAssignmentPanelProps) {
  const { targetsQuery, state, actions } = useSponsorEntityAssignmentPanel({
    accountId,
    sponsors,
  });

  if (targetsQuery.isPending) {
    return <SponsorEntityAssignmentLoading />;
  }

  if (targetsQuery.isError) {
    return <SponsorEntityAssignmentError error={targetsQuery.error} />;
  }

  if (isAccountSponsorEntityTargetsGatewayRedirect(targetsQuery.data)) {
    return <SponsorEntityAssignmentRedirect reason={targetsQuery.data.reason} />;
  }

  return (
    <>
      <div
        className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0">
          <SponsorEntityAssignmentPanelHeader />
          <SponsorEntityAssignmentTabs state={state} actions={actions} />
        </div>

        <SponsorEntityAssignmentSidebar
          metrics={state.metrics}
          mutationState={state.mutationState}
          clearAllDialogOpen={state.clearAllDialogOpen}
          entitySearchQuery={state.entitySearchQuery}
          entityRowFilter={state.entityRowFilter}
          entityTypeFilter={state.entityTypeFilter}
          setEntitySearchQuery={actions.setEntitySearchQuery}
          setEntityRowFilter={actions.setEntityRowFilter}
          setEntityTypeFilter={actions.setEntityTypeFilter}
          onClearAll={() => actions.setClearAllDialogOpen(true)}
        />
      </div>

      <ClearAllEntityAssignmentsDialog
        open={state.clearAllDialogOpen}
        isClearingAll={state.mutationState.isClearingAll}
        metrics={state.metrics}
        onOpenChange={actions.setClearAllDialogOpen}
        onConfirm={() => void actions.confirmClearAllEntityAssignments()}
      />
    </>
  );
}

function SponsorEntityAssignmentPanelHeader() {
  return (
    <div className="mb-4 max-w-3xl space-y-2">
      <TypographyH3 className="text-lg font-semibold tracking-tight">
        Assign sponsors to entities
      </TypographyH3>
      <TypographyP className="text-muted-foreground text-sm leading-relaxed">
        Sponsors you assign to a club, team, or grade are used whenever that entity appears on
        screen in your graphics and videos. Use{" "}
        <strong className="text-foreground font-medium">Assign</strong> to pick sponsors per row,
        and <strong className="text-foreground font-medium">Preview</strong> to check the look with
        your branding template.
      </TypographyP>
    </div>
  );
}

function SponsorEntityAssignmentTabs({
  state,
  actions,
}: {
  state: SponsorEntityAssignmentState;
  actions: SponsorEntityAssignmentActions;
}) {
  return (
    <Tabs defaultValue="assign" className="w-full">
      <TabsList
        aria-label="Entity targeting view"
        className={TABBER_SEGMENTED_RAIL_PRIMARY_LIST_CLASS}
      >
        <TabsTrigger value="assign" className={TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS}>
          Assign
        </TabsTrigger>
        <TabsTrigger value="preview" className={TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS}>
          Preview
        </TabsTrigger>
      </TabsList>
      <TabsContent value="assign" className="mt-4">
        <SponsorEntityAssignmentTable
          groupedTargets={state.groupedTargets}
          allocationsByTarget={state.allocationsByTarget}
          sponsorByNumericId={state.sponsorByNumericId}
          eligibleSponsors={state.eligibleSponsors}
          rowSelection={state.rowSelection}
          mutationState={state.mutationState}
          setRowSelection={actions.setRowSelection}
          assignToTarget={actions.assignToTarget}
          clearTarget={actions.clearTarget}
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-4">
        <SponsorEntityAssignmentPreview state={state} />
      </TabsContent>
    </Tabs>
  );
}

function SponsorEntityAssignmentPreview({ state }: { state: SponsorEntityAssignmentState }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {state.showBrandingAssetPreviewSkeleton ? <SponsorEntityPreviewSkeleton /> : null}
      {state.showBrandingAssetPreview ? (
        <SponsorEntityAssetPreview
          className="w-full"
          primaryHex={state.assetPreviewPalette.primary}
          secondaryHex={state.assetPreviewPalette.secondary}
          templateModeSlug={state.assetPreviewTemplateModeSlug}
          allocationsByTarget={state.allocationsByTarget}
          sponsorByNumericId={state.sponsorByNumericId}
          primarySponsors={state.primaryPositionSponsors}
          previewTargets={resolveEntityPreviewTargets({
            allTargets: state.allTargets,
            previewTargets: state.previewTargets,
          })}
        />
      ) : null}
    </div>
  );
}
