import { organisationDisplayNameFromAccountRow } from "@/lib/account/organisation-display-name";
import { isSelectOrgContinueSetup } from "@/lib/onboarding/select-org-card-tone";

import type { AccountSummary, OnboardingStateData } from "@/types/api/account";

export type SelectOrgSortMode = "name-asc" | "name-desc" | "setup-first" | "newest-first";

export type SelectOrgSummaryStats = {
  total: number;
  needsSetup: number;
  inactive: number;
  active: number;
};

export type SelectOrgWorkspaceContext = {
  simulating: boolean;
  onboardingStateByAccountId: Map<string, OnboardingStateData | undefined>;
};

function displayName(row: AccountSummary): string {
  return organisationDisplayNameFromAccountRow(row).toLowerCase();
}

function continueSetupForRow(row: AccountSummary, ctx: SelectOrgWorkspaceContext): boolean {
  const onboardingState = ctx.onboardingStateByAccountId.get(String(row.id));
  return ctx.simulating
    ? isSelectOrgContinueSetup(row)
    : isSelectOrgContinueSetup(row, onboardingState);
}

function sportForRow(row: AccountSummary): string {
  const org = row.contentHub?.accountOrganisationDetails ?? row.accountOrganisationDetails;
  return (org?.Sport ?? row.Sport ?? "").trim().toLowerCase();
}

function playHqIdForRow(row: AccountSummary): string {
  const org = row.contentHub?.accountOrganisationDetails ?? row.accountOrganisationDetails;
  return (org?.PlayHQID ?? "").trim();
}

export function filterSelectOrgRowsBySearch(
  rows: AccountSummary[],
  query: string,
): AccountSummary[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 1) return rows;
  return rows.filter((row) => {
    if (displayName(row).includes(normalized)) return true;
    const sport = sportForRow(row);
    if (sport.length > 0 && sport.includes(normalized)) return true;
    const playHqId = playHqIdForRow(row);
    if (playHqId.length > 0 && playHqId.toLowerCase() === normalized) return true;
    return false;
  });
}

function createdAtMs(row: AccountSummary): number {
  const parsed = Date.parse(row.createdAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortSelectOrgRows(
  rows: AccountSummary[],
  mode: SelectOrgSortMode,
  ctx: SelectOrgWorkspaceContext,
): AccountSummary[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (mode === "newest-first") {
      return createdAtMs(b) - createdAtMs(a);
    }
    if (mode === "setup-first") {
      const aSetup = continueSetupForRow(a, ctx);
      const bSetup = continueSetupForRow(b, ctx);
      if (aSetup !== bSetup) return aSetup ? -1 : 1;
    }
    const cmp = displayName(a).localeCompare(displayName(b));
    return mode === "name-desc" ? -cmp : cmp;
  });
  return sorted;
}

export function buildSelectOrgSummaryStats(
  rows: AccountSummary[],
  ctx: SelectOrgWorkspaceContext,
): SelectOrgSummaryStats {
  let needsSetup = 0;
  let inactive = 0;
  let active = 0;

  for (const row of rows) {
    if (continueSetupForRow(row, ctx)) needsSetup += 1;
    if (row.isActive === false) inactive += 1;
    else if (row.isActive === true) active += 1;
  }

  return {
    total: rows.length,
    needsSetup,
    inactive,
    active,
  };
}

export function formatSelectOrgSummaryLine(stats: SelectOrgSummaryStats): string {
  const parts: string[] = [`${stats.total} organisation${stats.total === 1 ? "" : "s"}`];
  if (stats.needsSetup > 0) {
    parts.push(`${stats.needsSetup} need setup`);
  }
  if (stats.inactive > 0) {
    parts.push(`${stats.inactive} inactive`);
  }
  return parts.join(" · ");
}
