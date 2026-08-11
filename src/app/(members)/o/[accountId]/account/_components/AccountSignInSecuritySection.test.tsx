import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountSignInSecuritySection } from "./AccountSignInSecuritySection";

import type { AccountSecuritySummary } from "../_types/account-security";

const summary: AccountSecuritySummary = {
  organisationTitle: "Test Org",
  loginEmail: "user@example.com",
  sportLabel: "Cricket",
  accountTypeLabel: "Club",
  activeLabel: "Active",
  setupLabel: "Setup complete",
  displayName: "Jane Doe",
};

describe("AccountSignInSecuritySection", () => {
  it("renders sign-in security rows with summary values", () => {
    render(
      <AccountSignInSecuritySection
        summary={summary}
        onEditDisplayName={vi.fn()}
        onEditEmail={vi.fn()}
        onEditPassword={vi.fn()}
      />,
    );

    expect(screen.getByText("Sign-in and security")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("********")).toBeInTheDocument();
  });

  it("calls the matching edit handler when a row action is submitted", () => {
    const onEditDisplayName = vi.fn();
    const onEditEmail = vi.fn();
    const onEditPassword = vi.fn();

    render(
      <AccountSignInSecuritySection
        summary={summary}
        onEditDisplayName={onEditDisplayName}
        onEditEmail={onEditEmail}
        onEditPassword={onEditPassword}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Change user name" }).closest("form")!);
    fireEvent.submit(screen.getByRole("button", { name: "Change login email" }).closest("form")!);
    fireEvent.submit(screen.getByRole("button", { name: "Change password" }).closest("form")!);

    expect(onEditDisplayName).toHaveBeenCalledTimes(1);
    expect(onEditEmail).toHaveBeenCalledTimes(1);
    expect(onEditPassword).toHaveBeenCalledTimes(1);
  });
});
