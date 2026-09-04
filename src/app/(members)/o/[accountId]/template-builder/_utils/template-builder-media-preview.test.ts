import { describe, expect, it } from "vitest";

import {
  clearUnavailableImageBackground,
  getTemplateBuilderMediaItems,
  resolveTemplateBuilderPreviewMediaItem,
} from "./template-builder-media-preview";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { AccountMediaLibraryItem } from "@/types/api/account";

function mediaItem(id: number, isActive = true): AccountMediaLibraryItem {
  return {
    id,
    title: `Image ${id}`,
    isActive,
    tags: [],
    ageGroup: "Both",
    assetTypes: ["ALL"],
    markerPosition: [],
    image: {
      id: id * 10,
      url: `https://cdn.example.com/${id}.jpg`,
      width: 1920,
      height: 1080,
      mime: "image/jpeg",
    },
  };
}

describe("template builder media preview selection", () => {
  it("keeps every user image in API order regardless of availability", () => {
    const items = [mediaItem(3), mediaItem(2, false), mediaItem(1)];

    expect(getTemplateBuilderMediaItems(items).map((item) => item.id)).toEqual([3, 2, 1]);
  });

  it("defaults to the first user image", () => {
    const items = getTemplateBuilderMediaItems([mediaItem(3, false), mediaItem(1)]);

    expect(resolveTemplateBuilderPreviewMediaItem(items, {}, "575")?.id).toBe(3);
  });

  it("retains a valid account-scoped selection", () => {
    const items = [mediaItem(3), mediaItem(1)];

    expect(resolveTemplateBuilderPreviewMediaItem(items, { "575": 1, "999": 3 }, "575")?.id).toBe(
      1,
    );
  });

  it("falls back when the selected image is removed or belongs to another account", () => {
    const items = [mediaItem(3), mediaItem(1)];

    expect(resolveTemplateBuilderPreviewMediaItem(items, { "575": 99 }, "575")?.id).toBe(3);
    expect(resolveTemplateBuilderPreviewMediaItem(items, { "999": 1 }, "575")?.id).toBe(3);
  });

  it("returns null for an empty library", () => {
    expect(resolveTemplateBuilderPreviewMediaItem([], { "575": 1 }, "575")).toBeNull();
  });
});

describe("clearUnavailableImageBackground", () => {
  const imageDraft: TemplateBuilderEditorState = {
    templateCategoryId: 1,
    templateModeId: 2,
    templatePaletteId: 3,
    templateGradientId: null,
    templateImageId: 14,
    templateNoiseId: null,
    templateParticleId: null,
    templatePatternId: null,
    templateTextureId: null,
    templateVideoId: null,
    templateAnimationId: null,
    useBackground: "Image",
    animation: null,
  };

  it("clears the image background and treatment after confirmed empty data", () => {
    expect(clearUnavailableImageBackground(imageDraft, true)).toMatchObject({
      useBackground: null,
      templateImageId: null,
    });
  });

  it("does not clear Image while availability is still unknown", () => {
    expect(clearUnavailableImageBackground(imageDraft, false)).toBe(imageDraft);
  });

  it("does not change a non-image background", () => {
    const solidDraft = { ...imageDraft, useBackground: "Solid" as const };
    expect(clearUnavailableImageBackground(solidDraft, true)).toBe(solidDraft);
  });
});
