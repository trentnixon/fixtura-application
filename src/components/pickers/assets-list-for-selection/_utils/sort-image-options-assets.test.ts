import { describe, expect, it } from "vitest";

import { sortImageOptionsAssets } from "./sort-image-options-assets";

import type { AssetListForSelectionItem } from "@/types/api/assets";

function asset(id: number, name: string, compositionId: string | null): AssetListForSelectionItem {
  return {
    id,
    Name: name,
    Sport: "Cricket",
    CompositionID: compositionId,
    Metadata: null,
    description: null,
    asset_category: {
      id: 1,
      Name: "Image Options",
      Identifier: "image-options",
      description: null,
    },
  };
}

describe("sortImageOptionsAssets", () => {
  it("puts Results before Batting Performances", () => {
    const items = [
      asset(1, "Batting Performances", "CricketBattingPerformances"),
      asset(2, "Results", "CricketResults"),
    ];

    expect(sortImageOptionsAssets(items).map((item) => item.CompositionID)).toEqual([
      "CricketResults",
      "CricketBattingPerformances",
    ]);
  });

  it("sorts unknown composition ids after configured ids by name", () => {
    const items = [
      asset(3, "Zeta Asset", "CricketUnknownZ"),
      asset(1, "Results", "CricketResults"),
      asset(2, "Alpha Asset", "CricketUnknownA"),
    ];

    expect(sortImageOptionsAssets(items).map((item) => item.id)).toEqual([1, 2, 3]);
  });
});
