"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { notificationsDataFromMeRowAndScheduler } from "@/features/notifications/me-scheduler-notifications-data";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { NotificationsForm } from "./_components/notifications-form";

import type { AccountSchedulerDocument, AccountSummary } from "@/types/api/account";

function meRowForAccountId(accounts: AccountSummary[] | undefined, accountId: string) {
  return accounts?.find((a) => String(a.id) === accountId || a.id === Number(accountId));
}

/**
 * `/o/[accountId]/notifications` read path: **`queryKeys.account.me`** row (`FirstName`, `DeliveryAddress`) + **`queryKeys.account.scheduler(accountId)`** (`days_of_the_week`). No settings GET; no getAccountNotifications.
 */
export function NotificationsContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const meQ = useAccountMe({ enabled: segmentOk });
  const schedulerQ = useAccountScheduler(accountId, { enabled: segmentOk });

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
    if (!meQ.isSuccess || !meQ.data || redirectingRef.current) return;
    const row = meRowForAccountId(meQ.data.data.accounts, accountId);
    if (row) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, meQ.isSuccess, meQ.data, accountId, router]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (meQ.isPending || schedulerQ.isPending) {
    return <BrandedLoader label="Loading notifications" />;
  }

  if (meQ.isError) {
    const err = meQ.error;
    return (
      <ErrorState
        title="Could not load notifications"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void meQ.refetch()}
      />
    );
  }

  if (!meQ.isSuccess || !meQ.data) {
    return null;
  }

  const meAccountRow = meRowForAccountId(meQ.data.data.accounts, accountId);
  if (!meAccountRow) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (schedulerQ.isError) {
    return (
      <ErrorState
        title="Could not load notifications"
        description={
          schedulerQ.error instanceof Error ? schedulerQ.error.message : AUTH_ERROR_MESSAGES.network
        }
        onRetry={() => void schedulerQ.refetch()}
      />
    );
  }

  if (!schedulerQ.isSuccess || !schedulerQ.data) {
    return null;
  }

  const apiSchedulerDoc: AccountSchedulerDocument | null = (() => {
    if (isAccountSchedulerGatewayRedirect(schedulerQ.data)) return null;
    return schedulerQ.data.data.scheduler;
  })();

  const formData = notificationsDataFromMeRowAndScheduler(meAccountRow, apiSchedulerDoc);

  return <NotificationsForm accountId={accountId} data={formData} />;
}
