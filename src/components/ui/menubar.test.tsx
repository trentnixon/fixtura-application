import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarGroup,
  MenubarLabel,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "./menubar";

// Mock @radix-ui/react-menubar
vi.mock("@radix-ui/react-menubar", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="menubar" {...props}>
      {children}
    </div>
  ),
  Menu: ({ children, ...props }: any) => (
    <div data-testid="menubar-menu" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="menubar-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="menubar-content" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, ...props }: any) => (
    <div data-testid="menubar-item" {...props}>
      {children}
    </div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid="menubar-group" {...props}>
      {children}
    </div>
  ),
  Label: ({ children, ...props }: any) => (
    <div data-testid="menubar-label" {...props}>
      {children}
    </div>
  ),
  Separator: ({ ...props }: any) => <div data-testid="menubar-separator" {...props} />,
  CheckboxItem: ({ children, ...props }: any) => (
    <div data-testid="menubar-checkbox-item" {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="menubar-radio-group" {...props}>
      {children}
    </div>
  ),
  RadioItem: ({ children, ...props }: any) => (
    <div data-testid="menubar-radio-item" {...props}>
      {children}
    </div>
  ),
  Sub: ({ children, ...props }: any) => (
    <div data-testid="menubar-sub" {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({ children, ...props }: any) => (
    <div data-testid="menubar-sub-trigger" {...props}>
      {children}
    </div>
  ),
  SubContent: ({ children, ...props }: any) => (
    <div data-testid="menubar-sub-content" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="menubar-portal" {...props}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <div data-testid="menubar-item-indicator" {...props}>
      {children}
    </div>
  ),
}));

describe("Menubar", () => {
  it("renders with default props", () => {
    render(
      <Menubar data-testid="menubar">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByTestId("menubar")).toBeInTheDocument();
    expect(screen.getByTestId("menubar-menu")).toBeInTheDocument();
    expect(screen.getByTestId("menubar-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("menubar-content")).toBeInTheDocument();
    expect(screen.getByTestId("menubar-item")).toBeInTheDocument();
  });

  it("renders trigger with correct attributes", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger data-testid="trigger">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Copy</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Edit");
    expect(trigger).toHaveAttribute("data-slot", "menubar-trigger");
  });

  it("renders content with correct attributes", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent data-testid="content">
            <MenubarItem>Zoom</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "menubar-content");
  });

  it("renders menu item with correct attributes", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem data-testid="item">Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent("Save");
    expect(item).toHaveAttribute("data-slot", "menubar-item");
  });

  it("renders menu group", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup data-testid="group">
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const group = screen.getByTestId("group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-slot", "menubar-group");
  });

  it("renders menu label", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel data-testid="label">File Operations</MenubarLabel>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("File Operations");
    expect(label).toHaveAttribute("data-slot", "menubar-label");
  });

  it("renders menu separator", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarSeparator data-testid="separator" />
            <MenubarItem>Exit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const separator = screen.getByTestId("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "menubar-separator");
  });

  it("renders checkbox item", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem data-testid="checkbox-item" checked>
              Show Toolbar
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const checkboxItem = screen.getByTestId("checkbox-item");
    expect(checkboxItem).toBeInTheDocument();
    expect(checkboxItem).toHaveTextContent("Show Toolbar");
    expect(checkboxItem).toHaveAttribute("data-slot", "menubar-checkbox-item");
  });

  it("renders radio group and radio items", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup data-testid="radio-group">
              <MenubarRadioItem data-testid="radio-item" value="small">
                Small Icons
              </MenubarRadioItem>
              <MenubarRadioItem value="large">Large Icons</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const radioGroup = screen.getByTestId("radio-group");
    const radioItem = screen.getByTestId("radio-item");
    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute("data-slot", "menubar-radio-group");
    expect(radioItem).toBeInTheDocument();
    expect(radioItem).toHaveTextContent("Small Icons");
    expect(radioItem).toHaveAttribute("data-slot", "menubar-radio-item");
  });

  it("renders shortcut", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Save
              <MenubarShortcut data-testid="shortcut">⌘S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const shortcut = screen.getByTestId("shortcut");
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveTextContent("⌘S");
    expect(shortcut).toHaveAttribute("data-slot", "menubar-shortcut");
  });

  it("renders sub menu", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarSub data-testid="sub">
              <MenubarSubTrigger data-testid="sub-trigger">Recent</MenubarSubTrigger>
              <MenubarSubContent data-testid="sub-content">
                <MenubarItem>File1.txt</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const sub = screen.getByTestId("sub");
    const subTrigger = screen.getByTestId("sub-trigger");
    const subContent = screen.getByTestId("sub-content");
    expect(sub).toBeInTheDocument();
    expect(sub).toHaveAttribute("data-slot", "menubar-sub");
    expect(subTrigger).toBeInTheDocument();
    expect(subTrigger).toHaveTextContent("Recent");
    expect(subTrigger).toHaveAttribute("data-slot", "menubar-sub-trigger");
    expect(subContent).toBeInTheDocument();
    expect(subContent).toHaveAttribute("data-slot", "menubar-sub-content");
  });

  it("applies custom className to root", () => {
    render(
      <Menubar className="custom-class" data-testid="menubar">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const menubar = screen.getByTestId("menubar");
    expect(menubar).toHaveClass("custom-class");
  });

  it("applies custom className to content", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent className="custom-class" data-testid="content">
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });
});
