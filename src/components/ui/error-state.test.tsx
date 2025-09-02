import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("renders with default props", () => {
    render(<ErrorState />);
    const errorState = screen.getByText("Something went wrong").closest("div");
    expect(errorState).toBeInTheDocument();
    expect(errorState).toHaveTextContent("Something went wrong");
    expect(errorState).toHaveTextContent(
      "Please try again. If the problem persists, contact support.",
    );
  });

  it("renders with custom title", () => {
    render(<ErrorState title="Custom Error" />);
    const errorState = screen.getByText("Custom Error").closest("div");
    expect(errorState).toHaveTextContent("Custom Error");
    expect(errorState).toHaveTextContent(
      "Please try again. If the problem persists, contact support.",
    );
  });

  it("renders with custom description", () => {
    render(<ErrorState description="Custom error message" />);
    const errorState = screen.getByText("Something went wrong").closest("div");
    expect(errorState).toHaveTextContent("Something went wrong");
    expect(errorState).toHaveTextContent("Custom error message");
  });

  it("renders with custom title and description", () => {
    render(<ErrorState title="Network Error" description="Unable to connect to the server." />);
    const errorState = screen.getByText("Network Error").closest("div");
    expect(errorState).toHaveTextContent("Network Error");
    expect(errorState).toHaveTextContent("Unable to connect to the server.");
  });

  it("shows retry button by default", () => {
    render(<ErrorState />);
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("hides retry button when canRetry is false", () => {
    render(<ErrorState canRetry={false} />);
    const retryButton = screen.queryByRole("button", { name: /retry/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const retryButton = screen.getByRole("button", { name: /retry/i });
    retryButton.click();
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("applies default styles", () => {
    render(<ErrorState />);
    const errorState = screen.getByText("Something went wrong").closest("div");
    expect(errorState).toHaveClass("grid", "gap-3", "rounded-xl", "border", "p-6", "text-center");
  });

  it("renders title with correct heading level", () => {
    render(<ErrorState title="Test Error" />);
    const title = screen.getByRole("heading", { level: 3, name: "Test Error" });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("text-lg", "font-semibold");
  });

  it("renders description with correct styling", () => {
    render(<ErrorState description="Test error message" />);
    const description = screen.getByText("Test error message");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-muted-foreground", "text-sm");
  });

  it("retry button has correct size", () => {
    render(<ErrorState />);
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toHaveClass("h-8");
  });
});
