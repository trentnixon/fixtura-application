import { describe, expect, it } from "vitest";

import {
  unwrapPutTemplateOptionsPayload,
  validatePutTemplateOptionsBody,
} from "./validate-put-template-options-body";

const requiredOnly = {
  templateCategoryId: 1,
  templateModeId: 2,
  useBackground: "Gradient",
};

const validBody = {
  ...requiredOnly,
  templatePaletteId: null,
  templateGradientId: null,
  templateImageId: null,
  templateNoiseId: null,
  templateParticleId: null,
  templatePatternId: null,
  templateTextureId: null,
  templateVideoId: null,
};

const animatedBody = {
  templateCategoryId: 1,
  templateModeId: 2,
  useBackground: "Animated",
  templateAnimationId: 42,
};

describe("unwrapPutTemplateOptionsPayload", () => {
  it("unwraps Strapi data wrapper", () => {
    expect(unwrapPutTemplateOptionsPayload({ data: requiredOnly })).toEqual(requiredOnly);
  });
});

describe("validatePutTemplateOptionsBody", () => {
  it("accepts required fields only (partial update shape)", () => {
    const result = validatePutTemplateOptionsBody(requiredOnly);
    expect(result.ok).toBe(true);
  });

  it("accepts a valid full flat body", () => {
    const result = validatePutTemplateOptionsBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.useBackground).toBe("Gradient");
    }
  });

  it("accepts Animated with templateAnimationId only", () => {
    const result = validatePutTemplateOptionsBody(animatedBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.templateAnimationId).toBe(42);
      expect(result.data.animation).toBeUndefined();
    }
  });

  it("accepts Animated with legacy animation JSON (ignored by CMS)", () => {
    const result = validatePutTemplateOptionsBody({
      ...animatedBody,
      animation: { type: "snow-field", speed: 2 },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.animation).toEqual({ type: "snow-field", speed: 2 });
    }
  });

  it("accepts Animated without templateAnimationId (CMS preserves existing link)", () => {
    const result = validatePutTemplateOptionsBody({
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Animated",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects Animated with invalid templateAnimationId", () => {
    const result = validatePutTemplateOptionsBody({
      ...animatedBody,
      templateAnimationId: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("accepts non-Animated with templateAnimationId null (save payload shape)", () => {
    const result = validatePutTemplateOptionsBody({
      ...validBody,
      templateAnimationId: null,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects animation when useBackground is not Animated", () => {
    const result = validatePutTemplateOptionsBody({
      ...requiredOnly,
      animation: { type: "snow-field" },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects legacy useBackground on write", () => {
    const result = validatePutTemplateOptionsBody({
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Graphics",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = validatePutTemplateOptionsBody({ ...requiredOnly, extra: 1 });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid useBackground", () => {
    const result = validatePutTemplateOptionsBody({ ...requiredOnly, useBackground: true });
    expect(result.ok).toBe(false);
  });

  it("rejects missing templateModeId", () => {
    const { templateModeId: _, ...partial } = requiredOnly;
    const result = validatePutTemplateOptionsBody(partial);
    expect(result.ok).toBe(false);
  });

  it("rejects non-positive optional relation ids when present", () => {
    const result = validatePutTemplateOptionsBody({ ...requiredOnly, templatePaletteId: 0 });
    expect(result.ok).toBe(false);
  });
});
