import Link from "next/link";

import { TypographyBodySmall } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { FeedbackCardStrong } from "@/components/ui/feedback-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { captureUserAction } from "@/lib/analytics";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BundlesRenderDateRangeFilter } from "./bundles-render-date-range-filter";
import { BundlesRenderListPagination } from "./bundles-render-list-pagination";
import { BundlesRenderListSortableHead } from "./bundles-render-list-sortable-head";
import { BundlesRenderStatusPill } from "./bundles-render-status-pill";
import { BUNDLES_RENDERS_LIST_COPY } from "../_consts/renders-list";
import { useBundlesRenderListPanel } from "../_hooks/use-bundles-render-list-panel";
import {
  formatRenderCreatedDate,
  formatRenderCreatedTime,
  formatRenderDaysAgo,
} from "../_utils/format-render-created-at";

function RenderListGridSkeleton() {
  return (
    <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
      <div className="p-4">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function BundlesRenderListPanel({ accountId }: { accountId: string }) {
  const view = useBundlesRenderListPanel(accountId);

  return (
    <section className="grid gap-4">
      {view.kind === "loading" ? <RenderListGridSkeleton /> : null}

      {view.kind === "error" ? (
        <FeedbackCardStrong
          kind="error"
          label={BUNDLES_RENDERS_LIST_COPY.feedbackErrorLabel}
          title={BUNDLES_RENDERS_LIST_COPY.errorTitle}
          description={view.message}
          primaryCta={BUNDLES_RENDERS_LIST_COPY.retryAction}
          onPrimaryAction={view.onRetry}
        />
      ) : null}

      {view.kind === "empty" ? (
        <TypographyBodySmall tone="muted">
          {BUNDLES_RENDERS_LIST_COPY.emptyBody}
        </TypographyBodySmall>
      ) : null}

      {view.kind === "ready" ? (
        <div className="grid gap-3">
          <BundlesRenderDateRangeFilter
            dateRange={view.dateRange}
            onDateRangeChange={view.setDateRange}
            onClear={view.clearFilters}
          />
          <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-950 hover:bg-primary-950 border-b border-white/15">
                    <BundlesRenderListSortableHead
                      label={BUNDLES_RENDERS_LIST_COPY.columnCreated}
                      column="createdAt"
                      activeColumn={view.sortColumn}
                      direction={view.sortDirection}
                      onSort={view.toggleSort}
                      tone="primary"
                    />
                    <TableHead className="text-white/90">
                      {BUNDLES_RENDERS_LIST_COPY.columnDaysAgo}
                    </TableHead>
                    <BundlesRenderListSortableHead
                      label={BUNDLES_RENDERS_LIST_COPY.columnStatus}
                      column="status"
                      activeColumn={view.sortColumn}
                      direction={view.sortDirection}
                      onSort={view.toggleSort}
                      tone="primary"
                    />
                    <TableHead className="text-right text-white/90">
                      {BUNDLES_RENDERS_LIST_COPY.columnAction}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.hasFilterMismatchOnPage ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground h-24 text-center text-sm"
                      >
                        {BUNDLES_RENDERS_LIST_COPY.noMatchesOnPage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    view.displayedRenders.map((render) => {
                      const adminHref = accountScopedRoutes.bundlesRender(accountId, render.id);

                      return (
                        <TableRow
                          key={render.id}
                          className="hover:bg-primary/5 cursor-pointer transition-colors"
                        >
                          <TableCell className="align-top text-sm whitespace-nowrap">
                            <span className="text-foreground block font-semibold">
                              {formatRenderCreatedDate(render.createdAt)}
                            </span>
                            <span className="text-muted-foreground block text-xs font-medium tabular-nums">
                              {formatRenderCreatedTime(render.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground align-top text-sm whitespace-nowrap tabular-nums">
                            {formatRenderDaysAgo(render.createdAt)}
                          </TableCell>
                          <TableCell className="align-top">
                            <BundlesRenderStatusPill status={render.status} />
                          </TableCell>
                          <TableCell className="text-right align-top">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button variant="brandPrimaryOutline" size="sm" asChild>
                                <Link
                                  href={adminHref}
                                  onClick={() =>
                                    captureUserAction("bundles_render_opened", {
                                      accountId,
                                      renderId: render.id,
                                      source: "list_row",
                                    })
                                  }
                                >
                                  {BUNDLES_RENDERS_LIST_COPY.viewOnAdminAction}
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <BundlesRenderListPagination
              page={view.page}
              pagination={view.pagination}
              onPrevious={() => view.setPage(view.page - 1)}
              onNext={() => view.setPage(view.page + 1)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
