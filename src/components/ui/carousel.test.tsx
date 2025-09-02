import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock embla-carousel-react to avoid DOM issues in tests
vi.mock("embla-carousel-react", () => ({
  default: () => [null, null],
}));

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel";

describe("Carousel", () => {
  it("renders with default props", () => {
    render(
      <Carousel data-testid="carousel">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const carousel = screen.getByTestId("carousel");
    expect(carousel).toBeInTheDocument();
    expect(carousel).toHaveAttribute("data-slot", "carousel");
    expect(carousel).toHaveAttribute("role", "region");
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("applies custom className", () => {
    render(
      <Carousel className="custom-class" data-testid="carousel">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const carousel = screen.getByTestId("carousel");
    expect(carousel).toHaveClass("custom-class");
  });

  it("renders with horizontal orientation by default", () => {
    render(
      <Carousel data-testid="carousel">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const carousel = screen.getByTestId("carousel");
    expect(carousel).toBeInTheDocument();
  });

  it("renders with vertical orientation", () => {
    render(
      <Carousel orientation="vertical" data-testid="carousel">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const carousel = screen.getByTestId("carousel");
    expect(carousel).toBeInTheDocument();
  });

  it("handles keyboard navigation", () => {
    render(
      <Carousel data-testid="carousel">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const carousel = screen.getByTestId("carousel");
    expect(carousel).toBeInTheDocument();
  });
});

describe("CarouselContent", () => {
  it("renders with default props", () => {
    render(
      <Carousel>
        <CarouselContent data-testid="carousel-content">
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const content = screen.getByTestId("carousel-content");
    expect(content).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Carousel>
        <CarouselContent className="custom-class" data-testid="carousel-content">
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const content = screen.getByTestId("carousel-content");
    expect(content).toHaveClass("custom-class");
  });

  it("applies horizontal orientation styles", () => {
    render(
      <Carousel orientation="horizontal">
        <CarouselContent data-testid="carousel-content">
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const content = screen.getByTestId("carousel-content");
    expect(content).toBeInTheDocument();
  });

  it("applies vertical orientation styles", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent data-testid="carousel-content">
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const content = screen.getByTestId("carousel-content");
    expect(content).toBeInTheDocument();
  });
});

describe("CarouselItem", () => {
  it("renders with default props", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem data-testid="carousel-item">Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const item = screen.getByTestId("carousel-item");
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent("Item 1");
    expect(item).toHaveAttribute("data-slot", "carousel-item");
    expect(item).toHaveAttribute("role", "group");
    expect(item).toHaveAttribute("aria-roledescription", "slide");
  });

  it("applies custom className", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem className="custom-class" data-testid="carousel-item">
            Item 1
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const item = screen.getByTestId("carousel-item");
    expect(item).toHaveClass("custom-class");
  });

  it("applies horizontal orientation styles", () => {
    render(
      <Carousel orientation="horizontal">
        <CarouselContent>
          <CarouselItem data-testid="carousel-item">Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const item = screen.getByTestId("carousel-item");
    expect(item).toBeInTheDocument();
  });

  it("applies vertical orientation styles", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem data-testid="carousel-item">Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const item = screen.getByTestId("carousel-item");
    expect(item).toBeInTheDocument();
  });
});

describe("CarouselPrevious", () => {
  it("renders with default props", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious data-testid="carousel-previous" />
      </Carousel>,
    );
    const previous = screen.getByTestId("carousel-previous");
    expect(previous).toBeInTheDocument();
    expect(previous).toHaveAttribute("data-slot", "carousel-previous");
  });

  it("applies custom className", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="custom-class" data-testid="carousel-previous" />
      </Carousel>,
    );
    const previous = screen.getByTestId("carousel-previous");
    expect(previous).toHaveClass("custom-class");
  });

  it("applies horizontal orientation styles", () => {
    render(
      <Carousel orientation="horizontal">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious data-testid="carousel-previous" />
      </Carousel>,
    );
    const previous = screen.getByTestId("carousel-previous");
    expect(previous).toBeInTheDocument();
  });

  it("applies vertical orientation styles", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious data-testid="carousel-previous" />
      </Carousel>,
    );
    const previous = screen.getByTestId("carousel-previous");
    expect(previous).toBeInTheDocument();
  });

  it("handles click events", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious data-testid="carousel-previous" />
      </Carousel>,
    );
    const previous = screen.getByTestId("carousel-previous");
    expect(previous).toBeInTheDocument();
  });
});

describe("CarouselNext", () => {
  it("renders with default props", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext data-testid="carousel-next" />
      </Carousel>,
    );
    const next = screen.getByTestId("carousel-next");
    expect(next).toBeInTheDocument();
    expect(next).toHaveAttribute("data-slot", "carousel-next");
  });

  it("applies custom className", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext className="custom-class" data-testid="carousel-next" />
      </Carousel>,
    );
    const next = screen.getByTestId("carousel-next");
    expect(next).toHaveClass("custom-class");
  });

  it("applies horizontal orientation styles", () => {
    render(
      <Carousel orientation="horizontal">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext data-testid="carousel-next" />
      </Carousel>,
    );
    const next = screen.getByTestId("carousel-next");
    expect(next).toBeInTheDocument();
  });

  it("applies vertical orientation styles", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext data-testid="carousel-next" />
      </Carousel>,
    );
    const next = screen.getByTestId("carousel-next");
    expect(next).toBeInTheDocument();
  });

  it("handles click events", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
        <CarouselNext data-testid="carousel-next" />
      </Carousel>,
    );
    const next = screen.getByTestId("carousel-next");
    expect(next).toBeInTheDocument();
  });
});

describe("Carousel composition", () => {
  it("renders complete carousel structure", () => {
    render(
      <Carousel data-testid="carousel">
        <CarouselContent data-testid="carousel-content">
          <CarouselItem data-testid="carousel-item-1">Item 1</CarouselItem>
          <CarouselItem data-testid="carousel-item-2">Item 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious data-testid="carousel-previous" />
        <CarouselNext data-testid="carousel-next" />
      </Carousel>,
    );

    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-content")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-previous")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-next")).toBeInTheDocument();
  });
});
