import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

const { postAccountBillingCancelInvoiceRequestMock } = vi.hoisted(() => ({
  postAccountBillingCancelInvoiceRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    postAccountBillingCancelInvoiceRequest: postAccountBillingCancelInvoiceRequestMock,
  },
}));

import { useBillingInvoiceRequestWithdraw } from "./useBillingInvoiceRequestWithdraw";
import { getBillingInvoiceRequestWithdrawCopy } from "../_constants/invoice-request/billingInvoiceRequestWithdraw";
import { invoiceRequestToWithdrawTarget } from "../_utils/invoice-request/invoiceRequestToWithdrawTarget";

import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  Wrapper.displayName = "TestQueryWrapper";
  return { Wrapper };
}

describe("getBillingInvoiceRequestWithdrawCopy", () => {
  it("returns withdraw copy by default", () => {
    expect(getBillingInvoiceRequestWithdrawCopy()).toMatchObject({
      title: "Withdraw invoice request?",
      triggerButtonLabel: "Withdraw invoice request",
      confirmButtonLabel: "Withdraw request",
      pendingConfirmButtonLabel: "Withdrawing…",
    });
  });

  it("returns cancel copy for invoice-issued variant", () => {
    expect(getBillingInvoiceRequestWithdrawCopy("cancel")).toMatchObject({
      title: "Cancel invoice request?",
      triggerButtonLabel: "Cancel invoice request",
      confirmButtonLabel: "Cancel request",
      pendingConfirmButtonLabel: "Cancelling…",
    });
  });
});

describe("invoiceRequestToWithdrawTarget", () => {
  it("resolves invoiceRequestId from summary row", () => {
    expect(
      invoiceRequestToWithdrawTarget({
        invoiceRequestId: "42",
        submittedAt: "2026-07-05",
        requestedStartDate: "2026-10-23",
        status: "submitted",
      }),
    ).toEqual({
      invoiceRequestId: "42",
      submittedAt: "2026-07-05",
      requestedStartDate: "2026-10-23",
      status: "submitted",
    });
  });

  it("returns null when no id is available", () => {
    expect(invoiceRequestToWithdrawTarget({ status: "submitted" })).toBeNull();
  });
});

describe("useBillingInvoiceRequestWithdraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postAccountBillingCancelInvoiceRequestMock.mockResolvedValue({ success: true });
  });

  it("openWithdraw sets target and opens dialog", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBillingInvoiceRequestWithdraw("575"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openWithdraw({ invoiceRequestId: "42" });
    });

    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.withdrawTarget).toEqual({ invoiceRequestId: "42" });
    expect(result.current.copyVariant).toBe("withdraw");
  });

  it("confirmWithdraw calls mutation and closes on success", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBillingInvoiceRequestWithdraw("575"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openWithdraw({ invoiceRequestId: "42" }, "cancel");
    });

    await act(async () => {
      await result.current.confirmWithdraw();
    });

    await waitFor(() => expect(result.current.confirmOpen).toBe(false));
    expect(postAccountBillingCancelInvoiceRequestMock).toHaveBeenCalledWith("575", "42");
  });

  it("confirmWithdraw keeps dialog open and sets error on ApiError", async () => {
    postAccountBillingCancelInvoiceRequestMock.mockRejectedValue(
      new ApiError({ status: 422, message: "Cannot withdraw this request" }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBillingInvoiceRequestWithdraw("575"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openWithdraw({ invoiceRequestId: "42" });
    });

    await act(async () => {
      await result.current.confirmWithdraw();
    });

    await waitFor(() => expect(result.current.errorMessage).toBe("Cannot withdraw this request"));
    expect(result.current.confirmOpen).toBe(true);
  });

  it("handleDialogOpenChange(false) is blocked while pending", async () => {
    let resolveMutation: (value: unknown) => void = () => {};
    postAccountBillingCancelInvoiceRequestMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBillingInvoiceRequestWithdraw("575"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openWithdraw({ invoiceRequestId: "42" });
    });

    act(() => {
      void result.current.confirmWithdraw();
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      result.current.handleDialogOpenChange(false);
    });

    expect(result.current.confirmOpen).toBe(true);

    await act(async () => {
      resolveMutation({ success: true });
    });

    await waitFor(() => expect(result.current.confirmOpen).toBe(false));
  });

  it("handleDialogOpenChange(false) clears target when not pending", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBillingInvoiceRequestWithdraw("575"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.openWithdraw({ invoiceRequestId: "42" });
    });

    act(() => {
      result.current.handleDialogOpenChange(false);
    });

    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.withdrawTarget).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });
});
