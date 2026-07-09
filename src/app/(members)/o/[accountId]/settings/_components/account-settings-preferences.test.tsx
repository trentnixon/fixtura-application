import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { AccountSettingsPreferences } from "./account-settings-preferences";

const useAccountScheduler = vi.hoisted(() => vi.fn());
const usePatchAccountSettings = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountScheduler", () => ({
  useAccountScheduler,
  isAccountSchedulerGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/usePatchAccountSettings", () => ({
  usePatchAccountSettings,
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: vi.fn(),
  },
}));

function basePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    FirstName: "Jane",
    LastName: "Doe",
    DeliveryAddress: null,
    isActive: true,
    isSetup: true,
    isUpdating: false,
    isRightsHolder: null,
    isPermissionGiven: null,
    group_assets_by: false,
    include_junior_surnames: false,
    Sport: "Cricket",
    hasCompletedStartSequence: true,
    hasCustomTemplate: false,
    account_type: 2,
    onboardingOrganisationName: "Test Association",
    scheduler: { days_of_the_week: { id: 1, Name: "Sunday" } },
    ...overrides,
  };
}

function mutationDefaults() {
  return {
    isPending: false,
    isError: false,
    error: null,
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
  };
}

function schedulerDefaults() {
  return {
    isPending: false,
    isSuccess: true,
    data: {
      data: {
        scheduler: { days_of_the_week: { id: 1, Name: "Sunday" } },
      },
    },
  };
}

describe("AccountSettingsPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAccountScheduler.mockReturnValue(schedulerDefaults());
    usePatchAccountSettings.mockReturnValue(mutationDefaults());
  });

  it("shows competition grouping for association accounts and hides club split toggle", () => {
    render(
      <AccountSettingsPreferences accountId="42" payload={basePayload({ account_type: 2 })} />,
    );

    expect(screen.getByText("Competitions grouped by")).toBeInTheDocument();
    expect(screen.queryByText("Split seniors and masters")).not.toBeInTheDocument();
  });

  it("shows split seniors toggle for club accounts and hides competition grouping", () => {
    render(
      <AccountSettingsPreferences accountId="42" payload={basePayload({ account_type: 1 })} />,
    );

    expect(screen.getByText("Split seniors and masters")).toBeInTheDocument();
    expect(screen.queryByText("Competitions grouped by")).not.toBeInTheDocument();
  });

  it("shows unsaved changes when a toggle differs from saved values", () => {
    render(<AccountSettingsPreferences accountId="42" payload={basePayload()} />);

    fireEvent.click(screen.getByRole("switch", { name: "" }));

    expect(screen.getByText("Review changes before saving.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save settings" })).not.toBeDisabled();
  });

  it("resets draft to baseline when Reset is clicked", () => {
    render(<AccountSettingsPreferences accountId="42" payload={basePayload()} />);

    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("Review changes before saving.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("All preferences match saved values.")).toBeInTheDocument();
  });

  it("opens save confirmation dialog listing changed fields", () => {
    render(<AccountSettingsPreferences accountId="42" payload={basePayload()} />);

    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Save settings?")).toBeInTheDocument();
    expect(screen.getByText("Include junior surnames")).toBeInTheDocument();
  });

  it("saves successfully and shows toast", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    usePatchAccountSettings.mockReturnValue({
      ...mutationDefaults(),
      mutateAsync,
    });

    render(<AccountSettingsPreferences accountId="42" payload={basePayload()} />);

    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm save" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ includeJuniorSurnames: true });
    });
    expect(toastSuccess).toHaveBeenCalledWith("Settings saved", {
      description: "Your changes are stored on the server.",
    });
  });

  it("shows 403 permission banner when save is forbidden", () => {
    usePatchAccountSettings.mockReturnValue({
      ...mutationDefaults(),
      isError: true,
      error: new ApiError({ status: 403, message: "Forbidden" }),
    });

    render(<AccountSettingsPreferences accountId="42" payload={basePayload()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(/saveAccountSettings/i);
  });

  it("shows inline alert for non-403 save errors", () => {
    usePatchAccountSettings.mockReturnValue({
      ...mutationDefaults(),
      isError: true,
      error: new ApiError({ status: 500, message: "Server error" }),
    });

    render(<AccountSettingsPreferences accountId="42" payload={basePayload()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Server error");
  });
});
