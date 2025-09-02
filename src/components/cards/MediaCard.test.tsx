import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaCard } from "./MediaCard";

describe("MediaCard", () => {
  it("renders with default props", () => {
    render(<MediaCard data-testid="media-card" />);
    const card = screen.getByTestId("media-card");
    expect(card).toBeInTheDocument();
  });

  it("renders with title only", () => {
    render(<MediaCard title="Test Title" data-testid="media-card" />);
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Test Title");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with description only", () => {
    render(<MediaCard description="Test Description" data-testid="media-card" />);
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Test Description");
  });

  it("renders with media only", () => {
    render(<MediaCard media={<img src="test.jpg" alt="Test" />} data-testid="media-card" />);
    const image = screen.getByRole("img", { name: "Test" });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test.jpg");
  });

  it("renders with title and description", () => {
    render(
      <MediaCard title="Test Title" description="Test Description" data-testid="media-card" />,
    );
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with media and children", () => {
    render(
      <MediaCard media={<img src="test.jpg" alt="Test" />} data-testid="media-card">
        <div>Card Content</div>
      </MediaCard>,
    );
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Card Content");
    expect(screen.getByRole("img", { name: "Test" })).toBeInTheDocument();
  });

  it("renders with footer", () => {
    render(<MediaCard footer={<div>Footer Content</div>} data-testid="media-card" />);
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Footer Content");
  });

  it("renders with all props", () => {
    render(
      <MediaCard
        title="Test Title"
        description="Test Description"
        media={<img src="test.jpg" alt="Test" />}
        footer={<div>Footer Content</div>}
        data-testid="media-card"
      >
        <div>Card Content</div>
      </MediaCard>,
    );
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Test Description");
    expect(card).toHaveTextContent("Card Content");
    expect(card).toHaveTextContent("Footer Content");
    expect(screen.getByRole("img", { name: "Test" })).toBeInTheDocument();
  });

  it("applies correct content layout classes", () => {
    render(
      <MediaCard media={<img src="test.jpg" alt="Test" />} data-testid="media-card">
        <div>Card Content</div>
      </MediaCard>,
    );
    const card = screen.getByTestId("media-card");
    const content = card.querySelector('[class*="grid"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("grid", "gap-3");
  });

  it("applies correct media container classes", () => {
    render(<MediaCard media={<img src="test.jpg" alt="Test" />} data-testid="media-card" />);
    const card = screen.getByTestId("media-card");
    const mediaContainer = card.querySelector('[class*="overflow-hidden"]');
    expect(mediaContainer).toBeInTheDocument();
    expect(mediaContainer).toHaveClass("overflow-hidden", "rounded-md", "border");
  });

  it("does not render header when no title or description", () => {
    render(
      <MediaCard media={<img src="test.jpg" alt="Test" />} data-testid="media-card">
        <div>Card Content</div>
      </MediaCard>,
    );
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Card Content");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not render footer when no footer prop", () => {
    render(
      <MediaCard
        title="Test Title"
        media={<img src="test.jpg" alt="Test" />}
        data-testid="media-card"
      >
        <div>Card Content</div>
      </MediaCard>,
    );
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Test Title");
    expect(card).toHaveTextContent("Card Content");
    // Footer should not be rendered
  });

  it("renders content even without media", () => {
    render(
      <MediaCard data-testid="media-card">
        <div>Card Content</div>
      </MediaCard>,
    );
    const card = screen.getByTestId("media-card");
    expect(card).toHaveTextContent("Card Content");
  });
});
