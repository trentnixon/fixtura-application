import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographySmall } from "./small";

describe("TypographySmall", () => {
  it("renders small text", () => {
    render(<TypographySmall>Small</TypographySmall>);
    expect(screen.getByText(/small/i)).toBeInTheDocument();
  });
});
