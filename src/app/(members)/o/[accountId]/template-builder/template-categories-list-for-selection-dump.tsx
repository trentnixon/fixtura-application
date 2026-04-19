"use client";

import { DumpBlock, jsonStringifyRedactingToken } from "../dashboard/temp-data-drilling/dump-block";

import type { TemplateCategoriesForSelectionResponse } from "@/types/api/account";
import type { UseQueryResult } from "@tanstack/react-query";

export function TemplateCategoriesListForSelectionDump({
  query,
}: {
  query: UseQueryResult<TemplateCategoriesForSelectionResponse, Error>;
}) {
  const q = query;

  const body =
    q.data !== undefined ? (
      <div className="grid gap-2">
        <p className="text-muted-foreground text-xs" role="status">
          categories: {Array.isArray(q.data.data) ? q.data.data.length : 0} (includes private rows)
        </p>
        <pre className="border-border max-h-[min(40vh,24rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {jsonStringifyRedactingToken(q.data)}
        </pre>
      </div>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload.
      </p>
    );

  return (
    <DumpBlock
      title="GET /api/account/template-categories/list-for-selection (live categories incl. private)"
      isPending={q.isPending}
      isError={q.isError}
      error={q.error instanceof Error ? q.error : null}
      refetch={() => void q.refetch()}
      emptyMessage=""
    >
      {body}
    </DumpBlock>
  );
}
