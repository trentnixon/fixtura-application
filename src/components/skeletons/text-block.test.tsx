import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextBlockSkeleton } from "./text-block";

describe("TextBlockSkeleton", () => {
  it("renders with default props", () => {
    const { container } = render(<TextBlockSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("space-y-2");
  });

  it("renders with default number of lines", () => {
    const { container } = render(<TextBlockSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    const lineSkeletons = skeleton.querySelectorAll(".h-4");
    expect(lineSkeletons).toHaveLength(3);
  });

  it("renders with custom number of lines", () => {
    const { container } = render(<TextBlockSkeleton lines={5} />);
    const skeleton = container.firstChild as HTMLElement;
    const lineSkeletons = skeleton.querySelectorAll(".h-4");
    expect(lineSkeletons).toHaveLength(5);
  });

  it("renders with default widths", () => {
    const { container } = render(<TextBlockSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    const lineSkeletons = skeleton.querySelectorAll(".h-4");
    expect(lineSkeletons[0]).toHaveStyle({ width: "80%" });
    expect(lineSkeletons[1]).toHaveStyle({ width: "70%" });
    expect(lineSkeletons[2]).toHaveStyle({ width: "60%" });
  });

  it("renders with custom widths", () => {
    const customWidths = [90, 75, 85, 70];
    const { container } = render(<TextBlockSkeleton lines={4} widths={customWidths} />);
    const skeleton = container.firstChild as HTMLElement;
    const lineSkeletons = skeleton.querySelectorAll(".h-4");
    expect(lineSkeletons[0]).toHaveStyle({ width: "90%" });
    expect(lineSkeletons[1]).toHaveStyle({ width: "75%" });
    expect(lineSkeletons[2]).toHaveStyle({ width: "85%" });
    expect(lineSkeletons[3]).toHaveStyle({ width: "70%" });
  });

  it("cycles through widths when lines exceed width array length", () => {
    const customWidths = [50, 60];
    const { container } = render(<TextBlockSkeleton lines={4} widths={customWidths} />);
    const skeleton = container.firstChild as HTMLElement;
    const lineSkeletons = skeleton.querySelectorAll(".h-4");
    expect(lineSkeletons[0]).toHaveStyle({ width: "50%" });
    expect(lineSkeletons[1]).toHaveStyle({ width: "60%" });
    expect(lineSkeletons[2]).toHaveStyle({ width: "50%" }); // cycles back
    expect(lineSkeletons[3]).toHaveStyle({ width: "60%" }); // cycles back
  });

  it("handles empty widths array by using defaults", () => {
    const { container } = render(<TextBlockSkeleton widths={[]} />);
    const skeleton = container.firstChild as HTMLElement;
    const lineSkeletons = skeleton.querySelectorAll(".h-4");
    expect(lineSkeletons[0]).toHaveStyle({ width: "80%" });
    expect(lineSkeletons[1]).toHaveStyle({ width: "70%" });
    expect(lineSkeletons[2]).toHaveStyle({ width: "60%" });
  });
});
