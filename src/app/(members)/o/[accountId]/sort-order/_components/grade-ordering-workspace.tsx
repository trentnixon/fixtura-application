"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUPPORT_READ_ONLY_FORM_DESCRIPTION } from "@/lib/support/support-read-only-copy";
import { useAccountReadOnly } from "@/lib/support/use-account-read-only";

import { GradeOrderingGroupCard } from "./grade-ordering-group-card";
import { GradeOrderingHeader } from "./grade-ordering-header";
import { useGradeOrderingEditor } from "../_hooks/use-grade-ordering-editor";

import type { GradeOrderingGetParams, GradeOrderingResponseData } from "@/types/api/grade-ordering";

export function GradeOrderingWorkspace({
  accountId,
  orgParams,
  canonicalData,
}: {
  accountId: string;
  orgParams: GradeOrderingGetParams;
  canonicalData: GradeOrderingResponseData;
}) {
  const readOnly = useAccountReadOnly();
  const {
    draft,
    gradeLookup,
    hasChanges,
    mutation,
    saveDisabled,
    conflictOpen,
    setConflictOpen,
    clearDialogOpen,
    setClearDialogOpen,
    handleReorder,
    handleReset,
    handleSave,
    handleLoadLatestAfterConflict,
    handleReviewAfterConflict,
    handleClearCustomOrder,
  } = useGradeOrderingEditor({ accountId, orgParams, canonicalData });

  const saveFooter = {
    hasChanges,
    saveDisabled,
    isPending: mutation.isPending,
    hasGroups: draft.groups.length > 0,
    onReset: handleReset,
    onClear: () => setClearDialogOpen(true),
    onSave: () => {
      void handleSave();
    },
  };

  return (
    <div className="space-y-8">
      {readOnly ? (
        <div
          role="status"
          className="border-border bg-muted/40 text-muted-foreground rounded-lg border px-4 py-3 text-sm"
        >
          {SUPPORT_READ_ONLY_FORM_DESCRIPTION}
        </div>
      ) : null}

      <GradeOrderingHeader organisationName={canonicalData.organisation.name} />

      {mutation.isError && mutation.error instanceof Error ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 rounded-lg border px-4 py-3 text-sm"
        >
          {mutation.error.message}
        </div>
      ) : null}

      <div className="space-y-6">
        {draft.groups.map((group) => (
          <GradeOrderingGroupCard
            key={`${group.groupType}-${group.groupKey}`}
            group={group}
            gradeLookup={gradeLookup}
            onReorder={(itemIds) => handleReorder(group.groupKey, itemIds)}
            disabled={mutation.isPending || readOnly}
            {...(readOnly ? {} : { saveFooter })}
          />
        ))}
      </div>

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order changed elsewhere</DialogTitle>
            <DialogDescription>
              Someone else saved while you were editing. Load their order, or keep yours and review
              it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleReviewAfterConflict}>
              Keep my changes
            </Button>
            <Button type="button" onClick={() => void handleLoadLatestAfterConflict()}>
              Load latest order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear custom grade order?</DialogTitle>
            <DialogDescription>
              This clears your saved order for every group and puts grades back in the default
              order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleClearCustomOrder()}>
              Clear custom order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
