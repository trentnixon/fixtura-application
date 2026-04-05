"use client";

import {
  isOrganisationGatewayRedirect,
  useAccountOrganisation,
} from "@/lib/api/hooks/account/useAccountOrganisation";

export function TempOrgDataDump({ accountId }: { accountId: string }) {
  const { data, isPending, isError, error, refetch } = useAccountOrganisation(accountId);

  if (isPending) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Loading organisation data…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-2">
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Could not load organisation data."}
        </p>
        <button
          type="button"
          className="text-primary w-fit text-sm underline"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || isOrganisationGatewayRedirect(data)) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        No organisation payload (redirect or empty). This should not appear after the access
        boundary.
      </p>
    );
  }

  return (
    <pre className="border-border max-h-[min(70vh,48rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
