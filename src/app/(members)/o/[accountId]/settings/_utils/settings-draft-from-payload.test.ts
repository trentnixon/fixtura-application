import { describe, expect, it } from "vitest";

import { equalDraft, settingsDraftFromPayload } from "./settings-draft-from-payload";

import type { AccountSchedulerDocument, AccountSettingsData } from "@/types/api/account";

function baseScheduler(
  overrides: Partial<AccountSchedulerDocument> = {},
): AccountSchedulerDocument {
  const doc: AccountSchedulerDocument = {
    id: 1,
    Name: "Weekly",
    Time: null,
    Queued: false,
    isRendering: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
  return Object.assign(doc, overrides);
}

function baseSettings(overrides: Partial<AccountSettingsData> = {}): AccountSettingsData {
  const settings: AccountSettingsData = {
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
    include_junior_surnames: true,
    Sport: "Cricket",
    hasCompletedStartSequence: true,
    hasCustomTemplate: false,
    account_type: 1,
  };
  return Object.assign(settings, overrides);
}

describe("settingsDraftFromPayload", () => {
  it("maps group_assets_by false to competition grouping", () => {
    const draft = settingsDraftFromPayload(baseSettings({ group_assets_by: false }), null);
    expect(draft.competitionsGroupedBy).toBe("competition");
  });

  it("maps group_assets_by true to grade grouping", () => {
    const draft = settingsDraftFromPayload(baseSettings({ group_assets_by: true }), null);
    expect(draft.competitionsGroupedBy).toBe("grade");
  });

  it("defaults split_seniors_and_masters to false when absent", () => {
    const draft = settingsDraftFromPayload(baseSettings(), null);
    expect(draft.splitSeniorsAndMasters).toBe(false);
  });

  it("maps include_junior_surnames and split_seniors_and_masters from payload", () => {
    const draft = settingsDraftFromPayload(
      baseSettings({ include_junior_surnames: false, split_seniors_and_masters: true }),
      null,
    );
    expect(draft.includeJuniorSurnames).toBe(false);
    expect(draft.splitSeniorsAndMasters).toBe(true);
  });

  it("prefers scheduler days_of_the_week over settings embedding", () => {
    const settings = baseSettings({
      scheduler: baseScheduler({ days_of_the_week: { id: 1, Name: "Sunday" } }),
    });
    const schedulerDoc = baseScheduler({
      days_of_the_week: { id: 3, Name: "Tuesday" },
    });
    const draft = settingsDraftFromPayload(settings, schedulerDoc);
    expect(draft.deliveryWeekdayKey).toBe("tuesday");
  });

  it("falls back to sunday when weekday is unparseable", () => {
    const draft = settingsDraftFromPayload(
      baseSettings({
        scheduler: baseScheduler({ days_of_the_week: { id: 0, Name: "" } }),
      }),
      null,
    );
    expect(draft.deliveryWeekdayKey).toBe("sunday");
  });
});

describe("equalDraft", () => {
  it("returns true for identical drafts", () => {
    const a = settingsDraftFromPayload(baseSettings(), null);
    const b = settingsDraftFromPayload(baseSettings(), null);
    expect(equalDraft(a, b)).toBe(true);
  });

  it("returns false when any field differs", () => {
    const a = settingsDraftFromPayload(baseSettings(), null);
    const b = settingsDraftFromPayload(baseSettings({ include_junior_surnames: false }), null);
    expect(equalDraft(a, b)).toBe(false);
  });
});
