"use client";

import {
  isAllTemplateOptionsGatewayRedirect,
  type AllTemplateOptionsQueryResult,
} from "@/lib/api/hooks/account/useAllTemplateOptions";

import { DumpBlock, jsonStringifyRedactingToken } from "../dashboard/temp-data-drilling/dump-block";

import type { AllTemplateOptionsData } from "@/types/api/account";
import type { UseQueryResult } from "@tanstack/react-query";

function summarizeCatalog(data: AllTemplateOptionsData): string {
  const keys: (keyof AllTemplateOptionsData)[] = [
    "categories",
    "modes",
    "palettes",
    "gradients",
    "images",
    "noises",
    "particles",
    "patterns",
    "textures",
    "videos",
  ];
  const parts = keys.map((k) => {
    const v = data[k];
    const n = Array.isArray(v) ? v.length : 0;
    return `${k}: ${n}`;
  });
  const sel =
    data.currentSelection === null ? "currentSelection: null" : "currentSelection: object";
  return `${parts.join(" · ")} · ${sel}`;
}

export function AllTemplateOptionsDump({
  catalogQuery,
  templateOptionIdUsed,
}: {
  catalogQuery: UseQueryResult<AllTemplateOptionsQueryResult, Error>;
  templateOptionIdUsed: number | null;
}) {
  const q = catalogQuery;

  const body =
    q.data && !isAllTemplateOptionsGatewayRedirect(q.data) ? (
      <div className="grid gap-2">
        <p className="text-muted-foreground text-xs" role="status">
          Query param{" "}
          <code className="bg-muted rounded px-1 py-0.5">
            templateOptionId=
            {templateOptionIdUsed ?? "(omitted)"}
          </code>
        </p>
        <p className="text-muted-foreground text-xs" role="status">
          {summarizeCatalog(q.data.data)}
        </p>
        <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {jsonStringifyRedactingToken(q.data)}
        </pre>
      </div>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  return (
    <DumpBlock
      title="GET /api/accounts/:id/all-template-options (full catalog + optional currentSelection)"
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
