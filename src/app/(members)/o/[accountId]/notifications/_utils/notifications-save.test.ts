import { describe, expect, it } from "vitest";

import {
  buildPatchAccountNotificationsBody,
  dataToProfileDraft,
  hasDeliveryDayChange,
  settingsPatchForDeliveryDay,
} from "./notifications-save";

import type { AccountNotificationsData } from "@/types/api/account";

function baseData(overrides: Partial<AccountNotificationsData> = {}): AccountNotificationsData {
  return {
    bundleAddressedTo: "Club Ops",
    deliveryEmail: "ops@example.com",
    assetDeliveryDay: "sunday",
    ...overrides,
  };
}

describe("dataToProfileDraft", () => {
  it("maps null fields to empty strings and defaults weekday", () => {
    expect(
      dataToProfileDraft(
        baseData({ bundleAddressedTo: null, deliveryEmail: null, assetDeliveryDay: null }),
      ),
    ).toEqual({
      bundleAddressedTo: "",
      deliveryEmail: "",
      assetDeliveryDay: "sunday",
    });
  });
});

describe("buildPatchAccountNotificationsBody", () => {
  it("returns null when nothing changed", () => {
    const data = baseData();
    const draft = dataToProfileDraft(data);
    expect(buildPatchAccountNotificationsBody(data, draft)).toBeNull();
  });

  it("builds partial patch for changed contact fields", () => {
    const data = baseData();
    const draft = dataToProfileDraft(data);
    draft.bundleAddressedTo = "New Club";
    draft.deliveryEmail = "new@example.com";

    expect(buildPatchAccountNotificationsBody(data, draft)).toEqual({
      bundleAddressedTo: "New Club",
      deliveryEmail: "new@example.com",
    });
  });

  it("clears fields with null when emptied", () => {
    const data = baseData();
    const draft = dataToProfileDraft(data);
    draft.bundleAddressedTo = "";
    draft.deliveryEmail = "   ";

    expect(buildPatchAccountNotificationsBody(data, draft)).toEqual({
      bundleAddressedTo: null,
      deliveryEmail: null,
    });
  });

  it("normalizes delivery email for comparison and patch body", () => {
    const data = baseData({ deliveryEmail: "OPS@Example.com" });
    const draft = dataToProfileDraft(data);
    draft.deliveryEmail = "  ops@example.com  ";

    expect(buildPatchAccountNotificationsBody(data, draft)).toBeNull();

    draft.deliveryEmail = "other@example.com";
    expect(buildPatchAccountNotificationsBody(data, draft)).toEqual({
      deliveryEmail: "other@example.com",
    });
  });
});

describe("hasDeliveryDayChange", () => {
  it("detects weekday changes against saved data", () => {
    const data = baseData({ assetDeliveryDay: "sunday" });
    const draft = dataToProfileDraft(data);
    expect(hasDeliveryDayChange(data, draft)).toBe(false);

    draft.assetDeliveryDay = "monday";
    expect(hasDeliveryDayChange(data, draft)).toBe(true);
  });
});

describe("settingsPatchForDeliveryDay", () => {
  it("prefers daysOfTheWeekId when CMS id is known", () => {
    expect(settingsPatchForDeliveryDay("monday")).toEqual({ daysOfTheWeekId: 2 });
  });
});
