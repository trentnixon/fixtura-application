import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";

// Mock @radix-ui/react-tooltip
vi.mock("@radix-ui/react-tooltip", () => ({
  Provider: ({ children, ...props }: any) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  ),
  Root: ({ children, ...props }: any) => (
    <div data-testid="tooltip" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="tooltip-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="tooltip-content" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="tooltip-portal" {...props}>
      {children}
    </div>
  ),
  Arrow: ({ ...props }: any) => <div data-testid="tooltip-arrow" {...props} />,
}));

describe("TooltipProvider", () => {
  it("renders with default delayDuration", () => {
    render(
      <TooltipProvider data-testid="provider">
        <div>Content</div>
      </TooltipProvider>,
    );
    const provider = screen.getByTestId("provider");
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveAttribute("data-slot", "tooltip-provider");
  });

  it("renders with custom delayDuration", () => {
    render(
      <TooltipProvider delayDuration={500} data-testid="provider">
        <div>Content</div>
      </TooltipProvider>,
    );
    const provider = screen.getByTestId("provider");
    expect(provider).toBeInTheDocument();
  });
});

describe("Tooltip", () => {
  it("renders with default props", () => {
    render(
      <Tooltip data-testid="tooltip">
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByTestId("tooltip-provider")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
  });

  it("renders trigger with correct attributes", () => {
    render(
      <Tooltip>
        <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Hover me");
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger");
  });

  it("renders content with correct attributes", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="content">Tooltip content</TooltipContent>
      </Tooltip>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Tooltip content");
    expect(content).toHaveAttribute("data-slot", "tooltip-content");
  });

  it("renders content with default sideOffset", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="content">Tooltip content</TooltipContent>
      </Tooltip>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with custom sideOffset", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent sideOffset={8} data-testid="content">
          Tooltip content
        </TooltipContent>
      </Tooltip>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with arrow", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="content">Tooltip content</TooltipContent>
      </Tooltip>,
    );
    const content = screen.getByTestId("content");
    const arrow = content.querySelector('[data-testid="tooltip-arrow"]');
    expect(arrow).toBeInTheDocument();
  });

  it("applies custom className to content", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className="custom-class" data-testid="content">
          Tooltip content
        </TooltipContent>
      </Tooltip>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });

  it("renders with complex trigger content", () => {
    render(
      <Tooltip>
        <TooltipTrigger data-testid="trigger">
          <div>
            <span>Complex trigger</span>
            <button>Button</button>
          </div>
        </TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Complex trigger");
    expect(trigger).toHaveTextContent("Button");
  });

  it("renders with complex content", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>
          <div>
            <h4>Tooltip Title</h4>
            <p>This is a detailed tooltip with multiple elements.</p>
            <button>Action</button>
          </div>
        </TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("Tooltip Title")).toBeInTheDocument();
    expect(
      screen.getByText("This is a detailed tooltip with multiple elements."),
    ).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders with disabled state", () => {
    render(
      <Tooltip>
        <TooltipTrigger disabled data-testid="trigger">
          Disabled trigger
        </TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
  });

  it("renders with multiple tooltips", () => {
    render(
      <div>
        <Tooltip>
          <TooltipTrigger data-testid="trigger1">First</TooltipTrigger>
          <TooltipContent>First tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="trigger2">Second</TooltipTrigger>
          <TooltipContent>Second tooltip</TooltipContent>
        </Tooltip>
      </div>,
    );
    expect(screen.getByTestId("trigger1")).toBeInTheDocument();
    expect(screen.getByTestId("trigger2")).toBeInTheDocument();
    expect(screen.getByTestId("trigger1")).toHaveTextContent("First");
    expect(screen.getByTestId("trigger2")).toHaveTextContent("Second");
  });

  it("renders with custom provider delayDuration", () => {
    render(
      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const providers = screen.getAllByTestId("tooltip-provider");
    expect(providers).toHaveLength(2);
  });
});
