import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import {
  applyPartialSaveToSavedDraft,
  getNotificationsSaveUserMessage,
  isNotificationsSaveFullySuccessful,
  isNotificationsSavePartiallySuccessful,
  runNotificationsSave,
} from "./notifications-partial-save";
import {
  NOTIFICATIONS_PARTIAL_SAVE_CONTACT_ONLY,
  NOTIFICATIONS_PARTIAL_SAVE_DAY_ONLY,
  NOTIFICATIONS_SAVE_FAILED,
} from "../_constants/notifications-form";

describe("runNotificationsSave", () => {
  it("skips both mutations when no patches provided", async () => {
    const patchContact = vi.fn();
    const patchDeliveryDay = vi.fn();

    const outcome = await runNotificationsSave({
      contactPatch: null,
      deliveryDayPatch: null,
      patchContact,
      patchDeliveryDay,
    });

    expect(outcome).toEqual({
      contact: "skipped",
      deliveryDay: "skipped",
      contactError: null,
      deliveryDayError: null,
    });
    expect(patchContact).not.toHaveBeenCalled();
    expect(patchDeliveryDay).not.toHaveBeenCalled();
  });

  it("marks both saved on full success", async () => {
    const outcome = await runNotificationsSave({
      contactPatch: { deliveryEmail: "a@b.com" },
      deliveryDayPatch: { daysOfTheWeekId: 2 },
      patchContact: vi.fn().mockResolvedValue(undefined),
      patchDeliveryDay: vi.fn().mockResolvedValue(undefined),
    });

    expect(outcome.contact).toBe("saved");
    expect(outcome.deliveryDay).toBe("saved");
    expect(isNotificationsSaveFullySuccessful(outcome)).toBe(true);
  });

  it("returns partial outcome when contact saves and day fails", async () => {
    const outcome = await runNotificationsSave({
      contactPatch: { deliveryEmail: "a@b.com" },
      deliveryDayPatch: { daysOfTheWeekId: 2 },
      patchContact: vi.fn().mockResolvedValue(undefined),
      patchDeliveryDay: vi
        .fn()
        .mockRejectedValue(new ApiError({ status: 500, message: "Settings failed" })),
    });

    expect(outcome.contact).toBe("saved");
    expect(outcome.deliveryDay).toBe("failed");
    expect(isNotificationsSavePartiallySuccessful(outcome)).toBe(true);
    expect(getNotificationsSaveUserMessage(outcome)).toEqual({
      toast: "error",
      alert: NOTIFICATIONS_PARTIAL_SAVE_CONTACT_ONLY,
    });
  });

  it("returns partial outcome when day saves and contact fails", async () => {
    const outcome = await runNotificationsSave({
      contactPatch: { deliveryEmail: "a@b.com" },
      deliveryDayPatch: { daysOfTheWeekId: 2 },
      patchContact: vi
        .fn()
        .mockRejectedValue(new ApiError({ status: 500, message: "Contact failed" })),
      patchDeliveryDay: vi.fn().mockResolvedValue(undefined),
    });

    expect(outcome.contact).toBe("failed");
    expect(outcome.deliveryDay).toBe("saved");
    expect(getNotificationsSaveUserMessage(outcome)).toEqual({
      toast: "error",
      alert: NOTIFICATIONS_PARTIAL_SAVE_DAY_ONLY,
    });
  });

  it("returns full failure when both mutations fail", async () => {
    const outcome = await runNotificationsSave({
      contactPatch: { deliveryEmail: "a@b.com" },
      deliveryDayPatch: { daysOfTheWeekId: 2 },
      patchContact: vi
        .fn()
        .mockRejectedValue(new ApiError({ status: 500, message: "Contact failed" })),
      patchDeliveryDay: vi
        .fn()
        .mockRejectedValue(new ApiError({ status: 500, message: "Settings failed" })),
    });

    expect(getNotificationsSaveUserMessage(outcome)).toEqual({
      toast: "error",
      alert: NOTIFICATIONS_SAVE_FAILED,
    });
  });
});

describe("applyPartialSaveToSavedDraft", () => {
  it("updates only fields that saved successfully", () => {
    const savedDraft = {
      bundleAddressedTo: "Old",
      deliveryEmail: "old@example.com",
      assetDeliveryDay: "sunday" as const,
    };
    const draft = {
      bundleAddressedTo: "New",
      deliveryEmail: "new@example.com",
      assetDeliveryDay: "monday" as const,
    };

    const next = applyPartialSaveToSavedDraft(savedDraft, draft, {
      contact: "saved",
      deliveryDay: "failed",
      contactError: null,
      deliveryDayError: null,
    });

    expect(next).toEqual({
      bundleAddressedTo: "New",
      deliveryEmail: "new@example.com",
      assetDeliveryDay: "sunday",
    });
  });
});
