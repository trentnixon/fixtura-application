import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyH3 } from "./h3";

describe("TypographyH3", () => {
  it("renders an h3 heading", () => {
    render(<TypographyH3>Section</TypographyH3>);
    expect(screen.getByRole("heading", { level: 3, name: /section/i })).toBeInTheDocument();
  });
});
