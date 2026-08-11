const LAST_ORG_STORAGE_KEY_PREFIX = "fixtura:last-selected-organisation:";

export type LastSelectedOrganisationRecordV2 = {
  version: 2;
  accountId: string;
  openedAt: string;
};

export type LastSelectedOrganisationRecord =
  | LastSelectedOrganisationRecordV2
  | { accountId: string };

function storageKey(userId: number): string {
  return `${LAST_ORG_STORAGE_KEY_PREFIX}${userId}`;
}

function parseStoredRecord(raw: string): LastSelectedOrganisationRecord | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      (parsed as { version: unknown }).version === 2 &&
      "accountId" in parsed &&
      typeof (parsed as { accountId: unknown }).accountId === "string"
    ) {
      const record = parsed as LastSelectedOrganisationRecordV2;
      if (record.accountId.trim() === "") return null;
      return record;
    }
  } catch {
    // Legacy id-only string.
  }
  return { accountId: trimmed };
}

export function readLastSelectedOrganisationRecord(
  userId: number | undefined,
): LastSelectedOrganisationRecord | null {
  if (userId == null || typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey(userId));
    if (value == null) return null;
    return parseStoredRecord(value);
  } catch {
    return null;
  }
}

/** @deprecated Prefer readLastSelectedOrganisationRecord for V2 timestamp support. */
export function readLastSelectedOrganisationId(userId: number | undefined): string | null {
  const record = readLastSelectedOrganisationRecord(userId);
  return record?.accountId ?? null;
}

export function readLastSelectedOrganisationOpenedAt(
  userId: number | undefined,
): string | undefined {
  const record = readLastSelectedOrganisationRecord(userId);
  if (record && "version" in record && record.version === 2) {
    return record.openedAt;
  }
  return undefined;
}

export function writeLastSelectedOrganisationRecord(
  userId: number | undefined,
  accountId: string,
  openedAt: string = new Date().toISOString(),
): void {
  if (userId == null || typeof window === "undefined") return;
  const payload: LastSelectedOrganisationRecordV2 = {
    version: 2,
    accountId,
    openedAt,
  };
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(payload));
  } catch {
    // Ignore quota / privacy errors.
  }
}

/** @deprecated Prefer writeLastSelectedOrganisationRecord. */
export function writeLastSelectedOrganisationId(
  userId: number | undefined,
  accountId: string,
): void {
  writeLastSelectedOrganisationRecord(userId, accountId);
}

export function lastSelectedOrganisationValidForAccounts(
  record: LastSelectedOrganisationRecord | null,
  accountIds: string[],
): LastSelectedOrganisationRecord | null {
  if (!record) return null;
  return accountIds.includes(record.accountId) ? record : null;
}
