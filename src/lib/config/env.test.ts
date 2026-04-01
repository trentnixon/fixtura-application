import { afterEach, describe, expect, it } from "vitest";

import { getStrapiUrl } from "./env";

describe("getStrapiUrl", () => {
  const original = process.env["STRAPI_URL"];

  afterEach(() => {
    if (original === undefined) {
      delete process.env["STRAPI_URL"];
    } else {
      process.env["STRAPI_URL"] = original;
    }
  });

  it("returns null when unset or blank", () => {
    delete process.env["STRAPI_URL"];
    expect(getStrapiUrl()).toBeNull();
    process.env["STRAPI_URL"] = "   ";
    expect(getStrapiUrl()).toBeNull();
  });

  it("normalizes trailing slashes", () => {
    process.env["STRAPI_URL"] = "http://localhost:1337/";
    expect(getStrapiUrl()).toBe("http://localhost:1337");
    process.env["STRAPI_URL"] = "http://localhost:1337///";
    expect(getStrapiUrl()).toBe("http://localhost:1337");
  });
});
