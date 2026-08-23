"use client";

import { useEffect } from "react";

import { clearOrganizationGroup, groupOrganization } from "@/lib/analytics";

export function AnalyticsAccountGroup({ accountId }: { accountId: string }) {
  useEffect(() => {
    groupOrganization(accountId);
    return () => {
      clearOrganizationGroup();
    };
  }, [accountId]);

  return null;
}
