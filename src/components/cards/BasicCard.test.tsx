import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BasicCard } from "./BasicCard";

describe("BasicCard", () => {
  it("renders with default props", () => {
    render(<BasicCard data-testid="basic-card" />);
    const card = screen.getByTestId("basic-card");
    expect(card).toBeInTheDocument();
  });

  it("renders with title only", () => {
    render(<BasicCard title="Test Title" data-testid="basic-card" />);
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Test Title");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with description only", () => {
    render(<BasicCard description="Test Description" data-testid="basic-card" />);
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Test Description");
  });

  it("renders with title and description", () => {
    render(
      <BasicCard title="Test Title" description="Test Description" data-testid="basic-card" />,
    );
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with children content", () => {
    render(
      <BasicCard data-testid="basic-card">
        <div>Card Content</div>
      </BasicCard>,
    );
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Card Content");
  });

  it("renders with footer", () => {
    render(<BasicCard footer={<div>Footer Content</div>} data-testid="basic-card" />);
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Footer Content");
  });

  it("renders with all props", () => {
    render(
      <BasicCard
        title="Test Title"
        description="Test Description"
        footer={<div>Footer Content</div>}
        data-testid="basic-card"
      >
        <div>Card Content</div>
      </BasicCard>,
    );
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(card).toHaveTextContent("Card Content");
    expect(card).toHaveTextContent("Footer Content");
  });

  it("does not render header when no title or description", () => {
    render(
      <BasicCard data-testid="basic-card">
        <div>Card Content</div>
      </BasicCard>,
    );
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Card Content");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not render content when no children", () => {
    render(<BasicCard title="Test Title" data-testid="basic-card" />);
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Test Title");
    // Content section should not be rendered
  });

  it("does not render footer when no footer prop", () => {
    render(
      <BasicCard title="Test Title" data-testid="basic-card">
        <div>Card Content</div>
      </BasicCard>,
    );
    const card = screen.getByTestId("basic-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Card Content");
    // Footer should not be rendered
  });
});
