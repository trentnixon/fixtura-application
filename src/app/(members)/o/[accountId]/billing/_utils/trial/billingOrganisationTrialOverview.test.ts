import { describe, expect, it } from "vitest";

import {
  resolveOrganisationTrialNoticePresentation,
  resolveProminentOrganisationTrialNoticePresentation,
  shouldShowBillingTrialStartCard,
  shouldShowBillingTrialUsedCardForUiMode,
  shouldShowOrganisationTrialNotice,
  shouldShowOrganisationTrialNoticeInDialog,
  shouldShowProminentOrganisationTrialNotice,
  shouldSuppressOrganisationTrialNotices,
} from "./billingOrganisationTrialOverview";

describe("billingOrganisationTrialOverview", () => {
  it("suppresses org notices for paid_active and payment_pending", () => {
    expect(shouldSuppressOrganisationTrialNotices("paid_active")).toBe(true);
    expect(shouldSuppressOrganisationTrialNotices("payment_pending")).toBe(true);
    expect(shouldSuppressOrganisationTrialNotices("no_billing")).toBe(false);
  });

  it("shows start only for free_trial_available + start_available", () => {
    expect(shouldShowBillingTrialStartCard("free_trial_available", "start_available")).toBe(true);
    expect(shouldShowBillingTrialStartCard("free_trial_available", "unavailable")).toBe(false);
    expect(shouldShowBillingTrialStartCard("paid_active", "start_available")).toBe(false);
  });

  it("maps notice presentations", () => {
    expect(resolveOrganisationTrialNoticePresentation("used")).toBe("used");
    expect(resolveOrganisationTrialNoticePresentation("blocked_by_billing")).toBeNull();
  });

  it("keeps active-elsewhere copy out of prominent page notices", () => {
    expect(resolveProminentOrganisationTrialNoticePresentation("active_on_another_account")).toBe(
      null,
    );
    expect(resolveProminentOrganisationTrialNoticePresentation("used")).toBe("used");
    expect(
      shouldShowProminentOrganisationTrialNotice("no_billing", "active_on_another_account"),
    ).toBe(false);
    expect(shouldShowOrganisationTrialNoticeInDialog("active_on_another_account")).toBe(true);
  });

  it("shows org notices except under paid/pending and active-elsewhere on page", () => {
    expect(shouldShowOrganisationTrialNotice("no_billing", "used")).toBe(true);
    expect(shouldShowOrganisationTrialNotice("no_billing", "active_on_another_account")).toBe(
      false,
    );
    expect(shouldShowOrganisationTrialNotice("paid_active", "used")).toBe(false);
    expect(shouldShowOrganisationTrialNotice("payment_pending", "active_on_another_account")).toBe(
      false,
    );
  });

  it("prefers org notice over account used card when org trial is used", () => {
    expect(shouldShowBillingTrialUsedCardForUiMode("trial_expired", "used", true)).toBe(false);
    expect(
      shouldShowBillingTrialUsedCardForUiMode("trial_expired", "active_on_this_account", true),
    ).toBe(true);
    expect(shouldShowBillingTrialUsedCardForUiMode("payment_pending", "used", true)).toBe(true);
  });
});
