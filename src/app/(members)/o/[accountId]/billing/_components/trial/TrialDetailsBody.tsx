"use client";

import { TrialDetailsBodyTrialInfo } from "./TrialDetailsBodyTrialInfo";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/billingTrialDetails";
import { billingTrialDetailsBodyDescription } from "../../_utils/billingTrialDetails";

import type { TrialDetailsBodyProps } from "../../_types/billingTrialDetails";

export function TrialDetailsBody({ trial, uiMode, emphasize }: TrialDetailsBodyProps) {
  const description = billingTrialDetailsBodyDescription(emphasize, uiMode);

  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      <div className="text-muted-foreground text-sm">
        {trial ? (
          <TrialDetailsBodyTrialInfo trial={trial} uiMode={uiMode} />
        ) : (
          <p role="status">{BILLING_TRIAL_DETAILS_COPY.noTrial}</p>
        )}
      </div>
    </div>
  );
}
