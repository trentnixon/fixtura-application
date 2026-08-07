import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";

import { canAccessAllAccountsFromMePayload, isSupportOnlyUser } from "./support-capability";

import type { AccountMePayload } from "@/types/api/account";

export type ResolvePostLoginDestinationInput = {
  mePayload: AccountMePayload | undefined;
  fromParam: string | null;
};

/**
 * Post-login redirect target after successful authentication.
 * Support-only users land on the support directory; others use safe deep link or org picker.
 */
export function resolvePostLoginDestination({
  mePayload,
  fromParam,
}: ResolvePostLoginDestinationInput): string {
  if (fromParam && isSafeAppReturnPath(fromParam)) {
    return fromParam;
  }
  if (isSupportOnlyUser(mePayload)) {
    return ROUTES.supportAccounts;
  }
  if (canAccessAllAccountsFromMePayload(mePayload)) {
    return ROUTES.selectOrganisation;
  }
  return ROUTES.selectOrganisation;
}
