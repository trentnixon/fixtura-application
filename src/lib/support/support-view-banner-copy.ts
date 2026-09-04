export function buildSupportViewBannerMessage({
  accountId,
  orgName,
}: {
  accountId: string;
  orgName?: string | null;
}): string {
  if (orgName) {
    return `Support view — Account ${accountId} (${orgName})`;
  }
  return `Support view — Account ${accountId}`;
}
