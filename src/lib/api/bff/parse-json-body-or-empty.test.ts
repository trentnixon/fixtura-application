import { describe, expect, it } from "vitest";

import { parseJsonBodyOrEmpty } from "./parse-json-body-or-empty";

describe("parseJsonBodyOrEmpty", () => {
  it("returns empty object when content-type is not JSON", async () => {
    const result = await parseJsonBodyOrEmpty(new Request("http://localhost"));
    expect(result).toEqual({ ok: true, body: {} });
  });

  it("returns empty object for empty JSON body", async () => {
    const result = await parseJsonBodyOrEmpty(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "",
      }),
    );
    expect(result).toEqual({ ok: true, body: {} });
  });

  it("parses valid JSON body", async () => {
    const body = { sport: "cricket" };
    const result = await parseJsonBodyOrEmpty(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    expect(result).toEqual({ ok: true, body });
  });

  it("returns 400 for invalid JSON body", async () => {
    const result = await parseJsonBodyOrEmpty(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      expect(await result.response.json()).toEqual({ error: "Invalid JSON body" });
    }
  });
});
