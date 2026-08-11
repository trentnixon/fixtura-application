const SUPPORT_CUSTOMER_LABEL_PREFIX = "fixtura.supportCustomerLabel:";

/** Persist display name from directory row for support banner (session-only). */
export function setSupportCustomerLabel(accountId: string, name: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${SUPPORT_CUSTOMER_LABEL_PREFIX}${accountId}`, name);
}

export function getSupportCustomerLabel(accountId: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(`${SUPPORT_CUSTOMER_LABEL_PREFIX}${accountId}`);
}
