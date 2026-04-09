import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { CreateOrganisationWizard } from "./create-organisation-wizard";

import type { OnboardingStateData } from "@/types/api/account";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => ({
    get: (key: string) => (key === "accountId" ? "1" : null),
  }),
}));

const useAccountMe = vi.hoisted(() => vi.fn());
const useCreateFirstAccount = vi.hoisted(() => vi.fn());
const useOnboardingLookupSports = vi.hoisted(() => vi.fn());
const useDeleteUnfinishedAccount = vi.hoisted(() => vi.fn());
const useOnboardingOnboardingState = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountMe", () => ({
  useAccountMe: useAccountMe,
}));

vi.mock("@/lib/api/hooks/account/useCreateFirstAccount", () => ({
  useCreateFirstAccount: useCreateFirstAccount,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupSports", () => ({
  useOnboardingLookupSports: useOnboardingLookupSports,
}));

vi.mock("@/lib/api/hooks/account/useDeleteUnfinishedAccount", () => ({
  useDeleteUnfinishedAccount: useDeleteUnfinishedAccount,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingOnboardingState", () => ({
  useOnboardingOnboardingState: useOnboardingOnboardingState,
}));

/** Matches `useQuery` `data` for GET /account/me (`AccountMeResponse`). */
function accountMeQueryData() {
  return {
    data: {
      accountId: 1,
      user: {
        id: 1,
        username: "u",
        email: "u@test.com",
        confirmed: true,
        blocked: false,
        role: null,
      },
      accounts: [{ id: 1 }],
    },
  };
}

function incompleteWizardState(over: Partial<OnboardingStateData> = {}): OnboardingStateData {
  return {
    accountId: 1,
    onboardingWizardStatus: "in_progress",
    onboardingCurrentStep: 1,
    onboardingLastCompletedStep: 0,
    onboardingStartedAt: null,
    onboardingLastActivityAt: null,
    hasCompletedOnboardingWizard: false,
    onboardingWizardCompletedAt: null,
    initialSetupStatus: "not_started",
    initialSetupStartedAt: null,
    initialSetupCompletedAt: null,
    initialSetupFailedAt: null,
    initialSetupFailureReason: null,
    initialDataFetchStatus: "not_started",
    initialDataFetchStartedAt: null,
    initialDataFetchCompletedAt: null,
    initialDataFetchFailedAt: null,
    initialDataFetchFailureReason: null,
    isSetup: false,
    isUpdating: false,
    isActive: true,
    ...over,
  };
}

function renderWizard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateOrganisationWizard />
    </QueryClientProvider>,
  );
}

describe("CreateOrganisationWizard — Epic 6 delete affordance", () => {
  const deleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAccountMe.mockReturnValue({
      data: accountMeQueryData(),
      isPending: false,
      isError: false,
    });
    useCreateFirstAccount.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    });
    useOnboardingLookupSports.mockReturnValue({
      data: { data: [{ id: "cricket", label: "Cricket", sortOrder: 0 }] },
      isPending: false,
      isError: false,
    });
    useOnboardingOnboardingState.mockReturnValue({
      data: incompleteWizardState(),
      isPending: false,
      isError: false,
    });
    deleteMutate.mockReset();
    useDeleteUnfinishedAccount.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    });
  });

  it("shows delete unfinished account when wizard is incomplete and setup is not complete", async () => {
    renderWizard();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete this unfinished account/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not show delete when wizard is complete (dashboard intent — full-page loader)", () => {
    useOnboardingOnboardingState.mockReturnValue({
      data: incompleteWizardState({
        onboardingWizardStatus: "completed",
        hasCompletedOnboardingWizard: true,
        onboardingCurrentStep: 4,
        initialSetupStatus: "running",
        initialDataFetchStatus: "queued",
      }),
      isPending: false,
      isError: false,
    });

    renderWizard();

    expect(
      screen.queryByRole("button", { name: /delete this unfinished account/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Opening your organisation/i)).toBeInTheDocument();
  });

  it("does not show delete when isSetup is true (dashboard intent)", () => {
    useOnboardingOnboardingState.mockReturnValue({
      data: incompleteWizardState({
        hasCompletedOnboardingWizard: true,
        onboardingWizardStatus: "completed",
        isSetup: true,
      }),
      isPending: false,
      isError: false,
    });

    renderWizard();

    expect(
      screen.queryByRole("button", { name: /delete this unfinished account/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Opening your organisation/i)).toBeInTheDocument();
  });

  it("opens confirmation dialog when delete is clicked", async () => {
    renderWizard();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete this unfinished account/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /delete this unfinished account/i }));

    expect(
      screen.getByRole("heading", { name: /delete this unfinished account\?/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^delete account$/i })).toBeInTheDocument();
  });

  it("shows mapped error when delete mutation reports ACCOUNT_DELETE_NOT_ALLOWED", async () => {
    deleteMutate.mockImplementation((_args, opts) => {
      opts?.onError?.(
        new ApiError({
          status: 403,
          message: "Forbidden",
          details: { code: "ACCOUNT_DELETE_NOT_ALLOWED", message: "Not allowed by policy." },
        }),
      );
    });

    renderWizard();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete this unfinished account/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /delete this unfinished account/i }));
    fireEvent.click(screen.getByRole("button", { name: /^delete account$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Not allowed by policy\./i)).toBeInTheDocument();
    });
  });

  it("invokes delete mutation when user confirms in dialog", async () => {
    renderWizard();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete this unfinished account/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /delete this unfinished account/i }));
    fireEvent.click(screen.getByRole("button", { name: /^delete account$/i }));

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalled();
    });

    expect(deleteMutate.mock.calls[0]?.[1]).toMatchObject({
      onError: expect.any(Function),
    });
  });
});
