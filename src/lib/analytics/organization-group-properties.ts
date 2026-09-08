import { organisationDetailsFromAccountRow } from "@/lib/account/account-me-rows";
import { organisationDisplayNameFromAccountRow } from "@/lib/account/organisation-display-name";

import type { AccountBillingSummaryV1, AccountSummary } from "@/types/api/account";

const ALLOWED_ORGANIZATION_GROUP_KEYS = ["name", "plan", "sport"] as const;

export type OrganizationGroupAnalyticsPropertyKey =
  (typeof ALLOWED_ORGANIZATION_GROUP_KEYS)[number];

export type OrganizationGroupAnalyticsProperties = Partial<
  Record<OrganizationGroupAnalyticsPropertyKey, string>
>;

function usableString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function pickOrganizationGroupProperties(
  input: Record<string, unknown>,
): OrganizationGroupAnalyticsProperties {
  const result: OrganizationGroupAnalyticsProperties = {};

  for (const key of ALLOWED_ORGANIZATION_GROUP_KEYS) {
    const value = usableString(input[key]);
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

export function deriveAnalyticsPlanFromBilling(
  summary: AccountBillingSummaryV1 | undefined,
): string | undefined {
  if (!summary) return undefined;

  if (summary.trial?.isActive) return "trial";

  const tierId = usableString(summary.currentPlan?.id);
  if (tierId) return tierId;

  const tierName = usableString(summary.currentPlan?.name);
  if (tierName) return tierName;

  return usableString(summary.billingStatus) ?? usableString(summary.accessStatus);
}

function sportFromAccountRow(row: AccountSummary): string | undefined {
  const details = organisationDetailsFromAccountRow(row);
  return usableString(details?.Sport) ?? usableString(row.Sport);
}

export function buildOrganizationGroupProperties(
  account: AccountSummary | undefined,
  billing: AccountBillingSummaryV1 | undefined,
): OrganizationGroupAnalyticsProperties {
  if (!account)
    return pickOrganizationGroupProperties({ plan: deriveAnalyticsPlanFromBilling(billing) });

  return pickOrganizationGroupProperties({
    name: organisationDisplayNameFromAccountRow(account),
    plan: deriveAnalyticsPlanFromBilling(billing),
    sport: sportFromAccountRow(account),
  });
}
