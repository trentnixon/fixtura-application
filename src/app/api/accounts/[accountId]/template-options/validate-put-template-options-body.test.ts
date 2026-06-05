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
