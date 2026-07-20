import { describe, expect, it } from "vitest";

import { parseMediaLibraryApiError } from "./parse-media-library-api-error";

describe("parseMediaLibraryApiError", () => {
  it("preserves plural assetTypes field errors", () => {
    const parsed = parseMediaLibraryApiError({
      error: {
        status: 400,
        name: "ValidationError",
        message: "Invalid",
        code: "VALIDATION_ERROR",
        details: {
          fields: {
            assetTypes: ["ALL_MUST_BE_EXCLUSIVE"],
          },
        },
      },
    });

    expect(parsed.fieldErrors["assetTypes"]).toEqual(["ALL_MUST_BE_EXCLUSIVE"]);
  });

  it("converts ASSET_TYPES_REQUIRE_CURRENT_CLIENT into a refresh message", () => {
    const parsed = parseMediaLibraryApiError({
      error: {
        status: 409,
        name: "Conflict",
        message: "Legacy client",
        code: "ASSET_TYPES_REQUIRE_CURRENT_CLIENT",
        details: {
          fields: {
            assetType: ["ASSET_TYPES_REQUIRE_CURRENT_CLIENT"],
          },
        },
      },
    });

    expect(parsed.message).toMatch(/refresh/i);
    expect(parsed.code).toBe("ASSET_TYPES_REQUIRE_CURRENT_CLIENT");
  });
});
