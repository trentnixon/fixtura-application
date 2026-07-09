import { describe, expect, it } from "vitest";

import { validateNotificationsDeliveryEmailValue } from "./notifications-validation";
import { NOTIFICATIONS_DELIVERY_EMAIL_INVALID_ERROR } from "../_constants/notifications-form";

describe("validateNotificationsDeliveryEmailValue", () => {
  it("allows empty value", () => {
    expect(validateNotificationsDeliveryEmailValue("")).toEqual({
      error: null,
      value: null,
    });
    expect(validateNotificationsDeliveryEmailValue("   ")).toEqual({
      error: null,
      value: null,
    });
  });

  it("rejects malformed email", () => {
    expect(validateNotificationsDeliveryEmailValue("not-an-email")).toEqual({
      error: NOTIFICATIONS_DELIVERY_EMAIL_INVALID_ERROR,
      value: null,
    });
  });

  it("normalizes valid email to lowercase", () => {
    expect(validateNotificationsDeliveryEmailValue("  User@Example.COM  ")).toEqual({
      error: null,
      value: "user@example.com",
    });
  });
});
