import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with default props", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("data-slot", "skeleton");
  });

  it("applies custom className", () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("bg-accent", "animate-pulse", "rounded-md");
  });

  it("renders with custom dimensions", () => {
    render(<Skeleton className="h-4 w-32" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-4", "w-32");
  });

  it("renders with custom shape", () => {
    render(<Skeleton className="rounded-full" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("rounded-full");
  });

  it("can be used as a loading placeholder", () => {
    render(
      <div>
        <Skeleton className="h-4 w-32" data-testid="skeleton-1" />
        <Skeleton className="h-4 w-24" data-testid="skeleton-2" />
        <Skeleton className="h-4 w-40" data-testid="skeleton-3" />
      </div>,
    );

    expect(screen.getByTestId("skeleton-1")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-2")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-3")).toBeInTheDocument();
  });
});
