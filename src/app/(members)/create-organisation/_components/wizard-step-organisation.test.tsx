import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import {
  baseSettingsPayload,
  createWizardTestWrapper,
  lookupAssociations,
  lookupClubs,
  lookupOrgTypes,
} from "./_test/wizard-test-fixtures";
import {
  WizardStepOrganisation,
  type WizardStepOrganisationHandle,
} from "./wizard-step-organisation";

const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { error: toastError, success: vi.fn() },
}));

const useOnboardingLookupOrganisationTypes = vi.hoisted(() => vi.fn());
const useOnboardingLookupAssociations = vi.hoisted(() => vi.fn());
const useOnboardingLookupClubs = vi.hoisted(() => vi.fn());
const useAccountSettings = vi.hoisted(() => vi.fn());
const useUpdateOnboardingStep1 = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useOnboardingLookupOrganisationTypes", () => ({
  useOnboardingLookupOrganisationTypes,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupAssociations", () => ({
  useOnboardingLookupAssociations,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupClubs", () => ({
  useOnboardingLookupClubs,
}));

vi.mock("@/lib/api/hooks/account/useAccountSettings", () => ({
  useAccountSettings,
  isAccountSettingsGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/useUpdateOnboardingStep1", () => ({
  useUpdateOnboardingStep1,
}));

vi.mock("@/components/ui/searchable-combobox", () => ({
  SearchableCombobox: ({
    id,
    options,
    value,
    onChange,
    disabled,
  }: {
    id?: string;
    options: { value: string; label: string }[];
    value: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <select
      id={id}
      aria-label={id === "onboarding-association" ? "Association" : "Club"}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select…</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  DependentFieldTrigger: ({ id, message }: { id: string; message: string }) => (
    <div id={id}>{message}</div>
  ),
}));

function renderOrganisationStep() {
  const ref = createRef<WizardStepOrganisationHandle>();
  const onContinue = vi.fn();
  const onPendingChange = vi.fn();
  const { Wrapper } = createWizardTestWrapper();

  render(
    <Wrapper>
      <WizardStepOrganisation
        ref={ref}
        accountId="1"
        sportId="cricket"
        onContinue={onContinue}
        onPendingChange={onPendingChange}
      />
      <button type="button" onClick={() => void ref.current?.submit()}>
        submit-step
      </button>
    </Wrapper>,
  );

  return { ref, onContinue, onPendingChange };
}

async function selectAssociation(label: string) {
  const select = screen.getByLabelText("Association");
  const option = lookupAssociations.find((a) => a.label === label);
  if (!option) throw new Error(`Missing association fixture: ${label}`);
  fireEvent.change(select, { target: { value: String(option.id) } });
}

async function selectClub(label: string) {
  const select = screen.getByLabelText("Club");
  const option = lookupClubs.find((c) => c.label === label);
  if (!option) throw new Error(`Missing club fixture: ${label}`);
  fireEvent.change(select, { target: { value: String(option.id) } });
}

describe("WizardStepOrganisation", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toastError.mockReset();
    mutateAsync.mockResolvedValue({ data: {} });

    useOnboardingLookupOrganisationTypes.mockReturnValue({
      data: { data: lookupOrgTypes },
      isPending: false,
      isError: false,
    });
    useOnboardingLookupAssociations.mockReturnValue({
      data: { data: lookupAssociations },
      isPending: false,
      isError: false,
    });
    useOnboardingLookupClubs.mockReturnValue({
      data: { data: lookupClubs },
      isPending: false,
      isError: false,
    });
    useAccountSettings.mockReturnValue({
      data: baseSettingsPayload({ account_type: null }),
      isPending: false,
      isError: false,
    });
    useUpdateOnboardingStep1.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
    });
  });

  it("submits W1 payload for association-type organisation", async () => {
    const { onContinue } = renderOrganisationStep();

    fireEvent.click(screen.getByRole("button", { name: /Association\. Select/i }));
    await selectAssociation("Metro Association");
    fireEvent.click(screen.getByLabelText(/authorised to act/i));
    fireEvent.click(screen.getByLabelText(/give Fixtura permission/i));
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        sport: "cricket",
        accountTypeId: 2,
        onboardingOrganisationName: "Metro Association",
        isRightsHolder: true,
        isPermissionGiven: true,
        associationId: 10,
        clubId: null,
      });
    });
    expect(onContinue).toHaveBeenCalled();
  });

  it("submits W1 payload with clubId for club-type organisation", async () => {
    const { onContinue } = renderOrganisationStep();

    fireEvent.click(screen.getByRole("button", { name: /Club\. Select/i }));
    await selectAssociation("Metro Association");
    await selectClub("North Club");
    fireEvent.click(screen.getByLabelText(/authorised to act/i));
    fireEvent.click(screen.getByLabelText(/give Fixtura permission/i));
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        sport: "cricket",
        accountTypeId: 1,
        onboardingOrganisationName: "North Club",
        isRightsHolder: true,
        isPermissionGiven: true,
        associationId: 10,
        clubId: 20,
      });
    });
    expect(onContinue).toHaveBeenCalled();
  });

  it("blocks submit and shows toast when required fields are missing", async () => {
    renderOrganisationStep();

    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    expect(toastError).toHaveBeenCalledWith("Choose an organisation type.");
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("shows org types lookup error", () => {
    useOnboardingLookupOrganisationTypes.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    renderOrganisationStep();

    expect(screen.getByText(/could not load organisation types/i)).toBeInTheDocument();
  });

  it("shows associations lookup error", () => {
    useOnboardingLookupAssociations.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    renderOrganisationStep();

    expect(screen.getByText(/could not load associations/i)).toBeInTheDocument();
  });

  it("maps API errors to toast", async () => {
    mutateAsync.mockRejectedValue(
      new ApiError({
        status: 400,
        message: "Bad request",
        details: { error: { message: "Association is required." } },
      }),
    );

    renderOrganisationStep();
    fireEvent.click(screen.getByRole("button", { name: /Association\. Select/i }));
    await selectAssociation("Metro Association");
    fireEvent.click(screen.getByLabelText(/authorised to act/i));
    fireEvent.click(screen.getByLabelText(/give Fixtura permission/i));
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Association is required.");
    });
  });

  it("reports pending state via onPendingChange", () => {
    useUpdateOnboardingStep1.mockReturnValue({
      mutateAsync,
      isPending: true,
      isError: false,
    });

    const onPendingChange = vi.fn();
    const { Wrapper } = createWizardTestWrapper();
    render(
      <Wrapper>
        <WizardStepOrganisation
          accountId="1"
          sportId="cricket"
          onContinue={vi.fn()}
          onPendingChange={onPendingChange}
        />
      </Wrapper>,
    );

    expect(onPendingChange).toHaveBeenCalledWith(true);
  });
});
