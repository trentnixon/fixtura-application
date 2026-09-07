import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAccountPreviewMediaSelection } from "./use-account-preview-media-selection";

import type { AccountMediaLibraryItem } from "@/types/api/account";
import type { ReactNode } from "react";

function mediaItem(id: number): AccountMediaLibraryItem {
  return {
    id,
    title: `Photo ${id}`,
    isActive: true,
    tags: [],
    ageGroup: "Both",
    assetTypes: ["ALL"],
    markerPosition: [],
    image: {
      id,
      url: `https://cdn.example/${id}.jpg`,
      width: 100,
      height: 100,
      mime: "image/jpeg",
    },
  };
}

describe("account preview sample photo", () => {
  it("retains the builder selection on dashboard mount and isolates accounts", async () => {
    const client = new QueryClient();
    const items = [mediaItem(1), mediaItem(2)];
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const builder = renderHook(() => useAccountPreviewMediaSelection("10", items), { wrapper });
    expect(builder.result.current.selectedItem?.id).toBe(1);
    act(() => builder.result.current.selectMedia(2));
    await waitFor(() => expect(builder.result.current.selectedItem?.id).toBe(2));
    builder.unmount();

    const dashboard = renderHook(
      ({ accountId, media }) => useAccountPreviewMediaSelection(accountId, media),
      { wrapper, initialProps: { accountId: "10", media: items } },
    );
    expect(dashboard.result.current.selectedItem?.id).toBe(2);
    dashboard.rerender({ accountId: "20", media: items });
    expect(dashboard.result.current.selectedItem?.id).toBe(1);
    dashboard.rerender({ accountId: "10", media: [mediaItem(1)] });
    expect(dashboard.result.current.selectedItem?.id).toBe(1);
    dashboard.rerender({ accountId: "10", media: [] });
    expect(dashboard.result.current.selectedItem).toBeNull();
    dashboard.unmount();
    client.clear();
  });
});
