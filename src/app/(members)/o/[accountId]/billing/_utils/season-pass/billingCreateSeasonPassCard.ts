/** Billing create/checkout path for the account (Season Pass setup). */
export function billingCreateSeasonPassCardHref(accountId: string): string {
  return `/o/${encodeURIComponent(accountId)}/billing/create`;
}
