import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";

describe("Card", () => {
  it("renders with default props", () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent("Card content");
    expect(card).toHaveAttribute("data-slot", "card");
  });

  it("applies custom className", () => {
    render(
      <Card className="custom-class" data-testid="card">
        Card content
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass(
      "bg-card",
      "text-card-foreground",
      "rounded-xl",
      "border",
      "shadow-sm",
    );
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Card onClick={handleClick} data-testid="card">
        Card content
      </Card>,
    );
    const card = screen.getByTestId("card");
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("CardHeader", () => {
  it("renders with default props", () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    const header = screen.getByTestId("card-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Header content");
    expect(header).toHaveAttribute("data-slot", "card-header");
  });

  it("applies custom className", () => {
    render(
      <CardHeader className="custom-class" data-testid="card-header">
        Header content
      </CardHeader>,
    );
    const header = screen.getByTestId("card-header");
    expect(header).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    const header = screen.getByTestId("card-header");
    expect(header).toHaveClass("@container/card-header", "grid", "items-start", "gap-1.5", "px-6");
  });
});

describe("CardTitle", () => {
  it("renders with default props", () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    const title = screen.getByTestId("card-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Title");
    expect(title).toHaveAttribute("data-slot", "card-title");
  });

  it("applies custom className", () => {
    render(
      <CardTitle className="custom-class" data-testid="card-title">
        Title
      </CardTitle>,
    );
    const title = screen.getByTestId("card-title");
    expect(title).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    const title = screen.getByTestId("card-title");
    expect(title).toHaveClass("leading-none", "font-semibold");
  });
});

describe("CardDescription", () => {
  it("renders with default props", () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>);
    const description = screen.getByTestId("card-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Description");
    expect(description).toHaveAttribute("data-slot", "card-description");
  });

  it("applies custom className", () => {
    render(
      <CardDescription className="custom-class" data-testid="card-description">
        Description
      </CardDescription>,
    );
    const description = screen.getByTestId("card-description");
    expect(description).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>);
    const description = screen.getByTestId("card-description");
    expect(description).toHaveClass("text-muted-foreground", "text-sm");
  });
});

describe("CardAction", () => {
  it("renders with default props", () => {
    render(<CardAction data-testid="card-action">Action</CardAction>);
    const action = screen.getByTestId("card-action");
    expect(action).toBeInTheDocument();
    expect(action).toHaveTextContent("Action");
    expect(action).toHaveAttribute("data-slot", "card-action");
  });

  it("applies custom className", () => {
    render(
      <CardAction className="custom-class" data-testid="card-action">
        Action
      </CardAction>,
    );
    const action = screen.getByTestId("card-action");
    expect(action).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<CardAction data-testid="card-action">Action</CardAction>);
    const action = screen.getByTestId("card-action");
    expect(action).toHaveClass(
      "col-start-2",
      "row-span-2",
      "row-start-1",
      "self-start",
      "justify-self-end",
    );
  });
});

describe("CardContent", () => {
  it("renders with default props", () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId("card-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Content");
    expect(content).toHaveAttribute("data-slot", "card-content");
  });

  it("applies custom className", () => {
    render(
      <CardContent className="custom-class" data-testid="card-content">
        Content
      </CardContent>,
    );
    const content = screen.getByTestId("card-content");
    expect(content).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId("card-content");
    expect(content).toHaveClass("px-6");
  });
});

describe("CardFooter", () => {
  it("renders with default props", () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId("card-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent("Footer");
    expect(footer).toHaveAttribute("data-slot", "card-footer");
  });

  it("applies custom className", () => {
    render(
      <CardFooter className="custom-class" data-testid="card-footer">
        Footer
      </CardFooter>,
    );
    const footer = screen.getByTestId("card-footer");
    expect(footer).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId("card-footer");
    expect(footer).toHaveClass("flex", "items-center", "px-6");
  });
});

describe("Card composition", () => {
  it("renders complete card structure", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">Card Description</CardDescription>
          <CardAction data-testid="card-action">Action</CardAction>
        </CardHeader>
        <CardContent data-testid="card-content">Card Content</CardContent>
        <CardFooter data-testid="card-footer">Card Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toBeInTheDocument();
    expect(screen.getByTestId("card-description")).toBeInTheDocument();
    expect(screen.getByTestId("card-action")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
    expect(screen.getByTestId("card-footer")).toBeInTheDocument();
  });
});
