import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { EntityAssignmentMetrics } from "../_types/sponsor-entity-assignment-panel";

export function ClearAllEntityAssignmentsDialog({
  open,
  isClearingAll,
  metrics,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  isClearingAll: boolean;
  metrics: EntityAssignmentMetrics;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isClearingAll) return;
        onOpenChange(nextOpen);
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isClearingAll}
            loading={isClearingAll}
            loadingText="Clearing..."
            onClick={onConfirm}
          >
            Clear all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
