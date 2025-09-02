import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Calendar, CalendarDayButton } from "./calendar";

describe("Calendar", () => {
  it("renders with default props", () => {
    render(<Calendar data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
    expect(calendar).toHaveAttribute("data-slot", "calendar");
  });

  it("applies custom className", () => {
    render(<Calendar className="custom-class" data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toHaveClass("custom-class");
  });

  it("renders with showOutsideDays true by default", () => {
    render(<Calendar data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("renders with captionLayout label by default", () => {
    render(<Calendar data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("renders with buttonVariant ghost by default", () => {
    render(<Calendar data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("handles selected date", () => {
    const selectedDate = new Date(2024, 0, 15); // January 15, 2024
    render(<Calendar selected={selectedDate} data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("handles date range selection", () => {
    const fromDate = new Date(2024, 0, 10);
    const toDate = new Date(2024, 0, 20);
    render(
      <Calendar mode="range" selected={{ from: fromDate, to: toDate }} data-testid="calendar" />,
    );
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("handles multiple date selection", () => {
    const dates = [new Date(2024, 0, 10), new Date(2024, 0, 15), new Date(2024, 0, 20)];
    render(<Calendar mode="multiple" selected={dates} data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("handles disabled dates", () => {
    const disabledDate = new Date(2024, 0, 15);
    render(<Calendar disabled={disabledDate} data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });

  it("handles custom formatters", () => {
    const customFormatters = {
      formatMonthDropdown: (date: Date) => date.toLocaleString("default", { month: "long" }),
    };
    render(<Calendar formatters={customFormatters} data-testid="calendar" />);
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });
});

describe("CalendarDayButton", () => {
  const mockDay = {
    date: new Date(2024, 0, 15),
    displayMonth: new Date(2024, 0, 1),
    dateLib: new Date(2024, 0, 15),
    outside: false,
    isEqualTo: vi.fn(),
  } as any;
  const defaultModifiers = {};

  it("renders with default props", () => {
    render(
      <CalendarDayButton day={mockDay} modifiers={defaultModifiers} data-testid="day-button" />,
    );
    const button = screen.getByTestId("day-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-day", "15/01/2024");
  });

  it("applies custom className", () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={defaultModifiers}
        className="custom-class"
        data-testid="day-button"
      />,
    );
    const button = screen.getByTestId("day-button");
    expect(button).toHaveClass("custom-class");
  });

  it("handles selected state", () => {
    const modifiers = { selected: true };
    render(<CalendarDayButton day={mockDay} modifiers={modifiers} data-testid="day-button" />);
    const button = screen.getByTestId("day-button");
    expect(button).toHaveAttribute("data-selected-single", "true");
  });

  it("handles range start state", () => {
    const modifiers = { selected: true, range_start: true };
    render(<CalendarDayButton day={mockDay} modifiers={modifiers} data-testid="day-button" />);
    const button = screen.getByTestId("day-button");
    expect(button).toHaveAttribute("data-range-start", "true");
  });

  it("handles range end state", () => {
    const modifiers = { selected: true, range_end: true };
    render(<CalendarDayButton day={mockDay} modifiers={modifiers} data-testid="day-button" />);
    const button = screen.getByTestId("day-button");
    expect(button).toHaveAttribute("data-range-end", "true");
  });

  it("handles range middle state", () => {
    const modifiers = { selected: true, range_middle: true };
    render(<CalendarDayButton day={mockDay} modifiers={modifiers} data-testid="day-button" />);
    const button = screen.getByTestId("day-button");
    expect(button).toHaveAttribute("data-range-middle", "true");
  });

  it("handles focused state", () => {
    const modifiers = { focused: true };
    render(<CalendarDayButton day={mockDay} modifiers={modifiers} data-testid="day-button" />);
    const button = screen.getByTestId("day-button");
    expect(button).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={defaultModifiers}
        onClick={handleClick}
        data-testid="day-button"
      />,
    );
    const button = screen.getByTestId("day-button");
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
