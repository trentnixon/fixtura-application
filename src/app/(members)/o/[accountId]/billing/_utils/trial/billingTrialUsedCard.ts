const BILLING_TRIAL_USED_ACCOUNT_NAME_FALLBACK = "this organisation";

export function formatBillingTrialUsedCardDescription(accountName: string): string {
  const target = accountName.trim() || BILLING_TRIAL_USED_ACCOUNT_NAME_FALLBACK;

  return `The free trial for ${target} has already been used.`;
}
