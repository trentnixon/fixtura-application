"use client";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";

import { BUNDLES_RENDERS_LIST_COPY } from "../_consts/renders-list";
import { paginationResultRange } from "../_utils/pagination-result-range";

import type { AccountRendersPagination } from "@/types/api/account";

type BundlesRenderListPaginationProps = {
  page: number;
  pagination: AccountRendersPagination;
  onPrevious: () => void;
  onNext: () => void;
};

/** `table.grid.pagination` — range summary + previous/next controls. */
export function BundlesRenderListPagination({
  page,
  pagination,
  onPrevious,
  onNext,
}: BundlesRenderListPaginationProps) {
  const range = paginationResultRange({
    page,
    pageSize: pagination.pageSize,
    total: pagination.total,
  });

  const summary = (() => {
    if (!range) return BUNDLES_RENDERS_LIST_COPY.paginationNone;
    if (pagination.total === 1) return BUNDLES_RENDERS_LIST_COPY.paginationSingleResult;
    return (
      <>
        {BUNDLES_RENDERS_LIST_COPY.paginationShowing}{" "}
        <strong>
          {range.start}-{range.end}
        </strong>{" "}
        {BUNDLES_RENDERS_LIST_COPY.paginationOf} <strong>{pagination.total}</strong>{" "}
        {BUNDLES_RENDERS_LIST_COPY.paginationResults}
      </>
    );
  })();

  return (
    <div className="bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t p-4">
      <TypographyMuted className="text-xs">{summary}</TypographyMuted>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-4 text-xs font-bold"
          disabled={page <= 1}
          onClick={onPrevious}
        >
          {BUNDLES_RENDERS_LIST_COPY.paginationPrevious}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-4 text-xs font-bold"
          disabled={page >= pagination.pageCount}
          onClick={onNext}
        >
          {BUNDLES_RENDERS_LIST_COPY.paginationNext}
        </Button>
      </div>
    </div>
  );
}
