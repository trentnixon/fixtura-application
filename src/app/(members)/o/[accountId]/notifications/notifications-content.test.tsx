import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { NotificationsContent } from "./notifications-content";

const useAccountNotifications = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountNotifications", () => ({
  useAccountNotifications,
  isAccountNotificationsGatewayRedirect: (value: unknown) =>
    value !== null &&
    typeof value === "object" &&
    "_tag" in value &&
    (value as { _tag: string })._tag === "notificationsGatewayRedirect",
}));

vi.mock("./_components/notifications-form", () => ({
  NotificationsForm: ({ accountId }: { accountId: string }) => (
    <div data-testid="notifications-form">form-{accountId}</div>
  ),
}));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe("NotificationsContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows redirecting state when account segment is invalid", () => {
    useAccountNotifications.mockReturnValue({ isPending: false });

    render(<NotificationsContent accountId="not-a-number" />);

    expect(screen.getByRole("status")).toHaveTextContent(/Redirecting/);
    expect(useAccountNotifications).toHaveBeenCalledWith("not-a-number", { enabled: false });
  });

  it("shows loading state while notifications query is pending", () => {
    useAccountNotifications.mockReturnValue({ isPending: true });

    render(<NotificationsContent accountId="42" />);

    expect(screen.getByText("Loading notifications")).toBeInTheDocument();
  });

  it("shows error state with retry", () => {
    const refetch = vi.fn();
    useAccountNotifications.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Notifications failed"),
      refetch,
    });

    render(<NotificationsContent accountId="42" />);

    expect(screen.getByText("Could not load notifications")).toBeInTheDocument();
    expect(screen.getByText("Notifications failed")).toBeInTheDocument();
    screen.getByRole("button", { name: /retry/i }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders form on success", () => {
    useAccountNotifications.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: {
          bundleAddressedTo: "Club",
          deliveryEmail: "ops@example.com",
          assetDeliveryDay: "sunday",
        },
      },
    });

    render(<NotificationsContent accountId="42" />);

    expect(screen.getByTestId("notifications-form")).toHaveTextContent("form-42");
  });
});
