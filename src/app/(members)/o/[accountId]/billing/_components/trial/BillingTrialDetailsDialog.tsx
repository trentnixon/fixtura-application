"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { TrialDetailsBody } from "./TrialDetailsBody";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/trial/billingTrialDetails";
import { billingTrialDetailsButtonLabel } from "../../_utils/trial/billingTrialDetails";

import type { BillingTrialDetailsDialogProps } from "../../_types/trial/billingTrialDetails";

export function BillingTrialDetailsDialog({
  trial,
  uiMode,
  emphasize,
  triggerVariant = "button",
}: BillingTrialDetailsDialogProps) {
  const label = billingTrialDetailsButtonLabel(uiMode);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerVariant === "text" ? (
          <button
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground text-left text-sm underline-offset-4 transition-colors hover:underline",
            )}
          >
            {label}
          </button>
        ) : (
          <Button type="button" variant="outline" size="sm">
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-brand">{BILLING_TRIAL_DETAILS_COPY.dialogTitle}</DialogTitle>
        </DialogHeader>
        <TrialDetailsBody trial={trial} uiMode={uiMode} emphasize={emphasize} />
      </DialogContent>
    </Dialog>
  );
}
