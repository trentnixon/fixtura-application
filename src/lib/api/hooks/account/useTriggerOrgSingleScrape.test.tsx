import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  triggerAssociationSingleScrapeMock,
  triggerClubSingleScrapeMock,
  useAccountOrganisationMock,
} = vi.hoisted(() => ({
  triggerAssociationSingleScrapeMock: vi.fn(),
  triggerClubSingleScrapeMock: vi.fn(),
  useAccountOrganisationMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerAssociationSingleScrape: triggerAssociationSingleScrapeMock,
    triggerClubSingleScrape: triggerClubSingleScrapeMock,
  },
}));

vi.mock("./useAccountOrganisation", () => ({
  useAccountOrganisation: useAccountOrganisationMock,
  isOrganisationGatewayRedirect: (value: unknown) =>
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    (value as { _tag?: string })._tag === "organisationGatewayRedirect",
}));

import { useTriggerOrgSingleScrape } from "./useTriggerOrgSingleScrape";

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

describe("useTriggerOrgSingleScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerAssociationSingleScrapeMock.mockResolvedValue({ success: true });
    triggerClubSingleScrapeMock.mockResolvedValue({ success: true });
  });

  it("routes Association org type to association trigger endpoint with accountId", async () => {
    useAccountOrganisationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        data: {
          account_type: 2,
          accountOrganisationDetails: {
            id: 2964,
            Name: "Darwin And Districts Cricket Competition",
          },
        },
      },
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useTriggerOrgSingleScrape("573"), { wrapper: Wrapper });

    await result.current.triggerSync();

    await waitFor(() =>
      expect(triggerAssociationSingleScrapeMock).toHaveBeenCalledWith({
        associationId: 2964,
        accountId: 573,
      }),
    );
    expect(triggerClubSingleScrapeMock).not.toHaveBeenCalled();
  });

  it("routes Club org type to club trigger endpoint with accountId", async () => {
    useAccountOrganisationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        data: {
          account_type: 1,
          accountOrganisationDetails: { id: 32961, Name: "Pint Cricket Club" },
        },
      },
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useTriggerOrgSingleScrape("574"), { wrapper: Wrapper });

    await result.current.triggerSync();

    await waitFor(() =>
      expect(triggerClubSingleScrapeMock).toHaveBeenCalledWith({
        clubId: 32961,
        accountId: 574,
      }),
    );
    expect(triggerAssociationSingleScrapeMock).not.toHaveBeenCalled();
  });

  it("blocks trigger when org type is unsupported", async () => {
    useAccountOrganisationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        data: {
          account_type: null,
          accountOrganisationDetails: { id: 111, Name: "Unknown Org" },
        },
      },
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useTriggerOrgSingleScrape("575"), { wrapper: Wrapper });

    expect(result.current.canTrigger).toBe(false);
    await expect(result.current.triggerSync()).rejects.toThrow("Organisation type is unsupported");
    expect(triggerAssociationSingleScrapeMock).not.toHaveBeenCalled();
    expect(triggerClubSingleScrapeMock).not.toHaveBeenCalled();
  });

  it("blocks trigger when org id is missing", async () => {
    useAccountOrganisationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        data: {
          account_type: 2,
          accountOrganisationDetails: { id: null, Name: "Association" },
        },
      },
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useTriggerOrgSingleScrape("576"), { wrapper: Wrapper });

    expect(result.current.canTrigger).toBe(false);
    await expect(result.current.triggerSync()).rejects.toThrow("Organisation ID is missing");
    expect(triggerAssociationSingleScrapeMock).not.toHaveBeenCalled();
    expect(triggerClubSingleScrapeMock).not.toHaveBeenCalled();
  });
});
