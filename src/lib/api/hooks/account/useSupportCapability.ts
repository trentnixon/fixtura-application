import { useMemo } from "react";

import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  canAccessAllAccountsFromMePayload,
  isOwnedAccountId,
  isSupportOnlyUser,
  isSupportViewForAccount,
  ownedAccountIdsFromMePayload,
} from "@/lib/support/support-capability";

export type UseSupportCapabilityOptions = {
  enabled?: boolean;
};

/**
 * Derived support super-user capability from GET /api/account/me.
 * Never persist — always sourced from bootstrap query.
 */
export function useSupportCapability(options?: UseSupportCapabilityOptions) {
  const me = useAccountMe({ enabled: options?.enabled !== false });

  return useMemo(() => {
    const payload = me.data?.data;
    return {
      meQuery: me,
      canAccessAllAccounts: canAccessAllAccountsFromMePayload(payload),
      ownedAccountIds: ownedAccountIdsFromMePayload(payload),
      isSupportOnlyUser: isSupportOnlyUser(payload),
      isOwnedAccountId: (accountId: string | undefined) => isOwnedAccountId(payload, accountId),
      isSupportViewForAccount: (accountId: string | undefined) =>
        isSupportViewForAccount(payload, accountId),
    };
  }, [me]);
}
