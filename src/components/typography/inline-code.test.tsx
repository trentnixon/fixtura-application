import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyInlineCode } from "./inline-code";

describe("TypographyInlineCode", () => {
  it("renders code element with content", () => {
    render(<TypographyInlineCode>const a=1</TypographyInlineCode>);
    expect(screen.getByText(/const a=1/)).toBeInTheDocument();
    const code = screen.getByText(/const a=1/).closest("code");
    expect(code).not.toBeNull();
  });
});
