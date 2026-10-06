import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { formatJoinedAgo, formatStatusLabel, SupportAccountsTable } from "./support-accounts-table";

import type { SupportDirectoryRow } from "@/types/api/account";

const row: SupportDirectoryRow = {
  id: 575,
  name: "Example Cricket Club",
  ownerEmail: "owner@example.com",
  accountType: "Club",
  sport: "Cricket",
  isActive: true,
  isSetup: false,
  onboardingStatus: "in_progress",
  accountHealthStatus: "failed",
  createdAt: "2024-03-15T10:00:00.000Z",
};

describe("formatJoinedAgo", () => {
  const today = new Date(2026, 9, 3, 12, 0, 0);

  it("uses days inside the first month", () => {
    expect(formatJoinedAgo(new Date(2026, 9, 3, 9, 0, 0).toISOString(), today)).toBe("Today");
    expect(formatJoinedAgo(new Date(2026, 9, 1, 9, 0, 0).toISOString(), today)).toBe("2 days ago");
  });

  it("uses months and leftover days after that", () => {
    expect(formatJoinedAgo(new Date(2026, 7, 1, 9, 0, 0).toISOString(), today)).toBe(
      "2 months, 2 days ago",
    );
    expect(formatJoinedAgo(new Date(2026, 7, 3, 9, 0, 0).toISOString(), today)).toBe(
      "2 months ago",
    );
  });
});

describe("formatStatusLabel", () => {
  it("title-cases underscored status values", () => {
    expect(formatStatusLabel("not_started")).toBe("Not Started");
    expect(formatStatusLabel("in_progress")).toBe("In Progress");
  });
});

describe("SupportAccountsTable", () => {
  it("gives type, joined, and each status their own column", () => {
    render(
      <SupportAccountsTable
        rows={[row]}
        meta={{ page: 1, pageSize: 25, total: 1, totalPages: 1 }}
        onOpen={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Type" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Joined" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Setup" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Onboarding" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Health" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Example Cricket Club").length).toBeGreaterThan(0);
    expect(screen.getAllByText("owner@example.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Club").length).toBeGreaterThan(0);
    expect(screen.getAllByText("15 Mar 2024").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not set up").length).toBeGreaterThan(0);
    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
    expect(screen.queryByText("Health · Failed")).not.toBeInTheDocument();
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
    expect(screen.getByText("1 account · page 1 of 1")).toBeInTheDocument();
  });

  it("shows the organisation logo when the row includes one", () => {
    render(
      <SupportAccountsTable
        rows={[{ ...row, logoUrl: "https://cdn.example/logo.png" }]}
        onOpen={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );

    const logos = screen.getAllByRole("img", { name: "Example Cricket Club" });
    expect(logos.length).toBeGreaterThan(0);
    expect(logos[0]).toHaveAttribute("src", "https://cdn.example/logo.png");
  });

  it("uses ParentLogo when logoUrl is absent, and initials when neither is set", () => {
    const { rerender } = render(
      <SupportAccountsTable
        rows={[{ ...row, ParentLogo: "https://cdn.example/parent.png" }]}
        onOpen={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("img", { name: "Example Cricket Club" })[0]).toHaveAttribute(
      "src",
      "https://cdn.example/parent.png",
    );

    rerender(<SupportAccountsTable rows={[row]} onOpen={vi.fn()} onPageChange={vi.fn()} />);

    expect(screen.queryByRole("img", { name: "Example Cricket Club" })).not.toBeInTheDocument();
    expect(screen.getAllByText("EC").length).toBeGreaterThan(0);
  });

  it("renders a row when the account name is null", () => {
    render(
      <SupportAccountsTable
        rows={[{ ...row, name: null }]}
        onOpen={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Unnamed account").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Open Unnamed account" }).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("UA").length).toBeGreaterThan(0);
  });

  it("opens the account from the row and from the button once", () => {
    const onOpen = vi.fn();
    render(<SupportAccountsTable rows={[row]} onOpen={onOpen} onPageChange={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Open Example Cricket Club" })[0]!);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(row);
  });
});
