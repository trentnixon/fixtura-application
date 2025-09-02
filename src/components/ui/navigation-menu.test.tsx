import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
} from "./navigation-menu";

// Mock @radix-ui/react-navigation-menu
vi.mock("@radix-ui/react-navigation-menu", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="navigation-menu" {...props}>
      {children}
    </div>
  ),
  List: ({ children, ...props }: any) => (
    <div data-testid="navigation-menu-list" {...props}>
      {children}
    </div>
  ),
  Item: ({ children, ...props }: any) => (
    <div data-testid="navigation-menu-item" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="navigation-menu-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="navigation-menu-content" {...props}>
      {children}
    </div>
  ),
  Link: ({ children, ...props }: any) => (
    <a data-testid="navigation-menu-link" {...props}>
      {children}
    </a>
  ),
  Indicator: ({ children, ...props }: any) => (
    <div data-testid="navigation-menu-indicator" {...props}>
      {children}
    </div>
  ),
  Viewport: ({ children, ...props }: any) => (
    <div data-testid="navigation-menu-viewport" {...props}>
      {children}
    </div>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
}));

describe("NavigationMenu", () => {
  it("renders with default props", () => {
    render(
      <NavigationMenu data-testid="navigation-menu">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("navigation-menu")).toBeInTheDocument();
    expect(screen.getByTestId("navigation-menu-list")).toBeInTheDocument();
    expect(screen.getByTestId("navigation-menu-item")).toBeInTheDocument();
    expect(screen.getByTestId("navigation-menu-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("navigation-menu-content")).toBeInTheDocument();
    expect(screen.getByTestId("navigation-menu-link")).toBeInTheDocument();
  });

  it("renders with viewport by default", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId("navigation-menu-viewport")).toBeInTheDocument();
  });

  it("renders without viewport when viewport is false", () => {
    render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.queryByTestId("navigation-menu-viewport")).not.toBeInTheDocument();
  });

  it("renders list with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList data-testid="list">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const list = screen.getByTestId("list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-slot", "navigation-menu-list");
  });

  it("renders item with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem data-testid="item">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute("data-slot", "navigation-menu-item");
  });

  it("renders trigger with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid="trigger">Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Products");
    expect(trigger).toHaveAttribute("data-slot", "navigation-menu-trigger");
  });

  it("renders trigger with chevron icon", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const trigger = screen.getByTestId("navigation-menu-trigger");
    const chevronIcon = trigger.querySelector('[data-testid="chevron-down-icon"]');
    expect(chevronIcon).toBeInTheDocument();
  });

  it("renders content with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="content">
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "navigation-menu-content");
  });

  it("renders link with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink data-testid="link" href="/product1">
                Product 1
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByTestId("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("Product 1");
    expect(link).toHaveAttribute("data-slot", "navigation-menu-link");
    expect(link).toHaveAttribute("href", "/product1");
  });

  it("renders indicator with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuIndicator data-testid="indicator" />
      </NavigationMenu>,
    );
    const indicator = screen.getByTestId("indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("data-slot", "navigation-menu-indicator");
  });

  it("renders viewport with correct attributes", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const viewport = screen.getByTestId("navigation-menu-viewport");
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveAttribute("data-slot", "navigation-menu-viewport");
  });

  it("applies custom className to root", () => {
    render(
      <NavigationMenu className="custom-class" data-testid="navigation-menu">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const root = screen.getByTestId("navigation-menu");
    expect(root).toHaveClass("custom-class");
  });

  it("applies custom className to list", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList className="custom-class" data-testid="list">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const list = screen.getByTestId("list");
    expect(list).toHaveClass("custom-class");
  });

  it("applies custom className to content", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent className="custom-class" data-testid="content">
              <NavigationMenuLink>Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });
});
