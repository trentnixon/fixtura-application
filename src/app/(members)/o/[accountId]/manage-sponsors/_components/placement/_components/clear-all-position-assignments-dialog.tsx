import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { PositionAssignmentMetrics } from "../_types/sponsor-slot-placement-panel";

export function ClearAllPositionAssignmentsDialog({
  open,
  isClearingAll,
  metrics,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  isClearingAll: boolean;
  metrics: PositionAssignmentMetrics;
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
            {isClearingAll ? "Clearing positions" : "Clear all position assignments?"}
          </DialogTitle>
          <DialogDescription>
            {isClearingAll
              ? "Please wait while assignments are removed."
              : `This removes every sponsor from all ${metrics.filled} filled position slot${metrics.filled === 1 ? "" : "s"}. You can assign sponsors again afterwards.`}
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
