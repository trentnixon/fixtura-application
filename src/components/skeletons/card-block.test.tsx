import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardBlockSkeleton } from "./card-block";

describe("CardBlockSkeleton", () => {
  it("renders with default props", () => {
    render(<CardBlockSkeleton data-testid="card-block-skeleton" />);
    const skeleton = screen.getByTestId("card-block-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("space-y-2", "rounded-md", "border", "p-4");
  });

  it("renders multiple skeleton elements", () => {
    render(<CardBlockSkeleton data-testid="card-block-skeleton" />);
    const skeleton = screen.getByTestId("card-block-skeleton");
    const skeletonElements = skeleton.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletonElements).toHaveLength(5); // 1 title + 2 text lines + 2 buttons
  });

  it("renders title skeleton with correct dimensions", () => {
    render(<CardBlockSkeleton data-testid="card-block-skeleton" />);
    const skeleton = screen.getByTestId("card-block-skeleton");
    const titleSkeleton = skeleton.querySelector(".h-6.w-40");
    expect(titleSkeleton).toBeInTheDocument();
  });

  it("renders text line skeletons", () => {
    render(<CardBlockSkeleton data-testid="card-block-skeleton" />);
    const skeleton = screen.getByTestId("card-block-skeleton");
    const fullWidthSkeleton = skeleton.querySelector(".h-4.w-full");
    const partialWidthSkeleton = skeleton.querySelector(".h-4.w-\\[90\\%\\]");
    expect(fullWidthSkeleton).toBeInTheDocument();
    expect(partialWidthSkeleton).toBeInTheDocument();
  });

  it("renders button skeletons", () => {
    render(<CardBlockSkeleton data-testid="card-block-skeleton" />);
    const skeleton = screen.getByTestId("card-block-skeleton");
    const buttonSkeletons = skeleton.querySelectorAll(".h-9.w-24");
    expect(buttonSkeletons).toHaveLength(2);
  });
});
