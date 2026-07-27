import { format } from "date-fns";
import { describe, expect, it } from "vitest";

import {
  formatTrackingUpdatedAt,
  formatTrackingUpdatedAtAbsolute,
} from "./format-tracking-updated-at";

describe("formatTrackingUpdatedAt", () => {
  const referenceDate = new Date(2026, 6, 8, 13, 23);

  it("returns just now for timestamps under one minute old", () => {
    const recent = new Date(2026, 6, 8, 13, 22, 45);
    expect(formatTrackingUpdatedAt(recent.toISOString(), referenceDate)).toBe("just now");
  });

  it("returns minutes ago for recent timestamps", () => {
    const recent = new Date(2026, 6, 8, 13, 18);
    expect(formatTrackingUpdatedAt(recent.toISOString(), referenceDate)).toBe("5 minutes ago");
  });

  it("returns hours ago for same-day timestamps", () => {
    const earlier = new Date(2026, 6, 8, 10, 23);
    expect(formatTrackingUpdatedAt(earlier.toISOString(), referenceDate)).toBe("3 hours ago");
  });

  it("returns yesterday with time for prior-day timestamps", () => {
    const priorDay = new Date(2026, 6, 7, 9, 15);
    expect(formatTrackingUpdatedAt(priorDay.toISOString(), referenceDate)).toBe(
      `yesterday at ${format(priorDay, "h:mm a")}`,
    );
  });

  it("returns day and time for older same-year timestamps", () => {
    const older = new Date(2026, 5, 1, 16, 40);
    expect(formatTrackingUpdatedAt(older.toISOString(), referenceDate)).toBe(
      `${format(older, "d MMM")} at ${format(older, "h:mm a")}`,
    );
  });
});

describe("formatTrackingUpdatedAtAbsolute", () => {
  it("returns a locale-aware absolute timestamp", () => {
    const date = new Date(2026, 6, 8, 13, 23);
    const formatted = formatTrackingUpdatedAtAbsolute(date.toISOString());
    const datePart = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    expect(formatted).toBe(timePart ? `${datePart}, ${timePart}` : datePart);
  });
});
