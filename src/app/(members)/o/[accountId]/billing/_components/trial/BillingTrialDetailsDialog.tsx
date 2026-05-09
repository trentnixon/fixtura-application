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
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/trial/billingTrialDetails";
import { billingTrialDetailsButtonLabel } from "../../_utils/trial/billingTrialDetails";

import type { BillingTrialDetailsDialogProps } from "../../_types/trial/billingTrialDetails";

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
