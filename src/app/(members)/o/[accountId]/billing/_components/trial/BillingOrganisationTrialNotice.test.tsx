import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BillingOrganisationTrialNotice } from "./BillingOrganisationTrialNotice";
import { BILLING_ORG_TRIAL_NOTICE_COPY } from "../../_constants/trial/billingOrganisationTrialNotice";

describe("BillingOrganisationTrialNotice", () => {
  it.each([
    ["active_on_another_account", BILLING_ORG_TRIAL_NOTICE_COPY.active_on_another_account.title],
    ["used", BILLING_ORG_TRIAL_NOTICE_COPY.used.title],
    ["unavailable", BILLING_ORG_TRIAL_NOTICE_COPY.unavailable.title],
  ] as const)("renders %s notice copy with status role", (presentation, title) => {
    const { container } = render(<BillingOrganisationTrialNotice presentation={presentation} />);

    expect(screen.getByRole("status")).toHaveTextContent(title);
    expect(container.textContent).not.toMatch(/@/);
    expect(container.textContent).not.toMatch(/account\s*#\s*\d+/i);
  });
});
