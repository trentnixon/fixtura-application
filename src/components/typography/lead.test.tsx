import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyLead } from "./lead";

describe("TypographyLead", () => {
  it("renders a lead paragraph", () => {
    render(<TypographyLead>Lead text</TypographyLead>);
    expect(screen.getByText(/lead text/i)).toBeInTheDocument();
  });
});
