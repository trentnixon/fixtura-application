import { describe, expect, it } from "vitest";

import { formatSchedulerTime } from "./format-scheduler-time";
import { resolveSchedulerRunStatus } from "./resolve-scheduler-run-status";

describe("formatSchedulerTime", () => {
  it("formats HH:mm:ss CMS time for locale display", () => {
    const formatted = formatSchedulerTime("06:00:00.000");
    expect(formatted).toMatch(/6:00/);
  });

  it("returns null for empty or invalid values", () => {
    expect(formatSchedulerTime(null)).toBeNull();
    expect(formatSchedulerTime("")).toBeNull();
    expect(formatSchedulerTime("invalid")).toBeNull();
  });
});

describe("resolveSchedulerRunStatus", () => {
  it("prioritises rendering over queued", () => {
    expect(resolveSchedulerRunStatus({ isRendering: true, Queued: true }).label).toBe("Rendering");
  });

  it("returns queued when not rendering", () => {
    expect(resolveSchedulerRunStatus({ isRendering: false, Queued: true }).label).toBe("Queued");
  });

  it("returns idle when neither flag is set", () => {
    expect(resolveSchedulerRunStatus({ isRendering: false, Queued: false }).label).toBe("Idle");
  });
});
