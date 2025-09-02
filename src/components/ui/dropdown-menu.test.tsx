import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu";

// Mock @radix-ui/react-dropdown-menu
vi.mock("@radix-ui/react-dropdown-menu", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="dropdown-menu-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-item" {...props}>
      {children}
    </div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-group" {...props}>
      {children}
    </div>
  ),
  Label: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-label" {...props}>
      {children}
    </div>
  ),
  Separator: ({ ...props }: any) => <div data-testid="dropdown-menu-separator" {...props} />,
  CheckboxItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-checkbox-item" {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-radio-group" {...props}>
      {children}
    </div>
  ),
  RadioItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-radio-item" {...props}>
      {children}
    </div>
  ),
  Sub: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-sub" {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-sub-trigger" {...props}>
      {children}
    </div>
  ),
  SubContent: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-sub-content" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-portal" {...props}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-item-indicator" {...props}>
      {children}
    </div>
  ),
}));

describe("DropdownMenu", () => {
  it("renders with default props", () => {
    render(
      <DropdownMenu data-testid="dropdown-menu">
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu-content")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu-item")).toBeInTheDocument();
  });

  it("renders trigger with correct attributes", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Open Menu");
  });

  it("renders content with correct attributes", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "dropdown-menu-content");
  });

  it("renders menu item with correct attributes", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="item">Menu Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent("Menu Item");
    expect(item).toHaveAttribute("data-slot", "dropdown-menu-item");
  });

  it("renders menu group", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup data-testid="group">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const group = screen.getByTestId("group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-slot", "dropdown-menu-group");
  });

  it("renders menu label", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel data-testid="label">Group Label</DropdownMenuLabel>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Group Label");
    expect(label).toHaveAttribute("data-slot", "dropdown-menu-label");
  });

  it("renders menu separator", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator data-testid="separator" />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const separator = screen.getByTestId("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "dropdown-menu-separator");
  });

  it("renders checkbox item", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem data-testid="checkbox-item" checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const checkboxItem = screen.getByTestId("checkbox-item");
    expect(checkboxItem).toBeInTheDocument();
    expect(checkboxItem).toHaveTextContent("Checkbox Item");
    expect(checkboxItem).toHaveAttribute("data-slot", "dropdown-menu-checkbox-item");
  });

  it("renders radio group and radio items", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup data-testid="radio-group">
            <DropdownMenuRadioItem data-testid="radio-item" value="option1">
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const radioGroup = screen.getByTestId("radio-group");
    const radioItem = screen.getByTestId("radio-item");
    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute("data-slot", "dropdown-menu-radio-group");
    expect(radioItem).toBeInTheDocument();
    expect(radioItem).toHaveTextContent("Option 1");
    expect(radioItem).toHaveAttribute("data-slot", "dropdown-menu-radio-item");
  });

  it("renders shortcut", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut data-testid="shortcut">⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const shortcut = screen.getByTestId("shortcut");
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveTextContent("⌘C");
    expect(shortcut).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
  });

  it("renders sub menu", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub data-testid="sub">
            <DropdownMenuSubTrigger data-testid="sub-trigger">Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent data-testid="sub-content">
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const sub = screen.getByTestId("sub");
    const subTrigger = screen.getByTestId("sub-trigger");
    const subContent = screen.getByTestId("sub-content");
    expect(sub).toBeInTheDocument();
    expect(sub).toHaveAttribute("data-slot", "dropdown-menu-sub");
    expect(subTrigger).toBeInTheDocument();
    expect(subTrigger).toHaveTextContent("Sub Menu");
    expect(subTrigger).toHaveAttribute("data-slot", "dropdown-menu-sub-trigger");
    expect(subContent).toBeInTheDocument();
    expect(subContent).toHaveAttribute("data-slot", "dropdown-menu-sub-content");
  });

  it("applies custom className to content", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-class" data-testid="content">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });

  it("applies custom className to item", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="custom-class" data-testid="item">
            Item 1
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByTestId("item");
    expect(item).toHaveClass("custom-class");
  });
});
