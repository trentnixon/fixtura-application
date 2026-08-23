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

import { useSeasonCompetitionGradesSyncAction } from "../_hooks";

import type { SeasonCompetitionSyncGradesDialogProps } from "../_types";

export function SeasonCompetitionSyncGradesDialog({
  accountId,
  open,
  onOpenChange,
  cmsCompetitionNumericId,
  isPending,
  mutateAsync,
}: SeasonCompetitionSyncGradesDialogProps) {
  const { runSync } = useSeasonCompetitionGradesSyncAction({
    accountId,
    cmsCompetitionNumericId,
    mutateAsync,
    onOpenChange,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync grades in Vision?</DialogTitle>
          <DialogDescription>
            This starts a background sync of grades for this competition. It may take a few minutes.
            Use Refresh Vision afterward to see the latest list; updates will not appear instantly.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            className="gap-2"
            disabled={isPending}
            onClick={runSync}
          >
            {isPending ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
            Confirm sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
