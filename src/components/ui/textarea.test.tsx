import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with default props", () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("data-slot", "textarea");
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("applies custom className", () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass(
      "border-input",
      "rounded-md",
      "border",
      "bg-transparent",
      "px-3",
      "py-2",
      "text-base",
    );
  });

  it("renders with placeholder", () => {
    render(<Textarea placeholder="Enter your message..." data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Enter your message...");
  });

  it("renders with value", () => {
    const handleChange = vi.fn();
    render(<Textarea value="Hello world" onChange={handleChange} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveValue("Hello world");
  });

  it("handles disabled state", () => {
    render(<Textarea disabled data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
  });

  it("handles readOnly state", () => {
    render(<Textarea readOnly data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("readonly");
  });

  it("handles required state", () => {
    render(<Textarea required data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeRequired();
  });

  it("handles onChange events", () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    // Simulate user input using fireEvent
    fireEvent.change(textarea, { target: { value: "New value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("handles onFocus events", () => {
    const handleFocus = vi.fn();
    render(<Textarea onFocus={handleFocus} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    textarea.focus();
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it("handles onBlur events", () => {
    const handleBlur = vi.fn();
    render(<Textarea onBlur={handleBlur} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    textarea.focus();
    textarea.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("renders with custom rows", () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("renders with custom cols", () => {
    render(<Textarea cols={50} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("cols", "50");
  });

  it("renders with minLength", () => {
    render(<Textarea minLength={10} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("minLength", "10");
  });

  it("renders with maxLength", () => {
    render(<Textarea maxLength={100} data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("maxLength", "100");
  });
});
