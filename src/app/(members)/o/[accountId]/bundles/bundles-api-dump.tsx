"use client";

import {
  isAccountRenderDetailGatewayRedirect,
  useAccountRenderDetail,
} from "@/lib/api/hooks/account/useAccountRenderDetail";
import {
  isAccountRendersGatewayRedirect,
  useAccountRenders,
} from "@/lib/api/hooks/account/useAccountRenders";
import {
  isAccountRenderTokenGatewayRedirect,
  useAccountRenderToken,
} from "@/lib/api/hooks/account/useAccountRenderToken";
import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";

import { DumpBlock, jsonStringifyRedactingToken } from "../dashboard/temp-data-drilling/dump-block";

export function BundlesApiDump({ accountId }: { accountId: string }) {
  const scheduler = useAccountScheduler(accountId);
  const renderToken = useAccountRenderToken(accountId);
  const renders = useAccountRenders(accountId, { page: 1, pageSize: 25 });

  const listData =
    renders.data && !isAccountRendersGatewayRedirect(renders.data) ? renders.data.data : null;
  const firstRenderId = listData?.renders[0]?.id;
  const phase8RenderId = firstRenderId != null ? String(firstRenderId) : "";

  const renderDetail = useAccountRenderDetail(accountId, phase8RenderId, {
    enabled: Boolean(accountId && phase8RenderId),
  });

  const schedulerBody =
    scheduler.data && !isAccountSchedulerGatewayRedirect(scheduler.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(scheduler.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const renderTokenBody =
    renderToken.data && !isAccountRenderTokenGatewayRedirect(renderToken.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {jsonStringifyRedactingToken(renderToken.data)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const rendersBody =
    renders.data && !isAccountRendersGatewayRedirect(renders.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(renders.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const renderDetailBody =
    listData !== null && !phase8RenderId ? (
      <p className="text-muted-foreground text-sm" role="status">
        No renders on page 1 — Phase 8 detail request skipped.
      </p>
    ) : renderDetail.data && !isAccountRenderDetailGatewayRedirect(renderDetail.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(renderDetail.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  return (
    <div className="grid gap-8">
      <DumpBlock
        title="Phase 5 — GET /api/accounts/:id/scheduler"
        isPending={scheduler.isPending}
        isError={scheduler.isError}
        error={scheduler.error instanceof Error ? scheduler.error : null}
        refetch={() => void scheduler.refetch()}
        emptyMessage=""
      >
        {schedulerBody}
      </DumpBlock>

      <DumpBlock
        title="Phase 6 — GET /api/accounts/:id/render-token (token values redacted in dump)"
        isPending={renderToken.isPending}
        isError={renderToken.isError}
        error={renderToken.error instanceof Error ? renderToken.error : null}
        refetch={() => void renderToken.refetch()}
        emptyMessage=""
      >
        {renderTokenBody}
      </DumpBlock>

      <DumpBlock
        title="Phase 7 — GET /api/accounts/:id/renders (page 1, pageSize 25)"
        isPending={renders.isPending}
        isError={renders.isError}
        error={renders.error instanceof Error ? renders.error : null}
        refetch={() => void renders.refetch()}
        emptyMessage=""
      >
        {rendersBody}
      </DumpBlock>

      <DumpBlock
        title={`Phase 8 — GET /api/accounts/:id/renders/:renderId (first render on page 1${phase8RenderId ? `, id ${phase8RenderId}` : ""})`}
        isPending={renders.isPending || renderDetail.isPending}
        isError={renderDetail.isError}
        error={renderDetail.error instanceof Error ? renderDetail.error : null}
        refetch={() => {
          void renders.refetch();
          void renderDetail.refetch();
        }}
        emptyMessage=""
      >
        {renderDetailBody}
      </DumpBlock>
    </div>
  );
}
