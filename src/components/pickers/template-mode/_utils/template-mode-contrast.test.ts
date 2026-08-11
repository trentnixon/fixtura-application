import { describe, expect, it } from "vitest";

import {
  templateModeContrastTitleClass,
  templateModeUsesDarkCopyOnDarkSurface,
  templateModeUsesDarkCopyOnLightSurface,
  templateModeUsesDarkTitlesOnGradient,
} from "./template-mode-contrast";

describe("templateModeUsesDarkTitlesOnGradient", () => {
  it("uses dark hero titles for Light and Dark Alt", () => {
    expect(templateModeUsesDarkTitlesOnGradient("light")).toBe(true);
    expect(templateModeUsesDarkTitlesOnGradient("dark-alt")).toBe(true);
  });

  it("uses light hero titles for Light Alt and Dark", () => {
    expect(templateModeUsesDarkTitlesOnGradient("light-alt")).toBe(false);
    expect(templateModeUsesDarkTitlesOnGradient("dark")).toBe(false);
  });
});

describe("templateModeUsesDarkCopyOnLightSurface", () => {
  it("uses dark copy on light surfaces for Light only", () => {
    expect(templateModeUsesDarkCopyOnLightSurface("light")).toBe(true);
    expect(templateModeUsesDarkCopyOnLightSurface("light-alt")).toBe(false);
  });
});

describe("templateModeUsesDarkCopyOnDarkSurface", () => {
  it("uses dark copy on dark surfaces for Dark Alt only", () => {
    expect(templateModeUsesDarkCopyOnDarkSurface("dark")).toBe(false);
    expect(templateModeUsesDarkCopyOnDarkSurface("dark-alt")).toBe(true);
  });
});

describe("templateModeContrastTitleClass", () => {
  it("pairs Light with dark titles and Light Alt with light titles on flat surfaces", () => {
    expect(templateModeContrastTitleClass("light", false)).toContain("text-zinc-950");
    expect(templateModeContrastTitleClass("light-alt", false)).toContain("text-white");
  });

  it("pairs Dark with light titles and Dark Alt with dark titles on flat surfaces", () => {
    expect(templateModeContrastTitleClass("dark", false)).toContain("text-white");
    expect(templateModeContrastTitleClass("dark-alt", false)).toContain("text-zinc-950");
  });
});
