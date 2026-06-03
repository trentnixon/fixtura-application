import {
  isAccountSettingsGatewayRedirect,
  type AccountSettingsQueryResult,
} from "@/lib/api/hooks/account/useAccountSettings";

import type { ClubLogosScreenView } from "../_types";

export function clubLogosScreenViewFromQuery(args: {
  segmentOk: boolean;
  isClubAccount: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: AccountSettingsQueryResult | undefined;
  errorMessage: string;
  onRetry: () => void;
}): ClubLogosScreenView {
  const { segmentOk, isClubAccount, isPending, isSuccess, isError, data, errorMessage, onRetry } =
    args;

  if (!segmentOk || isClubAccount) {
    return { kind: "redirecting" };
  }

  if (isPending) {
    return { kind: "loading" };
  }

  if (isSuccess && data && isAccountSettingsGatewayRedirect(data)) {
    return { kind: "redirecting" };
  }

  if (isError) {
    return {
      kind: "error",
      message: errorMessage,
      onRetry,
    };
  }

  if (!isSuccess || !data || isAccountSettingsGatewayRedirect(data)) {
    return { kind: "idle" };
  }

  return { kind: "ready" };
}
