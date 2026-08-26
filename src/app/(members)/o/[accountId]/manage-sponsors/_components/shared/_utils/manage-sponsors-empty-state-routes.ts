import { accountScopedRoutes } from "@/lib/config/account-routes";

export function getManageSponsorsEmptyStateAddHref(accountId: string) {
  return accountScopedRoutes.addSponsor(accountId);
}
