"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import type { AccountSponsorDto } from "@/types/api/account";

function formatDateLabel(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function SponsorCard({ sponsor }: { sponsor: AccountSponsorDto }) {
  return (
    <li className="border-border bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        <div className="bg-muted flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {sponsor.logo?.url ? (
            <img
              src={sponsor.logo.url}
              alt={sponsor.logo.alternativeText ?? sponsor.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-muted-foreground px-2 text-center text-xs">No logo</span>
          )}
        </div>
        <div className="grid min-w-0 flex-1 gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-brand text-lg leading-tight font-semibold">{sponsor.name}</h2>
            {sponsor.isActive ? (
              <Badge variant="secondary">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
            {sponsor.isPrimary ? <Badge>Primary</Badge> : null}
            {sponsor.isVideo ? <Badge variant="outline">Video</Badge> : null}
            {sponsor.isArticle ? <Badge variant="outline">Article</Badge> : null}
            {sponsor.order != null ? (
              <span className="text-muted-foreground text-xs">Order {sponsor.order}</span>
            ) : null}
          </div>
          {sponsor.tagline ? (
            <p className="text-muted-foreground text-sm leading-snug">{sponsor.tagline}</p>
          ) : null}
          {sponsor.description ? (
            <p className="line-clamp-4 text-sm leading-relaxed">{sponsor.description}</p>
          ) : null}
          <dl className="text-muted-foreground grid gap-1 text-xs">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <dt className="font-medium">Dates</dt>
              <dd>
                {formatDateLabel(sponsor.startDate)} — {formatDateLabel(sponsor.endDate)}
              </dd>
            </div>
            {sponsor.url ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <dt className="font-medium">URL</dt>
                <dd className="min-w-0 truncate">
                  <a
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium underline-offset-4 hover:underline"
                  >
                    {sponsor.url}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {sponsor.sponsorshipAllocations.length > 0 ? (
            <div className="grid gap-1">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Allocations
              </p>
              <ul className="grid gap-2">
                {sponsor.sponsorshipAllocations.map((row) => (
                  <li
                    key={row.id}
                    className="border-border bg-muted/40 rounded border px-2 py-1.5 font-mono text-[11px] leading-relaxed break-all"
                  >
                    <span className="text-muted-foreground mr-2">#{row.id}</span>
                    {row.allocation != null ? JSON.stringify(row.allocation) : "null"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function ManageSponsorsContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSponsors(accountId, { enabled: segmentOk });

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
    if (!isAccountSponsorsGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.sponsors(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isPending) {
    return <BrandedLoader label="Loading sponsors" />;
  }

  if (q.isSuccess && q.data && isAccountSponsorsGatewayRedirect(q.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isError) {
    const err = q.error;
    return (
      <ErrorState
        title="Could not load sponsors"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || !q.data || isAccountSponsorsGatewayRedirect(q.data)) {
    return null;
  }

  const items = q.data.data.items;

  if (items.length === 0) {
    return (
      <div
        className="border-border bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm"
        role="status"
      >
        No published sponsors for this account yet.
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((sponsor) => (
        <SponsorCard key={sponsor.id} sponsor={sponsor} />
      ))}
    </ul>
  );
}
