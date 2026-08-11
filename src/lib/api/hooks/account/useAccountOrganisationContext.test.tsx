import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";
import { SELECT_ORG_GATEWAY_REASON } from "@/lib/config/gateway-reasons";

import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "./useAccountOrganisationContext";

import type { ReactNode } from "react";

const getAccountOrganisationContext = vi.hoisted(() => vi.fn());

vi.mock("../../services/account.api", () => ({
  accountApi: {
    getAccountOrganisationContext: (...args: unknown[]) => getAccountOrganisationContext(...args),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useAccountOrganisationContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps 403 to not_found gateway redirect (identical to missing)", async () => {
    getAccountOrganisationContext.mockRejectedValue(
      new ApiError({ status: 403, message: "Forbidden" }),
    );

    const { result } = renderHook(() => useAccountOrganisationContext("123"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(isAccountOrganisationContextGatewayRedirect(result.current.data)).toBe(true);
    if (isAccountOrganisationContextGatewayRedirect(result.current.data)) {
      expect(result.current.data.reason).toBe(SELECT_ORG_GATEWAY_REASON.notFound);
    }
  });

  it("maps ACCOUNT_NOT_FOUND 404 to not_found gateway redirect", async () => {
    getAccountOrganisationContext.mockRejectedValue(
      new ApiError({
        status: 404,
        message: "Not found",
        details: { error: { code: "ACCOUNT_NOT_FOUND" } },
      }),
    );

    const { result } = renderHook(() => useAccountOrganisationContext("456"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(isAccountOrganisationContextGatewayRedirect(result.current.data)).toBe(true);
    if (isAccountOrganisationContextGatewayRedirect(result.current.data)) {
      expect(result.current.data.reason).toBe(SELECT_ORG_GATEWAY_REASON.notFound);
    }
  });

  it("maps legacy Account not found 404 to not_found gateway redirect", async () => {
    getAccountOrganisationContext.mockRejectedValue(
      new ApiError({ status: 404, message: "Account not found" }),
    );

    const { result } = renderHook(() => useAccountOrganisationContext("789"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(isAccountOrganisationContextGatewayRedirect(result.current.data)).toBe(true);
    if (isAccountOrganisationContextGatewayRedirect(result.current.data)) {
      expect(result.current.data.reason).toBe(SELECT_ORG_GATEWAY_REASON.notFound);
    }
  });

  it("maps 400 to invalid_org gateway redirect", async () => {
    getAccountOrganisationContext.mockRejectedValue(
      new ApiError({ status: 400, message: "Bad request" }),
    );

    const { result } = renderHook(() => useAccountOrganisationContext("bad"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(isAccountOrganisationContextGatewayRedirect(result.current.data)).toBe(true);
    if (isAccountOrganisationContextGatewayRedirect(result.current.data)) {
      expect(result.current.data.reason).toBe(SELECT_ORG_GATEWAY_REASON.invalidOrg);
    }
  });
});
