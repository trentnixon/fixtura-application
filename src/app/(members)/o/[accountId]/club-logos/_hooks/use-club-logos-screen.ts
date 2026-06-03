"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useEffect, useRef } from "react";

import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountScopedRoutes, isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { clubLogosScreenViewFromQuery, resolveClubLogosScreenErrorDescription } from "../_utils";

import type { ClubLogosScreenView } from "../_types";

export function useClubLogosScreen(accountId: string): ClubLogosScreenView {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const settings = useAccountSettings(accountId, { enabled: segmentOk });

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
    if (!settings.isSuccess || !settings.data || redirectingRef.current) return;
    if (!isAccountSettingsGatewayRedirect(settings.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.settings(accountId) });
    router.replace(selectOrganisationUrlWithReason(settings.data.reason));
  }, [accountId, queryClient, router, segmentOk, settings.data, settings.isSuccess]);

  const isClubAccount = useMemo(() => {
    if (!settings.isSuccess || !settings.data) return false;
    if (isAccountSettingsGatewayRedirect(settings.data)) return false;
    return settings.data.data.account_type === CLUB_ACCOUNT_TYPE_ID;
  }, [settings.data, settings.isSuccess]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!isClubAccount || redirectingRef.current) return;

    redirectingRef.current = true;
    router.replace(accountScopedRoutes.dashboard(accountId));
  }, [accountId, isClubAccount, router, segmentOk]);

  return clubLogosScreenViewFromQuery({
    segmentOk,
    isClubAccount,
    isPending: settings.isPending,
    isSuccess: settings.isSuccess,
    isError: settings.isError,
    data: settings.data,
    errorMessage: resolveClubLogosScreenErrorDescription(settings.error),
    onRetry: () => void settings.refetch(),
  });
}
