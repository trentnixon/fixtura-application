import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FullWidth } from "./FullWidth";

describe("FullWidth", () => {
  it("renders with children", () => {
    render(
      <FullWidth data-testid="full-width">
        <div>Test Content</div>
      </FullWidth>,
    );
    const container = screen.getByTestId("full-width");
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Test Content");
  });

  it("applies correct classes", () => {
    render(
      <FullWidth data-testid="full-width">
        <div>Test Content</div>
      </FullWidth>,
    );
    const container = screen.getByTestId("full-width");
    expect(container).toHaveClass("rounded-lg", "border", "p-4");
  });

  it("renders complex children content", () => {
    render(
      <FullWidth data-testid="full-width">
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </FullWidth>,
    );
    const container = screen.getByTestId("full-width");
    expect(container).toHaveTextContent("Title");
    expect(container).toHaveTextContent("Description");
    expect(container).toHaveTextContent("Action");
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders with multiple children", () => {
    render(
      <FullWidth data-testid="full-width">
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </FullWidth>,
    );
    const container = screen.getByTestId("full-width");
    expect(container).toHaveTextContent("First Child");
    expect(container).toHaveTextContent("Second Child");
    expect(container).toHaveTextContent("Third Child");
  });

  it("renders with no children", () => {
    render(<FullWidth data-testid="full-width" children={null} />);
    const container = screen.getByTestId("full-width");
    expect(container).toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders with nested components", () => {
    render(
      <FullWidth data-testid="full-width">
        <div>
          <header>
            <h1>Header</h1>
          </header>
          <main>
            <section>
              <h2>Section Title</h2>
              <p>Section content</p>
            </section>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      </FullWidth>,
    );
    const container = screen.getByTestId("full-width");
    expect(container).toHaveTextContent("Header");
    expect(container).toHaveTextContent("Section Title");
    expect(container).toHaveTextContent("Section content");
    expect(container).toHaveTextContent("Footer content");
    expect(screen.getByRole("heading", { name: "Header" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Section Title" })).toBeInTheDocument();
  });

  it("renders with form elements", () => {
    render(
      <FullWidth data-testid="full-width">
        <form>
          <input type="text" placeholder="Enter text" />
          <button type="submit">Submit</button>
        </form>
      </FullWidth>,
    );
    const container = screen.getByTestId("full-width");
    expect(container).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
