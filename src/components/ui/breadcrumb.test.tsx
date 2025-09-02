import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  it("renders with default props", () => {
    render(<Breadcrumb data-testid="breadcrumb" />);
    const breadcrumb = screen.getByTestId("breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveAttribute("aria-label", "breadcrumb");
    expect(breadcrumb).toHaveAttribute("data-slot", "breadcrumb");
  });

  it("applies custom className", () => {
    render(<Breadcrumb className="custom-class" data-testid="breadcrumb" />);
    const breadcrumb = screen.getByTestId("breadcrumb");
    expect(breadcrumb).toHaveClass("custom-class");
  });
});

describe("BreadcrumbList", () => {
  it("renders with default props", () => {
    render(<BreadcrumbList data-testid="breadcrumb-list" />);
    const list = screen.getByTestId("breadcrumb-list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-slot", "breadcrumb-list");
  });

  it("applies custom className", () => {
    render(<BreadcrumbList className="custom-class" data-testid="breadcrumb-list" />);
    const list = screen.getByTestId("breadcrumb-list");
    expect(list).toHaveClass("custom-class");
  });
});

describe("BreadcrumbItem", () => {
  it("renders with default props", () => {
    render(<BreadcrumbItem data-testid="breadcrumb-item" />);
    const item = screen.getByTestId("breadcrumb-item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute("data-slot", "breadcrumb-item");
  });

  it("applies custom className", () => {
    render(<BreadcrumbItem className="custom-class" data-testid="breadcrumb-item" />);
    const item = screen.getByTestId("breadcrumb-item");
    expect(item).toHaveClass("custom-class");
  });
});

describe("BreadcrumbLink", () => {
  it("renders as anchor by default", () => {
    render(
      <BreadcrumbLink href="/test" data-testid="breadcrumb-link">
        Link
      </BreadcrumbLink>,
    );
    const link = screen.getByTestId("breadcrumb-link");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveAttribute("data-slot", "breadcrumb-link");
  });

  it("applies custom className", () => {
    render(
      <BreadcrumbLink href="/test" className="custom-class" data-testid="breadcrumb-link">
        Link
      </BreadcrumbLink>,
    );
    const link = screen.getByTestId("breadcrumb-link");
    expect(link).toHaveClass("custom-class");
  });

  it("renders as child component when asChild is true", () => {
    render(
      <BreadcrumbLink asChild data-testid="breadcrumb-link">
        <button>Button Link</button>
      </BreadcrumbLink>,
    );
    const link = screen.getByTestId("breadcrumb-link");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("BUTTON");
  });
});

describe("BreadcrumbPage", () => {
  it("renders with default props", () => {
    render(<BreadcrumbPage data-testid="breadcrumb-page">Current Page</BreadcrumbPage>);
    const page = screen.getByTestId("breadcrumb-page");
    expect(page).toBeInTheDocument();
    expect(page).toHaveAttribute("role", "link");
    expect(page).toHaveAttribute("aria-disabled", "true");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("data-slot", "breadcrumb-page");
    expect(page).toHaveTextContent("Current Page");
  });

  it("applies custom className", () => {
    render(
      <BreadcrumbPage className="custom-class" data-testid="breadcrumb-page">
        Current Page
      </BreadcrumbPage>,
    );
    const page = screen.getByTestId("breadcrumb-page");
    expect(page).toHaveClass("custom-class");
  });
});

describe("BreadcrumbSeparator", () => {
  it("renders with default chevron", () => {
    render(<BreadcrumbSeparator data-testid="breadcrumb-separator" />);
    const separator = screen.getByTestId("breadcrumb-separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("role", "presentation");
    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).toHaveAttribute("data-slot", "breadcrumb-separator");
  });

  it("renders custom children", () => {
    render(<BreadcrumbSeparator data-testid="breadcrumb-separator">/</BreadcrumbSeparator>);
    const separator = screen.getByTestId("breadcrumb-separator");
    expect(separator).toHaveTextContent("/");
  });

  it("applies custom className", () => {
    render(<BreadcrumbSeparator className="custom-class" data-testid="breadcrumb-separator" />);
    const separator = screen.getByTestId("breadcrumb-separator");
    expect(separator).toHaveClass("custom-class");
  });
});

describe("BreadcrumbEllipsis", () => {
  it("renders with default props", () => {
    render(<BreadcrumbEllipsis data-testid="breadcrumb-ellipsis" />);
    const ellipsis = screen.getByTestId("breadcrumb-ellipsis");
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis).toHaveAttribute("role", "presentation");
    expect(ellipsis).toHaveAttribute("aria-hidden", "true");
    expect(ellipsis).toHaveAttribute("data-slot", "breadcrumb-ellipsis");
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<BreadcrumbEllipsis className="custom-class" data-testid="breadcrumb-ellipsis" />);
    const ellipsis = screen.getByTestId("breadcrumb-ellipsis");
    expect(ellipsis).toHaveClass("custom-class");
  });
});
