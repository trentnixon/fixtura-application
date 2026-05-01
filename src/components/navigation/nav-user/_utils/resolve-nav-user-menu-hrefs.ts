import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

export function resolveNavUserAccountHref(accountId: string | undefined): string {
  return accountId ? accountScopedRoutes.account(accountId) : ROUTES.selectOrganisation;
}

export function resolveNavUserBillingHref(accountId: string | undefined): string {
  return accountId ? accountScopedRoutes.billing(accountId) : ROUTES.selectOrganisation;
}
