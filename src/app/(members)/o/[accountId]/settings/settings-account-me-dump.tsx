"use client";

import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";

import { DumpBlock } from "../dashboard/temp-data-drilling/dump-block";

export function SettingsAccountMeDump() {
  const me = useAccountMe();

  const body = me.data ? (
    <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {JSON.stringify(me.data, null, 2)}
    </pre>
  ) : (
    <p className="text-muted-foreground text-sm" role="status">
      No payload.
    </p>
  );

  return (
    <DumpBlock
      title="Phase 1 — GET /api/account/me (bootstrap: user, accountId, accounts[])"
      isPending={me.isPending}
      isError={me.isError}
      error={me.error instanceof Error ? me.error : null}
      refetch={() => void me.refetch()}
      emptyMessage=""
    >
      {body}
    </DumpBlock>
  );
}
