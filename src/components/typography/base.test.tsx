import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyBase } from "./base";

describe("TypographyBase", () => {
  it("renders children", () => {
    render(<TypographyBase>Hello</TypographyBase>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders as a custom element", () => {
    render(
      <TypographyBase as="h2" data-testid="heading">
        Title
      </TypographyBase>,
    );
    expect(screen.getByTestId("heading").tagName).toBe("H2");
  });

  it("applies tone muted", () => {
    render(<TypographyBase tone="muted">Muted</TypographyBase>);
    const el = screen.getByText("Muted");
    expect(el.className).toContain("text-muted-foreground");
  });
});
