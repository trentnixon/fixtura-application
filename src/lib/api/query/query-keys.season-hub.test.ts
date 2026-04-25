import { describe, expect, it } from "vitest";

import { queryKeys } from "./query-keys";

describe("queryKeys.seasonHub", () => {
  it("competitions key includes page and pageSize with defaults", () => {
    expect(queryKeys.seasonHub.competitions("573")).toEqual([
      "season-hub",
      "competitions",
      "573",
      1,
      25,
    ]);
  });

  it("competitions key reflects explicit pagination", () => {
    expect(queryKeys.seasonHub.competitions("573", { page: 2, pageSize: 50 })).toEqual([
      "season-hub",
      "competitions",
      "573",
      2,
      50,
    ]);
  });

  it("fixture canonical key orders account competition grade fixture", () => {
    expect(queryKeys.seasonHub.fixture("1", "10", "20", "30")).toEqual([
      "season-hub",
      "fixture",
      "1",
      "10",
      "20",
      "30",
    ]);
  });

  it("grade key uses alias sentinel when competition omitted", () => {
    expect(queryKeys.seasonHub.grade("1", "5", null)).toEqual([
      "season-hub",
      "grade",
      "1",
      "5",
      "alias",
    ]);
  });
});
