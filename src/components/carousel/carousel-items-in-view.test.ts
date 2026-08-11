import { describe, expect, it } from "vitest";

import {
  carouselShowsMultipleItemsInView,
  resolveCarouselEmbeddedGutterClasses,
  resolveCarouselItemBasisClass,
} from "./carousel-items-in-view";

describe("resolveCarouselItemBasisClass", () => {
  it("maps a single count to basis-full", () => {
    expect(resolveCarouselItemBasisClass(1)).toBe("basis-full");
  });

  it("maps multiple counts to fractional basis", () => {
    expect(resolveCarouselItemBasisClass(3)).toBe("basis-1/3");
  });

  it("supports responsive breakpoint counts", () => {
    expect(resolveCarouselItemBasisClass({ base: 1, md: 2 })).toBe("basis-full md:basis-1/2");
    expect(resolveCarouselItemBasisClass({ base: 1, xl: 4 })).toBe("basis-full xl:basis-1/4");
  });
});

describe("carouselShowsMultipleItemsInView", () => {
  it("detects when any breakpoint shows more than one slide", () => {
    expect(carouselShowsMultipleItemsInView(1)).toBe(false);
    expect(carouselShowsMultipleItemsInView({ base: 1, lg: 2 })).toBe(true);
  });
});

describe("resolveCarouselEmbeddedGutterClasses", () => {
  it("only adds gutters at breakpoints with more than one slide", () => {
    expect(resolveCarouselEmbeddedGutterClasses({ base: 1, xl: 4 })).toEqual({
      contentClassName: "xl:-ml-1.5",
      itemClassName: "xl:pl-1.5",
    });
  });
});
