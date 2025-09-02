import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListItemSkeleton } from "./list-item";

describe("ListItemSkeleton", () => {
  it("renders with default props", () => {
    const { container } = render(<ListItemSkeleton />);
    const skeleton = container.firstChild as Element;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("flex", "items-center", "space-x-4");
  });

  it("renders with default avatar size", () => {
    const { container } = render(<ListItemSkeleton />);
    const skeleton = container.firstChild as Element;
    const avatarSkeleton = skeleton.querySelector(".rounded-full");
    expect(avatarSkeleton).toBeInTheDocument();
    expect(avatarSkeleton).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("renders with custom avatar size", () => {
    const { container } = render(<ListItemSkeleton avatarSize={64} />);
    const skeleton = container.firstChild as Element;
    const avatarSkeleton = skeleton.querySelector(".rounded-full");
    expect(avatarSkeleton).toHaveStyle({ width: "64px", height: "64px" });
  });

  it("renders with default text widths", () => {
    const { container } = render(<ListItemSkeleton />);
    const skeleton = container.firstChild as Element;
    const textSkeletons = skeleton.querySelectorAll(".h-4");
    expect(textSkeletons).toHaveLength(2);
    expect(textSkeletons[0]).toHaveStyle({ width: "200px" });
    expect(textSkeletons[1]).toHaveStyle({ width: "160px" });
  });

  it("renders with custom text widths", () => {
    const { container } = render(<ListItemSkeleton primaryWidth={300} secondaryWidth={250} />);
    const skeleton = container.firstChild as Element;
    const textSkeletons = skeleton.querySelectorAll(".h-4");
    expect(textSkeletons[0]).toHaveStyle({ width: "300px" });
    expect(textSkeletons[1]).toHaveStyle({ width: "250px" });
  });

  it("renders text container with correct classes", () => {
    const { container } = render(<ListItemSkeleton />);
    const skeleton = container.firstChild as Element;
    const textContainer = skeleton.querySelector(".space-y-2");
    expect(textContainer).toBeInTheDocument();
  });
});
