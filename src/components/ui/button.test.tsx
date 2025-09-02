import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button data-testid="button">Click me</Button>);
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("applies custom className", () => {
    render(
      <Button className="custom-class" data-testid="button">
        Click me
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("custom-class");
  });

  it("renders as child component when asChild is true", () => {
    render(
      <Button asChild data-testid="button">
        <a href="/test">Link Button</a>
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("A");
    expect(button).toHaveAttribute("href", "/test");
  });

  it("applies default variant styles", () => {
    render(<Button data-testid="button">Default</Button>);
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("applies destructive variant", () => {
    render(
      <Button variant="destructive" data-testid="button">
        Delete
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("bg-destructive", "text-white");
  });

  it("applies outline variant", () => {
    render(
      <Button variant="outline" data-testid="button">
        Outline
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("border", "bg-background");
  });

  it("applies secondary variant", () => {
    render(
      <Button variant="secondary" data-testid="button">
        Secondary
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
  });

  it("applies ghost variant", () => {
    render(
      <Button variant="ghost" data-testid="button">
        Ghost
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("hover:bg-accent", "hover:text-accent-foreground");
  });

  it("applies link variant", () => {
    render(
      <Button variant="link" data-testid="button">
        Link
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("text-primary", "underline-offset-4");
  });

  it("applies default size styles", () => {
    render(<Button data-testid="button">Default Size</Button>);
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("h-9", "px-4", "py-2");
  });

  it("applies small size", () => {
    render(
      <Button size="sm" data-testid="button">
        Small
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("h-8", "px-3");
  });

  it("applies large size", () => {
    render(
      <Button size="lg" data-testid="button">
        Large
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("h-10", "px-6");
  });

  it("applies icon size", () => {
    render(
      <Button size="icon" data-testid="button">
        🔍
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("size-9");
  });

  it("handles disabled state", () => {
    render(
      <Button disabled data-testid="button">
        Disabled
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} data-testid="button">
        Click me
      </Button>,
    );
    const button = screen.getByTestId("button");
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("combines variant and size", () => {
    render(
      <Button variant="destructive" size="lg" data-testid="button">
        Large Destructive
      </Button>,
    );
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("bg-destructive", "h-10", "px-6");
  });
});
