import { describe, expect, it } from "vitest";

import { paginationResultRange } from "./pagination-result-range";
import { renderStatusDisplay } from "./render-status-display";

describe("renderStatusDisplay", () => {
  it("maps complete status to success pill", () => {
    expect(renderStatusDisplay("complete").label).toBe("Complete");
    expect(renderStatusDisplay("complete").pillClassName).toContain("success");
  });
});

describe("paginationResultRange", () => {
  it("computes inclusive range for a page", () => {
    expect(paginationResultRange({ page: 1, pageSize: 25, total: 1 })).toEqual({
      start: 1,
      end: 1,
    });
    expect(paginationResultRange({ page: 2, pageSize: 25, total: 30 })).toEqual({
      start: 26,
      end: 30,
    });
  });

  it("returns null when total is zero", () => {
    expect(paginationResultRange({ page: 1, pageSize: 25, total: 0 })).toBeNull();
  });
});
