"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountApi } from "@/lib/api/services/account.api";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import {
  isLocalSponsorId,
  readLocalSponsors,
  removeLocalSponsor,
  upsertLocalSponsor,
} from "../_utils/local-sponsor-storage";
import {
  buildServerSponsorPatchBody,
  buildUpdatedLocalSponsor,
  getFilteredWorkspaceSponsors,
  getWorkspaceSponsorStats,
  invalidateSponsors,
  isNumericServerSponsorId,
} from "../_utils/manage-sponsors-workspace";
import { mapAccountSponsorToWorkspaceSponsor } from "../_utils/sponsor-display";

import type { SponsorEditorSaveParams } from "../_components/editor/_types/sponsor-editor";
import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../_types/manage-sponsors";
import type { ManageSponsorsWorkspaceResult } from "../_types/manage-sponsors-workspace";

export function useManageSponsorsWorkspace(accountId: string): ManageSponsorsWorkspaceResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSponsors(accountId, { enabled: segmentOk });
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const [workspaceSponsors, setWorkspaceSponsors] = useState<ManageSponsorsWorkspaceSponsor[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<ManageSponsorsLibraryFilter>("all");

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

  const serverSponsors = useMemo(() => {
    if (!q.isSuccess || !q.data || isAccountSponsorsGatewayRedirect(q.data)) return [];
    return q.data.data.items.map(mapAccountSponsorToWorkspaceSponsor);
  }, [q.data, q.isSuccess]);

  useEffect(() => {
    setWorkspaceSponsors(readLocalSponsors(accountId));
  }, [accountId]);

  useEffect(() => {
    if (serverSponsors.length === 0) return;

    setWorkspaceSponsors((current) => {
      const localSponsors = current.filter((sponsor) => isLocalSponsorId(sponsor.id));
      return [...localSponsors, ...serverSponsors];
    });
  }, [accountId, serverSponsors]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }
      objectUrls.clear();
    };
  }, []);

  const filteredSponsors = useMemo(() => {
    return getFilteredWorkspaceSponsors({
      sponsors: workspaceSponsors,
      searchValue,
      activeFilter,
    });
  }, [activeFilter, searchValue, workspaceSponsors]);

  const stats = useMemo(() => getWorkspaceSponsorStats(workspaceSponsors), [workspaceSponsors]);

  async function saveSponsorEdits(params: SponsorEditorSaveParams) {
    if (isNumericServerSponsorId(params.sponsorId)) {
      const sponsorId = params.sponsorId;
      await accountApi.patchAccountSponsor(
        accountId,
        sponsorId,
        buildServerSponsorPatchBody(params),
      );

      if (params.logoFile) {
        const formData = new FormData();
        formData.append("file", params.logoFile);
        await accountApi.postAccountSponsorLogoUpload(accountId, sponsorId, formData);
      }

      await invalidateSponsors(accountId, queryClient);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
      return;
    }

    if (isLocalSponsorId(params.sponsorId)) {
      const existing = workspaceSponsors.find((sponsor) => sponsor.id === params.sponsorId);
      if (!existing || !isLocalSponsorId(existing.id)) return;

      const updatedSponsor = buildUpdatedLocalSponsor({
        sponsor: existing,
        saveParams: params,
        objectUrls: objectUrlsRef.current,
      });

      setWorkspaceSponsors((current) =>
        current.map((sponsor) => (sponsor.id === params.sponsorId ? updatedSponsor : sponsor)),
      );

      upsertLocalSponsor(accountId, updatedSponsor);
    }
  }

  async function restoreArchivedSponsor(sponsorId: number | string) {
    if (isNumericServerSponsorId(sponsorId)) {
      await accountApi.patchAccountSponsor(accountId, sponsorId, { isActive: true });
      await invalidateSponsors(accountId, queryClient);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
      return;
    }

    if (isLocalSponsorId(sponsorId)) {
      const existing = workspaceSponsors.find((sponsor) => sponsor.id === sponsorId);
      if (!existing) return;
      const restored = buildUpdatedLocalSponsor({
        sponsor: existing,
        saveParams: {
          sponsorId,
          name: existing.name,
          tagline: existing.tagline,
          description: existing.description,
          url: existing.url,
          isActive: true,
          logoFile: null,
          clearLogo: false,
        },
        objectUrls: objectUrlsRef.current,
      });
      const resetPlacement = buildUpdatedLocalSponsor({
        sponsor: {
          ...existing,
          ...restored,
          isPrimary: false,
          rank: null,
        },
        saveParams: {
          sponsorId,
          name: existing.name,
          tagline: existing.tagline,
          description: existing.description,
          url: existing.url,
          isActive: true,
          logoFile: null,
          clearLogo: false,
        },
        objectUrls: objectUrlsRef.current,
      });
      setWorkspaceSponsors((current) =>
        current.map((sponsor) => (sponsor.id === sponsorId ? resetPlacement : sponsor)),
      );
      upsertLocalSponsor(accountId, resetPlacement);
    }
  }

  async function deleteSponsor(sponsorId: number | string) {
    if (isNumericServerSponsorId(sponsorId)) {
      await accountApi.deleteAccountSponsor(accountId, sponsorId);
      await invalidateSponsors(accountId, queryClient);
      await queryClient.removeQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
      return;
    }

    if (isLocalSponsorId(sponsorId)) {
      removeLocalSponsor(accountId, sponsorId);
      setWorkspaceSponsors((current) => current.filter((sponsor) => sponsor.id !== sponsorId));
    }
  }

  return {
    isRedirecting:
      !segmentOk || (q.isSuccess && q.data && isAccountSponsorsGatewayRedirect(q.data)),
    isLoading: q.isPending,
    isError: q.isError,
    errorMessage:
      q.isError && q.error instanceof Error ? q.error.message : AUTH_ERROR_MESSAGES.network,
    sponsors: filteredSponsors,
    workspaceSponsors,
    stats,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    saveSponsorEdits,
    restoreArchivedSponsor,
    deleteSponsor,
    refetch: q.refetch,
  };
}
