import { afterEach, describe, expect, it } from "vitest";

import {
  getAppSidebarEnvironmentLabel,
  getPublicEnvironment,
  isProductionEnvironment,
} from "./public-environment";

describe("getPublicEnvironment", () => {
  const original = process.env["NEXT_PUBLIC_ENVIRONMENT"];

  afterEach(() => {
    if (original === undefined) {
      delete process.env["NEXT_PUBLIC_ENVIRONMENT"];
    } else {
      process.env["NEXT_PUBLIC_ENVIRONMENT"] = original;
    }
  });

  it("returns null when unset or blank", () => {
    delete process.env["NEXT_PUBLIC_ENVIRONMENT"];
    expect(getPublicEnvironment()).toBeNull();
    process.env["NEXT_PUBLIC_ENVIRONMENT"] = "   ";
    expect(getPublicEnvironment()).toBeNull();
  });

  it("returns trimmed environment label", () => {
    process.env["NEXT_PUBLIC_ENVIRONMENT"] = "  local  ";
    expect(getPublicEnvironment()).toBe("local");
  });
});

describe("isProductionEnvironment", () => {
  it("matches production case-insensitively", () => {
    expect(isProductionEnvironment("production")).toBe(true);
    expect(isProductionEnvironment("Production")).toBe(true);
    expect(isProductionEnvironment("local")).toBe(false);
  });
});

describe("getAppSidebarEnvironmentLabel", () => {
  it("returns branded label in production", () => {
    expect(getAppSidebarEnvironmentLabel("production", 2026)).toBe("Fixtura V.1 2026");
  });

  it("returns the environment name for non-production", () => {
    expect(getAppSidebarEnvironmentLabel("local", 2026)).toBe("local");
  });
});
