"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isAccountMediaLibraryGatewayRedirect,
  useAccountMediaLibrary,
} from "@/lib/api/hooks/account/useAccountMediaLibrary";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { useAssetsListForSelection } from "@/lib/api/hooks/account/useAssetsListForSelection";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { MediaGalleryDeleteDialog } from "./_components/media-gallery-delete-dialog";
import { MediaGalleryEditDialog } from "./_components/media-gallery-edit-dialog";
import { MediaGalleryEmpty } from "./_components/media-gallery-empty";
import { MediaGalleryGrid } from "./_components/media-gallery-grid";
import { MediaGalleryNoResults } from "./_components/media-gallery-no-results";
import { MediaGalleryRedirecting } from "./_components/media-gallery-redirecting";
import {
  MediaGalleryToolbar,
  MediaGalleryFiltersToggle,
} from "./_components/media-gallery-toolbar";
import { MediaGalleryUploadDialog } from "./_components/media-gallery-upload-dialog";
import { useMediaGalleryCategoryConfig } from "./_hooks/use-media-gallery-category-config";
import { buildMediaGalleryCoverage } from "./_utils/media-gallery-coverage";
import {
  buildMediaGalleryOriginalIndexMap,
  filterMediaGalleryItems,
  sortMediaGalleryItems,
} from "./_utils/media-gallery-filter-sort";
import { buildMediaLibraryAssetTypeOptions } from "./_utils/media-gallery-form";
import {
  DEFAULT_MEDIA_GALLERY_QUERY_STATE,
  countActiveMediaGalleryFilters,
  mediaGalleryQueryStateEquals,
  parseMediaGalleryQueryState,
  serializeMediaGalleryQueryState,
} from "./_utils/media-gallery-query-state";

import type { MediaGalleryQueryState, MediaGalleryView } from "./_utils/media-gallery-query-state";
import type { AccountMediaLibraryItem } from "@/types/api/account";

const SEARCH_DEBOUNCE_MS = 250;

export function MediaGalleryContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const searchDebounceRef = useRef<number | null>(null);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountMediaLibrary(accountId, { enabled: segmentOk });
  const organisationQuery = useAccountOrganisationContext(accountId, { enabled: segmentOk });
  const accountSport =
    organisationQuery.data && !isAccountOrganisationContextGatewayRedirect(organisationQuery.data)
      ? organisationQuery.data.data.accountOrganisationDetails?.Sport?.trim() || null
      : null;
  const assetsQuery = useAssetsListForSelection({
    enabled: segmentOk && organisationQuery.isSuccess,
    sport: accountSport,
    catalogueMode: "media-library",
  });
  const hasLibraryItems =
    q.isSuccess && q.data && !isAccountMediaLibraryGatewayRedirect(q.data)
      ? q.data.data.items.length > 0
      : false;
  const categoryConfig = useMediaGalleryCategoryConfig(accountId, {
    enabled: segmentOk && hasLibraryItems,
  });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<AccountMediaLibraryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<AccountMediaLibraryItem | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const items = useMemo(
    () =>
      q.isSuccess && q.data && !isAccountMediaLibraryGatewayRedirect(q.data)
        ? q.data.data.items
        : [],
    [q.data, q.isSuccess],
  );

  const assetTypeOptions = useMemo(() => {
    return buildMediaLibraryAssetTypeOptions(
      assetsQuery.data?.data,
      items.flatMap((item) => item.assetTypes ?? []),
    );
  }, [assetsQuery.data?.data, items]);

  const queryState = useMemo(
    () =>
      parseMediaGalleryQueryState(searchParams, {
        assetTypeOptions,
        categoryConfig,
      }),
    [searchParams, assetTypeOptions, categoryConfig],
  );

  const viewOptions = useMemo(
    (): { value: MediaGalleryView; label: string }[] => [
      { value: "pool", label: "Image pool" },
      { value: "category", label: categoryConfig.viewLabel },
      { value: "asset", label: "By asset type" },
    ],
    [categoryConfig.viewLabel],
  );

  useEffect(() => {
    setSearchDraft(queryState.search);
  }, [queryState.search]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current != null) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const replaceQueryState = useCallback(
    (nextState: MediaGalleryQueryState) => {
      const params = serializeMediaGalleryQueryState(nextState);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  const handleStateChange = useCallback(
    (patch: Partial<MediaGalleryQueryState>) => {
      const nextState = { ...queryState, ...patch };
      if (mediaGalleryQueryStateEquals(queryState, nextState)) return;
      replaceQueryState(nextState);
    },
    [queryState, replaceQueryState],
  );

  const handleSearchDraftChange = useCallback(
    (value: string) => {
      setSearchDraft(value);
      if (searchDebounceRef.current != null) {
        window.clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = window.setTimeout(() => {
        const trimmed = value.trim();
        const nextState = { ...queryState, search: trimmed };
        if (!mediaGalleryQueryStateEquals(queryState, nextState)) {
          replaceQueryState(nextState);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [queryState, replaceQueryState],
  );

  const handleClearFilters = useCallback(() => {
    if (searchDebounceRef.current != null) {
      window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    setSearchDraft("");
    replaceQueryState({
      ...queryState,
      search: "",
      status: DEFAULT_MEDIA_GALLERY_QUERY_STATE.status,
      categoryTargets: [],
      assetTypes: [],
      needsAttention: false,
      needsRecategorisation: false,
    });
  }, [queryState, replaceQueryState]);

  const coverage = useMemo(
    () => buildMediaGalleryCoverage(items, assetTypeOptions, categoryConfig),
    [items, assetTypeOptions, categoryConfig],
  );

  const originalIndexById = useMemo(() => buildMediaGalleryOriginalIndexMap(items), [items]);

  const filteredItems = useMemo(
    () =>
      filterMediaGalleryItems(items, queryState, {
        coverage,
        view: queryState.view,
        categoryConfig,
      }),
    [items, queryState, coverage, categoryConfig],
  );

  const displayItems = useMemo(() => {
    if (queryState.view !== "pool") return filteredItems;
    return sortMediaGalleryItems(filteredItems, queryState.sort, originalIndexById);
  }, [filteredItems, queryState.view, queryState.sort, originalIndexById]);

  if (!segmentOk) {
    return <MediaGalleryRedirecting />;
  }

  if (q.isPending) {
    return <BrandedLoader label="Loading background images" />;
  }

  if (q.isSuccess && q.data && isAccountMediaLibraryGatewayRedirect(q.data)) {
    return <MediaGalleryRedirecting />;
  }

  if (q.isError) {
    const err = q.error;
    return (
      <ErrorState
        title="Could not load background images"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || !q.data || isAccountMediaLibraryGatewayRedirect(q.data)) {
    return null;
  }

  return (
    <>
      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={queryState.view}
              onValueChange={(value) => handleStateChange({ view: value as MediaGalleryView })}
              className="w-full min-w-0 sm:max-w-xl"
            >
              <TabsList className="grid h-auto w-full grid-cols-3 p-1" aria-label="Gallery view">
                {viewOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer text-xs sm:text-sm"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <MediaGalleryFiltersToggle
                open={filtersOpen}
                activeFilterCount={countActiveMediaGalleryFilters(queryState)}
                onOpenChange={setFiltersOpen}
              />
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950"
                onClick={() => setUploadOpen(true)}
              >
                Upload background
              </Button>
            </div>
          </div>
          <MediaGalleryToolbar
            state={queryState}
            searchDraft={searchDraft}
            assetTypeOptions={assetTypeOptions}
            categoryConfig={categoryConfig}
            totalCount={items.length}
            filteredCount={filteredItems.length}
            onSearchDraftChange={handleSearchDraftChange}
            onStateChange={handleStateChange}
            onClearFilters={handleClearFilters}
            filtersOpen={filtersOpen}
            onFiltersOpenChange={setFiltersOpen}
          />
        </div>
      ) : null}

      {items.length === 0 ? (
        <MediaGalleryEmpty onUploadClick={() => setUploadOpen(true)} />
      ) : filteredItems.length === 0 ? (
        <MediaGalleryNoResults onClearFilters={handleClearFilters} />
      ) : (
        <MediaGalleryGrid
          items={displayItems}
          view={queryState.view}
          sort={queryState.sort}
          originalIndexById={originalIndexById}
          assetTypeOptions={assetTypeOptions}
          categoryConfig={categoryConfig}
          coverage={coverage}
          onEdit={setEditItem}
          onDelete={setDeleteItem}
          onAddBackground={() => setUploadOpen(true)}
        />
      )}

      <MediaGalleryUploadDialog
        accountId={accountId}
        accountSport={accountSport}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
      <MediaGalleryEditDialog
        accountId={accountId}
        accountSport={accountSport}
        item={editItem}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      />
      <MediaGalleryDeleteDialog
        accountId={accountId}
        item={deleteItem}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
      />
    </>
  );
}
