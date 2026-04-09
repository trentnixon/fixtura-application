"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountMediaLibraryGatewayRedirect,
  useAccountMediaLibrary,
} from "@/lib/api/hooks/account/useAccountMediaLibrary";
import {
  isAccountMediaLibraryItemGatewayRedirect,
  useAccountMediaLibraryItem,
} from "@/lib/api/hooks/account/useAccountMediaLibraryItem";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { MediaGalleryEmpty } from "./_components/media-gallery-empty";
import { MediaGalleryFeatured } from "./_components/media-gallery-featured";
import { MediaGalleryGrid } from "./_components/media-gallery-grid";
import { MediaGalleryRedirecting } from "./_components/media-gallery-redirecting";

export function MediaGalleryContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountMediaLibrary(accountId, { enabled: segmentOk });

  const listPayload =
    q.isSuccess && q.data && !isAccountMediaLibraryGatewayRedirect(q.data) ? q.data : null;
  const firstMediaId = listPayload?.data.items[0]?.id;
  const mediaIdStr = firstMediaId != null ? String(firstMediaId) : "";
  const itemQ = useAccountMediaLibraryItem(accountId, mediaIdStr, {
    enabled: segmentOk && firstMediaId != null,
  });

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!q.isSuccess || !q.data || redirectingRef.current) return;
    if (!isAccountMediaLibraryGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.mediaLibrary(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk || !mediaIdStr) return;
    if (!itemQ.isSuccess || !itemQ.data || redirectingRef.current) return;
    if (!isAccountMediaLibraryItemGatewayRedirect(itemQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.mediaLibraryItem(accountId, mediaIdStr),
    });
    router.replace(selectOrganisationUrlWithReason(itemQ.data.reason));
  }, [itemQ.isSuccess, itemQ.data, accountId, mediaIdStr, queryClient, router, segmentOk]);

  if (!segmentOk) {
    return <MediaGalleryRedirecting />;
  }

  if (q.isPending) {
    return <BrandedLoader label="Loading media gallery" />;
  }

  if (q.isSuccess && q.data && isAccountMediaLibraryGatewayRedirect(q.data)) {
    return <MediaGalleryRedirecting />;
  }

  if (
    mediaIdStr &&
    itemQ.isSuccess &&
    itemQ.data &&
    isAccountMediaLibraryItemGatewayRedirect(itemQ.data)
  ) {
    return <MediaGalleryRedirecting />;
  }

  if (q.isError) {
    const err = q.error;
    return (
      <ErrorState
        title="Could not load media gallery"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || !q.data || isAccountMediaLibraryGatewayRedirect(q.data)) {
    return null;
  }

  const items = q.data.data.items;

  if (items.length === 0) {
    return <MediaGalleryEmpty />;
  }

  const featuredItem =
    itemQ.isSuccess && itemQ.data && !isAccountMediaLibraryItemGatewayRedirect(itemQ.data)
      ? itemQ.data.data
      : null;
  const gridItems = featuredItem ? items.filter((row) => row.id !== featuredItem.id) : items;

  return (
    <div className="grid gap-8">
      <MediaGalleryGrid items={gridItems} />

      {firstMediaId != null ? (
        <MediaGalleryFeatured
          isPending={itemQ.isPending}
          isError={itemQ.isError}
          error={itemQ.error}
          onRetry={() => void itemQ.refetch()}
          featuredItem={featuredItem}
        />
      ) : null}
    </div>
  );
}
