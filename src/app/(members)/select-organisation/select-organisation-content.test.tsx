import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
  accountThemeSummaryFixture,
} from "@/lib/account/account-summary-fixture";
import { UNFINISHED_ORGANISATION_DISPLAY_NAME } from "@/lib/account/organisation-display-name";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

import { SelectOrganisationContent } from "./select-organisation-content";

import type {
  AccountMeResponse,
  AccountMeUser,
  AccountSummary,
  OnboardingStateData,
} from "@/types/api/account";
import type { ReactElement } from "react";

const navMocks = vi.hoisted(() => ({
  pathname: "/select-organisation",
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navMocks.push, replace: navMocks.replace }),
  usePathname: () => navMocks.pathname,
  useSearchParams: () => navMocks.searchParams,
}));

const useAccountMeMock = vi.hoisted(() => vi.fn());
const getOnboardingOnboardingStateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountMe", () => ({
  useAccountMe: useAccountMeMock,
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    getOnboardingOnboardingState: getOnboardingOnboardingStateMock,
  },
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

const SELECTION_ERROR_MESSAGE =
  "We could not open this organisation. Try again or contact support if the problem continues.";

function orgPrimaryButton(name: string | RegExp) {
  const article = screen.getByRole("article", { name });
  return within(article).getByRole("button", {
    name: /Continue setup|Open organisation|View organisation|Review issue/i,
  });
}

function orgArticlesMatching(pattern: RegExp) {
  return screen.getAllByRole("article").filter((node) => {
    const label = node.getAttribute("aria-label") ?? "";
    return pattern.test(label);
  });
}

function baseOnboardingState(over: Partial<OnboardingStateData> = {}): OnboardingStateData {
  return {
    accountId: 42,
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

function orgDetails(id: number, name: string, sport = "Cricket") {
  return accountOrganisationSummaryFixture({
    id,
    Name: name,
    href: "",
    ParentLogo: "",
    Sport: sport,
  });
}

function row(over: Parameters<typeof accountSummaryFixture>[0]) {
  return accountSummaryFixture(over);
}

function accountMeResponse(
  accounts: AccountSummary[],
  over: Partial<AccountMeResponse["data"]> = {},
): AccountMeResponse {
  let compatibilityAccountId: number | null;
  if ("accountId" in over) {
    compatibilityAccountId = over.accountId ?? null;
  } else if (accounts.length === 0) {
    compatibilityAccountId = null;
  } else if (accounts.length === 1) {
    compatibilityAccountId = accounts[0]?.id ?? null;
  } else {
    throw new Error(
      "accountMeResponse: pass explicit accountId when fixtures include multiple accounts",
    );
  }
  return {
    data: {
      user: null,
      accounts,
      ...over,
      accountId: compatibilityAccountId,
    },
  };
}

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const testUser: AccountMeUser = {
  id: 110,
  username: "tester",
  email: "test@example.com",
  confirmed: true,
  blocked: false,
  role: null,
};

describe("SelectOrganisationContent lifecycle routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.pathname = "/select-organisation";
    navMocks.searchParams = new URLSearchParams();
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse([
        row({
          id: 42,
          isActive: true,
          isSetup: false,
          onboardingWizardCompletedAt: null,
          accountOrganisationDetails: orgDetails(7, "North Districts"),
        }),
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("opens the create-organisation resume route when the selected account has an unfinished wizard", async () => {
    getOnboardingOnboardingStateMock.mockResolvedValue({
      data: baseOnboardingState({ onboardingWizardStatus: "in_progress" }),
    });

    renderWithClient(<SelectOrganisationContent />);

    await screen.findByRole("article", { name: /North Districts/i });
    fireEvent.click(orgPrimaryButton(/North Districts/i));

    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(`${ROUTES.createOrganisation}?accountId=42`);
    });
  });

  it("opens the scoped dashboard when the selected account has completed the wizard", async () => {
    getOnboardingOnboardingStateMock.mockResolvedValue({
      data: baseOnboardingState({
        accountId: 42,
        onboardingWizardStatus: "completed",
        hasCompletedOnboardingWizard: true,
        onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
        initialSetupStatus: "running",
      }),
    });

    renderWithClient(<SelectOrganisationContent />);

    await screen.findByRole("article", { name: /North Districts/i });
    fireEvent.click(orgPrimaryButton(/North Districts/i));

    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(accountScopedRoutes.dashboard("42"));
    });
  });

  it("shows an inline error when the selected account onboarding state cannot be loaded", async () => {
    getOnboardingOnboardingStateMock.mockRejectedValue(new Error("Onboarding unavailable"));

    renderWithClient(<SelectOrganisationContent />);

    await screen.findByRole("article", { name: /North Districts/i });
    fireEvent.click(orgPrimaryButton(/North Districts/i));

    expect(await screen.findByText(SELECTION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(navMocks.push).not.toHaveBeenCalled();
  });
});

describe("SelectOrganisationContent multi-account presentation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.pathname = "/select-organisation";
    navMocks.searchParams = new URLSearchParams();
    getOnboardingOnboardingStateMock.mockImplementation(async (accountId: string) => ({
      data: baseOnboardingState({
        accountId: Number(accountId),
        onboardingWizardCompletedAt: accountId === "101" ? null : "2026-01-01T00:00:00.000Z",
        hasCompletedOnboardingWizard: accountId !== "101",
        onboardingWizardStatus: accountId === "101" ? "in_progress" : "completed",
        isSetup: accountId === "202",
      }),
    }));
  });

  it("renders two or more account cards and does not auto-select", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            onboardingWizardCompletedAt: null,
            onboardingOrganisationName: "Alpha Working",
            accountOrganisationDetails: orgDetails(1, "Alpha Details"),
          }),
          row({
            id: 202,
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(2, "Beta Club"),
          }),
        ],
        { accountId: null },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByRole("article", { name: /Alpha Working/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /Beta Club/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create organisation/i })).toBeInTheDocument();
    expect(navMocks.push).not.toHaveBeenCalled();
  });

  it("shows Unfinished organisation for a nameless account", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            onboardingWizardCompletedAt: null,
            onboardingOrganisationName: "   ",
            accountOrganisationDetails: null,
          }),
          row({
            id: 202,
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(2, "Beta Club"),
          }),
        ],
        { accountId: null },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(
      await screen.findByRole("article", {
        name: new RegExp(UNFINISHED_ORGANISATION_DISPLAY_NAME, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("prefers onboardingOrganisationName over organisation details for the title", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse([
        row({
          id: 101,
          onboardingWizardCompletedAt: null,
          onboardingOrganisationName: "Working Title",
          accountOrganisationDetails: orgDetails(1, "Details Title"),
        }),
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByRole("article", { name: /Working Title/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Details Title/i })).not.toBeInTheDocument();
  });

  it("shows Continue setup from onboardingWizardCompletedAt null, not from isSetup", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            isSetup: true,
            onboardingWizardCompletedAt: null,
            accountOrganisationDetails: orgDetails(1, "Still Unfinished"),
          }),
          row({
            id: 202,
            isSetup: false,
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(2, "Finished Wizard"),
          }),
        ],
        { accountId: null },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    await screen.findByRole("article", { name: /Still Unfinished/i });
    await waitFor(() => {
      expect(
        within(screen.getByRole("article", { name: /Still Unfinished/i })).getByRole("button", {
          name: /About Still Unfinished setup/i,
        }),
      ).toBeInTheDocument();
    });
    const unfinished = orgPrimaryButton(/Still Unfinished/i);
    const finished = orgPrimaryButton(/Finished Wizard/i);

    expect(unfinished).toHaveAccessibleName(/Continue setup/i);
    expect(finished).toHaveAccessibleName(/Open organisation/i);
    expect(
      within(screen.getByRole("article", { name: /Finished Wizard/i })).getByText("Active"),
    ).toBeInTheDocument();
    expect(finished).not.toHaveAccessibleName(/Continue setup/i);
  });

  it("navigates each card with that card's explicit account id", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            onboardingWizardCompletedAt: null,
            accountOrganisationDetails: orgDetails(1, "Alpha Org"),
          }),
          row({
            id: 202,
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(2, "Beta Org"),
          }),
        ],
        { accountId: null },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    await screen.findByRole("article", { name: /Alpha Org/i });
    fireEvent.click(orgPrimaryButton(/Alpha Org/i));
    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(`${ROUTES.createOrganisation}?accountId=101`);
    });

    navMocks.push.mockClear();

    fireEvent.click(orgPrimaryButton(/Beta Org/i));
    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(accountScopedRoutes.dashboard("202"));
    });
  });

  it("still lists accounts when compatibility accountId is null or omitted", async () => {
    useAccountMeMock.mockReturnValue({
      data: {
        data: {
          accountId: null,
          user: null,
          accounts: [
            row({
              id: 101,
              onboardingWizardCompletedAt: null,
              accountOrganisationDetails: orgDetails(1, "Null Compat"),
            }),
            row({
              id: 202,
              onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
              accountOrganisationDetails: orgDetails(2, "Omitted Compat"),
            }),
          ],
        },
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByRole("article", { name: /Null Compat/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /Omitted Compat/i })).toBeInTheDocument();
  });
});

describe("SelectOrganisationContent search filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.pathname = "/select-organisation";
    navMocks.searchParams = new URLSearchParams();
    getOnboardingOnboardingStateMock.mockImplementation(async (accountId: string) => ({
      data: baseOnboardingState({
        accountId: Number(accountId),
        onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
        hasCompletedOnboardingWizard: true,
        onboardingWizardStatus: "completed",
      }),
    }));
  });

  function manyAccounts(count: number): AccountSummary[] {
    return Array.from({ length: count }, (_, index) =>
      row({
        id: 100 + index,
        onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
        accountOrganisationDetails: orgDetails(index + 1, `Organisation ${index + 1}`),
      }),
    );
  }

  it("shows search input when user has more than five accounts", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(manyAccounts(6), { accountId: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(
      await screen.findByRole("textbox", { name: /Search organisations/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /Organisation 1/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /Organisation 6/i })).toBeInTheDocument();
  });

  it("hides search input when user has five or fewer accounts", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(manyAccounts(5), { accountId: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByRole("article", { name: /Organisation 1/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /Search organisations/i }),
    ).not.toBeInTheDocument();
  });

  it("filters account cards by display name after one character", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(manyAccounts(6), { accountId: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    const search = await screen.findByRole("textbox", { name: /Search organisations/i });
    fireEvent.change(search, { target: { value: "3" } });

    expect(screen.getByRole("article", { name: /Organisation 3/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Organisation 1/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Organisation 6/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create organisation/i })).toBeInTheDocument();
  });

  it("shows empty message when filter matches no accounts", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(manyAccounts(6), { accountId: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    const search = await screen.findByRole("textbox", { name: /Search organisations/i });
    fireEvent.change(search, { target: { value: "zzzz" } });

    expect(
      screen.getByText(
        (content) => content.includes("No organisations match") && content.includes("zzzz"),
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Clear$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("article", { name: /Organisation 1/i })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Create organisation/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows result count and clear restores all cards", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(manyAccounts(6), { accountId: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    const search = await screen.findByRole("textbox", { name: /Search organisations/i });
    fireEvent.change(search, { target: { value: "3" } });

    expect(screen.getByText("Showing 1 of 6 organisations")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /^Clear$/i })[0]!);

    expect(screen.getByRole("article", { name: /Organisation 1/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /Organisation 6/i })).toBeInTheDocument();
    expect(screen.queryByText(/Showing \d+ of 6 organisations/)).not.toBeInTheDocument();
  });
});

describe("SelectOrganisationContent UX enhancements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.pathname = "/select-organisation";
    navMocks.searchParams = new URLSearchParams();
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    getOnboardingOnboardingStateMock.mockImplementation(async (accountId: string) => ({
      data: baseOnboardingState({
        accountId: Number(accountId),
        onboardingWizardCompletedAt: accountId === "101" ? null : "2026-01-01T00:00:00.000Z",
        hasCompletedOnboardingWizard: accountId !== "101",
        onboardingWizardStatus: accountId === "101" ? "in_progress" : "completed",
        isSetup: accountId === "202",
      }),
    }));
  });

  function sixAccountsForSort(): AccountSummary[] {
    return Array.from({ length: 6 }, (_, index) =>
      row({
        id: 100 + index,
        onboardingWizardCompletedAt: index === 2 ? null : "2026-01-01T00:00:00.000Z",
        accountOrganisationDetails: orgDetails(index + 1, `Organisation ${index + 1}`),
      }),
    );
  }

  it("shows resume panel when last organisation is stored and portfolio has more than five orgs", async () => {
    localStorage.setItem("fixtura:last-selected-organisation:110", "105");
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(sixAccountsForSort(), { accountId: null, user: testUser }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    const resume = await screen.findByRole("region", { name: /Continue where you left off/i });
    expect(within(resume).getByText("Organisation 6")).toBeInTheDocument();
  });

  it("hides resume panel when portfolio has five or fewer organisations", async () => {
    localStorage.setItem("fixtura:last-selected-organisation:110", "202");
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            onboardingWizardCompletedAt: null,
            accountOrganisationDetails: orgDetails(1, "Alpha Org"),
          }),
          row({
            id: 202,
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(2, "Beta Org"),
          }),
        ],
        { accountId: null, user: testUser },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByRole("article", { name: /Beta Org/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Continue where you left off/i }),
    ).not.toBeInTheDocument();
  });

  it("hides resume panel when no last organisation is stored", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(sixAccountsForSort(), { accountId: null, user: testUser }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByRole("article", { name: /Organisation 1/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Continue where you left off/i }),
    ).not.toBeInTheDocument();
  });

  it("routes through resume panel like a card click", async () => {
    localStorage.setItem("fixtura:last-selected-organisation:110", "105");
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(sixAccountsForSort(), { accountId: null, user: testUser }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    const resume = await screen.findByRole("region", { name: /Continue where you left off/i });
    fireEvent.click(within(resume).getByRole("button", { name: /Open organisation/i }));

    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(accountScopedRoutes.dashboard("105"));
    });
  });

  it("shows summary counts for the full portfolio", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            onboardingWizardCompletedAt: null,
            isActive: true,
            accountOrganisationDetails: orgDetails(1, "Needs Setup"),
          }),
          row({
            id: 202,
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            isActive: false,
            accountOrganisationDetails: orgDetails(2, "Inactive Org"),
          }),
        ],
        { accountId: null, user: testUser },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(
      (await screen.findAllByText("2 organisations · 1 need setup · 1 inactive")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows a New badge when createdAt is within 14 days", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(
        [
          row({
            id: 101,
            createdAt: "2026-07-10T00:00:00.000Z",
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(1, "Fresh Org"),
          }),
          row({
            id: 202,
            createdAt: "2026-01-01T00:00:00.000Z",
            onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
            accountOrganisationDetails: orgDetails(2, "Established Org"),
          }),
        ],
        { accountId: null },
      ),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    expect(await screen.findByText("New")).toBeInTheDocument();
    expect(
      within(screen.getByRole("article", { name: /Fresh Org/i })).getByText("New"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("article", { name: /Established Org/i })).queryByText("New"),
    ).not.toBeInTheDocument();
  });

  it("applies primary and secondary brand colors from me-row theme", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse([
        row({
          id: 101,
          createdAt: "2026-01-01T00:00:00.000Z",
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          onboardingOrganisationName: "Blue Districts",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 1,
            Name: "Blue Districts",
            href: "",
            ParentLogo: "",
            Sport: "Cricket",
          }),
          theme: accountThemeSummaryFixture({
            id: 42,
            name: "Blue Districts",
            isPublic: false,
            theme: { primary: "#003366", secondary: "#FF6600" },
          }),
        }),
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = renderWithClient(<SelectOrganisationContent />);

    await screen.findByRole("article", { name: /Blue Districts/i });

    const accentTile = container.querySelector('[style*="#003366"]');
    const secondaryAccent = container.querySelector('[style*="#FF6600"]');
    expect(accentTile).toBeTruthy();
    expect(secondaryAccent).toBeTruthy();
  });

  it("sorts setup-first when selected", async () => {
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(sixAccountsForSort(), { accountId: null, user: testUser }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithClient(<SelectOrganisationContent />);

    fireEvent.click((await screen.findAllByRole("combobox", { name: /Sort organisations/i }))[0]!);
    fireEvent.click(await screen.findByRole("option", { name: /Setup first/i }));

    const orgButtons = orgArticlesMatching(/Organisation \d/);

    expect(orgButtons[0]).toHaveAttribute("aria-label", "Organisation 3");
  });
});
