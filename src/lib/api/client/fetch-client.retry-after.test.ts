import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./api-error";
import { apiRequest } from "./fetch-client";

describe("apiRequest Retry-After", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("attaches retryAfterSeconds from Retry-After on error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "ACCOUNT_CREATE_BUSY",
              message: "Account creation is busy. Please retry.",
            },
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "1",
            },
          },
        ),
      ),
    );

    try {
      await apiRequest("/api/account/first", { method: "POST", body: {} });
      expect.unreachable("expected ApiError");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.status).toBe(503);
        expect(error.retryAfterSeconds).toBe(1);
        expect(error.details).toEqual({
          error: {
            code: "ACCOUNT_CREATE_BUSY",
            message: "Account creation is busy. Please retry.",
          },
        });
      }
    }
  });
});
