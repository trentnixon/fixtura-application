import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import {
  cancelOtherAccountQueries,
  isOtherAccountScopedQueryKey,
} from "./cancel-other-account-queries";
import { queryKeys } from "./query-keys";

const ACCOUNT_A = "123";
const ACCOUNT_B = "456";

describe("isOtherAccountScopedQueryKey", () => {
  it("never matches account.me", () => {
    expect(isOtherAccountScopedQueryKey(queryKeys.account.me, ACCOUNT_A)).toBe(false);
  });

  it("matches other-account billing / branding / season-hub keys", () => {
    expect(isOtherAccountScopedQueryKey(queryKeys.account.billing(ACCOUNT_B), ACCOUNT_A)).toBe(
      true,
    );
    expect(isOtherAccountScopedQueryKey(queryKeys.account.branding(ACCOUNT_B), ACCOUNT_A)).toBe(
      true,
    );
    expect(isOtherAccountScopedQueryKey(queryKeys.seasonHub.recon(ACCOUNT_B), ACCOUNT_A)).toBe(
      true,
    );
  });

  it("does not match current-account keys", () => {
    expect(isOtherAccountScopedQueryKey(queryKeys.account.billing(ACCOUNT_A), ACCOUNT_A)).toBe(
      false,
    );
    expect(
      isOtherAccountScopedQueryKey(queryKeys.account.onboardingState(ACCOUNT_A), ACCOUNT_A),
    ).toBe(false);
  });
});

describe("cancelOtherAccountQueries", () => {
  it("cancels other-account queries and leaves account.me / current-id alone", async () => {
    const queryClient = new QueryClient();
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries");

    await cancelOtherAccountQueries(queryClient, ACCOUNT_A);

    expect(cancelSpy).toHaveBeenCalledTimes(1);
    const arg = cancelSpy.mock.calls[0]?.[0] as {
      predicate: (q: { queryKey: readonly unknown[] }) => boolean;
    };
    expect(arg.predicate({ queryKey: queryKeys.account.me })).toBe(false);
    expect(arg.predicate({ queryKey: queryKeys.account.billing(ACCOUNT_A) })).toBe(false);
    expect(arg.predicate({ queryKey: queryKeys.account.scheduler(ACCOUNT_B) })).toBe(true);
    expect(arg.predicate({ queryKey: queryKeys.seasonHub.stats(ACCOUNT_B) })).toBe(true);
  });
});
