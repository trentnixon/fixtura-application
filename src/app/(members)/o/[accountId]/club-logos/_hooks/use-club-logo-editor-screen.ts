"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import {
  isAccountClubLogosDirectoryGatewayRedirect,
  useAccountClubLogosDirectory,
} from "@/lib/api/hooks/account/useAccountClubLogosDirectory";
import { queryKeys } from "@/lib/api/query/query-keys";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { selectOrganisationUrlWithReason } from "@/lib/config/gateway-reasons";

import { useClubLogosScreen } from "./use-club-logos-screen";

import type { AccountBrandingData, AccountClubLogosDirectoryClub } from "@/types/api/account";

export type ClubLogoEditorScreenView =
  | { kind: "redirecting" }
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "idle" }
  | { kind: "invalidClubId" }
  | { kind: "clubNotFound" }
  | { kind: "ready"; club: AccountClubLogosDirectoryClub; branding: AccountBrandingData | null };

export function useClubLogoEditorScreen(
  accountId: string,
  clubIdParam: string,
): ClubLogoEditorScreenView {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const gate = useClubLogosScreen(accountId);
  const segmentOk = isValidAccountIdSegment(accountId);
  const clubIdOk = isValidAccountIdSegment(clubIdParam);
  const clubId = clubIdOk ? Number(clubIdParam) : null;

  const directory = useAccountClubLogosDirectory(accountId, {
    enabled: segmentOk && clubIdOk && gate.kind === "ready",
  });
  const branding = useAccountBranding(accountId, {
    enabled: segmentOk && clubIdOk && gate.kind === "ready",
  });

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId, clubIdParam]);

  useEffect(() => {
    if (!directory.isSuccess || !directory.data || redirectingRef.current) return;
    if (!isAccountClubLogosDirectoryGatewayRedirect(directory.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.clubLogosDirectory(accountId) });
    router.replace(selectOrganisationUrlWithReason(directory.data.reason));
  }, [accountId, directory.data, directory.isSuccess, queryClient, router]);

  useEffect(() => {
    if (!branding.isSuccess || !branding.data || redirectingRef.current) return;
    if (!isAccountBrandingGatewayRedirect(branding.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.branding(accountId) });
    router.replace(selectOrganisationUrlWithReason(branding.data.reason));
  }, [accountId, branding.data, branding.isSuccess, queryClient, router]);

  const club = useMemo(() => {
    if (!directory.isSuccess || !directory.data) return null;
    if (isAccountClubLogosDirectoryGatewayRedirect(directory.data)) return null;
    return directory.data.data.clubs.find((row) => row.id === clubId) ?? null;
  }, [clubId, directory.data, directory.isSuccess]);

  if (gate.kind !== "ready") {
    return gate;
  }

  if (!clubIdOk) {
    return { kind: "invalidClubId" };
  }

  if (
    directory.isSuccess &&
    directory.data &&
    isAccountClubLogosDirectoryGatewayRedirect(directory.data)
  ) {
    return { kind: "redirecting" };
  }

  const isLoading = directory.isPending || branding.isPending;
  if (isLoading) {
    return { kind: "loading" };
  }

  const directoryError = directory.isError;
  const brandingError = branding.isError;

  if (directoryError || brandingError) {
    const message =
      (directory.error instanceof Error && directory.error.message) ||
      (branding.error instanceof Error && branding.error.message) ||
      "Could not load this club.";
    return {
      kind: "error",
      message,
      onRetry: () => {
        void directory.refetch();
        void branding.refetch();
      },
    };
  }

  if (
    !directory.isSuccess ||
    !directory.data ||
    isAccountClubLogosDirectoryGatewayRedirect(directory.data)
  ) {
    return { kind: "idle" };
  }

  if (!club) {
    return { kind: "clubNotFound" };
  }

  const brandingData =
    branding.isSuccess && branding.data && !isAccountBrandingGatewayRedirect(branding.data)
      ? branding.data.data
      : null;

  return {
    kind: "ready",
    club,
    branding: brandingData,
  };
}
