"use client";

import { TypographyBodySmall, TypographyMuted } from "@/components/typography";

import { BILLING_ORG_TRIAL_NOTICE_COPY } from "../../_constants/trial/billingOrganisationTrialNotice";

import type { BillingOrganisationTrialNoticePresentation } from "./BillingOrganisationTrialNotice";

type TrialDetailsOrgTrialNoticeProps = {
  presentation: Extract<BillingOrganisationTrialNoticePresentation, "active_on_another_account">;
};

export function TrialDetailsOrgTrialNotice({ presentation }: TrialDetailsOrgTrialNoticeProps) {
  const copy = BILLING_ORG_TRIAL_NOTICE_COPY[presentation];

  return (
    <div
      className="border-border bg-muted/40 grid gap-1 rounded-md border px-3 py-2 text-sm"
      role="status"
      data-testid={`billing-org-trial-notice-${presentation}`}
    >
      <TypographyBodySmall className="font-medium">{copy.title}</TypographyBodySmall>
      <TypographyMuted className="leading-relaxed">{copy.description}</TypographyMuted>
    </div>
  );
}
