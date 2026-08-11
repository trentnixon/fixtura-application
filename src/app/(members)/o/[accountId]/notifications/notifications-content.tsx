"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountNotificationsGatewayRedirect,
  useAccountNotifications,
} from "@/lib/api/hooks/account/useAccountNotifications";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { NotificationsForm } from "./_components/notifications-form";

/**
 * `/o/[accountId]/notifications` read path: **`GET /api/accounts/:accountId/notifications`**.
 */
export function NotificationsContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const notificationsQ = useAccountNotifications(accountId, { enabled: segmentOk });

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk || !notificationsQ.isSuccess || !notificationsQ.data || redirectingRef.current) {
      return;
    }
    if (!isAccountNotificationsGatewayRedirect(notificationsQ.data)) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(notificationsQ.data.reason));
  }, [segmentOk, notificationsQ.isSuccess, notificationsQ.data, router]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (notificationsQ.isPending) {
    return <BrandedLoader label="Loading notifications" />;
  }

  if (notificationsQ.isError) {
    const err = notificationsQ.error;
    return (
      <ErrorState
        title="Could not load notifications"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void notificationsQ.refetch()}
      />
    );
  }

  if (!notificationsQ.isSuccess || !notificationsQ.data) {
    return null;
  }

  if (isAccountNotificationsGatewayRedirect(notificationsQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  return <NotificationsForm accountId={accountId} data={notificationsQ.data.data} />;
}
