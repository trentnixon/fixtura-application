import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyLarge } from "./large";

describe("TypographyLarge", () => {
  it("renders a paragraph with larger text", () => {
    render(<TypographyLarge>Large</TypographyLarge>);
    expect(screen.getByText(/large/i)).toBeInTheDocument();
  });
});
