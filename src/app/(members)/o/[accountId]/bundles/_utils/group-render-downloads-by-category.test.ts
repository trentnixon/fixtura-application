import { describe, expect, it } from "vitest";

import { groupRenderDownloadsByCategory } from "./group-render-downloads-by-category";

import type { AccountRenderDetailDownload } from "@/types/api/account";

function download(
  partial: Partial<AccountRenderDetailDownload> & Pick<AccountRenderDetailDownload, "id">,
): AccountRenderDetailDownload {
  return {
    Name: "Asset",
    URL: "",
    grouping_category: null,
    ...partial,
  };
}

describe("groupRenderDownloadsByCategory", () => {
  it("dedupes by grouping_category and sorts numerically by prefix", () => {
    const groups = groupRenderDownloadsByCategory([
      download({ id: 1, grouping_category: "02 - Senior Competition" }),
      download({ id: 2, grouping_category: "01 - Women's Competition" }),
      download({ id: 3, grouping_category: "01 - Women's Competition" }),
      download({ id: 4, grouping_category: "03 - Junior Competition" }),
    ]);

    expect(groups).toEqual([
      { groupingCategory: "01 - Women's Competition", assetCount: 2, fallbackUrl: null },
      { groupingCategory: "02 - Senior Competition", assetCount: 1, fallbackUrl: null },
      { groupingCategory: "03 - Junior Competition", assetCount: 1, fallbackUrl: null },
    ]);
  });

  it("skips rows without a grouping category", () => {
    expect(
      groupRenderDownloadsByCategory([
        download({ id: 1, grouping_category: null }),
        download({ id: 2, grouping_category: "01 - Women's Competition" }),
      ]),
    ).toHaveLength(1);
  });

  it("keeps the first fallback URL in a group", () => {
    const groups = groupRenderDownloadsByCategory([
      download({
        id: 1,
        grouping_category: "01 - Women's Competition",
        URL: "https://example.com/a",
      }),
      download({
        id: 2,
        grouping_category: "01 - Women's Competition",
        URL: "https://example.com/b",
      }),
    ]);

    expect(groups[0]?.fallbackUrl).toBe("https://example.com/a");
  });
});
