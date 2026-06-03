"use client";

import {
  isAccountRenderDetailGatewayRedirect,
  useAccountRenderDetail,
} from "@/lib/api/hooks/account/useAccountRenderDetail";
import { isValidAccountIdSegment, isValidRenderIdSegment } from "@/lib/config/account-routes";

import { resolveBundlesScreenErrorDescription } from "../_utils";
import { useBundlesScreen } from "./use-bundles-screen";

import type { BundlesRenderDetailScreenView } from "../_types";

export function useBundlesRenderDetailScreen(
  accountId: string,
  renderIdParam: string,
): BundlesRenderDetailScreenView {
  const gate = useBundlesScreen(accountId);
  const segmentOk = isValidAccountIdSegment(accountId);
  const renderIdOk = isValidRenderIdSegment(renderIdParam);

  const renderDetail = useAccountRenderDetail(accountId, renderIdParam, {
    enabled: segmentOk && renderIdOk && gate.kind === "ready",
  });

  if (gate.kind !== "ready") {
    return gate;
  }

  if (!renderIdOk) {
    return { kind: "invalidRenderId" };
  }

  if (renderDetail.isPending) {
    return { kind: "loading" };
  }

  if (renderDetail.isError) {
    return {
      kind: "error",
      message: resolveBundlesScreenErrorDescription(renderDetail.error),
      onRetry: () => void renderDetail.refetch(),
    };
  }

  if (!renderDetail.isSuccess || !renderDetail.data) {
    return { kind: "idle" };
  }

  if (isAccountRenderDetailGatewayRedirect(renderDetail.data)) {
    return { kind: "renderNotFound" };
  }

  return { kind: "ready", render: renderDetail.data.data.render };
}
