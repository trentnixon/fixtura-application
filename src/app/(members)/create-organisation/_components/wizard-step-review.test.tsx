import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import {
  accountMeQueryData,
  baseBrandingPayload,
  baseSettingsPayload,
  createWizardTestWrapper,
  lookupOrgTypes,
  lookupSports,
  lookupThemes,
} from "./_test/wizard-test-fixtures";
import { WizardStepReview, type WizardStepReviewHandle } from "./wizard-step-review";

const useAccountSettings = vi.hoisted(() => vi.fn());
const useAccountOrganisationContext = vi.hoisted(() => vi.fn());
const useAccountBranding = vi.hoisted(() => vi.fn());
const useAccountMe = vi.hoisted(() => vi.fn());
const useCurrentUser = vi.hoisted(() => vi.fn());
const useOnboardingLookupSports = vi.hoisted(() => vi.fn());
const useOnboardingLookupOrganisationTypes = vi.hoisted(() => vi.fn());
const useOnboardingLookupThemes = vi.hoisted(() => vi.fn());
const useConfirmOnboarding = vi.hoisted(() => vi.fn());
const brandingRefetch = vi.hoisted(() => vi.fn());
const settingsRefetch = vi.hoisted(() => vi.fn());
const orgRefetch = vi.hoisted(() => vi.fn());
const meRefetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountSettings", () => ({
  useAccountSettings,
  isAccountSettingsGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/useAccountOrganisationContext", () => ({
  useAccountOrganisationContext,
  isAccountOrganisationContextGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/useAccountBranding", () => ({
  useAccountBranding,
  isAccountBrandingGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/useAccountMe", () => ({
  useAccountMe,
}));

vi.mock("@/lib/api/hooks/auth/useCurrentUser", () => ({
  useCurrentUser,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupSports", () => ({
  useOnboardingLookupSports,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupOrganisationTypes", () => ({
  useOnboardingLookupOrganisationTypes,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupThemes", () => ({
  useOnboardingLookupThemes,
}));

vi.mock("@/lib/api/hooks/account/useConfirmOnboarding", () => ({
  useConfirmOnboarding,
}));

function setupReviewMocks(
  over: {
    settingsError?: boolean;
    brandingError?: boolean;
    orgError?: boolean;
    meError?: boolean;
    authError?: boolean;
    confirmError?: unknown;
    confirmed?: boolean;
  } = {},
) {
  useAccountSettings.mockReturnValue({
    data: over.settingsError ? undefined : baseSettingsPayload(),
    isPending: false,
    isError: over.settingsError ?? false,
    refetch: settingsRefetch,
  });
  useAccountOrganisationContext.mockReturnValue({
    data: over.orgError
      ? undefined
      : {
          data: {
            accountOrganisationDetails: { Name: "Metro Association" },
          },
        },
    isPending: false,
    isError: over.orgError ?? false,
    refetch: orgRefetch,
  });
  useAccountBranding.mockReturnValue({
    data: over.brandingError ? undefined : baseBrandingPayload(),
    isPending: false,
    isError: over.brandingError ?? false,
    refetch: brandingRefetch,
  });
  useAccountMe.mockReturnValue({
    data: over.meError ? undefined : accountMeQueryData(),
    isPending: false,
    isError: over.meError ?? false,
    refetch: meRefetch,
  });
  useCurrentUser.mockReturnValue({
    data: over.authError ? undefined : { user: { email: "auth@test.com" } },
    isPending: false,
    isError: over.authError ?? false,
  });
  useOnboardingLookupSports.mockReturnValue({
    data: { data: lookupSports },
    isPending: false,
    isError: false,
  });
  useOnboardingLookupOrganisationTypes.mockReturnValue({
    data: { data: lookupOrgTypes },
    isPending: false,
    isError: false,
  });
  useOnboardingLookupThemes.mockReturnValue({
    data: { data: lookupThemes },
    isPending: false,
    isError: false,
  });
  useConfirmOnboarding.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ data: {} }),
    isPending: false,
    isError: Boolean(over.confirmError),
    error: over.confirmError ?? null,
  });
}

function renderReviewStep(props: { confirmed?: boolean } = {}) {
  const ref = createRef<WizardStepReviewHandle>();
  const onConfirmSuccess = vi.fn();
  const { Wrapper } = createWizardTestWrapper();

  render(
    <Wrapper>
      <WizardStepReview
        ref={ref}
        accountId="1"
        {...(props.confirmed !== undefined ? { confirmed: props.confirmed } : {})}
        onConfirmSuccess={onConfirmSuccess}
        onPendingChange={vi.fn()}
      />
      <button type="button" onClick={() => void ref.current?.submit()}>
        submit-step
      </button>
    </Wrapper>,
  );

  return { ref, onConfirmSuccess };
}

describe("WizardStepReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupReviewMocks();
  });

  it("renders resolved summary labels", async () => {
    renderReviewStep();

    await waitFor(() => {
      expect(screen.getByText("Organisation")).toBeInTheDocument();
    });

    expect(screen.getByText("Metro Association")).toBeInTheDocument();
    expect(screen.getByText("Cricket")).toBeInTheDocument();
    expect(screen.getByText("Association")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("assets@test.com")).toBeInTheDocument();
  });

  it("calls confirmOnboarding on submit", async () => {
    const confirmMutateAsync = vi.fn().mockResolvedValue({ data: {} });
    useConfirmOnboarding.mockReturnValue({
      mutateAsync: confirmMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    const { onConfirmSuccess } = renderReviewStep();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit-step/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(confirmMutateAsync).toHaveBeenCalledWith({});
    });
    expect(onConfirmSuccess).toHaveBeenCalled();
  });

  it("shows confirm error in InlineAlert", async () => {
    setupReviewMocks({
      confirmError: new ApiError({
        status: 400,
        message: "Bad request",
        details: { error: { message: "Wizard cannot be confirmed yet." } },
      }),
    });

    renderReviewStep();

    await waitFor(() => {
      expect(screen.getByText(/Wizard cannot be confirmed yet/i)).toBeInTheDocument();
    });
  });

  it("shows wizard complete state when confirmed", () => {
    setupReviewMocks();
    renderReviewStep({ confirmed: true });

    expect(screen.getByText(/Wizard complete/i)).toBeInTheDocument();
  });

  it("shows partial failures and Retry all", async () => {
    setupReviewMocks({ brandingError: true });

    renderReviewStep();

    await waitFor(() => {
      expect(screen.getByText(/Some sections could not be loaded/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Branding", { selector: "li" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry all/i }));

    expect(brandingRefetch).toHaveBeenCalled();
  });

  it("shows auth user info alert without blocking other sections", async () => {
    setupReviewMocks({ authError: true });

    renderReviewStep();

    await waitFor(() => {
      expect(screen.getByText(/could not load your sign-in email/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });
});
