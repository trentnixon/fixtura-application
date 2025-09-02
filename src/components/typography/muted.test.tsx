import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyMuted } from "./muted";

describe("TypographyMuted", () => {
  it("renders muted text", () => {
    render(<TypographyMuted>Muted text</TypographyMuted>);
    expect(screen.getByText(/muted text/i)).toBeInTheDocument();
  });
});
