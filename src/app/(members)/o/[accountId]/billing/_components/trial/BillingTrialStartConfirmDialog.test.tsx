import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BillingTrialStartConfirmDialog } from "./BillingTrialStartConfirmDialog";
import {
  BILLING_TRIAL_START_COPY,
  BILLING_TRIAL_START_DURATION_DAYS,
} from "../../_constants/trial/billingTrialStart";

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  accountName: "Westside Cricket Club",
  errorMessage: null,
  isPending: false,
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
};

describe("BillingTrialStartConfirmDialog", () => {
  it("shows duration and no-charge copy without client-predicted start/end dates", () => {
    render(<BillingTrialStartConfirmDialog {...defaultProps} />);

    expect(
      screen.getByRole("heading", {
        name: `${BILLING_TRIAL_START_COPY.confirmTitlePrefix} ${BILLING_TRIAL_START_DURATION_DAYS}${BILLING_TRIAL_START_COPY.confirmTitleSuffix}`,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Westside Cricket Club will get full Fixtura access for 14 days/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /You will not be charged today, and no payment details are required to start/i,
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/^Starts$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Ends$/i)).not.toBeInTheDocument();
  });

  it("renders error message when present", () => {
    render(
      <BillingTrialStartConfirmDialog
        {...defaultProps}
        errorMessage="This organisation has already used its free trial."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This organisation has already used its free trial.",
    );
  });
});
