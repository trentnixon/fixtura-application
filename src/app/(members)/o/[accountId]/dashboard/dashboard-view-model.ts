import type {
  AccountAnalyticsMetricsAsPercentageOfCost,
  AccountAnalyticsOverviewResponse,
  AccountAnalyticsOverviewSeriesPoint,
  AccountAnalyticsRollup,
  AccountBrandingData,
  AccountMeResponse,
  AccountOrganisationContextData,
  AccountOrganisationDetails,
  AccountSettingsData,
  AccountSummary,
} from "@/types/api/account";

export type DashboardViewModel = {
  organisationName: string;
  sport: string | null;
  accountType: number | null;
  logoUrl: string | null;
  userEmail: string | null;
  orgDetails: AccountOrganisationDetails | null;
  settings: AccountSettingsData | null;
  branding: AccountBrandingData | null;
  analytics: AccountAnalyticsOverviewResponse | null;
  rollup: AccountAnalyticsRollup | null;
  metricsPct: AccountAnalyticsMetricsAsPercentageOfCost | null;
  series: AccountAnalyticsOverviewSeriesPoint[];
};

function findAccountRow(
  me: AccountMeResponse | undefined,
  accountId: string,
): AccountSummary | undefined {
  if (!me?.data.accounts?.length) return undefined;
  const id = Number(accountId);
  if (Number.isNaN(id)) return undefined;
  return me.data.accounts.find((a) => a.id === id);
}

function fallbackNameFromAccountRow(row: AccountSummary | undefined): string | null {
  if (!row) return null;
  const org = row.accountOrganisationDetails?.Name?.trim();
  if (org) return org;
  const onb = row.onboardingOrganisationName?.trim();
  if (onb) return onb;
  const fn = row.FirstName?.trim() ?? "";
  const ln = row.LastName?.trim() ?? "";
  const full = `${fn} ${ln}`.trim();
  return full || null;
}

export function buildDashboardViewModel({
  accountId,
  me,
  settings,
  branding,
  organisationContext,
  analytics,
}: {
  accountId: string;
  me: AccountMeResponse | undefined;
  settings: AccountSettingsData | null;
  branding: AccountBrandingData | null;
  organisationContext: AccountOrganisationContextData | null;
  analytics: AccountAnalyticsOverviewResponse | null;
}): DashboardViewModel {
  const orgDetails = organisationContext?.accountOrganisationDetails ?? null;
  const row = findAccountRow(me, accountId);
  const organisationName =
    orgDetails?.Name?.trim() || fallbackNameFromAccountRow(row) || "Dashboard";

  const sport = orgDetails?.Sport?.trim() || settings?.Sport?.trim() || null;
  const accountType = organisationContext?.account_type ?? settings?.account_type ?? null;

  const logoRaw = orgDetails?.ParentLogo?.trim() || branding?.onboardingLogo?.url?.trim() || "";
  const logoUrl = logoRaw || null;

  const rollup = analytics?.data.rollup ?? null;
  const series = analytics?.data.series ?? [];
  const metricsPct = analytics?.data.metricsAsPercentageOfCost ?? null;

  return {
    organisationName,
    sport,
    accountType,
    logoUrl,
    userEmail: me?.data.user?.email ?? null,
    orgDetails,
    settings,
    branding,
    analytics,
    rollup,
    metricsPct,
    series,
  };
}
