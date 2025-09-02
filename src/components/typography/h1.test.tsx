import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyH1 } from "./h1";

describe("TypographyH1", () => {
  it("renders its children", () => {
    render(<TypographyH1>Title</TypographyH1>);
    expect(screen.getByRole("heading", { level: 1, name: /title/i })).toBeInTheDocument();
  });
});
