import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackCardSoft } from "@/components/ui/feedback-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { captureEvent } from "@/lib/analytics";
import { buildBundlesHubRenderGroupUrl } from "@/lib/config/bundles-hub";

import { BUNDLES_RENDER_DETAIL_COPY } from "../_consts/render-detail";
import { groupRenderDownloadsByCategory } from "../_utils/group-render-downloads-by-category";

import type { AccountRenderDetail } from "@/types/api/account";

function formatGroupAssetCount(count: number): string {
  if (count === 1) return BUNDLES_RENDER_DETAIL_COPY.downloadsAssetCountSingular;
  return BUNDLES_RENDER_DETAIL_COPY.downloadsAssetCountPlural.replace("{count}", String(count));
}

export function BundlesRenderDownloadsPanel({
  accountId,
  sport,
  render,
}: {
  accountId: string;
  sport: string | null;
  render: AccountRenderDetail;
}) {
  const downloads = useMemo(() => render.downloads ?? [], [render.downloads]);
  const groups = useMemo(() => groupRenderDownloadsByCategory(downloads), [downloads]);

  if (render.downloads_count === 0 || downloads.length === 0) {
    return (
      <FeedbackCardSoft
        kind="info"
        label={BUNDLES_RENDER_DETAIL_COPY.feedbackInfoLabel}
        title={BUNDLES_RENDER_DETAIL_COPY.downloadsEmptyTitle}
        description={BUNDLES_RENDER_DETAIL_COPY.downloadsEmptyBody}
      />
    );
  }

  if (groups.length === 0) {
    return (
      <FeedbackCardSoft
        kind="info"
        label={BUNDLES_RENDER_DETAIL_COPY.feedbackInfoLabel}
        title={BUNDLES_RENDER_DETAIL_COPY.downloadsNoGroupsTitle}
        description={BUNDLES_RENDER_DETAIL_COPY.downloadsNoGroupsBody}
      />
    );
  }

  return (
    <div className="border-primary/10 overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary-950 hover:bg-primary-950 border-b border-white/15">
              <TableHead className="text-white/90">
                {BUNDLES_RENDER_DETAIL_COPY.downloadsColumnCompetition}
              </TableHead>
              <TableHead className="text-white/90">
                {BUNDLES_RENDER_DETAIL_COPY.downloadsColumnAssets}
              </TableHead>
              <TableHead className="text-right text-white/90">
                {BUNDLES_RENDER_DETAIL_COPY.downloadsColumnAction}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => {
              const hubHref = buildBundlesHubRenderGroupUrl(
                accountId,
                sport,
                render.id,
                group.groupingCategory,
              );

              return (
                <TableRow
                  key={group.groupingCategory}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="align-top font-semibold">
                    <span className="block truncate" title={group.groupingCategory}>
                      {group.groupingCategory}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground align-top text-sm whitespace-nowrap tabular-nums">
                    {formatGroupAssetCount(group.assetCount)}
                  </TableCell>
                  <TableCell className="text-right align-top">
                    {hubHref ? (
                      <Button variant="accent" size="sm" asChild>
                        <a
                          href={hubHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            captureEvent("hub_opened", {
                              accountId,
                              renderId: render.id,
                              groupingCategory: group.groupingCategory,
                              source: "app_bundles_downloads",
                            });
                          }}
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                          {BUNDLES_RENDER_DETAIL_COPY.downloadsViewAction}
                        </a>
                      </Button>
                    ) : group.fallbackUrl ? (
                      <Button variant="brandPrimaryOutline" size="sm" asChild>
                        <a href={group.fallbackUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-3.5" aria-hidden />
                          {BUNDLES_RENDER_DETAIL_COPY.openAssetFallbackAction}
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
