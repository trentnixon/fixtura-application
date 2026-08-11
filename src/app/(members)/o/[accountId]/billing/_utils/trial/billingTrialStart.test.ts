import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import {
  formatBillingTrialStartCardDescription,
  formatBillingTrialStartConfirmDescription,
  messageFromBillingTrialStartFailure,
  parseOrganisationTrialErrorCode,
  resolveBillingTrialAccountName,
  shouldInvalidateBillingAfterStartTrialFailure,
} from "./billingTrialStart";

function orgTrialApiError(
  status: number,
  code: string,
  message = "CMS message should be ignored",
  retryAfterSeconds: number | null = null,
) {
  return new ApiError({
    status,
    message: AUTH_ERROR_MESSAGES.serverError,
    details: { error: { code, message } },
    retryAfterSeconds,
  });
}

describe("billingTrialStart account name copy", () => {
  it("resolves account name from organisation context", () => {
    expect(
      resolveBillingTrialAccountName({
        accountOrganisationDetails: { Name: "Westside Cricket Club" },
      } as never),
    ).toBe("Westside Cricket Club");
  });

  it("uses account name in card description", () => {
    expect(formatBillingTrialStartCardDescription("Westside Cricket Club")).toBe(
      "Start Westside Cricket Club's trial with no upfront payment. Explore automated content, scheduled delivery, and premium workflow tools.",
    );
  });

  it("falls back to organisation copy when account name is missing", () => {
    expect(formatBillingTrialStartCardDescription("")).toContain("Start your organisation's trial");
    expect(formatBillingTrialStartConfirmDescription("")).toContain(
      "Your organisation will get full Fixtura access for 14 days",
    );
  });

  it("uses account name in confirm description", () => {
    expect(formatBillingTrialStartConfirmDescription("Westside Cricket Club")).toBe(
      "Westside Cricket Club will get full Fixtura access for 14 days. You will not be charged today, and no payment details are required to start.",
    );
  });
});

describe("billingTrialStart organisation trial errors", () => {
  it.each([
    ["TRIAL_ALREADY_CONSUMED", 409],
    ["TRIAL_ORGANISATION_UNAVAILABLE", 409],
    ["TRIAL_ALLOCATION_DISABLED", 503],
  ] as const)("parses %s from ApiError details", (code, status) => {
    const error = orgTrialApiError(status, code);
    expect(parseOrganisationTrialErrorCode(error)).toBe(code);
    expect(shouldInvalidateBillingAfterStartTrialFailure(error)).toBe(true);
  });

  it("maps org error codes to stable copy, not CMS message text", () => {
    const error = orgTrialApiError(409, "TRIAL_ALREADY_CONSUMED", "Org trial consumed on CMS");
    expect(messageFromBillingTrialStartFailure(error)).toContain("already used its free trial");
    expect(messageFromBillingTrialStartFailure(error)).not.toContain("Org trial consumed on CMS");
  });

  it("maps TRIAL_ORGANISATION_UNAVAILABLE to support guidance", () => {
    const error = orgTrialApiError(409, "TRIAL_ORGANISATION_UNAVAILABLE");
    expect(messageFromBillingTrialStartFailure(error)).toContain("Contact support");
  });

  it("maps TRIAL_ALLOCATION_DISABLED from masked 503 message via details.error.code", () => {
    const error = orgTrialApiError(503, "TRIAL_ALLOCATION_DISABLED");
    expect(messageFromBillingTrialStartFailure(error)).toContain("temporarily unavailable");
    expect(messageFromBillingTrialStartFailure(error)).not.toBe(AUTH_ERROR_MESSAGES.serverError);
  });

  it("appends retry-after hint for TRIAL_ALLOCATION_DISABLED when present", () => {
    const error = orgTrialApiError(503, "TRIAL_ALLOCATION_DISABLED", "disabled", 30);
    expect(messageFromBillingTrialStartFailure(error)).toContain("Try again in 30 seconds.");
  });

  it("returns null for unknown codes and does not invalidate", () => {
    const error = new ApiError({
      status: 400,
      message: "Bad request",
      details: { error: { code: "UNKNOWN", message: "Bad request" } },
    });
    expect(parseOrganisationTrialErrorCode(error)).toBeNull();
    expect(shouldInvalidateBillingAfterStartTrialFailure(error)).toBe(false);
  });

  it("falls back to network copy for non-ApiError failures", () => {
    expect(messageFromBillingTrialStartFailure(new Error("network"))).toBe(
      AUTH_ERROR_MESSAGES.network,
    );
  });

  it("falls back to ApiError message for non-org errors", () => {
    const error = new ApiError({
      status: 400,
      message: "Trial plan missing",
      details: { message: "Trial plan missing" },
    });
    expect(messageFromBillingTrialStartFailure(error)).toBe("Trial plan missing");
    expect(shouldInvalidateBillingAfterStartTrialFailure(error)).toBe(false);
  });
});
