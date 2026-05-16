import { accountScopedRoutes } from "@/lib/config/account-routes";

export function getManageSponsorsEmptyStateAddHref(accountId: string) {
  return accountScopedRoutes.addSponsor(accountId);
}

export function getManageSponsorsEmptyStateAssignmentHref(accountId: string) {
  return accountScopedRoutes.manageSponsorsAssignPosition(accountId);
}
