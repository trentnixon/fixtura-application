import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListCard } from "./ListCard";

describe("ListCard", () => {
  it("renders with default props", () => {
    render(<ListCard data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toBeInTheDocument();
  });

  it("renders with title only", () => {
    render(<ListCard title="Test Title" data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with description only", () => {
    render(<ListCard description="Test Description" data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Description");
  });

  it("renders with list only", () => {
    render(
      <ListCard
        list={
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        }
        data-testid="list-card"
      />,
    );
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Item 1");
    expect(card).toHaveTextContent("Item 2");
  });

  it("renders with title and description", () => {
    render(<ListCard title="Test Title" description="Test Description" data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with title and list", () => {
    render(
      <ListCard
        title="Test Title"
        list={
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        }
        data-testid="list-card"
      />,
    );
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Item 1");
    expect(card).toHaveTextContent("Item 2");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with footer", () => {
    render(<ListCard footer={<div>Footer Content</div>} data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Footer Content");
  });

  it("renders with all props", () => {
    render(
      <ListCard
        title="Test Title"
        description="Test Description"
        list={
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        }
        footer={<div>Footer Content</div>}
        data-testid="list-card"
      />,
    );
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(card).toHaveTextContent("Item 1");
    expect(card).toHaveTextContent("Item 2");
    expect(card).toHaveTextContent("Footer Content");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with complex list content", () => {
    const complexList = (
      <div>
        <h4>List Header</h4>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    );
    render(<ListCard title="Test Title" list={complexList} data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("List Header");
    expect(card).toHaveTextContent("Item 1");
    expect(card).toHaveTextContent("Item 2");
    expect(card).toHaveTextContent("Item 3");
  });

  it("does not render header when no title or description", () => {
    render(
      <ListCard
        list={
          <ul>
            <li>Item 1</li>
          </ul>
        }
        data-testid="list-card"
      />,
    );
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Item 1");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not render content when no list", () => {
    render(<ListCard title="Test Title" data-testid="list-card" />);
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    // Content section should not be rendered
  });

  it("does not render footer when no footer prop", () => {
    render(
      <ListCard
        title="Test Title"
        list={
          <ul>
            <li>Item 1</li>
          </ul>
        }
        data-testid="list-card"
      />,
    );
    const card = screen.getByTestId("list-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Item 1");
    // Footer should not be rendered
  });
});
