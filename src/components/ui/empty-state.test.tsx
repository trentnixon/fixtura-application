import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders with default props", () => {
    render(<EmptyState />);
    const emptyState = screen.getByText("Nothing here yet").closest("div");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent("Nothing here yet");
    expect(emptyState).toHaveTextContent("There is no data to display.");
  });

  it("renders with custom title", () => {
    render(<EmptyState title="Custom Title" />);
    const emptyState = screen.getByText("Custom Title").closest("div");
    expect(emptyState).toHaveTextContent("Custom Title");
    expect(emptyState).toHaveTextContent("There is no data to display.");
  });

  it("renders with custom description", () => {
    render(<EmptyState description="Custom description" />);
    const emptyState = screen.getByText("Nothing here yet").closest("div");
    expect(emptyState).toHaveTextContent("Nothing here yet");
    expect(emptyState).toHaveTextContent("Custom description");
  });

  it("renders with custom title and description", () => {
    render(<EmptyState title="No Results" description="Try adjusting your search criteria." />);
    const emptyState = screen.getByText("No Results").closest("div");
    expect(emptyState).toHaveTextContent("No Results");
    expect(emptyState).toHaveTextContent("Try adjusting your search criteria.");
  });

  it("renders with action button", () => {
    render(
      <EmptyState
        title="No Data"
        description="Get started by adding some data."
        action={<button data-testid="action-button">Add Data</button>}
      />,
    );
    const emptyState = screen.getByText("No Data").closest("div");
    const actionButton = screen.getByTestId("action-button");
    expect(emptyState).toBeInTheDocument();
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveTextContent("Add Data");
  });

  it("applies default styles", () => {
    render(<EmptyState />);
    const emptyState = screen.getByText("Nothing here yet").closest("div");
    expect(emptyState).toHaveClass("grid", "gap-3", "rounded-xl", "border", "p-6", "text-center");
  });

  it("renders title with correct heading level", () => {
    render(<EmptyState title="Test Title" />);
    const title = screen.getByRole("heading", { level: 3, name: "Test Title" });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("text-lg", "font-semibold");
  });

  it("renders description with correct styling", () => {
    render(<EmptyState description="Test description" />);
    const description = screen.getByText("Test description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-muted-foreground", "text-sm");
  });
});
