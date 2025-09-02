import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./popover";

// Mock @radix-ui/react-popover
vi.mock("@radix-ui/react-popover", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="popover" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="popover-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="popover-content" {...props}>
      {children}
    </div>
  ),
  Anchor: ({ children, ...props }: any) => (
    <div data-testid="popover-anchor" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="popover-portal" {...props}>
      {children}
    </div>
  ),
}));

describe("Popover", () => {
  it("renders with default props", () => {
    render(
      <Popover data-testid="popover">
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByTestId("popover")).toBeInTheDocument();
    expect(screen.getByTestId("popover-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
  });

  it("renders trigger with correct attributes", () => {
    render(
      <Popover>
        <PopoverTrigger data-testid="trigger">Open Popover</PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Open Popover");
    expect(trigger).toHaveAttribute("data-slot", "popover-trigger");
  });

  it("renders content with correct attributes", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "popover-content");
  });

  it("renders content with default align and sideOffset", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with custom align", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent align="start" data-testid="content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with custom sideOffset", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent sideOffset={8} data-testid="content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders anchor with correct attributes", () => {
    render(
      <Popover>
        <PopoverAnchor data-testid="anchor">
          <div>Anchor element</div>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const anchor = screen.getByTestId("anchor");
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveTextContent("Anchor element");
    expect(anchor).toHaveAttribute("data-slot", "popover-anchor");
  });

  it("applies custom className to content", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class" data-testid="content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });

  it("renders with complex content", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>
            <h3>Popover Title</h3>
            <p>This is popover content with multiple elements.</p>
            <button>Action Button</button>
          </div>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Popover Title")).toBeInTheDocument();
    expect(screen.getByText("This is popover content with multiple elements.")).toBeInTheDocument();
    expect(screen.getByText("Action Button")).toBeInTheDocument();
  });

  it("renders with multiple triggers", () => {
    render(
      <Popover>
        <PopoverTrigger data-testid="trigger1">Open 1</PopoverTrigger>
        <PopoverTrigger data-testid="trigger2">Open 2</PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByTestId("trigger1")).toBeInTheDocument();
    expect(screen.getByTestId("trigger2")).toBeInTheDocument();
    expect(screen.getByTestId("trigger1")).toHaveTextContent("Open 1");
    expect(screen.getByTestId("trigger2")).toHaveTextContent("Open 2");
  });
});
