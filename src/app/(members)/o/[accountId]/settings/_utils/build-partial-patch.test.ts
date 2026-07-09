import { describe, expect, it } from "vitest";

import { buildPartialPatch } from "./build-partial-patch";

import type { SettingsDraft } from "../_types/settings-draft";

function baseDraft(overrides: Partial<SettingsDraft> = {}): SettingsDraft {
  return {
    includeJuniorSurnames: false,
    competitionsGroupedBy: "competition",
    splitSeniorsAndMasters: false,
    deliveryWeekdayKey: "sunday",
    ...overrides,
  };
}

describe("buildPartialPatch", () => {
  it("returns null when draft equals baseline", () => {
    const draft = baseDraft();
    expect(buildPartialPatch({ baseline: draft, next: draft, isClub: false })).toBeNull();
  });

  it("emits only includeJuniorSurnames when that field changes", () => {
    const baseline = baseDraft();
    const next = baseDraft({ includeJuniorSurnames: true });
    expect(buildPartialPatch({ baseline, next, isClub: false })).toEqual({
      includeJuniorSurnames: true,
    });
  });

  it("includes competitionsGroupedBy for association accounts", () => {
    const baseline = baseDraft();
    const next = baseDraft({ competitionsGroupedBy: "grade" });
    expect(buildPartialPatch({ baseline, next, isClub: false })).toEqual({
      competitionsGroupedBy: "grade",
    });
  });

  it("ignores competitionsGroupedBy changes for club accounts", () => {
    const baseline = baseDraft();
    const next = baseDraft({ competitionsGroupedBy: "grade" });
    expect(buildPartialPatch({ baseline, next, isClub: true })).toBeNull();
  });

  it("includes splitSeniorsAndMasters for club accounts", () => {
    const baseline = baseDraft();
    const next = baseDraft({ splitSeniorsAndMasters: true });
    expect(buildPartialPatch({ baseline, next, isClub: true })).toEqual({
      splitSeniorsAndMasters: true,
    });
  });

  it("ignores splitSeniorsAndMasters changes for association accounts", () => {
    const baseline = baseDraft();
    const next = baseDraft({ splitSeniorsAndMasters: true });
    expect(buildPartialPatch({ baseline, next, isClub: false })).toBeNull();
  });

  it("emits daysOfTheWeekId when delivery weekday changes", () => {
    const baseline = baseDraft({ deliveryWeekdayKey: "sunday" });
    const next = baseDraft({ deliveryWeekdayKey: "monday" });
    expect(buildPartialPatch({ baseline, next, isClub: false })).toEqual({
      daysOfTheWeekId: 2,
    });
  });

  it("combines multiple changed fields in one patch", () => {
    const baseline = baseDraft();
    const next = baseDraft({
      includeJuniorSurnames: true,
      deliveryWeekdayKey: "wednesday",
    });
    expect(buildPartialPatch({ baseline, next, isClub: true })).toEqual({
      includeJuniorSurnames: true,
      daysOfTheWeekId: 4,
    });
  });
});
