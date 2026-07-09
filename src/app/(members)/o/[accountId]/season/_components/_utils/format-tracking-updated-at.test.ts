import { describe, expect, it } from "vitest";

import {
  formatTrackingUpdatedAt,
  formatTrackingUpdatedAtAbsolute,
} from "./format-tracking-updated-at";

describe("formatTrackingUpdatedAt", () => {
  const referenceDate = new Date("2026-07-08T13:23:00+10:00");

  it("returns just now for timestamps under one minute old", () => {
    expect(formatTrackingUpdatedAt("2026-07-08T13:22:45+10:00", referenceDate)).toBe("just now");
  });

  it("returns minutes ago for recent timestamps", () => {
    expect(formatTrackingUpdatedAt("2026-07-08T13:18:00+10:00", referenceDate)).toBe(
      "5 minutes ago",
    );
  });

  it("returns hours ago for same-day timestamps", () => {
    expect(formatTrackingUpdatedAt("2026-07-08T10:23:00+10:00", referenceDate)).toBe("3 hours ago");
  });

  it("returns yesterday with time for prior-day timestamps", () => {
    expect(formatTrackingUpdatedAt("2026-07-07T09:15:00+10:00", referenceDate)).toBe(
      "yesterday at 9:15 AM",
    );
  });

  it("returns day and time for older same-year timestamps", () => {
    expect(formatTrackingUpdatedAt("2026-06-01T16:40:00+10:00", referenceDate)).toBe(
      "1 Jun at 4:40 PM",
    );
  });
});

describe("formatTrackingUpdatedAtAbsolute", () => {
  it("returns a locale-aware absolute timestamp", () => {
    const formatted = formatTrackingUpdatedAtAbsolute("2026-07-08T13:23:00+10:00");
    expect(formatted).toContain("2026");
    expect(formatted).toMatch(/1:23|13:23/);
  });
});
