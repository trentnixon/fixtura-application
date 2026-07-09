/** Billing create/checkout path for the account (Season Pass setup). */
export function billingCreateSeasonPassCardHref(accountId: string): string {
  return `/o/${encodeURIComponent(accountId)}/billing/create`;
}

const BILLING_SEASON_PASS_ACCOUNT_NAME_FALLBACK = "this organisation";

export function formatBillingCreateSeasonPassDescription(accountName: string): string {
  const target = accountName.trim() || BILLING_SEASON_PASS_ACCOUNT_NAME_FALLBACK;

  return `Set up a Season Pass to keep Fixtura active for ${target}.`;
}
