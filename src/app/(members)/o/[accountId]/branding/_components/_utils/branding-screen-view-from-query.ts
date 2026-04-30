import {
  isAccountBrandingGatewayRedirect,
  type AccountBrandingQueryResult,
} from "@/lib/api/hooks/account/useAccountBranding";

import { resolveBrandingScreenErrorDescription } from "./resolve-branding-screen-error-description";

import type { BrandingScreenView } from "../_types";

export function brandingScreenViewFromQuery(args: {
  segmentOk: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: AccountBrandingQueryResult | undefined;
  error: unknown;
  onRetry: () => void;
}): BrandingScreenView {
  const { segmentOk, isPending, isSuccess, isError, data, error, onRetry } = args;

  if (!segmentOk) {
    return { kind: "redirecting" };
  }

  if (isPending) {
    return { kind: "loading" };
  }

  if (isSuccess && data && isAccountBrandingGatewayRedirect(data)) {
    return { kind: "redirecting" };
  }

  if (isError) {
    return {
      kind: "error",
      message: resolveBrandingScreenErrorDescription(error),
      onRetry,
    };
  }

  if (!isSuccess || !data || isAccountBrandingGatewayRedirect(data)) {
    return { kind: "idle" };
  }

  return { kind: "ready", data: data.data };
}
