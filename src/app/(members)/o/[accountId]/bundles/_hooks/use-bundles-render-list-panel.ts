"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";

import { captureUserAction } from "@/lib/analytics";
import {
  isAccountRendersGatewayRedirect,
  useAccountRenders,
} from "@/lib/api/hooks/account/useAccountRenders";

import { BUNDLES_RENDERS_PAGE_SIZE } from "../_consts/renders-list";
import { resolveBundlesScreenErrorDescription } from "../_utils";
import {
  nextBundlesRenderSort,
  sortBundlesRenders,
  type BundlesRenderSortColumn,
  type BundlesRenderSortDirection,
} from "../_utils/sort-bundles-renders";

import type {
  AccountRenderListRow,
  AccountRendersListParams,
  AccountRendersListData,
  AccountRendersPagination,
} from "@/types/api/account";
import type { DateRange } from "react-day-picker";

export type BundlesRenderListPanelView =
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "empty" }
  | {
      kind: "ready";
      data: AccountRendersListData;
      pagination: AccountRendersPagination;
      page: number;
      setPage: (page: number) => void;
      displayedRenders: AccountRenderListRow[];
      dateRange: DateRange | undefined;
      setDateRange: (range: DateRange | undefined) => void;
      sortColumn: BundlesRenderSortColumn;
      sortDirection: BundlesRenderSortDirection;
      toggleSort: (column: BundlesRenderSortColumn) => void;
      hasActiveFilters: boolean;
      clearFilters: () => void;
      hasFilterMismatchOnPage: boolean;
    };

export function useBundlesRenderListPanel(accountId: string): BundlesRenderListPanelView {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRangeState] = useState<DateRange | undefined>();
  const [sortColumn, setSortColumn] = useState<BundlesRenderSortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<BundlesRenderSortDirection>("desc");

  const from = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
  const hasActiveFilters = Boolean(from || to);
  const renderParams: AccountRendersListParams = {
    page,
    pageSize: BUNDLES_RENDERS_PAGE_SIZE,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  const rendersQuery = useAccountRenders(accountId, renderParams);

  function captureFilterApplied(
    nextSort: { column: BundlesRenderSortColumn; direction: BundlesRenderSortDirection },
    range: DateRange | undefined,
  ) {
    captureUserAction("bundles_filter_applied", {
      accountId,
      sort_column: nextSort.column,
      sort_direction: nextSort.direction,
      has_date_range: Boolean(range?.from || range?.to),
    });
  }

  function setDateRange(range: DateRange | undefined) {
    setDateRangeState(range);
    setPage(1);
    captureFilterApplied({ column: sortColumn, direction: sortDirection }, range);
  }

  const readyPayload = useMemo(() => {
    if (!rendersQuery.isSuccess || !rendersQuery.data) return null;
    if (isAccountRendersGatewayRedirect(rendersQuery.data)) return null;

    const { data } = rendersQuery.data;
    const pagination = data.meta.pagination;
    const displayedRenders = sortBundlesRenders(data.renders, sortColumn, sortDirection);

    return {
      data,
      pagination,
      displayedRenders,
      hasFilterMismatchOnPage: hasActiveFilters && displayedRenders.length === 0,
    };
  }, [hasActiveFilters, rendersQuery.data, rendersQuery.isSuccess, sortColumn, sortDirection]);

  if (rendersQuery.isPending) {
    return { kind: "loading" };
  }

  if (rendersQuery.isError) {
    return {
      kind: "error",
      message: resolveBundlesScreenErrorDescription(rendersQuery.error),
      onRetry: () => void rendersQuery.refetch(),
    };
  }

  if (!rendersQuery.isSuccess || !rendersQuery.data) {
    return { kind: "loading" };
  }

  if (isAccountRendersGatewayRedirect(rendersQuery.data)) {
    return { kind: "empty" };
  }

  const { data } = rendersQuery.data;
  const pagination = data.meta.pagination;

  if (!hasActiveFilters && data.renders.length === 0 && pagination.total === 0) {
    return { kind: "empty" };
  }

  if (!readyPayload) {
    return { kind: "loading" };
  }

  return {
    kind: "ready",
    data,
    pagination,
    page,
    setPage,
    displayedRenders: readyPayload.displayedRenders,
    dateRange,
    setDateRange,
    sortColumn,
    sortDirection,
    toggleSort: (column) => {
      const next = nextBundlesRenderSort({ column: sortColumn, direction: sortDirection }, column);
      setSortColumn(next.column);
      setSortDirection(next.direction);
      captureFilterApplied(next, dateRange);
    },
    hasActiveFilters,
    clearFilters: () => {
      setDateRangeState(undefined);
      setPage(1);
      captureFilterApplied({ column: sortColumn, direction: sortDirection }, undefined);
    },
    hasFilterMismatchOnPage: readyPayload.hasFilterMismatchOnPage,
  };
}
