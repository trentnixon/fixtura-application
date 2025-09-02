import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock cmdk to avoid complex DOM interactions in tests
vi.mock("cmdk", () => {
  const CommandComponent = ({ children, ...props }: any) => (
    <div data-testid="cmdk-command" {...props}>
      {children}
    </div>
  );

  // Add primitive components as properties of Command
  CommandComponent.Input = ({ ...props }: any) => <input data-testid="cmdk-input" {...props} />;
  CommandComponent.List = ({ children, ...props }: any) => (
    <div data-testid="cmdk-list" {...props}>
      {children}
    </div>
  );
  CommandComponent.Empty = ({ children, ...props }: any) => (
    <div data-testid="cmdk-empty" {...props}>
      {children}
    </div>
  );
  CommandComponent.Group = ({ children, ...props }: any) => (
    <div data-testid="cmdk-group" {...props}>
      {children}
    </div>
  );
  CommandComponent.Item = ({ children, ...props }: any) => (
    <div data-testid="cmdk-item" {...props}>
      {children}
    </div>
  );
  CommandComponent.Separator = ({ ...props }: any) => (
    <div data-testid="cmdk-separator" {...props} />
  );

  return {
    Command: CommandComponent,
  };
});

// Mock lucide-react
vi.mock("lucide-react", () => ({
  SearchIcon: () => <div data-testid="search-icon" />,
  XIcon: () => <div data-testid="x-icon" />,
}));

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";

describe("Command", () => {
  it("renders with default props", () => {
    render(<Command data-testid="command">Command content</Command>);
    const command = screen.getByTestId("command");
    expect(command).toBeInTheDocument();
    expect(command).toHaveTextContent("Command content");
    expect(command).toHaveAttribute("data-slot", "command");
  });

  it("applies custom className", () => {
    render(
      <Command className="custom-class" data-testid="command">
        Command content
      </Command>,
    );
    const command = screen.getByTestId("command");
    expect(command).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<Command data-testid="command">Command content</Command>);
    const command = screen.getByTestId("command");
    expect(command).toHaveClass("bg-popover", "text-popover-foreground", "rounded-md");
  });
});

describe("CommandDialog", () => {
  it.skip("renders with default props", () => {
    render(
      <CommandDialog open data-testid="command-dialog">
        <CommandInput />
      </CommandDialog>,
    );
    const dialog = screen.getByTestId("command-dialog");
    expect(dialog).toBeInTheDocument();
  });

  it.skip("renders with custom title and description", () => {
    render(
      <CommandDialog
        open
        title="Custom Title"
        description="Custom Description"
        data-testid="command-dialog"
      >
        <CommandInput />
      </CommandDialog>,
    );
    const dialog = screen.getByTestId("command-dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <CommandDialog open className="custom-class" data-testid="command-dialog">
        <CommandInput />
      </CommandDialog>,
    );
    // The data-testid is applied to the DialogContent, not the Dialog itself
    const dialogContent = screen.getByTestId("command-dialog");
    expect(dialogContent).toBeInTheDocument();
    expect(dialogContent).toHaveClass("custom-class");
  });
});

describe("CommandInput", () => {
  it("renders with default props", () => {
    render(
      <Command>
        <CommandInput data-testid="command-input" />
      </Command>,
    );
    const input = screen.getByTestId("command-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "command-input");
  });

  it("applies custom className", () => {
    render(
      <Command>
        <CommandInput className="custom-class" data-testid="command-input" />
      </Command>,
    );
    const input = screen.getByTestId("command-input");
    expect(input).toHaveClass("custom-class");
  });

  it("renders with placeholder", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." data-testid="command-input" />
      </Command>,
    );
    const input = screen.getByTestId("command-input");
    expect(input).toHaveAttribute("placeholder", "Search...");
  });
});

describe("CommandList", () => {
  it("renders with default props", () => {
    render(
      <Command>
        <CommandList data-testid="command-list">
          <CommandItem>Item 1</CommandItem>
        </CommandList>
      </Command>,
    );
    const list = screen.getByTestId("command-list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-slot", "command-list");
  });

  it("applies custom className", () => {
    render(
      <Command>
        <CommandList className="custom-class" data-testid="command-list">
          <CommandItem>Item 1</CommandItem>
        </CommandList>
      </Command>,
    );
    const list = screen.getByTestId("command-list");
    expect(list).toHaveClass("custom-class");
  });
});

describe("CommandEmpty", () => {
  it("renders with default props", () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty data-testid="command-empty">No results found</CommandEmpty>
        </CommandList>
      </Command>,
    );
    const empty = screen.getByTestId("command-empty");
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveTextContent("No results found");
    expect(empty).toHaveAttribute("data-slot", "command-empty");
  });
});

describe("CommandGroup", () => {
  it("renders with default props", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup data-testid="command-group">
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const group = screen.getByTestId("command-group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-slot", "command-group");
  });

  it("applies custom className", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup className="custom-class" data-testid="command-group">
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const group = screen.getByTestId("command-group");
    expect(group).toHaveClass("custom-class");
  });
});

describe("CommandItem", () => {
  it("renders with default props", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem data-testid="command-item">Item 1</CommandItem>
        </CommandList>
      </Command>,
    );
    const item = screen.getByTestId("command-item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent("Item 1");
    expect(item).toHaveAttribute("data-slot", "command-item");
  });

  it("applies custom className", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem className="custom-class" data-testid="command-item">
            Item 1
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const item = screen.getByTestId("command-item");
    expect(item).toHaveClass("custom-class");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem onClick={handleClick} data-testid="command-item">
            Item 1
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const item = screen.getByTestId("command-item");
    item.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("CommandShortcut", () => {
  it("renders with default props", () => {
    render(<CommandShortcut data-testid="command-shortcut">⌘K</CommandShortcut>);
    const shortcut = screen.getByTestId("command-shortcut");
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveTextContent("⌘K");
    expect(shortcut).toHaveAttribute("data-slot", "command-shortcut");
  });

  it("applies custom className", () => {
    render(
      <CommandShortcut className="custom-class" data-testid="command-shortcut">
        ⌘K
      </CommandShortcut>,
    );
    const shortcut = screen.getByTestId("command-shortcut");
    expect(shortcut).toHaveClass("custom-class");
  });
});

describe("CommandSeparator", () => {
  it("renders with default props", () => {
    render(<CommandSeparator data-testid="command-separator" />);
    const separator = screen.getByTestId("command-separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "command-separator");
  });

  it("applies custom className", () => {
    render(<CommandSeparator className="custom-class" data-testid="command-separator" />);
    const separator = screen.getByTestId("command-separator");
    expect(separator).toHaveClass("custom-class");
  });
});

describe("Command composition", () => {
  it("renders complete command structure", () => {
    render(
      <Command data-testid="command">
        <CommandInput data-testid="command-input" />
        <CommandList data-testid="command-list">
          <CommandGroup data-testid="command-group">
            <CommandItem data-testid="command-item">Item 1</CommandItem>
            <CommandItem data-testid="command-item-2">Item 2</CommandItem>
          </CommandGroup>
          <CommandSeparator data-testid="command-separator" />
          <CommandEmpty data-testid="command-empty">No results</CommandEmpty>
        </CommandList>
      </Command>,
    );

    expect(screen.getByTestId("command")).toBeInTheDocument();
    expect(screen.getByTestId("command-input")).toBeInTheDocument();
    expect(screen.getByTestId("command-list")).toBeInTheDocument();
    expect(screen.getByTestId("command-group")).toBeInTheDocument();
    expect(screen.getByTestId("command-item")).toBeInTheDocument();
    expect(screen.getByTestId("command-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("command-separator")).toBeInTheDocument();
    expect(screen.getByTestId("command-empty")).toBeInTheDocument();
  });
});
