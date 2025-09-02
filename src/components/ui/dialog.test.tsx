import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock @radix-ui/react-dialog to avoid complex DOM interactions in tests
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="dialog-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="dialog-portal" {...props}>
      {children}
    </div>
  ),
  Overlay: ({ children, ...props }: any) => (
    <div data-testid="dialog-overlay" {...props}>
      {children}
    </div>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  Close: ({ children, ...props }: any) => (
    <button data-testid="dialog-close" {...props}>
      {children}
    </button>
  ),
  Title: ({ children, ...props }: any) => (
    <h2 data-testid="dialog-title" {...props}>
      {children}
    </h2>
  ),
  Description: ({ children, ...props }: any) => (
    <p data-testid="dialog-description" {...props}>
      {children}
    </p>
  ),
}));

import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

describe("Dialog", () => {
  it("renders with default props", () => {
    render(
      <Dialog open data-testid="dialog">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-slot", "dialog");
  });
});

describe("DialogTrigger", () => {
  it("renders with default props", () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByTestId("dialog-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Open Dialog");
    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Dialog>
        <DialogTrigger onClick={handleClick} data-testid="dialog-trigger">
          Open Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByTestId("dialog-trigger");
    trigger.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("DialogPortal", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogPortal data-testid="dialog-portal">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );
    const portal = screen.getAllByTestId("dialog-portal")[0];
    expect(portal).toBeInTheDocument();
    expect(portal).toHaveAttribute("data-slot", "dialog-portal");
  });
});

describe("DialogOverlay", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay data-testid="dialog-overlay" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );
    const overlay = screen.getAllByTestId("dialog-overlay")[0];
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute("data-slot", "dialog-overlay");
  });

  it("applies custom className", () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay className="custom-class" data-testid="dialog-overlay" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );
    const overlay = screen.getAllByTestId("dialog-overlay")[0];
    expect(overlay).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay data-testid="dialog-overlay" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );
    const overlay = screen.getAllByTestId("dialog-overlay")[0];
    expect(overlay).toHaveClass("fixed", "inset-0", "z-50", "bg-black/50");
  });
});

describe("DialogContent", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByTestId("dialog-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "dialog-content");
  });

  it("applies custom className", () => {
    render(
      <Dialog open>
        <DialogContent className="custom-class" data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByTestId("dialog-content");
    expect(content).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByTestId("dialog-content");
    expect(content).toHaveClass("bg-background", "fixed", "rounded-lg", "border", "shadow-lg");
  });

  it("shows close button by default", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const closeButton = screen.getByTestId("dialog-close");
    expect(closeButton).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false} data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const closeButton = screen.queryByTestId("dialog-close");
    expect(closeButton).not.toBeInTheDocument();
  });
});

describe("DialogClose", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogClose data-testid="dialog-close">Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const close = screen.getByTestId("dialog-close");
    expect(close).toBeInTheDocument();
    expect(close).toHaveTextContent("Close");
    expect(close).toHaveAttribute("data-slot", "dialog-close");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={handleClick} data-testid="dialog-close">
            Close
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );
    const close = screen.getByTestId("dialog-close");
    close.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("DialogHeader", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const header = screen.getByTestId("dialog-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-slot", "dialog-header");
  });

  it("applies custom className", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader className="custom-class" data-testid="dialog-header">
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const header = screen.getByTestId("dialog-header");
    expect(header).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const header = screen.getByTestId("dialog-header");
    expect(header).toHaveClass("flex", "flex-col", "gap-2");
  });
});

describe("DialogFooter", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="dialog-footer">
            <DialogClose>Cancel</DialogClose>
            <DialogClose>Save</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const footer = screen.getByTestId("dialog-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute("data-slot", "dialog-footer");
  });

  it("applies custom className", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogFooter className="custom-class" data-testid="dialog-footer">
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const footer = screen.getByTestId("dialog-footer");
    expect(footer).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="dialog-footer">
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const footer = screen.getByTestId("dialog-footer");
    expect(footer).toHaveClass("flex", "flex-col-reverse", "gap-2");
  });
});

describe("DialogTitle", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const title = screen.getByTestId("dialog-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Dialog Title");
    expect(title).toHaveAttribute("data-slot", "dialog-title");
  });

  it("applies custom className", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="custom-class" data-testid="dialog-title">
              Dialog Title
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const title = screen.getByTestId("dialog-title");
    expect(title).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const title = screen.getByTestId("dialog-title");
    expect(title).toHaveClass("text-lg", "leading-none", "font-semibold");
  });
});

describe("DialogDescription", () => {
  it("renders with default props", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Dialog description
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const description = screen.getByTestId("dialog-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Dialog description");
    expect(description).toHaveAttribute("data-slot", "dialog-description");
  });

  it("applies custom className", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription className="custom-class" data-testid="dialog-description">
              Dialog description
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const description = screen.getByTestId("dialog-description");
    expect(description).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Dialog description
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const description = screen.getByTestId("dialog-description");
    expect(description).toHaveClass("text-muted-foreground", "text-sm");
  });
});

describe("Dialog composition", () => {
  it("renders complete dialog structure", () => {
    render(
      <Dialog open data-testid="dialog">
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
        <DialogContent data-testid="dialog-content" showCloseButton={false}>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Dialog description
            </DialogDescription>
          </DialogHeader>
          <DialogFooter data-testid="dialog-footer">
            <DialogClose data-testid="dialog-close">Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
  });
});
