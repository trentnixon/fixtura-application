"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { useSupportCapability } from "@/lib/api/hooks/account/useSupportCapability";
import { ROUTES } from "@/lib/config/routes";

import type { ReactNode } from "react";

/**
 * Redirects non-support users away from /support/accounts.
 */
export function SupportAccountsGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const redirectingRef = useRef(false);
  const { meQuery, canAccessAllAccounts } = useSupportCapability();

  useEffect(() => {
    if (meQuery.isPending) return;
    if (canAccessAllAccounts) return;
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(ROUTES.selectOrganisation);
  }, [canAccessAllAccounts, meQuery.isPending, router]);

  if (meQuery.isPending) {
    return <BrandedLoader fullPage label="Loading support access" />;
  }

  if (!canAccessAllAccounts) {
    return (
      <div className="text-muted-foreground grid gap-2 p-6 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
