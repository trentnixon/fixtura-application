import { accountScopedRoutes } from "@/lib/config/account-routes";

export function getSponsorArchivePoolHref(accountId: string) {
  return accountScopedRoutes.manageSponsors(accountId);
}
