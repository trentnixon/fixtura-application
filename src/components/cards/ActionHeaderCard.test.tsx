import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActionHeaderCard } from "./ActionHeaderCard";

describe("ActionHeaderCard", () => {
  it("renders with default props", () => {
    render(<ActionHeaderCard data-testid="action-header-card" />);
    const card = screen.getByTestId("action-header-card");
    expect(card).toBeInTheDocument();
  });

  it("renders with title only", () => {
    render(<ActionHeaderCard title="Test Title" data-testid="action-header-card" />);
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Title");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with description only", () => {
    render(<ActionHeaderCard description="Test Description" data-testid="action-header-card" />);
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Description");
  });

  it("renders with actions only", () => {
    render(
      <ActionHeaderCard
        actions={<button>Action Button</button>}
        data-testid="action-header-card"
      />,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Action Button");
    expect(screen.getByRole("button", { name: "Action Button" })).toBeInTheDocument();
  });

  it("renders with title and description", () => {
    render(
      <ActionHeaderCard
        title="Test Title"
        description="Test Description"
        data-testid="action-header-card"
      />,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with title and actions", () => {
    render(
      <ActionHeaderCard
        title="Test Title"
        actions={<button>Action Button</button>}
        data-testid="action-header-card"
      />,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Action Button");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action Button" })).toBeInTheDocument();
  });

  it("renders with all header props", () => {
    render(
      <ActionHeaderCard
        title="Test Title"
        description="Test Description"
        actions={<button>Action Button</button>}
        data-testid="action-header-card"
      />,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(card).toHaveTextContent("Action Button");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action Button" })).toBeInTheDocument();
  });

  it("renders with children content", () => {
    render(
      <ActionHeaderCard data-testid="action-header-card">
        <div>Card Content</div>
      </ActionHeaderCard>,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Card Content");
  });

  it("renders with all props", () => {
    render(
      <ActionHeaderCard
        title="Test Title"
        description="Test Description"
        actions={<button>Action Button</button>}
        data-testid="action-header-card"
      >
        <div>Card Content</div>
      </ActionHeaderCard>,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(card).toHaveTextContent("Action Button");
    expect(card).toHaveTextContent("Card Content");
  });

  it("applies correct header layout classes", () => {
    render(
      <ActionHeaderCard
        title="Test Title"
        actions={<button>Action Button</button>}
        data-testid="action-header-card"
      />,
    );
    const card = screen.getByTestId("action-header-card");
    const header = card.querySelector('[class*="flex-row"]');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("flex-row", "items-start", "justify-between");
  });

  it("does not render header when no title, description, or actions", () => {
    render(
      <ActionHeaderCard data-testid="action-header-card">
        <div>Card Content</div>
      </ActionHeaderCard>,
    );
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Card Content");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not render content when no children", () => {
    render(<ActionHeaderCard title="Test Title" data-testid="action-header-card" />);
    const card = screen.getByTestId("action-header-card");
    expect(card).toHaveTextContent("Test Title");
    // Content section should not be rendered
  });
});
