import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyErrorText } from "./forms";
import { TypographyCardTitle, TypographyPageTitle } from "./shell-hierarchy";

describe("semantic typography", () => {
  it("TypographyPageTitle renders as heading", () => {
    render(<TypographyPageTitle>Main</TypographyPageTitle>);
    expect(screen.getByRole("heading", { level: 1, name: /main/i })).toBeInTheDocument();
  });

  it("TypographyCardTitle can override element", () => {
    render(
      <TypographyCardTitle as="h2" data-testid="ct">
        Card
      </TypographyCardTitle>,
    );
    expect(screen.getByTestId("ct").tagName).toBe("H2");
  });

  it("TypographyErrorText uses destructive tone", () => {
    render(<TypographyErrorText>Bad</TypographyErrorText>);
    expect(screen.getByText("Bad").className).toContain("text-destructive");
  });
});
