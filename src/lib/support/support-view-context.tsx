"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

import { useSupportCapability } from "@/lib/api/hooks/account/useSupportCapability";
import { parseAccountScopePath } from "@/lib/config/account-routes";

import type { ReactNode } from "react";

export type SupportViewContextValue = {
  canAccessAllAccounts: boolean;
  isSupportView: boolean;
  customerAccountId: string | null;
};

const SupportViewContext = createContext<SupportViewContextValue>({
  canAccessAllAccounts: false,
  isSupportView: false,
  customerAccountId: null,
});

export function SupportViewProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const scoped = parseAccountScopePath(pathname);
  const { canAccessAllAccounts, isSupportViewForAccount } = useSupportCapability();

  const value = useMemo((): SupportViewContextValue => {
    const customerAccountId = scoped?.accountId ?? null;
    const isSupportView = customerAccountId != null && isSupportViewForAccount(customerAccountId);

    return {
      canAccessAllAccounts,
      isSupportView,
      customerAccountId: isSupportView ? customerAccountId : null,
    };
  }, [canAccessAllAccounts, isSupportViewForAccount, scoped?.accountId]);

  return <SupportViewContext.Provider value={value}>{children}</SupportViewContext.Provider>;
}

export function useSupportView(): SupportViewContextValue {
  return useContext(SupportViewContext);
}
