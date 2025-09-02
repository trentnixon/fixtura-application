import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyBlockquote } from "./blockquote";

describe("TypographyBlockquote", () => {
  it("renders children inside a blockquote", () => {
    render(<TypographyBlockquote>Quote</TypographyBlockquote>);
    const el = screen.getByText(/quote/i);
    expect(el).toBeInTheDocument();
    expect(el.closest("blockquote")).not.toBeNull();
  });
});
