"use client";

import { useAccountOrganisationContext } from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { useAccountSettings } from "@/lib/api/hooks/account/useAccountSettings";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { resolveBundlesAccountSport } from "../_utils/resolve-bundles-account-sport";

import type {
  AccountOrganisationContextResponse,
  AccountSettingsResponse,
} from "@/types/api/account";

function organisationContextData(
  result: AccountOrganisationContextResponse | { _tag: string } | undefined,
): AccountOrganisationContextResponse["data"] | null {
  if (!result || "_tag" in result) return null;
  return result.data;
}

function settingsData(
  result: AccountSettingsResponse | { _tag: string } | undefined,
): AccountSettingsResponse["data"] | null {
  if (!result || "_tag" in result) return null;
  return result.data;
}

/** Organisation or settings sport for external bundle hub render URLs. */
export function useBundlesAccountSport(accountId: string, options?: { enabled?: boolean }) {
  const segmentOk = isValidAccountIdSegment(accountId);
  const enabled = (options?.enabled ?? true) && segmentOk;

  const organisation = useAccountOrganisationContext(accountId, { enabled });
  const settings = useAccountSettings(accountId, { enabled });

  const orgData = organisation.isSuccess ? organisationContextData(organisation.data) : null;
  const settingsPayload = settings.isSuccess ? settingsData(settings.data) : null;

  return resolveBundlesAccountSport({
    organisationContext: orgData,
    settings: settingsPayload,
  });
}
