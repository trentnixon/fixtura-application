import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyH2 } from "./h2";

describe("TypographyH2", () => {
  it("renders an h2 heading", () => {
    render(<TypographyH2>SubTitle</TypographyH2>);
    expect(screen.getByRole("heading", { level: 2, name: /subtitle/i })).toBeInTheDocument();
  });
});
