import { describe, expect, it } from "vitest";

import { buildThumbnailFrameTargets } from "./build-thumbnail-frame-targets";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

describe("buildThumbnailFrameTargets", () => {
  it("limits carousel items when maxFrameTargets is set", () => {
    const data = { frames: [10, 20, 30, 40] } as FixturaDataset;

    const limited = buildThumbnailFrameTargets(data, 100, 2);
    const unlimited = buildThumbnailFrameTargets(data, 100);

    expect(limited.targets).toHaveLength(2);
    expect(limited.targets.map((t) => t.desired)).toEqual([10, 20]);
    expect(unlimited.targets).toHaveLength(4);
  });
});
