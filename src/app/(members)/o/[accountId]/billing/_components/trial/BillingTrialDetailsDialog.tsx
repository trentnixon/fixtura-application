"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { TrialDetailsBody } from "./TrialDetailsBody";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/billingTrialDetails";
import { billingTrialDetailsButtonLabel } from "../../_utils/billingTrialDetails";

import type { BillingTrialDetailsDialogProps } from "../../_types/billingTrialDetails";

export function BillingTrialDetailsDialog({
  trial,
  uiMode,
  emphasize,
}: BillingTrialDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {billingTrialDetailsButtonLabel(uiMode)}
        </Button>
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
