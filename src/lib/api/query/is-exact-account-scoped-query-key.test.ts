import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearDeletedAccountPersistedState,
  isExactAccountScopedQueryKey,
  removeExactAccountScopedQueries,
} from "./is-exact-account-scoped-query-key";
import { queryKeys } from "./query-keys";

const ACCOUNT_A = "123";
const ACCOUNT_B = "456";

describe("isExactAccountScopedQueryKey", () => {
  it("matches known account / season-hub / ui picker keys for the exact id only", () => {
    expect(isExactAccountScopedQueryKey(queryKeys.account.billing(ACCOUNT_A), ACCOUNT_A)).toBe(
      true,
    );
    expect(isExactAccountScopedQueryKey(queryKeys.account.scheduler(ACCOUNT_A), ACCOUNT_A)).toBe(
      true,
    );
    expect(
      isExactAccountScopedQueryKey(queryKeys.account.renderDetail(ACCOUNT_A, "999"), ACCOUNT_A),
    ).toBe(true);
    expect(isExactAccountScopedQueryKey(queryKeys.seasonHub.recon(ACCOUNT_A), ACCOUNT_A)).toBe(
      true,
    );
    expect(
      isExactAccountScopedQueryKey(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A), ACCOUNT_A),
    ).toBe(true);
  });

  it("does not match other-account keys, user-scoped me, or shared catalogues", () => {
    expect(isExactAccountScopedQueryKey(queryKeys.account.billing(ACCOUNT_B), ACCOUNT_A)).toBe(
      false,
    );
    expect(isExactAccountScopedQueryKey(queryKeys.account.me, ACCOUNT_A)).toBe(false);
    expect(isExactAccountScopedQueryKey(queryKeys.auth.me, ACCOUNT_A)).toBe(false);
    expect(
      isExactAccountScopedQueryKey(queryKeys.account.templateCategoriesListForSelection, ACCOUNT_A),
    ).toBe(false);
    expect(isExactAccountScopedQueryKey(queryKeys.assets.listForSelection, ACCOUNT_A)).toBe(false);
  });

  it("does not treat a nested resource id as the account id", () => {
    expect(
      isExactAccountScopedQueryKey(queryKeys.account.renderDetail(ACCOUNT_B, ACCOUNT_A), ACCOUNT_A),
    ).toBe(false);
    expect(
      isExactAccountScopedQueryKey(
        queryKeys.seasonHub.competition(ACCOUNT_B, ACCOUNT_A),
        ACCOUNT_A,
      ),
    ).toBe(false);
  });
});

describe("removeExactAccountScopedQueries", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes every seeded A entry and preserves B, me, and shared catalogues", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.account.billing(ACCOUNT_A), { a: "billing" });
    queryClient.setQueryData(queryKeys.account.scheduler(ACCOUNT_A), { a: "scheduler" });
    queryClient.setQueryData(queryKeys.account.notifications(ACCOUNT_A), { a: "notifications" });
    queryClient.setQueryData(queryKeys.account.mediaLibrary(ACCOUNT_A), { a: "media" });
    queryClient.setQueryData(queryKeys.account.sponsors(ACCOUNT_A), { a: "sponsors" });
    queryClient.setQueryData(queryKeys.account.renders(ACCOUNT_A), { a: "renders" });
    queryClient.setQueryData(queryKeys.account.analyticsOverview(ACCOUNT_A), { a: "analytics" });
    queryClient.setQueryData(queryKeys.account.onboardingState(ACCOUNT_A), { a: "onboarding" });
    queryClient.setQueryData(queryKeys.account.branding(ACCOUNT_A), { a: "branding" });
    queryClient.setQueryData(queryKeys.seasonHub.recon(ACCOUNT_A), { a: "season" });
    queryClient.setQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A), 11);
    queryClient.setQueryData(queryKeys.ui.templateCategoryPickerSelectedId(ACCOUNT_A), 12);

    queryClient.setQueryData(queryKeys.account.billing(ACCOUNT_B), { b: "billing" });
    queryClient.setQueryData(queryKeys.account.scheduler(ACCOUNT_B), { b: "scheduler" });
    queryClient.setQueryData(queryKeys.seasonHub.recon(ACCOUNT_B), { b: "season" });
    queryClient.setQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_B), 22);
    queryClient.setQueryData(queryKeys.account.me, { data: { accounts: [{ id: 123 }] } });
    queryClient.setQueryData(queryKeys.auth.me, { id: 1 });
    queryClient.setQueryData(queryKeys.account.templateCategoriesListForSelection, { cats: true });
    queryClient.setQueryData(queryKeys.assets.listForSelection, { assets: true });

    await removeExactAccountScopedQueries(queryClient, ACCOUNT_A);

    expect(queryClient.getQueryData(queryKeys.account.billing(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.scheduler(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.notifications(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.mediaLibrary(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.sponsors(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.renders(ACCOUNT_A))).toBeUndefined();
    expect(
      queryClient.getQueryData(queryKeys.account.analyticsOverview(ACCOUNT_A)),
    ).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.onboardingState(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.branding(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.seasonHub.recon(ACCOUNT_A))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A))).toBeUndefined();
    expect(
      queryClient.getQueryData(queryKeys.ui.templateCategoryPickerSelectedId(ACCOUNT_A)),
    ).toBeUndefined();

    expect(queryClient.getQueryData(queryKeys.account.billing(ACCOUNT_B))).toEqual({
      b: "billing",
    });
    expect(queryClient.getQueryData(queryKeys.account.scheduler(ACCOUNT_B))).toEqual({
      b: "scheduler",
    });
    expect(queryClient.getQueryData(queryKeys.seasonHub.recon(ACCOUNT_B))).toEqual({ b: "season" });
    expect(queryClient.getQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_B))).toBe(22);
    expect(queryClient.getQueryData(queryKeys.account.me)).toEqual({
      data: { accounts: [{ id: 123 }] },
    });
    expect(queryClient.getQueryData(queryKeys.auth.me)).toEqual({ id: 1 });
    expect(queryClient.getQueryData(queryKeys.account.templateCategoriesListForSelection)).toEqual({
      cats: true,
    });
    expect(queryClient.getQueryData(queryKeys.assets.listForSelection)).toEqual({ assets: true });
  });
});

describe("clearDeletedAccountPersistedState", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes only the deleted account's manage-sponsors session key", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        removeItem: (key: string) => {
          store.delete(key);
        },
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    });
    store.set(`manage-sponsors:${ACCOUNT_A}:local-sponsors`, "[{}]");
    store.set(`manage-sponsors:${ACCOUNT_B}:local-sponsors`, "[{}]");

    clearDeletedAccountPersistedState(ACCOUNT_A);

    expect(store.has(`manage-sponsors:${ACCOUNT_A}:local-sponsors`)).toBe(false);
    expect(store.has(`manage-sponsors:${ACCOUNT_B}:local-sponsors`)).toBe(true);
  });
});
