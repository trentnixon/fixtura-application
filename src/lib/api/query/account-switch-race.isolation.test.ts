import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { cancelOtherAccountQueries } from "./cancel-other-account-queries";
import { queryKeys } from "./query-keys";

const ACCOUNT_A = "123";
const ACCOUNT_B = "456";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("account switch race isolation", () => {
  it("slow account-A fetch cannot publish into account-B cache after switch", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const aFetch = deferred<{ id: string; label: string }>();
    const bData = { id: ACCOUNT_B, label: "B-ready" };

    const aPromise = queryClient.fetchQuery({
      queryKey: queryKeys.account.billing(ACCOUNT_A),
      queryFn: () => aFetch.promise,
    });

    queryClient.setQueryData(queryKeys.account.billing(ACCOUNT_B), bData);
    await cancelOtherAccountQueries(queryClient, ACCOUNT_B);

    aFetch.resolve({ id: ACCOUNT_A, label: "A-late" });
    await expect(aPromise).rejects.toThrow();

    expect(queryClient.getQueryData(queryKeys.account.billing(ACCOUNT_B))).toEqual(bData);
    expect(queryClient.getQueryData(queryKeys.account.billing(ACCOUNT_A))).toBeUndefined();
  });

  it("cancels a pending scheduler poll for the previous account on switch", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const aPoll = deferred<{ tick: number }>();
    const pollFn = vi.fn(() => aPoll.promise);

    const aPromise = queryClient.fetchQuery({
      queryKey: queryKeys.account.scheduler(ACCOUNT_A),
      queryFn: pollFn,
    });

    queryClient.setQueryData(queryKeys.account.scheduler(ACCOUNT_B), { tick: 2 });
    await cancelOtherAccountQueries(queryClient, ACCOUNT_B);

    aPoll.resolve({ tick: 1 });
    await expect(aPromise).rejects.toThrow();

    expect(pollFn).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(queryKeys.account.scheduler(ACCOUNT_B))).toEqual({ tick: 2 });
    expect(queryClient.getQueryData(queryKeys.account.scheduler(ACCOUNT_A))).toBeUndefined();
  });
});

/* Optimistic server-mutation rollback: not applicable.
 * Audited account mutations do not use onMutate / optimistic setQueryData rollback.
 * Client-only picker selection uses account-scoped keys (picker isolation tests).
 */
