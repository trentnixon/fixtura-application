import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  lastSelectedOrganisationValidForAccounts,
  readLastSelectedOrganisationId,
  readLastSelectedOrganisationOpenedAt,
  readLastSelectedOrganisationRecord,
  writeLastSelectedOrganisationId,
  writeLastSelectedOrganisationRecord,
} from "./last-selected-organisation";

describe("last-selected-organisation", () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(storage)) delete storage[key];
    vi.stubGlobal("localStorage", {
      getItem(key: string) {
        return storage[key] ?? null;
      },
      setItem(key: string, value: string) {
        storage[key] = value;
      },
      removeItem(key: string) {
        delete storage[key];
      },
      clear() {
        for (const key of Object.keys(storage)) delete storage[key];
      },
    });
  });

  it("reads legacy id-only storage and writes V2 on save", () => {
    storage["fixtura:last-selected-organisation:42"] = "101";
    expect(readLastSelectedOrganisationId(42)).toBe("101");
    expect(readLastSelectedOrganisationRecord(42)).toEqual({ accountId: "101" });
    expect(readLastSelectedOrganisationOpenedAt(42)).toBeUndefined();

    writeLastSelectedOrganisationId(42, "101");
    const record = readLastSelectedOrganisationRecord(42);
    expect(record).toMatchObject({ version: 2, accountId: "101" });
    expect(readLastSelectedOrganisationId(99)).toBeNull();
  });

  it("reads and writes V2 record with openedAt", () => {
    writeLastSelectedOrganisationRecord(42, "101", "2026-07-14T10:00:00.000Z");
    expect(readLastSelectedOrganisationId(42)).toBe("101");
    expect(readLastSelectedOrganisationOpenedAt(42)).toBe("2026-07-14T10:00:00.000Z");
    expect(readLastSelectedOrganisationRecord(42)).toEqual({
      version: 2,
      accountId: "101",
      openedAt: "2026-07-14T10:00:00.000Z",
    });
  });

  it("returns null when user id is missing", () => {
    writeLastSelectedOrganisationId(undefined, "101");
    expect(readLastSelectedOrganisationId(undefined)).toBeNull();
  });

  it("validates stored account id against latest accounts list", () => {
    const record = { version: 2 as const, accountId: "999", openedAt: "2026-07-14T10:00:00.000Z" };
    expect(lastSelectedOrganisationValidForAccounts(record, ["101", "202"])).toBeNull();
    expect(lastSelectedOrganisationValidForAccounts(record, ["101", "999"])).toEqual(record);
  });
});
