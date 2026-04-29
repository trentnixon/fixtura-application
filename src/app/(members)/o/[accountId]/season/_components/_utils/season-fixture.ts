import type { UnknownRecord } from "../_types";

function isNonArrayObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Wrapped fixture detail: sibling `fixture` + `grade` objects (and friends). */
function isFixtureDetailShape(rec: UnknownRecord): boolean {
  if (isNonArrayObject(rec["fixture"])) {
    return true;
  }
  if (isNonArrayObject(rec["grade"])) {
    return true;
  }
  if (Array.isArray(rec["teamsData"]) || isNonArrayObject(rec["teamsData"])) {
    return true;
  }
  if (isNonArrayObject(rec["renderStatus"])) {
    return true;
  }
  if (isNonArrayObject(rec["links"])) {
    return true;
  }
  return false;
}

/**
 * Flattened fixture row: no nested `fixture` key; match fields live on this object
 * (e.g. `{ id, teams: { home, away }, round, dates, ... }` under `data`).
 */
function isFlattenedFixtureDto(rec: UnknownRecord): boolean {
  if (!isNonArrayObject(rec["teams"])) {
    return false;
  }
  return (
    rec["id"] != null ||
    typeof rec["gameID"] === "string" ||
    typeof rec["gameId"] === "string" ||
    typeof rec["round"] === "string" ||
    isNonArrayObject(rec["dates"]) ||
    isNonArrayObject(rec["venue"])
  );
}

/**
 * Normalize fixture-detail API payloads to the object that contains `fixture`, `grade`, etc.
 * Handles:
 * - `{ json: { fixture, ... } }` (serializer / tRPC-style)
 * - `{ data: { fixture, ... } }` (same pattern as other season-hub `data` wrappers)
 * - Chains like `{ data: { json: { ... } } }` or `{ json: { data: { ... } } }`
 */
export function unwrapSeasonHubFixturePayload(payload: unknown): UnknownRecord | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }
  let cur = payload as UnknownRecord;

  for (let depth = 0; depth < 8; depth++) {
    const jsonLayer = cur["json"];
    if (jsonLayer && typeof jsonLayer === "object" && !Array.isArray(jsonLayer)) {
      cur = jsonLayer as UnknownRecord;
      continue;
    }

    const dataLayer = cur["data"];
    if (dataLayer && typeof dataLayer === "object" && !Array.isArray(dataLayer)) {
      const next = dataLayer as UnknownRecord;
      if (isFixtureDetailShape(next) || isFlattenedFixtureDto(next)) {
        cur = next;
        continue;
      }
      if (next["json"] != null || next["data"] != null) {
        cur = next;
        continue;
      }
    }

    const attrs = cur["attributes"];
    if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
      const ar = attrs as UnknownRecord;
      if (isFixtureDetailShape(ar)) {
        cur = ar;
        continue;
      }
    }

    break;
  }

  if (isFixtureDetailShape(cur) || isFlattenedFixtureDto(cur)) {
    return cur;
  }

  for (const v of Object.values(cur)) {
    if (!isNonArrayObject(v)) {
      continue;
    }
    if (isFixtureDetailShape(v) || isFlattenedFixtureDto(v)) {
      return v;
    }
  }

  return Object.keys(cur).length > 0 ? cur : undefined;
}

export function fixtureTeamSideLabel(side: unknown): string {
  return teamSideName(side) ?? "—";
}

function teamSideName(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const n = (value as UnknownRecord)["name"];
    if (typeof n === "string" && n.trim()) {
      return n.trim();
    }
  }
  return undefined;
}

export function extractFixtureRecord(payload: unknown): UnknownRecord | undefined {
  const root = unwrapSeasonHubFixturePayload(payload);
  if (!root) {
    return undefined;
  }

  const fixture = root["fixture"];
  if (fixture && typeof fixture === "object" && !Array.isArray(fixture)) {
    return fixture as UnknownRecord;
  }

  if (isFlattenedFixtureDto(root)) {
    return root;
  }

  return undefined;
}

export function resolveFixtureHeadline(
  fixture: UnknownRecord | undefined,
  fixtureId: string,
): string {
  const teams =
    fixture && typeof fixture["teams"] === "object" && fixture["teams"] !== null
      ? (fixture["teams"] as UnknownRecord)
      : undefined;
  if (teams) {
    const home = teamSideName(teams["home"]);
    const away = teamSideName(teams["away"]);
    if (home && away) {
      return `${home} vs ${away}`;
    }
  }

  if (fixture && typeof fixture["title"] === "string" && fixture["title"].length > 0) {
    return fixture["title"];
  }

  if (fixture && typeof fixture["name"] === "string" && fixture["name"].length > 0) {
    return fixture["name"];
  }

  return `Fixture ${fixtureId}`;
}
