import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { AccountSettingsContent } from "./account-settings-content";

const useAccountSettings = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountSettings", () => ({
  useAccountSettings,
  isAccountSettingsGatewayRedirect: (value: unknown) =>
    value !== null &&
    typeof value === "object" &&
    "_tag" in value &&
    (value as { _tag: string })._tag === "settingsGatewayRedirect",
}));

vi.mock("./_components/account-settings-preferences", () => ({
  AccountSettingsPreferences: ({ accountId }: { accountId: string }) => (
    <div data-testid="account-settings-preferences">prefs-{accountId}</div>
  ),
}));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ removeQueries: vi.fn() }),
}));

describe("AccountSettingsContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows redirecting state when account segment is invalid", () => {
    useAccountSettings.mockReturnValue({ isPending: false });

    render(<AccountSettingsContent accountId="not-a-number" />);

    expect(screen.getByRole("status")).toHaveTextContent(/Redirecting/);
    expect(useAccountSettings).toHaveBeenCalledWith("not-a-number", { enabled: false });
  });

  it("shows loading state while settings query is pending", () => {
    useAccountSettings.mockReturnValue({ isPending: true });

    render(<AccountSettingsContent accountId="42" />);

    expect(screen.getByText("Loading settings")).toBeInTheDocument();
  });

  it("shows error state with retry", () => {
    const refetch = vi.fn();
    useAccountSettings.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Settings failed"),
      refetch,
    });

    render(<AccountSettingsContent accountId="42" />);

    expect(screen.getByText("Could not load settings")).toBeInTheDocument();
    expect(screen.getByText("Settings failed")).toBeInTheDocument();
    screen.getByRole("button", { name: /retry/i }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders preferences on success", () => {
    useAccountSettings.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: {
          id: 42,
          include_junior_surnames: true,
          group_assets_by: false,
          Sport: "Cricket",
          account_type: 1,
        },
      },
    });

    render(<AccountSettingsContent accountId="42" />);

    expect(screen.getByTestId("account-settings-preferences")).toHaveTextContent("prefs-42");
  });
});
