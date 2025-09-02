import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";

// Mock @radix-ui/react-dialog
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="sheet" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="sheet-trigger" {...props}>
      {children}
    </button>
  ),
  Close: ({ children, ...props }: any) => (
    <button data-testid="sheet-close" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="sheet-portal" {...props}>
      {children}
    </div>
  ),
  Overlay: ({ ...props }: any) => <div data-testid="sheet-overlay" {...props} />,
  Content: ({ children, ...props }: any) => (
    <div data-testid="sheet-content" {...props}>
      {children}
    </div>
  ),
  Title: ({ children, ...props }: any) => (
    <div data-testid="sheet-title" {...props}>
      {children}
    </div>
  ),
  Description: ({ children, ...props }: any) => (
    <div data-testid="sheet-description" {...props}>
      {children}
    </div>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  XIcon: () => <div data-testid="x-icon" />,
}));

describe("Sheet", () => {
  it("renders with default props", () => {
    render(
      <Sheet data-testid="sheet">
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId("sheet")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
    expect(screen.getByText("Sheet Title")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-title")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-description")).toBeInTheDocument();
  });

  it("renders trigger with correct attributes", () => {
    render(
      <Sheet>
        <SheetTrigger data-testid="trigger">Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Open Sheet");
    expect(trigger).toHaveAttribute("data-slot", "sheet-trigger");
  });

  it("renders close button with correct attributes", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetClose data-testid="close">Close</SheetClose>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const close = screen.getByTestId("close");
    expect(close).toBeInTheDocument();
    expect(close).toHaveTextContent("Close");
    expect(close).toHaveAttribute("data-slot", "sheet-close");
  });

  it("renders content with default side", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent data-testid="content">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "sheet-content");
  });

  it("renders content with right side", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="right" data-testid="content">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with left side", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left" data-testid="content">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with top side", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="top" data-testid="content">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with bottom side", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="bottom" data-testid="content">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
  });

  it("renders content with close button and X icon", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("sheet-content");
    const closeButton = content.querySelector('[data-testid="sheet-close"]');
    expect(closeButton).toBeInTheDocument();
    const xIcon = closeButton?.querySelector('[data-testid="x-icon"]');
    expect(xIcon).toBeInTheDocument();
  });

  it("renders header with correct attributes", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader data-testid="header">
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-slot", "sheet-header");
  });

  it("renders footer with correct attributes", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
          <SheetFooter data-testid="footer">
            <button>Cancel</button>
            <button>Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    const footer = screen.getByTestId("footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute("data-slot", "sheet-footer");
  });

  it("renders title with correct attributes", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle data-testid="title">Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const title = screen.getByTestId("title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Sheet Title");
    expect(title).toHaveAttribute("data-slot", "sheet-title");
  });

  it("renders description with correct attributes", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription data-testid="description">Sheet description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const description = screen.getByTestId("description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Sheet description");
    expect(description).toHaveAttribute("data-slot", "sheet-description");
  });

  it("applies custom className to content", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent className="custom-class" data-testid="content">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });

  it("applies custom className to header", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader className="custom-class" data-testid="header">
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const header = screen.getByTestId("header");
    expect(header).toHaveClass("custom-class");
  });

  it("applies custom className to footer", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
          <SheetFooter className="custom-class" data-testid="footer">
            <button>Cancel</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("custom-class");
  });

  it("renders with complex content structure", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>Manage your application settings</SheetDescription>
          </SheetHeader>
          <div>
            <h3>General</h3>
            <p>Configure general settings</p>
          </div>
          <SheetFooter>
            <button>Cancel</button>
            <button>Save Changes</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Manage your application settings")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Configure general settings")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });
});
