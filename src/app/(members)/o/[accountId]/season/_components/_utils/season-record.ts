import type { UnknownRecord } from "../_types";

export function asRecord(value: unknown): UnknownRecord | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return undefined;
}

export function pickString(row: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

export function pickId(row: UnknownRecord): string | undefined {
  const id = row["id"];
  if (typeof id === "number" && Number.isFinite(id)) {
    return String(id);
  }
  if (typeof id === "string" && id.length > 0) {
    return id;
  }
  return undefined;
}
