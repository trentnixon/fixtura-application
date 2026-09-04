export const SUPPORT_VIEW_BANNER_COPY = {
  billingReadOnly: "Billing changes are read-only.",
  visionSyncAllowed: "Vision sync is available for troubleshooting.",
  fixtureResultSyncUnavailable: "Per-fixture result scrape is not available in support view.",
} as const;

export function buildSupportViewBannerMessage({
  accountId,
  orgName,
}: {
  accountId: string;
  orgName?: string | null;
}): string {
  const header = orgName
    ? `Support view — Account ${accountId} (${orgName})`
    : `Support view — Account ${accountId}`;

  const details = [
    SUPPORT_VIEW_BANNER_COPY.billingReadOnly,
    SUPPORT_VIEW_BANNER_COPY.visionSyncAllowed,
    SUPPORT_VIEW_BANNER_COPY.fixtureResultSyncUnavailable,
  ].join(" ");

  return `${header} — ${details}`;
}
