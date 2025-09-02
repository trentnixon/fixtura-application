import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyP } from "./p";

describe("TypographyP", () => {
  it("renders a paragraph", () => {
    render(<TypographyP>Body</TypographyP>);
    expect(screen.getByText(/body/i)).toBeInTheDocument();
  });
});
