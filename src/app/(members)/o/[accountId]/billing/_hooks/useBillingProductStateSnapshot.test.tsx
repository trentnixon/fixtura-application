import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { queryKeys } from "@/lib/api/query/query-keys";

import { useBillingProductStateSnapshot } from "./useBillingProductStateSnapshot";

import type { AccountBillingSummaryV1 } from "@/types/api/account";
import type { ReactNode } from "react";

const ACCOUNT_ID = "42";

function trialSummary(): AccountBillingSummaryV1 {
  return {
    billingStatus: "trial",
    accessStatus: "trial",
    currentPlan: null,
    trial: { isActive: true, endDate: "2026-12-01" },
    activeOrder: null,
    latestInvoiceRequest: null,
  };
}

function renderSnapshot(seedBilling: AccountBillingSummaryV1 | { data: AccountBillingSummaryV1 }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(queryKeys.account.billing(ACCOUNT_ID), seedBilling);
  queryClient.setQueryData(queryKeys.account.billingOrders(ACCOUNT_ID), {
    accountId: Number(ACCOUNT_ID),
    orders: [],
    meta: { count: 0 },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return renderHook(() => useBillingProductStateSnapshot(ACCOUNT_ID), { wrapper: Wrapper });
}

describe("useBillingProductStateSnapshot billing cache shape", () => {
  it("reads activeOrder when the organisation picker cached the summary without a data wrapper", async () => {
    const { result } = renderSnapshot(trialSummary());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current).toMatchObject({
      status: "ready",
      billingUiMode: "active_trial",
    });
  });

  it("reads activeOrder from the wrapped billing response", async () => {
    const { result } = renderSnapshot({ data: trialSummary() });

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current).toMatchObject({
      status: "ready",
      billingUiMode: "active_trial",
    });
  });
});
