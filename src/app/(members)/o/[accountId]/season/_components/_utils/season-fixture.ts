import type { UnknownRecord } from "../_types";

export function extractFixtureRecord(payload: unknown): UnknownRecord | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const fixture = (payload as { fixture?: unknown }).fixture;
  if (!fixture || typeof fixture !== "object") {
    return undefined;
  }

  return fixture as UnknownRecord;
}

export function resolveFixtureHeadline(
  fixture: UnknownRecord | undefined,
  fixtureId: string,
): string {
  if (fixture && typeof fixture["title"] === "string" && fixture["title"].length > 0) {
    return fixture["title"];
  }

  if (fixture && typeof fixture["name"] === "string" && fixture["name"].length > 0) {
    return fixture["name"];
  }

  return `Fixture ${fixtureId}`;
}
