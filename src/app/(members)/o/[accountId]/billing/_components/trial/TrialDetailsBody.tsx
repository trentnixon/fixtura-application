"use client";

import { TypographyBodySmall, TypographyMuted } from "@/components/typography";

import { TrialDetailsBodyTrialInfo } from "./TrialDetailsBodyTrialInfo";
import { TrialDetailsOrgTrialNotice } from "./TrialDetailsOrgTrialNotice";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/trial/billingTrialDetails";
import { billingTrialDetailsBodyDescription } from "../../_utils/trial/billingTrialDetails";

import type { TrialDetailsBodyProps } from "../../_types/trial/billingTrialDetails";

export function TrialDetailsBody({
  trial,
  uiMode,
  emphasize,
  organisationTrialNoticePresentation = null,
}: TrialDetailsBodyProps) {
  const description = billingTrialDetailsBodyDescription(emphasize, uiMode);

  return (
    <div className="grid gap-4">
      {organisationTrialNoticePresentation ? (
        <TrialDetailsOrgTrialNotice presentation={organisationTrialNoticePresentation} />
      ) : null}
      <TypographyMuted className="leading-relaxed">{description}</TypographyMuted>
      <div>
        {trial ? (
          <TrialDetailsBodyTrialInfo trial={trial} uiMode={uiMode} />
        ) : (
          <TypographyBodySmall role="status">
            {BILLING_TRIAL_DETAILS_COPY.noTrial}
          </TypographyBodySmall>
        )}
      </div>
    </div>
  );
}
