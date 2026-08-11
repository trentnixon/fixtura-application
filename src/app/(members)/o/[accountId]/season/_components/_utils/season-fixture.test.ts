import { describe, expect, it } from "vitest";

import fixtureDetailSample from "@/types/api/__fixtures__/season-hub-fixture-detail-81411.json";

import { extractFixtureRecord, unwrapSeasonHubFixturePayload } from "./season-fixture";

import type { SeasonHubFixtureDetailBody } from "@/types/api/season-hub";

describe("unwrapSeasonHubFixturePayload", () => {
  it("unwraps json-wrapped fixture detail sample", () => {
    const body = unwrapSeasonHubFixturePayload(fixtureDetailSample);
    expect(body).toBeDefined();
    expect(body?.fixture.id).toBe(81411);
    expect(body?.grade.id).toBe(71338);
    expect(body?.links.canonical).toContain("81411");
  });

  it("unwraps data-wrapped fixture detail body", () => {
    const inner = (fixtureDetailSample as { json: SeasonHubFixtureDetailBody }).json;
    const body = unwrapSeasonHubFixturePayload({ data: inner });
    expect(body?.fixture.id).toBe(81411);
    expect(body?.grade.id).toBe(71338);
  });

  it("unwraps bare fixture detail body", () => {
    const inner = (fixtureDetailSample as { json: SeasonHubFixtureDetailBody }).json;
    const body = unwrapSeasonHubFixturePayload(inner);
    expect(body?.fixture.id).toBe(81411);
  });

  it("exposes teamsData array from sample", () => {
    const body = unwrapSeasonHubFixturePayload(fixtureDetailSample);
    expect(Array.isArray(body?.teamsData)).toBe(true);
    const teams = body?.teamsData as Array<{ name: string }>;
    expect(teams).toHaveLength(2);
    expect(teams[0]?.name).toBe("Waratah Women's Div 1");
    expect(teams[1]?.name).toBe("Nightcliff Div 1");
  });
});

describe("extractFixtureRecord", () => {
  it("returns nested fixture with match fields from sample", () => {
    const fixture = extractFixtureRecord(fixtureDetailSample);
    expect(fixture?.id).toBe(81411);
    expect(fixture?.gameID).toBe("bf20bec7");
    expect(fixture?.teams?.home?.name).toBe("Waratah Women's Div 1");
    expect(fixture?.teams?.away?.name).toBe("Nightcliff Div 1");
    expect(fixture?.matchDetails?.resultStatement).toBe("Waratah Women's Div 1 won by 67 runs");
  });

  it("extracts fixture from data-wrapped payload", () => {
    const inner = (fixtureDetailSample as { json: SeasonHubFixtureDetailBody }).json;
    const fixture = extractFixtureRecord({ data: inner });
    expect(fixture?.gameID).toBe("bf20bec7");
  });
});
