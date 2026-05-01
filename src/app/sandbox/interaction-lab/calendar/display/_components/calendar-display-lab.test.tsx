import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarDisplayLab } from "./calendar-display-lab";
import { SelectedDateFixtures } from "./selected-date-fixtures";
import { fixtureEvents } from "../_data/fixture-events";

describe("CalendarDisplayLab", () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-04-15T12:00:00"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("renders the lab shell copy and metrics", () => {
    render(<CalendarDisplayLab />);

    expect(screen.getByRole("heading", { name: "Calendar Display Lab" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Show all events" })).toBeInTheDocument();
    expect(screen.getByText("Lab Metrics")).toBeInTheDocument();
    expect(screen.getByText("Visible event count")).toBeInTheDocument();
  });

  it("renders a single per-day fixture total badge in month view", () => {
    const { container } = render(<CalendarDisplayLab />);

    const fixtureDayTotals = Array.from(container.querySelectorAll(".fc-event")).filter((event) =>
      /\d+\s*games?/i.test(event.textContent ?? ""),
    );

    expect(fixtureDayTotals.length).toBeGreaterThan(0);
    expect(fixtureDayTotals[0]?.textContent).toMatch(/\d+\s+games?/i);
  });

  it("opens the dialog for an individual bundle-production event", () => {
    const { container } = render(<CalendarDisplayLab />);

    const bundleEvent = Array.from(container.querySelectorAll(".fc-event")).find((event) =>
      event.textContent?.includes("Bundle"),
    );

    expect(bundleEvent).not.toBeNull();

    fireEvent.click(bundleEvent!);

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Bundle production")).toBeInTheDocument();
    expect(within(dialog).getByText("Bundle created")).toBeInTheDocument();
    expect(within(dialog).getByText("Round 1 Results Pack")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "View" })).toBeDisabled();
    expect(within(dialog).getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "https://example.com/bundles/round-1",
    );
  });

  it("renders selected-date fixtures for a supplied date", () => {
    render(
      <SelectedDateFixtures
        selectedDate="2026-04-04"
        fixtures={fixtureEvents.filter((event) => event.date === "2026-04-04")}
        onFixtureSelect={() => {}}
      />,
    );

    expect(screen.getByText("Companion list for Saturday, 4 April 2026.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /First Grade Norths vs Souths/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reserve Grade Sharks vs Tigers/i }),
    ).toBeInTheDocument();
  });
});
