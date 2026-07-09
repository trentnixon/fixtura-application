import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { baseSettingsPayload, createWizardTestWrapper } from "./_test/wizard-test-fixtures";
import { WizardStepContact, type WizardStepContactHandle } from "./wizard-step-contact";

const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { error: toastError, success: vi.fn() },
}));

const useAccountSettings = vi.hoisted(() => vi.fn());
const useCurrentUser = vi.hoisted(() => vi.fn());
const useUpdateOnboardingStep3 = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountSettings", () => ({
  useAccountSettings,
  isAccountSettingsGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/auth/useCurrentUser", () => ({
  useCurrentUser,
}));

vi.mock("@/lib/api/hooks/account/useUpdateOnboardingStep3", () => ({
  useUpdateOnboardingStep3,
}));

describe("WizardStepContact", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toastError.mockReset();
    mutateAsync.mockResolvedValue({ data: {} });

    useAccountSettings.mockReturnValue({
      data: baseSettingsPayload(),
      isPending: false,
      isError: false,
    });
    useCurrentUser.mockReturnValue({
      data: { user: { email: "auth@test.com" } },
      isPending: false,
      isError: false,
    });
    useUpdateOnboardingStep3.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
    });
  });

  it("requires first name and weekly assets email", async () => {
    useAccountSettings.mockReturnValue({
      data: baseSettingsPayload({
        FirstName: "",
        DeliveryAddress: "",
      }),
      isPending: false,
      isError: false,
    });

    const { Wrapper } = createWizardTestWrapper();
    const ref = createRef<WizardStepContactHandle>();
    render(
      <Wrapper>
        <WizardStepContact ref={ref} accountId="1" onContinue={vi.fn()} />
        <button type="button" onClick={() => void ref.current?.submit()}>
          submit-step
        </button>
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Enter a first name.");
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("rejects invalid weekly assets email", async () => {
    const { Wrapper } = createWizardTestWrapper();
    const ref = createRef<WizardStepContactHandle>();
    render(
      <Wrapper>
        <WizardStepContact ref={ref} accountId="1" onContinue={vi.fn()} />
        <button type="button" onClick={() => void ref.current?.submit()}>
          submit-step
        </button>
      </Wrapper>,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/email address \(required\)/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Enter a valid email address for weekly assets.");
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("PATCHes dirty fields using deliveryAddress key", async () => {
    const onContinueFn = vi.fn();
    const { Wrapper } = createWizardTestWrapper();
    const ref = createRef<WizardStepContactHandle>();
    render(
      <Wrapper>
        <WizardStepContact ref={ref} accountId="1" onContinue={onContinueFn} />
        <button type="button" onClick={() => void ref.current?.submit()}>
          submit-step
        </button>
      </Wrapper>,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Janet" } });
    fireEvent.change(screen.getByLabelText(/email address \(required\)/i), {
      target: { value: "weekly@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        firstName: "Janet",
        deliveryAddress: "weekly@test.com",
      });
    });
    expect(onContinueFn).toHaveBeenCalled();
  });

  it("skips PATCH when values are unchanged", async () => {
    const onContinueFn = vi.fn();
    const { Wrapper } = createWizardTestWrapper();
    const ref = createRef<WizardStepContactHandle>();
    render(
      <Wrapper>
        <WizardStepContact ref={ref} accountId="1" onContinue={onContinueFn} />
        <button type="button" onClick={() => void ref.current?.submit()}>
          submit-step
        </button>
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(onContinueFn).toHaveBeenCalled();
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sends partial body when only last name changes", async () => {
    const onContinueFn = vi.fn();
    const { Wrapper } = createWizardTestWrapper();
    const ref = createRef<WizardStepContactHandle>();
    render(
      <Wrapper>
        <WizardStepContact ref={ref} accountId="1" onContinue={onContinueFn} />
        <button type="button" onClick={() => void ref.current?.submit()}>
          submit-step
        </button>
      </Wrapper>,
    );

    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Smith" } });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ lastName: "Smith" });
    });
    expect(onContinueFn).toHaveBeenCalled();
  });

  it("fills weekly assets email from Send to Me", () => {
    const { Wrapper } = createWizardTestWrapper();
    render(
      <Wrapper>
        <WizardStepContact accountId="1" onContinue={vi.fn()} />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /send to me/i }));

    expect(screen.getByLabelText(/email address \(required\)/i)).toHaveValue("auth@test.com");
  });

  it("maps 409 errors to refresh guidance", async () => {
    mutateAsync.mockRejectedValue(
      new ApiError({
        status: 409,
        message: "Conflict",
        details: {},
      }),
    );

    const { Wrapper } = createWizardTestWrapper();
    const ref = createRef<WizardStepContactHandle>();
    render(
      <Wrapper>
        <WizardStepContact ref={ref} accountId="1" onContinue={vi.fn()} />
        <button type="button" onClick={() => void ref.current?.submit()}>
          submit-step
        </button>
      </Wrapper>,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Janet" } });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "This account or your sign-in details changed. Refresh the page or go back to organisation selection.",
      );
    });
  });

  it("shows settings load error", () => {
    useAccountSettings.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    const { Wrapper } = createWizardTestWrapper();
    render(
      <Wrapper>
        <WizardStepContact accountId="1" onContinue={vi.fn()} />
      </Wrapper>,
    );

    expect(screen.getByText(/could not load settings/i)).toBeInTheDocument();
  });
});
