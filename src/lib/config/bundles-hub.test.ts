import { afterEach, describe, expect, it } from "vitest";

import {
  buildBundlesHubAccountUrl,
  buildBundlesHubRenderGroupUrl,
  buildBundlesHubRenderUrl,
  getBundlesHubBaseUrl,
  sportSegmentForBundlesHub,
} from "./bundles-hub";

const ENV_KEY = "NEXT_PUBLIC_BUNDLES_HUBS_URL";

describe("bundles-hub", () => {
  afterEach(() => {
    delete process.env[ENV_KEY];
  });

  it("returns null when env is unset", () => {
    expect(getBundlesHubBaseUrl()).toBeNull();
    expect(buildBundlesHubAccountUrl("42")).toBeNull();
  });

  it("trims trailing slashes from base URL", () => {
    process.env[ENV_KEY] = "https://hub.example.com///";
    expect(getBundlesHubBaseUrl()).toBe("https://hub.example.com");
    expect(buildBundlesHubAccountUrl("99")).toBe("https://hub.example.com/99");
  });

  it("builds render URL with lowercased sport segment", () => {
    process.env[ENV_KEY] = "https://hub.example.com";
    expect(sportSegmentForBundlesHub("Cricket")).toBe("cricket");
    expect(buildBundlesHubRenderUrl("12", "AFL", 456)).toBe("https://hub.example.com/12/afl/456");
  });

  it("returns null render URL when sport is missing", () => {
    process.env[ENV_KEY] = "https://hub.example.com";
    expect(buildBundlesHubRenderUrl("12", null, 1)).toBeNull();
  });

  it("builds group URL with encoded grouping category segment", () => {
    process.env[ENV_KEY] = "https://hub.example.com";
    expect(buildBundlesHubRenderGroupUrl("575", "Cricket", 8769, "01 - women's competition")).toBe(
      "https://hub.example.com/575/cricket/8769/01%20-%20women's%20competition",
    );
    expect(buildBundlesHubRenderGroupUrl("575", "cricket", 8769, "  ")).toBeNull();
  });
});
