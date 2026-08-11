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
import {
  type WeekdayKey,
  weekdayKeyFromCmsDaysOfWeekId,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";

import type { PatchAccountSettingsBody } from "@/types/api/account";

export function SaveSettingsDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partialPatch: PatchAccountSettingsBody | null;
  draftDeliveryWeekdayKey: WeekdayKey;
  mutationPending: boolean;
  onConfirmSave: () => void;
}) {
  const {
    open,
    onOpenChange,
    partialPatch,
    draftDeliveryWeekdayKey,
    mutationPending,
    onConfirmSave,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save settings?</DialogTitle>
          <DialogDescription>
            Only the fields you changed are sent. Everything else stays unchanged on the server.
          </DialogDescription>
        </DialogHeader>

        <div className="border-border space-y-2 rounded-lg border p-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Changes
          </p>
          <ul className="text-foreground space-y-1 text-sm">
            {partialPatch?.includeJuniorSurnames !== undefined ? (
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Include junior surnames</span>
                <span className="font-medium">
                  {partialPatch.includeJuniorSurnames ? "Enabled" : "Disabled"}
                </span>
              </li>
            ) : null}
            {partialPatch?.competitionsGroupedBy !== undefined ? (
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Competitions grouped by</span>
                <span className="font-medium">
                  {partialPatch.competitionsGroupedBy === "grade" ? "Grade" : "Competition"}
                </span>
              </li>
            ) : null}
            {partialPatch?.splitSeniorsAndMasters !== undefined ? (
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Split seniors and masters</span>
                <span className="font-medium">
                  {partialPatch.splitSeniorsAndMasters ? "Enabled" : "Disabled"}
                </span>
              </li>
            ) : null}
            {partialPatch?.daysOfTheWeekId !== undefined ? (
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Delivery day</span>
                <span className="font-medium">
                  {weekdayLabel(
                    weekdayKeyFromCmsDaysOfWeekId(partialPatch.daysOfTheWeekId) ??
                      draftDeliveryWeekdayKey,
                  )}
                </span>
              </li>
            ) : null}
            {partialPatch?.bundleDeliveryDay !== undefined ? (
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Delivery day</span>
                <span className="font-medium">{partialPatch.bundleDeliveryDay}</span>
              </li>
            ) : null}
          </ul>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!partialPatch || mutationPending} onClick={onConfirmSave}>
            {mutationPending ? "Saving…" : "Confirm save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
