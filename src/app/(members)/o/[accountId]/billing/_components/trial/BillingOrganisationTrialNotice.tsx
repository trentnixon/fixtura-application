"use client";

import { TypographyAlertDescription, TypographyAlertTitle } from "@/components/typography";

import {
  BILLING_ORG_TRIAL_NOTICE_COPY,
  BILLING_ORG_TRIAL_NOTICE_SURFACE_CLASS_NAME,
} from "../../_constants/trial/billingOrganisationTrialNotice";

import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";

export type BillingOrganisationTrialNoticePresentation = Extract<
  OrganisationTrialPresentation,
  "active_on_another_account" | "used" | "unavailable"
>;

export type BillingOrganisationTrialNoticeProps = {
  presentation: BillingOrganisationTrialNoticePresentation;
};

export function BillingOrganisationTrialNotice({
  presentation,
}: BillingOrganisationTrialNoticeProps) {
  const copy = BILLING_ORG_TRIAL_NOTICE_COPY[presentation];

  return (
    <div
      className={`${BILLING_ORG_TRIAL_NOTICE_SURFACE_CLASS_NAME} rounded-lg px-4 py-3 text-sm`}
      role="status"
      data-testid={`billing-org-trial-notice-${presentation}`}
    >
      <TypographyAlertTitle as="p">{copy.title}</TypographyAlertTitle>
      <TypographyAlertDescription className="mt-1" tone="muted">
        {copy.description}
      </TypographyAlertDescription>
    </div>
  );
}
