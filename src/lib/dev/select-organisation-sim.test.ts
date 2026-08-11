import { describe, expect, it } from "vitest";

import { accountPickerRowsFromMePayload } from "@/lib/account/account-me-rows";

import { parseSelectOrgSim, syntheticAccountMeResponseForSim } from "./select-organisation-sim";

describe("parseSelectOrgSim", () => {
  it("accepts known values", () => {
    expect(parseSelectOrgSim("loading")).toBe("loading");
    expect(parseSelectOrgSim("none")).toBe("none");
    expect(parseSelectOrgSim("one")).toBe("one");
    expect(parseSelectOrgSim("multiple")).toBe("multiple");
    expect(parseSelectOrgSim("error")).toBe("error");
  });

  it("rejects unknown and empty", () => {
    expect(parseSelectOrgSim(null)).toBeNull();
    expect(parseSelectOrgSim("")).toBeNull();
    expect(parseSelectOrgSim("invalid")).toBeNull();
  });
});

describe("syntheticAccountMeResponseForSim", () => {
  it("yields expected row counts for accountPickerRowsFromMePayload", () => {
    expect(
      accountPickerRowsFromMePayload(syntheticAccountMeResponseForSim("none").data).length,
    ).toBe(0);
    expect(
      accountPickerRowsFromMePayload(syntheticAccountMeResponseForSim("one").data).length,
    ).toBe(1);
    expect(
      accountPickerRowsFromMePayload(syntheticAccountMeResponseForSim("multiple").data).length,
    ).toBe(3);
  });
});
