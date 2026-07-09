import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PlanTierCard } from "./PlanTierCard";

import type { AvailableBillingTier } from "@/types/api/account";

function sampleTier(overrides: Partial<AvailableBillingTier> = {}): AvailableBillingTier {
  return {
    id: "tier_1",
    name: "Season Pass",
    description: "Full season coverage",
    category: "Club",
    price: 520,
    currency: "AUD",
    daysInPass: 365,
    priceByWeekInPass: 10,
    includeSponsors: false,
    includedAssetTypes: [],
    isActive: true,
    ...overrides,
  };
}

describe("PlanTierCard", () => {
  it("renders as role radio with aria-checked reflecting selection", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <PlanTierCard tier={sampleTier()} selected={false} onSelect={onSelect} />,
    );

    const radio = screen.getByRole("radio", { name: "Season Pass" });
    expect(radio).toHaveAttribute("aria-checked", "false");
    expect(radio).toHaveAttribute("tabindex", "-1");

    rerender(<PlanTierCard tier={sampleTier()} selected={true} onSelect={onSelect} />);
    expect(screen.getByRole("radio", { name: "Season Pass" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Season Pass" })).toHaveAttribute("tabindex", "0");
  });

  it("calls onSelect when the card is clicked", () => {
    const onSelect = vi.fn();
    render(<PlanTierCard tier={sampleTier()} selected={false} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("radio", { name: "Season Pass" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onSelect on Enter and Space keydown", () => {
    const onSelect = vi.fn();
    render(<PlanTierCard tier={sampleTier()} selected={true} onSelect={onSelect} />);

    const radio = screen.getByRole("radio", { name: "Season Pass" });
    fireEvent.keyDown(radio, { key: "Enter" });
    fireEvent.keyDown(radio, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("applies selected styling class when selected", () => {
    const onSelect = vi.fn();
    render(<PlanTierCard tier={sampleTier()} selected={true} onSelect={onSelect} />);

    expect(screen.getByRole("radio", { name: "Season Pass" }).className).toMatch(/ring-primary/);
    expect(screen.getByRole("radio", { name: "Season Pass" }).className).toMatch(/bg-primary\/5/);
  });

  it("shows Selected label on visual CTA when selected", () => {
    const onSelect = vi.fn();
    render(<PlanTierCard tier={sampleTier()} selected={true} onSelect={onSelect} />);

    expect(screen.getByText("Selected")).toBeInTheDocument();
  });
});
