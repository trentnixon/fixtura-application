import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { accountSummaryFixture } from "@/lib/account/account-summary-fixture";
import { ApiError } from "@/lib/api/client/api-error";

import {
  accountMeQueryData,
  createWizardTestWrapper,
  incompleteWizardState,
  lookupSports,
} from "./_test/wizard-test-fixtures";
import { CreateOrganisationWizard } from "./create-organisation-wizard";

const replace = vi.fn();
const push = vi.fn();
const searchParamsGet = vi.hoisted(() =>
  vi.fn((key: string): string | null => (key === "accountId" ? "1" : null)),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => ({
    get: searchParamsGet,
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

function renderWizard() {
  const { Wrapper } = createWizardTestWrapper();
  return render(
    <Wrapper>
      <CreateOrganisationWizard />
    </Wrapper>,
  );
}

describe("CreateOrganisationWizard — Epic 6 delete affordance", () => {
  const deleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGet.mockImplementation((key: string) => (key === "accountId" ? "1" : null));
    useAccountMe.mockReturnValue({
      data: accountMeQueryData({ accounts: [accountSummaryFixture({ id: 1 })], accountId: 1 }),
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
      data: incompleteWizardState({ accountId: 1 }),
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

  it("shows delete unfinished account when a validated accountId is present", async () => {
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

describe("CreateOrganisationWizard — Step 0 Get started", () => {
  const createFirstMutate = vi.fn();

  function setupStep0(
    over: {
      me?: ReturnType<typeof accountMeQueryData>;
      mePending?: boolean;
      sports?: typeof lookupSports;
      sportsError?: boolean;
      createFirstPending?: boolean;
      createFirstError?: Error | null;
    } = {},
  ) {
    searchParamsGet.mockImplementation(() => null);
    useAccountMe.mockReturnValue({
      data: over.me ?? accountMeQueryData({ accounts: [], accountId: null }),
      isPending: over.mePending ?? false,
      isError: false,
    });
    useOnboardingLookupSports.mockReturnValue({
      data: over.sportsError ? undefined : { data: over.sports ?? lookupSports },
      isPending: false,
      isError: over.sportsError ?? false,
    });
    useOnboardingOnboardingState.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
    });
    useCreateFirstAccount.mockReturnValue({
      mutate: createFirstMutate,
      isPending: over.createFirstPending ?? false,
      isError: Boolean(over.createFirstError),
      error: over.createFirstError ?? null,
    });
    useDeleteUnfinishedAccount.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    createFirstMutate.mockReset();
  });

  it("disables Get started for coming-soon sports", () => {
    setupStep0();
    renderWizard();

    expect(screen.getByRole("button", { name: /get started/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /AFL/i }));
    expect(screen.getByRole("button", { name: /get started/i })).toBeDisabled();
  });

  it("calls createFirstAccount for zero-account users then advances to step 1", async () => {
    setupStep0();
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 77 } });
    });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(createFirstMutate).toHaveBeenCalledWith(
        { sport: "cricket", hasCompletedStartSequence: true },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Organisation and permission/i }),
      ).toBeInTheDocument();
    });
    expect(replace).toHaveBeenCalledWith("/create-organisation?accountId=77");
  });

  it("treats blank reuse id 101 the same as create (200/201 identical success path)", async () => {
    setupStep0();
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 101 } });
    });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/create-organisation?accountId=101");
    });
    expect(
      screen.getByRole("heading", { name: /Organisation and permission/i }),
    ).toBeInTheDocument();
  });

  it("scopes wizard to returned id 202 (not a hard-coded account)", async () => {
    setupStep0();
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 202 } });
    });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/create-organisation?accountId=202");
    });
  });

  it("creates a new account when user already has accounts and no accountId query is present", async () => {
    setupStep0({
      me: accountMeQueryData({ accounts: [accountSummaryFixture({ id: 42 })], accountId: null }),
    });
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 77 } });
    });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(createFirstMutate).toHaveBeenCalledWith(
        { sport: "cricket", hasCompletedStartSequence: true },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Organisation and permission/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not create a new account when accountId query explicitly resumes an owned account", async () => {
    searchParamsGet.mockImplementation((key: string) => (key === "accountId" ? "42" : null));
    useAccountMe.mockReturnValue({
      data: accountMeQueryData({ accounts: [accountSummaryFixture({ id: 42 })], accountId: 42 }),
      isPending: false,
      isError: false,
    });
    useOnboardingLookupSports.mockReturnValue({
      data: { data: lookupSports },
      isPending: false,
      isError: false,
    });
    useOnboardingOnboardingState.mockReturnValue({
      data: incompleteWizardState({ accountId: 42, onboardingCurrentStep: 1 }),
      isPending: false,
      isError: false,
    });
    useCreateFirstAccount.mockReturnValue({
      mutate: createFirstMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    useDeleteUnfinishedAccount.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    });

    renderWizard();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Organisation and permission/i }),
      ).toBeInTheDocument();
    });
    expect(createFirstMutate).not.toHaveBeenCalled();
  });

  it("blocks explicit resume when accountId is not owned by the user", () => {
    searchParamsGet.mockImplementation((key: string) => (key === "accountId" ? "999" : null));
    useAccountMe.mockReturnValue({
      data: accountMeQueryData({ accounts: [accountSummaryFixture({ id: 42 })], accountId: 42 }),
      isPending: false,
      isError: false,
    });
    useOnboardingLookupSports.mockReturnValue({
      data: { data: lookupSports },
      isPending: false,
      isError: false,
    });
    useOnboardingOnboardingState.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
    });
    useCreateFirstAccount.mockReturnValue({
      mutate: createFirstMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    useDeleteUnfinishedAccount.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    });

    renderWizard();

    expect(screen.getByText(/could not find that organisation/i)).toBeInTheDocument();
    expect(createFirstMutate).not.toHaveBeenCalled();
  });

  it("shows an error when account creation does not return a new account id", async () => {
    setupStep0();
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: {} });
    });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(screen.getByText(/new account id was missing/i)).toBeInTheDocument();
    });
  });

  it("shows sports lookup error", () => {
    setupStep0({ sportsError: true });
    renderWizard();

    expect(screen.getByText(/could not load sports/i)).toBeInTheDocument();
  });

  it("shows create-first error in InlineAlert", () => {
    setupStep0({ createFirstError: new Error("Account bootstrap failed.") });
    renderWizard();

    expect(screen.getByText(/Account bootstrap failed/i)).toBeInTheDocument();
  });

  it("shows Loading… when account me is pending", () => {
    setupStep0({ mePending: true });
    renderWizard();

    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });

  it("shows Preparing… when createFirst is pending", () => {
    setupStep0({ createFirstPending: true });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    expect(screen.getByRole("button", { name: /preparing/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /preparing/i }));
    expect(createFirstMutate).not.toHaveBeenCalled();
  });

  it("shows retryable ACCOUNT_CREATE_BUSY state, keeps sport selection, and allows retry", async () => {
    setupStep0();
    const busy = new ApiError({
      status: 503,
      message: "Account creation is busy. Please retry.",
      details: {
        error: {
          code: "ACCOUNT_CREATE_BUSY",
          message: "Account creation is busy. Please retry.",
        },
      },
      retryAfterSeconds: 0,
    });
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onError?.(busy);
    });

    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    expect(await screen.findByText(/Account creation is busy/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cricket\. Selected/i })).toBeInTheDocument();
    expect(createFirstMutate).toHaveBeenCalledTimes(1);

    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 101 } });
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /get started/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(createFirstMutate).toHaveBeenCalledTimes(2);
      expect(replace).toHaveBeenCalledWith("/create-organisation?accountId=101");
    });
  });

  it("on timeout then retry, accepts returned blank id 101 as success", async () => {
    setupStep0();
    const timeout = new ApiError({
      status: 408,
      message: "Request timed out",
    });
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onError?.(timeout);
    });

    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    expect(await screen.findByText(/Request timed out/i)).toBeInTheDocument();
    expect(createFirstMutate).toHaveBeenCalledTimes(1);

    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 101 } });
    });

    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(createFirstMutate).toHaveBeenCalledTimes(2);
      expect(replace).toHaveBeenCalledWith("/create-organisation?accountId=101");
    });
    expect(
      screen.getByRole("heading", { name: /Organisation and permission/i }),
    ).toBeInTheDocument();
  });

  it("after confirmed delete of unfinished 201, create-first obtains blank id 301", async () => {
    setupStep0({
      me: accountMeQueryData({ accounts: [], accountId: null }),
    });
    createFirstMutate.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({ data: { accountId: 301 } });
    });
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /Cricket/i }));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(createFirstMutate).toHaveBeenCalledWith(
        { sport: "cricket", hasCompletedStartSequence: true },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
      expect(replace).toHaveBeenCalledWith("/create-organisation?accountId=301");
    });
  });

  it("explicit resume of account 22 loads only that account's onboarding state among two unfinished accounts", async () => {
    searchParamsGet.mockImplementation((key: string) => (key === "accountId" ? "22" : null));
    useAccountMe.mockReturnValue({
      data: accountMeQueryData({
        accounts: [accountSummaryFixture({ id: 11 }), accountSummaryFixture({ id: 22 })],
        accountId: null,
      }),
      isPending: false,
      isError: false,
    });
    useOnboardingLookupSports.mockReturnValue({
      data: { data: lookupSports },
      isPending: false,
      isError: false,
    });
    useOnboardingOnboardingState.mockReturnValue({
      data: incompleteWizardState({ accountId: 22, onboardingCurrentStep: 1 }),
      isPending: false,
      isError: false,
    });
    useCreateFirstAccount.mockReturnValue({
      mutate: createFirstMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    useDeleteUnfinishedAccount.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    });

    renderWizard();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Organisation and permission/i }),
      ).toBeInTheDocument();
    });
    expect(createFirstMutate).not.toHaveBeenCalled();
    expect(useOnboardingOnboardingState).toHaveBeenCalledWith(
      "22",
      expect.objectContaining({ enabled: true }),
    );
    expect(useOnboardingOnboardingState).not.toHaveBeenCalledWith("11", expect.anything());
  });
});
