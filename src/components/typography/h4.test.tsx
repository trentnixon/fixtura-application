import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyH4 } from "./h4";

describe("TypographyH4", () => {
  it("renders an h4 heading", () => {
    render(<TypographyH4>Caption</TypographyH4>);
    expect(screen.getByRole("heading", { level: 4, name: /caption/i })).toBeInTheDocument();
  });
});
