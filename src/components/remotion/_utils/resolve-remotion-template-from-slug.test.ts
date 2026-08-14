import { describe, expect, it } from "vitest";

import { resolveRemotionTemplateFromSlug } from "./resolve-remotion-template-from-slug";

describe("resolveRemotionTemplateFromSlug", () => {
  it("maps hyphenated CMS slugs to BroadcastPro", () => {
    const { template, usedFallback } = resolveRemotionTemplateFromSlug("broadcast-pro");
    expect(template).toBe("BroadcastPro");
    expect(usedFallback).toBe(false);
  });

  it("maps hyphenated CMS slugs to BroadcastProRounded", () => {
    const { template, usedFallback } = resolveRemotionTemplateFromSlug("broadcast-pro-rounded");
    expect(template).toBe("BroadcastProRounded");
    expect(usedFallback).toBe(false);
  });

  it("maps mudgeeraba case-insensitively", () => {
    const { template, usedFallback } = resolveRemotionTemplateFromSlug("mudgeeraba");
    expect(template).toBe("Mudgeeraba");
    expect(usedFallback).toBe(false);
  });
});
