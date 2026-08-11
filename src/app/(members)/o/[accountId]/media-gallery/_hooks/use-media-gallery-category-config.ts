"use client";

import { useMemo } from "react";

import {
  isAccountGradeOrderingGatewayRedirect,
  useAccountGradeOrdering,
} from "@/lib/api/hooks/account/useAccountGradeOrdering";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  useAccountSettings,
  isAccountSettingsGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountSettings";
import { useSeasonHubCompetitions } from "@/lib/api/hooks/season-hub/useSeasonHubCompetitions";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import {
  buildMediaGalleryCategoryConfig,
  resolveMediaGalleryCategoryType,
} from "../_utils/media-gallery-category";

import type { MediaGalleryCategoryConfig } from "../_utils/media-gallery-category";
import type { AccountMediaLibraryResolvedTarget } from "@/types/api/account";
import type { GradeOrderingGetParams } from "@/types/api/grade-ordering";

function resolveGradeOrderingParams(
  accountType: number | null | undefined,
  organisationId: number | undefined,
): GradeOrderingGetParams | null {
  if (!organisationId || !Number.isFinite(organisationId)) return null;
  if (accountType === CLUB_ACCOUNT_TYPE_ID) {
    return { organisationType: "club", organisationId };
  }
  if (accountType != null) {
    return { organisationType: "association", organisationId };
  }
  return null;
}

export function useMediaGalleryCategoryConfig(
  accountId: string,
  options?: {
    enabled?: boolean;
    resolvedTargets?: readonly AccountMediaLibraryResolvedTarget[];
  },
): MediaGalleryCategoryConfig {
  const enabled = options?.enabled ?? Boolean(accountId);

  const settingsQuery = useAccountSettings(accountId, { enabled });
  const organisationQuery = useAccountOrganisationContext(accountId, { enabled });

  const settings =
    settingsQuery.isSuccess &&
    settingsQuery.data &&
    !isAccountSettingsGatewayRedirect(settingsQuery.data)
      ? settingsQuery.data.data
      : null;

  const organisationContext =
    organisationQuery.isSuccess &&
    organisationQuery.data &&
    !isAccountOrganisationContextGatewayRedirect(organisationQuery.data)
      ? organisationQuery.data.data
      : null;

  const categoryType = resolveMediaGalleryCategoryType(settings);
  const orgParams = useMemo(
    () =>
      resolveGradeOrderingParams(
        organisationContext?.account_type ?? settings?.account_type ?? null,
        organisationContext?.accountOrganisationDetails?.id,
      ),
    [organisationContext, settings?.account_type],
  );

  const competitionsQuery = useSeasonHubCompetitions(
    accountId,
    { page: 1, pageSize: 100 },
    { enabled: enabled && categoryType === "competition" },
  );

  const gradeOrderingQuery = useAccountGradeOrdering(accountId, orgParams, {
    enabled: enabled && categoryType === "grade" && orgParams !== null,
  });

  const competitions =
    competitionsQuery.isSuccess && competitionsQuery.data ? competitionsQuery.data.data : undefined;

  const gradeGroups =
    gradeOrderingQuery.isSuccess &&
    gradeOrderingQuery.data &&
    !isAccountGradeOrderingGatewayRedirect(gradeOrderingQuery.data)
      ? gradeOrderingQuery.data.data.groups
      : undefined;

  const isLoading =
    settingsQuery.isPending ||
    organisationQuery.isPending ||
    (categoryType === "competition" && competitionsQuery.isPending) ||
    (categoryType === "grade" && gradeOrderingQuery.isPending);

  const isError =
    settingsQuery.isError ||
    organisationQuery.isError ||
    (categoryType === "competition" && competitionsQuery.isError) ||
    (categoryType === "grade" && gradeOrderingQuery.isError);

  return useMemo(() => {
    const params: Parameters<typeof buildMediaGalleryCategoryConfig>[0] = {
      settings,
      competitions,
      gradeGroups,
      isLoading,
      isError,
    };
    if (options?.resolvedTargets) {
      params.resolvedTargets = options.resolvedTargets;
    }
    return buildMediaGalleryCategoryConfig(params);
  }, [settings, competitions, gradeGroups, options?.resolvedTargets, isLoading, isError]);
}
