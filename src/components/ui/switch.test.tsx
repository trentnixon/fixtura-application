import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock @radix-ui/react-switch to avoid complex DOM interactions in tests
vi.mock("@radix-ui/react-switch", () => ({
  Root: ({ children, checked, onCheckedChange, ...props }: any) => (
    <button
      data-testid="switch-root"
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {children}
    </button>
  ),
  Thumb: ({ ...props }: any) => <span data-testid="switch-thumb" {...props} />,
}));

import { Switch } from "./switch";

describe("Switch", () => {
  it("renders with default props", () => {
    render(<Switch data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute("data-slot", "switch");
  });

  it("applies custom className", () => {
    render(<Switch className="custom-class" data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<Switch data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveClass(
      "inline-flex",
      "h-[1.15rem]",
      "w-8",
      "rounded-full",
      "border",
      "border-transparent",
    );
  });

  it("renders with thumb", () => {
    render(<Switch data-testid="switch" />);
    const thumb = screen.getByTestId("switch-thumb");
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveAttribute("data-slot", "switch-thumb");
  });

  it("handles checked state", () => {
    render(<Switch checked data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("data-state", "checked");
  });

  it("handles unchecked state", () => {
    render(<Switch checked={false} data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("data-state", "unchecked");
  });

  it("handles disabled state", () => {
    render(<Switch disabled data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Switch onClick={handleClick} data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    switchElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles onCheckedChange events", () => {
    const handleCheckedChange = vi.fn();
    render(<Switch onCheckedChange={handleCheckedChange} data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    // Simulate checked change by clicking
    switchElement.click();
    expect(handleCheckedChange).toHaveBeenCalled();
  });

  it("renders with required prop", () => {
    render(<Switch required data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("required");
  });

  it("renders with name prop", () => {
    render(<Switch name="toggle" data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("name", "toggle");
  });

  it("renders with value prop", () => {
    render(<Switch value="on" data-testid="switch" />);
    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toHaveAttribute("value", "on");
  });
});
