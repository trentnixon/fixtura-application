import { describe, expect, it } from "vitest";

import { previewMediaKeyFromData } from "./preview-media-key-from-data";

describe("previewMediaKeyFromData", () => {
  it("combines template and compositionId from videoMeta", () => {
    const data = {
      videoMeta: {
        video: {
          appearance: { template: "Basic" },
          metadata: { compositionId: "CricketLadder" },
        },
      },
    } as Parameters<typeof previewMediaKeyFromData>[0];

    expect(previewMediaKeyFromData(data)).toBe("Basic-CricketLadder");
  });

  it("returns empty segments when fields are missing", () => {
    const data = {} as Parameters<typeof previewMediaKeyFromData>[0];
    expect(previewMediaKeyFromData(data)).toBe("-");
  });
});
