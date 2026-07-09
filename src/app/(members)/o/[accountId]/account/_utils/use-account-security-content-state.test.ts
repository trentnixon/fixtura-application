import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import {
  createAccountSecurityProfileDraft,
  getAccountSecurityMutationErrorMessage,
  validateAccountSecurityLoginEmailValue,
  validateAccountSecurityProfileValue,
} from "./use-account-security-content-state";
import { ACCOUNT_EMPTY_VALUE_LABEL } from "../_constants/account-display-primitives";
import {
  ACCOUNT_SECURITY_EMAIL_INVALID_ERROR,
  ACCOUNT_SECURITY_PROFILE_REQUIRED_ERROR,
} from "../_constants/use-account-security-content-state";

import type { AccountSettingsData } from "@/types/api/account";

function baseSettings(overrides: Partial<AccountSettingsData> = {}): AccountSettingsData {
  return {
    id: 1,
    FirstName: "Jane",
    LastName: "Doe",
    DeliveryAddress: null,
    isActive: true,
    isSetup: true,
    isUpdating: false,
    isRightsHolder: null,
    isPermissionGiven: null,
    group_assets_by: false,
    include_junior_surnames: false,
    Sport: "Cricket",
    hasCompletedStartSequence: true,
    hasCustomTemplate: false,
    account_type: 1,
    ...overrides,
  };
}

describe("validateAccountSecurityProfileValue", () => {
  it("returns required error for empty value", () => {
    expect(validateAccountSecurityProfileValue("   ")).toEqual({
      error: ACCOUNT_SECURITY_PROFILE_REQUIRED_ERROR,
      value: null,
    });
  });

  it("returns trimmed value on success", () => {
    expect(validateAccountSecurityProfileValue("  Ada  ")).toEqual({
      error: null,
      value: "Ada",
    });
  });
});

describe("validateAccountSecurityLoginEmailValue", () => {
  it("returns invalid error for malformed email", () => {
    expect(validateAccountSecurityLoginEmailValue("not-an-email")).toEqual({
      error: ACCOUNT_SECURITY_EMAIL_INVALID_ERROR,
      value: null,
    });
  });

  it("normalizes email to lowercase", () => {
    expect(validateAccountSecurityLoginEmailValue("  User@Example.COM  ")).toEqual({
      error: null,
      value: "user@example.com",
    });
  });
});

describe("createAccountSecurityProfileDraft", () => {
  it("strips empty placeholder from display name draft", () => {
    expect(
      createAccountSecurityProfileDraft(baseSettings({ FirstName: null, LastName: null })),
    ).toBe("");

    expect(createAccountSecurityProfileDraft(baseSettings())).toBe("Jane Doe");
  });

  it("does not include em dash placeholder in draft", () => {
    const draft = createAccountSecurityProfileDraft(
      baseSettings({ FirstName: null, LastName: null }),
    );

    expect(draft).not.toContain(ACCOUNT_EMPTY_VALUE_LABEL);
  });
});

describe("getAccountSecurityMutationErrorMessage", () => {
  it("returns ApiError message for API failures", () => {
    const error = new ApiError({
      status: 400,
      message: "Current password is incorrect.",
    });

    expect(getAccountSecurityMutationErrorMessage(error)).toBe("Current password is incorrect.");
  });

  it("returns generic unexpected message for unknown errors", () => {
    expect(getAccountSecurityMutationErrorMessage(new Error("boom"))).toBe(
      AUTH_ERROR_MESSAGES.unexpected,
    );
  });
});
