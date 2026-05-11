import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricComparisonCard } from "./MetricComparisonCard";

const baseProps = {
  title: "Content output",
  primary: { label: "Current", value: "86" },
  secondary: { label: "Previous", value: "73" },
  footer: <span>Gap to target reduced by 13 items.</span>,
};

describe("MetricComparisonCard", () => {
  it("renders surface layout with section bands", () => {
    render(<MetricComparisonCard {...baseProps} data-testid="metric-compare" layout="surface" />);
    expect(screen.getByTestId("metric-compare")).toBeInTheDocument();
    expect(screen.getByText("Content output")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("86")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("73")).toBeInTheDocument();
    expect(screen.getByText("Gap to target reduced by 13 items.")).toBeInTheDocument();
  });

  it("renders card layout", () => {
    render(<MetricComparisonCard {...baseProps} data-testid="metric-compare-card" layout="card" />);
    expect(screen.getByTestId("metric-compare-card")).toBeInTheDocument();
    expect(screen.getByText("Content output")).toBeInTheDocument();
  });

  it("renders body slot instead of the comparison grid when body is provided", () => {
    render(
      <MetricComparisonCard
        layout="card"
        title="Season coverage"
        body={<p>Prose or structured content goes here.</p>}
        footer={<span>Footer hint</span>}
        data-testid="metric-body-card"
      />,
    );
    expect(screen.getByTestId("metric-body-card")).toBeInTheDocument();
    expect(screen.getByText("Prose or structured content goes here.")).toBeInTheDocument();
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
    expect(screen.getByText("Footer hint")).toBeInTheDocument();
  });

  it("omits column label band when label is null and still renders values", () => {
    render(
      <MetricComparisonCard
        title="Pick one"
        layout="card"
        primary={{ label: null, value: "Left" }}
        secondary={{ label: null, value: "Right" }}
        footer={<span>Footer hint</span>}
      />,
    );
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(screen.getByText("Footer hint")).toBeInTheDocument();
  });
});
