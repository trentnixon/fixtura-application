"use client";

import { useEffect, useRef } from "react";

import { clearOrganizationGroup, groupOrganization } from "@/lib/analytics";
import {
  buildOrganizationGroupProperties
} from "@/lib/analytics/organization-group-properties";
import {
  useAccountBilling,
  isAccountBillingGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountBilling";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";

import type {
  pickOrganizationGroupProperties} from "@/lib/analytics/organization-group-properties";

function serializeGroupProperties(
  properties: ReturnType<typeof pickOrganizationGroupProperties>,
): string {
  return JSON.stringify(properties);
}

export function AnalyticsAccountGroup({ accountId }: { accountId: string }) {
  const { data: meData } = useAccountMe();
  const { data: billingData } = useAccountBilling(accountId);
  const lastGroupedRef = useRef<string | null>(null);

  useEffect(() => {
    const accountRow = meData?.data?.accounts?.find((row) => String(row.id) === accountId);
    const billingSummary =
      billingData && !isAccountBillingGatewayRedirect(billingData) ? billingData.data : undefined;
    const properties = buildOrganizationGroupProperties(accountRow, billingSummary);
    const fingerprint = `${accountId}:${serializeGroupProperties(properties)}`;

    if (lastGroupedRef.current === fingerprint) return;
    lastGroupedRef.current = fingerprint;

    groupOrganization(accountId, properties);

    return () => {
      lastGroupedRef.current = null;
      clearOrganizationGroup();
    };
  }, [accountId, meData, billingData]);

  return null;
}
