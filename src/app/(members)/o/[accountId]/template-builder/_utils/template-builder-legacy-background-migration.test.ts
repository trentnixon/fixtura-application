import { describe, expect, it } from "vitest";

import {
  getLegacyBackgroundMigrationMessage,
  getSavedUseBackgroundRequiresMigration,
  isSaveBlockedByLegacyBackground,
} from "./template-builder-legacy-background-migration";

describe("legacy background migration", () => {
  it("detects forbidden legacy modes", () => {
    expect(getSavedUseBackgroundRequiresMigration("Graphics")).toBe("Graphics");
    expect(getSavedUseBackgroundRequiresMigration("Animated")).toBeNull();
  });

  it("blocks save for legacy saved backgrounds", () => {
    expect(isSaveBlockedByLegacyBackground("Particle")).toBe(true);
    expect(isSaveBlockedByLegacyBackground("Solid")).toBe(false);
  });

  it("returns migration message", () => {
    expect(getLegacyBackgroundMigrationMessage("Graphics")).toMatch(/legacy/i);
  });
});
