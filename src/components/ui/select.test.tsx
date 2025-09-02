import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// Mock @radix-ui/react-select
vi.mock("@radix-ui/react-select", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="select" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  Value: ({ children, ...props }: any) => (
    <span data-testid="select-value" {...props}>
      {children}
    </span>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, ...props }: any) => (
    <div data-testid="select-item" {...props}>
      {children}
    </div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  ),
  Label: ({ children, ...props }: any) => (
    <div data-testid="select-label" {...props}>
      {children}
    </div>
  ),
  Separator: ({ ...props }: any) => <div data-testid="select-separator" {...props} />,
  ScrollUpButton: ({ children, ...props }: any) => (
    <div data-testid="select-scroll-up-button" {...props}>
      {children}
    </div>
  ),
  ScrollDownButton: ({ children, ...props }: any) => (
    <div data-testid="select-scroll-down-button" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="select-portal" {...props}>
      {children}
    </div>
  ),
  Viewport: ({ children, ...props }: any) => (
    <div data-testid="select-viewport" {...props}>
      {children}
    </div>
  ),
  Icon: ({ children, ...props }: any) => (
    <div data-testid="select-icon" {...props}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <div data-testid="select-item-indicator" {...props}>
      {children}
    </div>
  ),
  ItemText: ({ children, ...props }: any) => (
    <div data-testid="select-item-text" {...props}>
      {children}
    </div>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon" />,
}));

describe("Select", () => {
  it("renders with default props", () => {
    render(
      <Select data-testid="select">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("select")).toBeInTheDocument();
    expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("select-value")).toBeInTheDocument();
    expect(screen.getByTestId("select-content")).toBeInTheDocument();
    expect(screen.getAllByTestId("select-item")).toHaveLength(2);
  });

  it("renders trigger with default size", () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveAttribute("data-size", "default");
  });

  it("renders trigger with small size", () => {
    render(
      <Select>
        <SelectTrigger size="sm" data-testid="trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toHaveAttribute("data-size", "sm");
  });

  it("renders trigger with chevron icon", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByTestId("select-trigger");
    const chevronIcon = trigger.querySelector('[data-testid="chevron-down-icon"]');
    expect(chevronIcon).toBeInTheDocument();
  });

  it("renders value with placeholder", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" data-testid="value" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const value = screen.getByTestId("value");
    expect(value).toBeInTheDocument();
    expect(value).toHaveAttribute("data-slot", "select-value");
  });

  it("renders content with default position", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent data-testid="content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "select-content");
  });

  it("renders content with popper position", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent position="popper" data-testid="content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders item with correct attributes", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" data-testid="item">
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent("Option 1");
    expect(item).toHaveAttribute("data-slot", "select-item");
  });

  it("renders group with correct attributes", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup data-testid="group">
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    const group = screen.getByTestId("group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-slot", "select-group");
  });

  it("renders label with correct attributes", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel data-testid="label">Group Label</SelectLabel>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Group Label");
    expect(label).toHaveAttribute("data-slot", "select-label");
  });

  it("renders separator with correct attributes", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectSeparator data-testid="separator" />
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    );
    const separator = screen.getByTestId("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "select-separator");
  });

  it("renders scroll buttons", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton data-testid="scroll-up" />
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectScrollDownButton data-testid="scroll-down" />
        </SelectContent>
      </Select>,
    );
    const scrollUp = screen.getByTestId("scroll-up");
    const scrollDown = screen.getByTestId("scroll-down");
    expect(scrollUp).toBeInTheDocument();
    expect(scrollUp).toHaveAttribute("data-slot", "select-scroll-up-button");
    expect(scrollDown).toBeInTheDocument();
    expect(scrollDown).toHaveAttribute("data-slot", "select-scroll-down-button");
  });

  it("renders scroll up button with chevron up icon", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const scrollUp = screen.getAllByTestId("select-scroll-up-button")[0];
    const chevronUpIcon = scrollUp?.querySelector('[data-testid="chevron-up-icon"]');
    expect(chevronUpIcon).toBeInTheDocument();
  });

  it("renders scroll down button with chevron down icon", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>,
    );
    const scrollDown = screen.getAllByTestId("select-scroll-down-button")[0];
    const chevronDownIcon = scrollDown?.querySelector('[data-testid="chevron-down-icon"]');
    expect(chevronDownIcon).toBeInTheDocument();
  });

  it("applies custom className to trigger", () => {
    render(
      <Select>
        <SelectTrigger className="custom-class" data-testid="trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toHaveClass("custom-class");
  });

  it("applies custom className to content", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="custom-class" data-testid="content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });

  it("applies custom className to item", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" className="custom-class" data-testid="item">
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const item = screen.getByTestId("item");
    expect(item).toHaveClass("custom-class");
  });
});
