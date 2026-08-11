"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { SeasonFixtureResultSyncDialogProps } from "../_types";

export function SeasonFixtureResultSyncDialog({
  open,
  onOpenChange,
  isSyncMutating,
  onConfirm,
}: SeasonFixtureResultSyncDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Queue result scrape for this fixture?</DialogTitle>
          <DialogDescription>
            This sends a request to queue a PlayHQ result scrape for this fixture. Processing often
            takes about 30–60 seconds; scores and details may update shortly after. This is not an
            instant refresh of the page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSyncMutating}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            className="gap-2"
            disabled={isSyncMutating}
            onClick={() => void onConfirm()}
          >
            {isSyncMutating ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            Confirm sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
