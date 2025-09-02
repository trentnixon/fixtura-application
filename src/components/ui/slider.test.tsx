import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "./slider";

// Mock @radix-ui/react-slider
vi.mock("@radix-ui/react-slider", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="slider" {...props}>
      {children}
    </div>
  ),
  Track: ({ children, ...props }: any) => (
    <div data-testid="slider-track" {...props}>
      {children}
    </div>
  ),
  Range: ({ ...props }: any) => <div data-testid="slider-range" {...props} />,
  Thumb: ({ ...props }: any) => <div data-testid="slider-thumb" {...props} />,
}));

describe("Slider", () => {
  it("renders with default props", () => {
    render(<Slider data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("data-slot", "slider");
  });

  it("renders with default min and max values", () => {
    render(<Slider data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with custom min and max values", () => {
    render(<Slider min={10} max={90} data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with default value", () => {
    render(<Slider defaultValue={[25, 75]} data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with controlled value", () => {
    render(<Slider value={[30, 70]} data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders track with correct attributes", () => {
    render(<Slider data-testid="slider" />);
    const track = screen.getByTestId("slider-track");
    expect(track).toBeInTheDocument();
    expect(track).toHaveAttribute("data-slot", "slider-track");
  });

  it("renders range with correct attributes", () => {
    render(<Slider data-testid="slider" />);
    const range = screen.getByTestId("slider-range");
    expect(range).toBeInTheDocument();
    expect(range).toHaveAttribute("data-slot", "slider-range");
  });

  it("renders single thumb for single value", () => {
    render(<Slider defaultValue={[50]} data-testid="slider" />);
    const thumbs = screen.getAllByTestId("slider-thumb");
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]).toHaveAttribute("data-slot", "slider-thumb");
  });

  it("renders multiple thumbs for range values", () => {
    render(<Slider defaultValue={[25, 75]} data-testid="slider" />);
    const thumbs = screen.getAllByTestId("slider-thumb");
    expect(thumbs).toHaveLength(2);
    thumbs.forEach((thumb) => {
      expect(thumb).toHaveAttribute("data-slot", "slider-thumb");
    });
  });

  it("renders thumbs based on min/max when no value provided", () => {
    render(<Slider min={0} max={100} data-testid="slider" />);
    const thumbs = screen.getAllByTestId("slider-thumb");
    expect(thumbs).toHaveLength(2); // min and max values create 2 thumbs
  });

  it("applies custom className", () => {
    render(<Slider className="custom-class" data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toHaveClass("custom-class");
  });

  it("renders with disabled state", () => {
    render(<Slider disabled data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with step value", () => {
    render(<Slider step={5} data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with orientation vertical", () => {
    render(<Slider orientation="vertical" data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with orientation horizontal", () => {
    render(<Slider orientation="horizontal" data-testid="slider" />);
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
  });

  it("renders with all props combined", () => {
    render(
      <Slider
        min={0}
        max={100}
        step={10}
        defaultValue={[20, 80]}
        orientation="horizontal"
        disabled={false}
        className="custom-class"
        data-testid="slider"
      />,
    );
    const slider = screen.getByTestId("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveClass("custom-class");

    const thumbs = screen.getAllByTestId("slider-thumb");
    expect(thumbs).toHaveLength(2);
  });

  it("handles single value array", () => {
    render(<Slider value={[50]} data-testid="slider" />);
    const thumbs = screen.getAllByTestId("slider-thumb");
    expect(thumbs).toHaveLength(1);
  });

  it("handles multiple value array", () => {
    render(<Slider value={[10, 30, 50, 70, 90]} data-testid="slider" />);
    const thumbs = screen.getAllByTestId("slider-thumb");
    expect(thumbs).toHaveLength(5);
  });
});
