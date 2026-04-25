import { afterEach, describe, expect, it } from "vitest";

import { spamSuppression } from "./spam-suppression";

describe("spamSuppression", () => {
  const ip = "127.0.0.1";
  const email = "person@example.com";

  afterEach(() => {
    spamSuppression.resetForTests();
  });

  it("does not let forgot-password attempts trigger login rate limiting", () => {
    spamSuppression.recordForgotPasswordAttempt(ip, email);
    spamSuppression.recordForgotPasswordAttempt(ip, email);
    spamSuppression.recordForgotPasswordAttempt(ip, email);

    expect(spamSuppression.checkLogin(ip, email)).toEqual({
      allowed: true,
      delayMs: 0,
    });
  });

  it("does not let failed login attempts trigger forgot-password rate limiting", () => {
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);

    expect(spamSuppression.checkForgotPassword(ip, email)).toEqual({ allowed: true });
  });

  it("still rate limits login failures on the login channel", () => {
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);
    spamSuppression.recordFailure(ip, email);

    expect(spamSuppression.checkLogin(ip, email)).toMatchObject({
      allowed: false,
      reason: "ip_rate_limit",
    });
  });
});
