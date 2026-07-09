import { describe, expect, it } from "vitest";

import {
  collectNotificationsChanges,
  equalNotificationsDraft,
} from "./bundle-delivery-profile-shared";

describe("equalNotificationsDraft", () => {
  it("returns true when all fields match", () => {
    const draft = {
      bundleAddressedTo: "Club",
      deliveryEmail: "ops@example.com",
      assetDeliveryDay: "sunday" as const,
    };
    expect(equalNotificationsDraft(draft, { ...draft })).toBe(true);
  });

  it("returns false when any field differs", () => {
    const a = {
      bundleAddressedTo: "Club",
      deliveryEmail: "ops@example.com",
      assetDeliveryDay: "sunday" as const,
    };
    const b = { ...a, assetDeliveryDay: "monday" as const };
    expect(equalNotificationsDraft(a, b)).toBe(false);
  });
});

describe("collectNotificationsChanges", () => {
  it("lists only changed fields with labels", () => {
    const saved = {
      bundleAddressedTo: "Club",
      deliveryEmail: "ops@example.com",
      assetDeliveryDay: "sunday" as const,
    };
    const next = {
      ...saved,
      deliveryEmail: "new@example.com",
      assetDeliveryDay: "monday" as const,
    };

    expect(collectNotificationsChanges(saved, next)).toEqual([
      {
        label: "Delivery email",
        before: "ops@example.com",
        after: "new@example.com",
      },
      {
        label: "Asset delivery day",
        before: "Sunday",
        after: "Monday",
      },
    ]);
  });
});
