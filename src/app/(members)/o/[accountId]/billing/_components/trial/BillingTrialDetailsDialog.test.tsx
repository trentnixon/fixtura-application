import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BillingTrialDetailsDialog } from "./BillingTrialDetailsDialog";
import { BILLING_ORG_TRIAL_NOTICE_COPY } from "../../_constants/trial/billingOrganisationTrialNotice";

describe("BillingTrialDetailsDialog", () => {
  it("shows active-elsewhere org copy inside the dialog", () => {
    render(
      <BillingTrialDetailsDialog
        trial={null}
        uiMode="unknown"
        emphasize={false}
        organisationTrialNoticePresentation="active_on_another_account"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Trial information/i }));

    expect(
      screen.getByText(BILLING_ORG_TRIAL_NOTICE_COPY.active_on_another_account.title),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("billing-org-trial-notice-active_on_another_account"),
    ).toBeInTheDocument();
  });
});
