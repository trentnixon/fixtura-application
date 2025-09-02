import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Constrained } from "./Constrained";

describe("Constrained", () => {
  it("renders with default props", () => {
    render(
      <Constrained data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Test Content");
  });

  it("renders with default size (3xl)", () => {
    render(
      <Constrained data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    const innerDiv = container.querySelector("div > div");
    expect(innerDiv).toHaveClass("max-w-3xl");
  });

  it("renders with 2xl size", () => {
    render(
      <Constrained size="2xl" data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    const innerDiv = container.querySelector("div > div");
    expect(innerDiv).toHaveClass("max-w-2xl");
  });

  it("renders with 3xl size", () => {
    render(
      <Constrained size="3xl" data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    const innerDiv = container.querySelector("div > div");
    expect(innerDiv).toHaveClass("max-w-3xl");
  });

  it("renders with 6xl size", () => {
    render(
      <Constrained size="6xl" data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    const innerDiv = container.querySelector("div > div");
    expect(innerDiv).toHaveClass("max-w-6xl");
  });

  it("applies correct outer container classes", () => {
    render(
      <Constrained data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    expect(container).toHaveClass("rounded-lg", "border", "p-4");
  });

  it("applies correct inner container classes", () => {
    render(
      <Constrained data-testid="constrained">
        <div>Test Content</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    const innerDiv = container.querySelector("div > div");
    expect(innerDiv).toHaveClass("mx-auto", "rounded", "border", "p-3", "text-sm");
  });

  it("renders complex children content", () => {
    render(
      <Constrained data-testid="constrained">
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    expect(container).toHaveTextContent("Title");
    expect(container).toHaveTextContent("Description");
    expect(container).toHaveTextContent("Action");
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders with multiple children", () => {
    render(
      <Constrained data-testid="constrained">
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </Constrained>,
    );
    const container = screen.getByTestId("constrained");
    expect(container).toHaveTextContent("First Child");
    expect(container).toHaveTextContent("Second Child");
    expect(container).toHaveTextContent("Third Child");
  });

  it("renders with no children", () => {
    render(<Constrained data-testid="constrained">{null}</Constrained>);
    const container = screen.getByTestId("constrained");
    expect(container).toBeInTheDocument();
    // The container has an inner div even when no children
    expect(container.querySelector("div > div")).toBeEmptyDOMElement();
  });
});
