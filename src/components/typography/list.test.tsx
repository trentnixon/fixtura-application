import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TypographyList } from "./list";

describe("TypographyList", () => {
  it("renders list children inside a ul", () => {
    render(
      <TypographyList>
        <li>One</li>
        <li>Two</li>
      </TypographyList>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText(/one/i)).toBeInTheDocument();
    expect(screen.getByText(/two/i)).toBeInTheDocument();
  });
});
