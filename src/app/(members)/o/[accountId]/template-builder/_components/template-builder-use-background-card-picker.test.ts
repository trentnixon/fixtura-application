import { describe, expect, it } from "vitest";

import { buildTemplateBuilderUseBackgroundOptions } from "./template-builder-use-background-card-picker";

describe("buildTemplateBuilderUseBackgroundOptions", () => {
  it("keeps Image available while media availability is unknown or populated", () => {
    expect(buildTemplateBuilderUseBackgroundOptions(false).map((option) => option.value)).toContain(
      "Image",
    );
  });

  it("removes Image after the media library is confirmed empty", () => {
    expect(
      buildTemplateBuilderUseBackgroundOptions(true).map((option) => option.value),
    ).not.toContain("Image");
  });

  it("continues to hide the unsupported Video option", () => {
    expect(
      buildTemplateBuilderUseBackgroundOptions(false).map((option) => option.value),
    ).not.toContain("Video");
  });
});
