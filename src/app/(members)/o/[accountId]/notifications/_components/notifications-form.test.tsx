import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { NotificationsForm } from "./notifications-form";
import { NOTIFICATIONS_PARTIAL_SAVE_CONTACT_ONLY } from "../_constants/notifications-form";

import type * as NotificationsPartialSaveModule from "../_utils/notifications-partial-save";

const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const useAccountOrganisationContext = vi.hoisted(() => vi.fn());
const usePatchAccountNotifications = vi.hoisted(() => vi.fn());
const usePatchAccountSettings = vi.hoisted(() => vi.fn());
const runNotificationsSave = vi.hoisted(() => vi.fn());

vi.mock("@/lib/notify", () => ({
  toastSuccess,
  toastError,
}));

vi.mock("@/lib/api/hooks/account/useAccountOrganisationContext", () => ({
  useAccountOrganisationContext,
  isAccountOrganisationContextGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/usePatchAccountNotifications", () => ({
  usePatchAccountNotifications,
}));

vi.mock("@/lib/api/hooks/account/usePatchAccountSettings", () => ({
  usePatchAccountSettings,
}));

vi.mock("../_utils/notifications-partial-save", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof NotificationsPartialSaveModule;
  return {
    ...actual,
    runNotificationsSave,
  };
});

function baseData() {
  return {
    bundleAddressedTo: "Club",
    deliveryEmail: "ops@example.com",
    assetDeliveryDay: "sunday",
  };
}

function mutationDefaults() {
  return {
    isPending: false,
    isError: false,
    error: null,
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  };
}

function deliveryEmailInput() {
  return screen.getByDisplayValue("ops@example.com");
}

describe("NotificationsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAccountOrganisationContext.mockReturnValue({
      isSuccess: true,
      data: {
        data: {
          accountOrganisationDetails: { Name: "Test Org" },
        },
      },
    });
    usePatchAccountNotifications.mockReturnValue(mutationDefaults());
    usePatchAccountSettings.mockReturnValue(mutationDefaults());
    runNotificationsSave.mockResolvedValue({
      contact: "saved",
      deliveryDay: "skipped",
      contactError: null,
      deliveryDayError: null,
    });
  });

  it("shows unsaved changes when draft differs from saved data", () => {
    render(<NotificationsForm accountId="42" data={baseData()} />);

    fireEvent.change(deliveryEmailInput(), {
      target: { value: "new@example.com" },
    });

    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
  });

  it("blocks save dialog for invalid delivery email", () => {
    render(<NotificationsForm accountId="42" data={baseData()} />);

    fireEvent.change(deliveryEmailInput(), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid delivery email/i);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows 403 banner for blocked notifications save permission", () => {
    usePatchAccountNotifications.mockReturnValue({
      ...mutationDefaults(),
      isError: true,
      error: new ApiError({ status: 403, message: "Forbidden" }),
    });

    render(<NotificationsForm accountId="42" data={baseData()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(/saveAccountNotifications/i);
  });

  it("saves successfully and shows toast", async () => {
    runNotificationsSave.mockResolvedValue({
      contact: "saved",
      deliveryDay: "skipped",
      contactError: null,
      deliveryDayError: null,
    });

    render(<NotificationsForm accountId="42" data={baseData()} />);

    fireEvent.change(deliveryEmailInput(), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(runNotificationsSave).toHaveBeenCalled();
    });
    expect(toastSuccess).toHaveBeenCalledWith("Notification preferences saved");
  });

  it("shows partial save alert when contact saves but day fails", async () => {
    runNotificationsSave.mockResolvedValue({
      contact: "saved",
      deliveryDay: "failed",
      contactError: null,
      deliveryDayError: new ApiError({ status: 500, message: "Settings failed" }),
    });

    render(<NotificationsForm accountId="42" data={baseData()} />);

    fireEvent.change(deliveryEmailInput(), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(screen.getByText(NOTIFICATIONS_PARTIAL_SAVE_CONTACT_ONLY)).toBeInTheDocument();
    });
    expect(toastError).toHaveBeenCalled();
  });
});
