"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getBillingDebugSnapshot, type BillingDebugSnapshot } from "../_core/billing-state";
import {
  buildBillingDebugFunnelGates,
  type BillingDebugFunnelGates,
} from "../_utils/debug/billingDebugPanel";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

/** Same toggle as BillingDebugPanel: dev build or `?debug=1`. */
export function useBillingDevToolsVisible(): boolean {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && (process.env.NODE_ENV === "development" || searchParams.get("debug") === "1");
}

type UseBillingDebugPanelResult = {
  visible: boolean;
  snapshot: BillingDebugSnapshot | null;
  funnel: BillingDebugFunnelGates;
};

export function useBillingDebugPanel(
  summary: AccountBillingSummaryV1 | null,
  orders?: AccountBillingOrderHistoryDto[] | null,
): UseBillingDebugPanelResult {
  const visible = useBillingDevToolsVisible();

  const snapshot = useMemo((): BillingDebugSnapshot | null => {
    if (!summary) return null;
    return getBillingDebugSnapshot(summary, { orders: orders ?? null });
  }, [summary, orders]);

  const funnel = useMemo(
    () => buildBillingDebugFunnelGates(summary, { orders: orders ?? null }),
    [summary, orders],
  );

  return { visible, snapshot, funnel };
}
