"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountGradeOrderingGatewayRedirect,
  useAccountGradeOrdering,
} from "@/lib/api/hooks/account/useAccountGradeOrdering";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { GradeOrderingWorkspace } from "./_components/grade-ordering-workspace";

import type { GradeOrderingGetParams } from "@/types/api/grade-ordering";

function resolveOrgParams(
  accountType: number | null,
  organisationId: number | undefined,
): GradeOrderingGetParams | null {
  if (!organisationId || !Number.isFinite(organisationId)) return null;
  if (accountType === CLUB_ACCOUNT_TYPE_ID) {
    return { organisationType: "club", organisationId };
  }
  if (accountType !== null) {
    return { organisationType: "association", organisationId };
  }
  return null;
}

export function SortOrderContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);

  const orgQuery = useAccountOrganisationContext(accountId, { enabled: segmentOk });

  const orgParams = useMemo(() => {
    if (
      !orgQuery.isSuccess ||
      !orgQuery.data ||
      isAccountOrganisationContextGatewayRedirect(orgQuery.data)
    ) {
      return null;
    }
    const { account_type, accountOrganisationDetails } = orgQuery.data.data;
    return resolveOrgParams(account_type, accountOrganisationDetails?.id);
  }, [orgQuery.isSuccess, orgQuery.data]);

  const orderingQuery = useAccountGradeOrdering(accountId, orgParams, {
    enabled: segmentOk && orgParams !== null,
  });

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk || !orgQuery.isSuccess || !orgQuery.data || redirectingRef.current) return;
    if (!isAccountOrganisationContextGatewayRedirect(orgQuery.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.organisationContext(accountId),
    });
    router.replace(selectOrganisationUrlWithReason(orgQuery.data.reason));
  }, [orgQuery.isSuccess, orgQuery.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk || !orderingQuery.isSuccess || !orderingQuery.data || redirectingRef.current) {
      return;
    }
    if (!isAccountGradeOrderingGatewayRedirect(orderingQuery.data)) return;
    redirectingRef.current = true;
    if (orgParams) {
      void queryClient.removeQueries({
        queryKey: queryKeys.account.gradeOrdering(
          accountId,
          orgParams.organisationType,
          orgParams.organisationId,
        ),
      });
    }
    router.replace(selectOrganisationUrlWithReason(orderingQuery.data.reason));
  }, [
    orderingQuery.isSuccess,
    orderingQuery.data,
    accountId,
    orgParams,
    queryClient,
    router,
    segmentOk,
  ]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (orgQuery.isPending || (orgParams !== null && orderingQuery.isPending)) {
    return <BrandedLoader label="Loading grade order" />;
  }

  if (orgQuery.isError) {
    const err = orgQuery.error;
    return (
      <ErrorState
        title="Could not load organisation"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void orgQuery.refetch()}
      />
    );
  }

  if (
    orgQuery.isSuccess &&
    orgQuery.data &&
    isAccountOrganisationContextGatewayRedirect(orgQuery.data)
  ) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (!orgParams) {
    return (
      <EmptyState
        title="Organisation not linked"
        description="Link a club or association to this account before setting grade order."
      />
    );
  }

  if (orderingQuery.isError) {
    const err = orderingQuery.error;
    return (
      <ErrorState
        title="Could not load grade order"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void orderingQuery.refetch()}
      />
    );
  }

  if (
    !orderingQuery.isSuccess ||
    !orderingQuery.data ||
    isAccountGradeOrderingGatewayRedirect(orderingQuery.data)
  ) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (orderingQuery.data.data.groups.length === 0) {
    return (
      <EmptyState
        title="No grades to order"
        description="Published grades will appear here when they are reachable for this organisation."
      />
    );
  }

  return (
    <GradeOrderingWorkspace
      accountId={accountId}
      orgParams={orgParams}
      canonicalData={orderingQuery.data.data}
    />
  );
}
