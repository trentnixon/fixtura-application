import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyBrand } from "./brand";

describe("TypographyBrand", () => {
  it("renders the brand font line", () => {
    render(<TypographyBrand />);
    expect(screen.getByText(/brand font/i)).toBeInTheDocument();
  });
});
