import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./icon";

describe("Icon Component", () => {
  it("renders icons using namespace access", () => {
    render(<Icon.Check data-testid="check-icon" />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("renders multiple different icons", () => {
    render(
      <div>
        <Icon.Star data-testid="star-icon" />
        <Icon.Heart data-testid="heart-icon" />
        <Icon.Home data-testid="home-icon" />
      </div>,
    );

    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
    expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });

  it("passes through props to icon components", () => {
    render(<Icon.Check data-testid="check-icon" className="custom-class" size={24} />);

    const icon = screen.getByTestId("check-icon");
    expect(icon).toHaveClass("custom-class");
  });

  it("exports individual icons for direct import", () => {
    // This test verifies that individual icons are exported
    // The actual rendering is tested above
    expect(Icon.Check).toBeDefined();
    expect(Icon.Star).toBeDefined();
    expect(Icon.Heart).toBeDefined();
  });
});
