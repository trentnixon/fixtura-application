import { describe, expect, it } from "vitest";

import { nextBundlesRenderSort, sortBundlesRenders } from "./sort-bundles-renders";

import type { AccountRenderListRow } from "@/types/api/account";

const rows: AccountRenderListRow[] = [
  {
    id: 2,
    Name: "Beta",
    createdAt: "2026-05-02T10:00:00.000Z",
    Processing: false,
    Complete: true,
    status: "complete",
  },
  {
    id: 1,
    Name: "Alpha",
    createdAt: "2026-05-01T10:00:00.000Z",
    Processing: true,
    Complete: false,
    status: "processing",
  },
];

describe("sortBundlesRenders", () => {
  it("sorts by createdAt descending", () => {
    expect(sortBundlesRenders(rows, "createdAt", "desc").map((r) => r.id)).toEqual([2, 1]);
  });

  it("sorts by status ascending", () => {
    expect(sortBundlesRenders(rows, "status", "asc").map((r) => r.status)).toEqual([
      "complete",
      "processing",
    ]);
  });
});

describe("nextBundlesRenderSort", () => {
  it("toggles direction on same column", () => {
    expect(nextBundlesRenderSort({ column: "status", direction: "asc" }, "status")).toEqual({
      column: "status",
      direction: "desc",
    });
  });

  it("defaults createdAt to descending on column change", () => {
    expect(nextBundlesRenderSort({ column: "status", direction: "desc" }, "createdAt")).toEqual({
      column: "createdAt",
      direction: "desc",
    });
  });
});
