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

import { useSeasonOverviewSyncAction } from "../_hooks";

import type { SeasonOverviewSyncDialogProps } from "../_types";

export function SeasonOverviewSyncDialog({
  accountId,
  open,
  onOpenChange,
  orgSync,
}: SeasonOverviewSyncDialogProps) {
  const { runSync } = useSeasonOverviewSyncAction({ accountId, orgSync, onOpenChange });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Competition Sync</DialogTitle>
            <DialogDescription>
              Resync your competition data. This may take a few moments.
              <br />
              Note: This will only update competition-level data. To sync grades, fixtures, or
              teams, please go to their specific pages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={!orgSync.canTrigger || orgSync.isPending}
              onClick={runSync}
            >
              Confirm sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {open && orgSync.errorReason ? (
        <p className="text-muted-foreground text-xs">{orgSync.errorReason}</p>
      ) : null}
    </>
  );
}
