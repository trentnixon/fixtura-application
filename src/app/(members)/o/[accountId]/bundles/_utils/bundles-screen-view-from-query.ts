import {
  isAccountSchedulerGatewayRedirect,
  type AccountSchedulerQueryResult,
} from "@/lib/api/hooks/account/useAccountScheduler";

import type { BundlesScreenView } from "../_types";

export function bundlesScreenViewFromQuery(args: {
  segmentOk: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: AccountSchedulerQueryResult | undefined;
  errorMessage: string;
  onRetry: () => void;
}): BundlesScreenView {
  const { segmentOk, isPending, isSuccess, isError, data, errorMessage, onRetry } = args;

  if (!segmentOk) {
    return { kind: "redirecting" };
  }

  if (isPending) {
    return { kind: "loading" };
  }

  if (isSuccess && data && isAccountSchedulerGatewayRedirect(data)) {
    return { kind: "redirecting" };
  }

  if (isError) {
    return {
      kind: "error",
      message: errorMessage,
      onRetry,
    };
  }

  if (!isSuccess || !data || isAccountSchedulerGatewayRedirect(data)) {
    return { kind: "idle" };
  }

  return { kind: "ready" };
}
