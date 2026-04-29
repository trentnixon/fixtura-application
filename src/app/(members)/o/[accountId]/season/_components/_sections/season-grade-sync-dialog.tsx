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

import { useSeasonGradeSyncAction } from "../_hooks";

import type { SeasonGradeSyncDialogProps } from "../_types";

export function SeasonGradeSyncDialog({
  open,
  onOpenChange,
  isSyncMutating,
  cmsCompetitionNumericId,
  cmsGradeNumericId,
  teamsMutateAsync,
  fixturesMutateAsync,
  onSynced,
}: SeasonGradeSyncDialogProps) {
  const { runSync } = useSeasonGradeSyncAction({
    cmsCompetitionNumericId,
    cmsGradeNumericId,
    teamsMutateAsync,
    fixturesMutateAsync,
    onSynced,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resync this grade?</DialogTitle>
          <DialogDescription>
            This pulls the latest data for this grade from your season source. It can take a few
            minutes. We&apos;ll refresh this page right away; counts and fixtures may still update
            as processing finishes; use Sync again later if something looks out of date.
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
            onClick={runSync}
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
