import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { AccountSecurityContent } from "./AccountSecurityContent";

const useAccountSecurityContentState = vi.hoisted(() => vi.fn());

vi.mock("../_hooks/useAccountSecurityContentState", () => ({
  useAccountSecurityContentState,
}));

vi.mock("./AccountSignInSecuritySection", () => ({
  AccountSignInSecuritySection: () => <div data-testid="sign-in-security-section" />,
}));

vi.mock("./AccountOverviewSection", () => ({
  AccountOverviewSection: () => <div data-testid="account-overview-section" />,
}));

vi.mock("./EditDisplayNameDialog", () => ({
  EditDisplayNameDialog: () => null,
}));

vi.mock("./EditLoginEmailDialog", () => ({
  EditLoginEmailDialog: () => null,
}));

vi.mock("./ChangePasswordDialog", () => ({
  ChangePasswordDialog: () => null,
}));

function dialogDefaults() {
  return {
    error: null,
    isOpen: false,
    isSubmitting: false,
    value: "",
    onChange: vi.fn(),
    onClose: vi.fn(),
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
  };
}

function passwordDialogDefaults(accountId = "42") {
  return {
    accountId,
    formKey: 0,
    isOpen: false,
    onEdit: vi.fn(),
    onOpenChange: vi.fn(),
  };
}

describe("AccountSecurityContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows redirecting state when account segment is invalid", () => {
    useAccountSecurityContentState.mockReturnValue({
      segmentOk: false,
      settingsQ: { isPending: false },
      meQ: { isPending: false },
      orgQ: { isPending: false },
      emailDialog: dialogDefaults(),
      profileDialog: dialogDefaults(),
      passwordDialog: passwordDialogDefaults(),
      orgContextSlice: undefined,
    });

    render(<AccountSecurityContent accountId="not-a-number" />);

    expect(screen.getByRole("status")).toHaveTextContent("Redirecting...");
  });

  it("shows loading state while queries are pending", () => {
    useAccountSecurityContentState.mockReturnValue({
      segmentOk: true,
      settingsQ: { isPending: true },
      meQ: { isPending: false },
      orgQ: { isPending: false },
      emailDialog: dialogDefaults(),
      profileDialog: dialogDefaults(),
      passwordDialog: passwordDialogDefaults(),
      orgContextSlice: undefined,
    });

    render(<AccountSecurityContent accountId="42" />);

    expect(screen.getByText("Loading account")).toBeInTheDocument();
  });

  it("shows settings error state with retry", () => {
    const refetch = vi.fn();
    useAccountSecurityContentState.mockReturnValue({
      segmentOk: true,
      settingsQ: {
        isPending: false,
        isError: true,
        error: new Error("Settings failed"),
        refetch,
      },
      meQ: { isPending: false, isError: false },
      orgQ: { isPending: false, isError: false },
      emailDialog: dialogDefaults(),
      profileDialog: dialogDefaults(),
      passwordDialog: passwordDialogDefaults(),
      orgContextSlice: undefined,
    });

    render(<AccountSecurityContent accountId="42" />);

    expect(screen.getByText("Could not load account details")).toBeInTheDocument();
    expect(screen.getByText("Settings failed")).toBeInTheDocument();
    screen.getByRole("button", { name: /retry/i }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders success layout with organisation title and sections", () => {
    useAccountSecurityContentState.mockReturnValue({
      segmentOk: true,
      settingsQ: {
        isPending: false,
        isError: false,
        isSuccess: true,
        data: {
          data: {
            id: 42,
            FirstName: "Jane",
            LastName: "Doe",
            isActive: true,
            isSetup: true,
          },
        },
      },
      meQ: {
        isPending: false,
        isError: false,
        isSuccess: true,
        data: { data: { user: { email: "user@example.com" } } },
      },
      orgQ: {
        isPending: false,
        isError: false,
        isSuccess: true,
        data: {
          data: {
            id: 42,
            account_type: 1,
            accountOrganisationDetails: { Name: "Test Org", Sport: "Cricket" },
          },
        },
      },
      emailDialog: dialogDefaults(),
      profileDialog: dialogDefaults(),
      passwordDialog: passwordDialogDefaults("42"),
      orgContextSlice: {
        id: 42,
        account_type: 1,
        accountOrganisationDetails: { Name: "Test Org", Sport: "Cricket" },
      },
    });

    render(<AccountSecurityContent accountId="42" />);

    expect(screen.getByRole("heading", { name: "Test Org" })).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-security-section")).toBeInTheDocument();
    expect(screen.getByTestId("account-overview-section")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Organisation settings" })).toBeInTheDocument();
  });
});
