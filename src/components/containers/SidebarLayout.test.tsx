import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarLayout } from "./SidebarLayout";

describe("SidebarLayout", () => {
  it("renders with sidebar and main content", () => {
    render(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Sidebar Content");
    expect(container).toHaveTextContent("Main Content");
  });

  it("applies correct grid classes", () => {
    render(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toHaveClass("grid", "grid-cols-1", "gap-3", "md:grid-cols-[240px_1fr]");
  });

  it("renders sidebar with correct classes and semantic element", () => {
    render(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveTextContent("Sidebar Content");
    expect(sidebar).toHaveClass("rounded-lg", "border", "p-3", "text-sm");
  });

  it("renders main content with correct classes and semantic element", () => {
    render(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent("Main Content");
    expect(main).toHaveClass("rounded-lg", "border", "p-3", "text-sm");
  });

  it("renders with complex sidebar content", () => {
    const sidebarContent = (
      <div>
        <h2>Navigation</h2>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    );
    render(
      <SidebarLayout
        sidebar={sidebarContent}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toHaveTextContent("Navigation");
    expect(container).toHaveTextContent("Home");
    expect(container).toHaveTextContent("About");
    expect(container).toHaveTextContent("Contact");
    expect(screen.getByRole("heading", { name: "Navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders with complex main content", () => {
    const mainContent = (
      <div>
        <header>
          <h1>Page Title</h1>
        </header>
        <section>
          <h2>Section Title</h2>
          <p>Section content goes here.</p>
        </section>
        <footer>
          <p>Footer content</p>
        </footer>
      </div>
    );
    render(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
        main={mainContent}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toHaveTextContent("Page Title");
    expect(container).toHaveTextContent("Section Title");
    expect(container).toHaveTextContent("Section content goes here.");
    expect(container).toHaveTextContent("Footer content");
    expect(screen.getByRole("heading", { name: "Page Title" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Section Title" })).toBeInTheDocument();
  });

  it("renders with empty sidebar", () => {
    render(
      <SidebarLayout
        sidebar={<div></div>}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Main Content");
    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toBeInTheDocument();
    // The sidebar contains an empty div, so it's not completely empty
    expect(sidebar).toHaveTextContent("");
  });

  it("renders with empty main content", () => {
    render(
      <SidebarLayout
        sidebar={<div>Sidebar Content</div>}
        main={<div></div>}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Sidebar Content");
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    // The main contains an empty div, so it's not completely empty
    expect(main).toHaveTextContent("");
  });

  it("renders with form elements in sidebar", () => {
    const sidebarWithForm = (
      <div>
        <h3>Settings</h3>
        <form role="form">
          <label>
            Theme:
            <select>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </label>
          <button type="submit">Save</button>
        </form>
      </div>
    );
    render(
      <SidebarLayout
        sidebar={sidebarWithForm}
        main={<div>Main Content</div>}
        data-testid="sidebar-layout"
      />,
    );
    const container = screen.getByTestId("sidebar-layout");
    expect(container).toHaveTextContent("Settings");
    expect(container).toHaveTextContent("Theme:");
    expect(container).toHaveTextContent("Light");
    expect(container).toHaveTextContent("Dark");
    expect(container).toHaveTextContent("Save");
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
