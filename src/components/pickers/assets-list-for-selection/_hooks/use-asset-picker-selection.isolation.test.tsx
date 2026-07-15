import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAssetPickerSelection } from "@/components/pickers/assets-list-for-selection";
import { queryKeys } from "@/lib/api/query/query-keys";

import type { ReactNode } from "react";

const ACCOUNT_A = "123";
const ACCOUNT_B = "456";

describe("useAssetPickerSelection account isolation", () => {
  it("setting selection for account A does not appear under account B", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    function wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    }

    const { result: resultA } = renderHook(() => useAssetPickerSelection(ACCOUNT_A), { wrapper });
    renderHook(() => useAssetPickerSelection(ACCOUNT_B), { wrapper });

    act(() => {
      resultA.current.setSelectedId("asset-from-a");
    });

    expect(client.getQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A))).toBe("asset-from-a");
    expect(client.getQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_B))).toBeUndefined();
  });

  it("does not write when setSelectedId is called with the same value", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    function wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useAssetPickerSelection(ACCOUNT_A), { wrapper });

    act(() => {
      result.current.setSelectedId("asset-1");
    });

    let notifications = 0;
    const unsubscribe = client.getQueryCache().subscribe(() => {
      notifications += 1;
    });

    act(() => {
      result.current.setSelectedId("asset-1");
      result.current.setSelectedId("asset-1");
    });
    expect(notifications).toBe(0);

    act(() => {
      result.current.setSelectedId(null);
    });
    const afterChange = notifications;
    expect(afterChange).toBeGreaterThan(0);

    act(() => {
      result.current.setSelectedId(null);
      result.current.setSelectedId(undefined);
    });
    expect(notifications).toBe(afterChange);

    unsubscribe();
    expect(client.getQueryData(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A))).toBeNull();
  });
});
