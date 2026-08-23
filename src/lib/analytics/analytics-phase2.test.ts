import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { isAnalyticsExcludedPath, pathnameFromAnalyticsUrl } from "./excluded-path";
import { loginFailureReasonCode } from "./login-failure";
import { settingsFieldsChanged } from "./settings-fields-changed";

describe("isAnalyticsExcludedPath", () => {
  it("excludes sandbox and admin system routes", () => {
    expect(isAnalyticsExcludedPath("/sandbox")).toBe(true);
    expect(isAnalyticsExcludedPath("/sandbox/kitchen-sink")).toBe(true);
    expect(isAnalyticsExcludedPath("/admin/system")).toBe(true);
    expect(isAnalyticsExcludedPath("/admin/system/inspector")).toBe(true);
  });

  it("allows production member routes", () => {
    expect(isAnalyticsExcludedPath("/o/12/dashboard")).toBe(false);
    expect(isAnalyticsExcludedPath("/select-organisation")).toBe(false);
  });

  it("strips query strings from pageview paths", () => {
    expect(pathnameFromAnalyticsUrl("/o/1/bundles?tab=1")).toBe("/o/1/bundles");
  });
});

describe("loginFailureReasonCode", () => {
  it("maps ApiError status to reason codes", () => {
    expect(loginFailureReasonCode(new ApiError({ status: 401, message: "x" }))).toBe(
      "invalid_credentials",
    );
    expect(loginFailureReasonCode(new ApiError({ status: 503, message: "x" }))).toBe("unavailable");
  });

  it("maps network errors", () => {
    expect(loginFailureReasonCode(new TypeError("fetch failed"))).toBe("network");
    expect(loginFailureReasonCode(new Error("unknown"))).toBe("unknown");
  });
});

describe("settingsFieldsChanged", () => {
  it("returns snake_case field keys from patch body", () => {
    expect(
      settingsFieldsChanged({
        includeJuniorSurnames: true,
        daysOfTheWeekId: 2,
      }),
    ).toEqual(["include_junior_surnames", "delivery_weekday"]);
  });
});
