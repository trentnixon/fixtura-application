import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { CreateSubscriptionWizard } from "./create-subscription-wizard";

import type { AvailableBillingTier, AccountBillingSummaryV1 } from "@/types/api/account";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("../_hooks/useBillingInvoiceContactPrefill", () => ({
  useBillingInvoiceContactPrefill: vi.fn(),
}));

vi.mock("./actions/create-stripe-invoice", () => ({
  createStrapiStripeInvoice: vi.fn(),
}));

const useAccountBilling = vi.hoisted(() => vi.fn());
const useAccountBillingAvailableTiers = vi.hoisted(() => vi.fn());
const usePostAccountBillingCheckout = vi.hoisted(() => vi.fn());
const usePostAccountBillingInvoiceRequest = vi.hoisted(() => vi.fn());
const useAccountMe = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountBilling", () => ({
  useAccountBilling,
  isAccountBillingGatewayRedirect: (value: unknown) =>
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    (value as { _tag: string })._tag === "billingGatewayRedirect",
}));

vi.mock("@/lib/api/hooks/account/useAccountBillingAvailableTiers", () => ({
  useAccountBillingAvailableTiers,
  isAccountBillingAvailableTiersGatewayRedirect: (value: unknown) =>
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    (value as { _tag: string })._tag === "billingAvailableTiersGatewayRedirect",
}));

vi.mock("@/lib/api/hooks/account/usePostAccountBillingCheckout", () => ({
  usePostAccountBillingCheckout,
}));

vi.mock("@/lib/api/hooks/account/usePostAccountBillingInvoiceRequest", () => ({
  usePostAccountBillingInvoiceRequest,
}));

vi.mock("@/lib/api/hooks/account/useAccountMe", () => ({
  useAccountMe,
}));

function sampleTier(overrides: Partial<AvailableBillingTier> = {}): AvailableBillingTier {
  return {
    id: "tier_1",
    name: "Season Pass",
    description: "Full season coverage",
    category: "Club",
    price: 520,
    currency: "AUD",
    daysInPass: 365,
    priceByWeekInPass: 10,
    includeSponsors: false,
    includedAssetTypes: [],
    packageName: "Season",
    stripePriceId: "price_test",
    isActive: true,
    ...overrides,
  };
}

function eligibleSummary(over: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "none",
    accessStatus: "none",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: { canStartCheckout: true },
    ...over,
  };
}

function mockBillingQuery(
  over: Partial<ReturnType<typeof useAccountBilling>> & {
    summary?: Partial<AccountBillingSummaryV1>;
  } = {},
) {
  const { summary, ...rest } = over;
  useAccountBilling.mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: { data: eligibleSummary(summary) },
    refetch: vi.fn(),
    ...rest,
  });
}

function mockTiersQuery(
  tiers: AvailableBillingTier[] = [sampleTier()],
  over: Partial<ReturnType<typeof useAccountBillingAvailableTiers>> = {},
) {
  useAccountBillingAvailableTiers.mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: { tiers },
    refetch: vi.fn(),
    ...over,
  });
}

function mockMutations(
  over: {
    checkoutMutateAsync?: ReturnType<typeof vi.fn>;
    invoiceMutateAsync?: ReturnType<typeof vi.fn>;
  } = {},
) {
  usePostAccountBillingCheckout.mockReturnValue({
    mutateAsync: over.checkoutMutateAsync ?? vi.fn(),
    isPending: false,
  });
  usePostAccountBillingInvoiceRequest.mockReturnValue({
    mutateAsync: over.invoiceMutateAsync ?? vi.fn(),
    isPending: false,
  });
}

function mockMe() {
  useAccountMe.mockReturnValue({
    data: {
      data: {
        accountId: 42,
        user: {
          id: 1,
          username: "user",
          email: "user@example.com",
          confirmed: true,
          blocked: false,
          role: null,
        },
      },
    },
    isPending: false,
    isError: false,
  });
}

function renderWizard(accountId = "42") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateSubscriptionWizard accountId={accountId} />
    </QueryClientProvider>,
  );
}

async function selectTierAndContinue() {
  fireEvent.click(screen.getByRole("radio", { name: /Season Pass/i }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(await screen.findByText("2. Subscription start date")).toBeInTheDocument();
}

function pickCalendarToday() {
  const today = new Date();
  const day = String(today.getDate());
  const dayButtons = screen
    .getAllByRole("button")
    .filter((button) => button.textContent?.trim() === day && !button.hasAttribute("disabled"));
  const target = dayButtons.at(-1);
  if (!target) {
    throw new Error("Could not find an enabled calendar day button for today");
  }
  fireEvent.click(target);
}

async function advanceToCardReviewStep() {
  await selectTierAndContinue();
  pickCalendarToday();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(await screen.findByText("4. Review and pay")).toBeInTheDocument();
}

async function advanceToInvoiceReviewStep() {
  await selectTierAndContinue();
  pickCalendarToday();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(await screen.findByText("4. Review and submit invoice request")).toBeInTheDocument();
}

const incompleteCheckoutOrder = {
  id: 99,
  Name: "Pending",
  total: null,
  currency: "AUD",
  OrderPaid: null,
  payment_status: null,
  checkout_status: "inComplete",
  payment_channel: null,
  startOrderAt: null,
  endOrderAt: null,
  isActive: false,
  isPaused: false,
  cancel_at_period_end: null,
  stripe_subscription_id: null,
  stripe_status: null,
  hosted_invoice_url: null,
  invoice_pdf: null,
  invoice_number: null,
  invoice_due_date: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  subscriptionTier: null,
} as AccountBillingSummaryV1["activeOrder"];

describe("CreateSubscriptionWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMe();
    mockMutations();
    useAccountBilling.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    });
    useAccountBillingAvailableTiers.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    });
  });

  it("shows redirecting state when account segment is invalid", () => {
    renderWizard("not-a-number");

    expect(screen.getByRole("status")).toHaveTextContent(/Redirecting/);
  });

  it("shows loading state while billing query is pending", () => {
    useAccountBilling.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    });
    useAccountBillingAvailableTiers.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    });

    renderWizard();

    expect(screen.getByText("Loading billing")).toBeInTheDocument();
  });

  it("shows error state with retry on billing load failure", () => {
    const refetch = vi.fn();
    useAccountBilling.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      error: new Error("Billing unavailable"),
      data: undefined,
      refetch,
    });

    renderWizard();

    expect(screen.getByText("Could not load billing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("redirects to billing when wizard is blocked by payment_pending mode", async () => {
    mockBillingQuery({
      summary: {
        billingStatus: "trial_available",
        accessStatus: "pending",
        availableActions: { canStartTrial: true },
        activeOrder: incompleteCheckoutOrder,
      },
    });
    mockTiersQuery([]);

    renderWizard();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/o/42/billing");
    });
    expect(screen.getByRole("status")).toHaveTextContent(/Redirecting/);
  });

  it("shows loading state while available tiers query is pending", () => {
    mockBillingQuery();
    useAccountBillingAvailableTiers.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    });

    renderWizard();

    expect(screen.getByText("Loading plans")).toBeInTheDocument();
  });

  it("shows error state with retry on tiers load failure", () => {
    const refetch = vi.fn();
    mockBillingQuery();
    useAccountBillingAvailableTiers.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      error: new Error("Tiers unavailable"),
      data: undefined,
      refetch,
    });

    renderWizard();

    expect(screen.getByText("Could not load plans")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows empty tiers copy when no plans are returned", () => {
    mockBillingQuery();
    mockTiersQuery([]);

    renderWizard();

    expect(screen.getByRole("status")).toHaveTextContent(/No Season Pass plans are available/);
  });

  it("shows no-actions card when neither checkout nor invoice is allowed", () => {
    mockBillingQuery({
      summary: {
        availableActions: {
          canStartCheckout: false,
          canRequestInvoice: false,
        },
      },
    });
    mockTiersQuery([sampleTier()]);

    renderWizard();

    expect(screen.getByText("No subscription actions available")).toBeInTheDocument();
  });

  it("shows step 1 tier selection when billing and tiers are ready", () => {
    mockBillingQuery();
    mockTiersQuery([sampleTier()]);

    renderWizard();

    expect(screen.getByText("1. Choose Season Pass")).toBeInTheDocument();
  });

  it("renders one radio option per available tier in step 1", () => {
    mockBillingQuery();
    mockTiersQuery([
      sampleTier({ id: "tier_1m", name: "1 Month Pass", daysInPass: 30, price: 140 }),
      sampleTier({ id: "tier_3m", name: "3-Month Pass", daysInPass: 90, price: 300 }),
      sampleTier({ id: "tier_season", name: "Season Pass", daysInPass: 365, price: 520 }),
    ]);

    renderWizard();

    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("shows checkout error near the card review action when checkout fails", async () => {
    mockBillingQuery({
      summary: {
        availableActions: { canStartCheckout: true, canRequestInvoice: false },
      },
    });
    mockTiersQuery([sampleTier()]);
    mockMutations({
      checkoutMutateAsync: vi
        .fn()
        .mockRejectedValue(new ApiError({ status: 422, message: "Checkout failed" })),
    });

    renderWizard();
    await advanceToCardReviewStep();

    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Checkout failed");
  });

  it("shows invoice submitted state after a successful invoice request", async () => {
    mockBillingQuery({
      summary: {
        availableActions: { canStartCheckout: false, canRequestInvoice: true },
      },
    });
    mockTiersQuery([sampleTier()]);
    mockMutations({
      invoiceMutateAsync: vi.fn().mockResolvedValue({ invoiceRequestId: "99" }),
    });

    renderWizard();
    await advanceToInvoiceReviewStep();

    fireEvent.change(screen.getByLabelText("Billing contact name"), {
      target: { value: "Alex Customer" },
    });
    fireEvent.change(screen.getByLabelText("Billing email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Organisation name"), {
      target: { value: "Example Club" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit invoice request" }));

    expect(await screen.findByText("Invoice request submitted")).toBeInTheDocument();
    expect(screen.getByText("We have your Season Pass request")).toBeInTheDocument();
  });
});
