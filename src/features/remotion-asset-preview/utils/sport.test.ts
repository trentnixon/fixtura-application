import { describe, expect, it } from "vitest";

import { getExampleDatasetPathForSport } from "./example-dataset-loader";
import { isCricketSport, normalizeSport } from "./sport";

describe("normalizeSport", () => {
  it("trims and returns null for empty", () => {
    expect(normalizeSport(null)).toBeNull();
    expect(normalizeSport(undefined)).toBeNull();
    expect(normalizeSport("  ")).toBeNull();
    expect(normalizeSport(" Cricket ")).toBe("Cricket");
  });
});

describe("isCricketSport", () => {
  it("is true for Cricket case variants", () => {
    expect(isCricketSport("Cricket")).toBe(true);
    expect(isCricketSport("cricket")).toBe(true);
    expect(isCricketSport(" CRICKET ")).toBe(true);
  });

  it("is false for other sports and null", () => {
    expect(isCricketSport("AFL")).toBe(false);
    expect(isCricketSport("Netball")).toBe(false);
    expect(isCricketSport(null)).toBe(false);
  });
});

describe("getExampleDatasetPathForSport", () => {
  it("returns cricket ladder path for cricket", () => {
    expect(getExampleDatasetPathForSport("Cricket")).toBe(
      "/dummyAssetData/Cricket/Cricket_Ladder.json",
    );
  });

  it("returns path for cricket composition when id matches bundled sandbox", () => {
    expect(getExampleDatasetPathForSport("Cricket", "CricketUpcoming")).toBe(
      "/dummyAssetData/Cricket/Cricket_upcoming.json",
    );
  });

  it("falls back to ladder when composition id is unknown", () => {
    expect(getExampleDatasetPathForSport("Cricket", "NotARealComposition")).toBe(
      "/dummyAssetData/Cricket/Cricket_Ladder.json",
    );
  });

  it("returns null for non-cricket", () => {
    expect(getExampleDatasetPathForSport("AFL")).toBeNull();
    expect(getExampleDatasetPathForSport(null)).toBeNull();
  });
});
