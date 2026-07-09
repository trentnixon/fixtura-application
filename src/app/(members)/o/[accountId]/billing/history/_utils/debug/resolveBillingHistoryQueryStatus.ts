import type { UseQueryResult } from "@tanstack/react-query";

export function resolveBillingHistoryQueryStatus(
  query: Pick<UseQueryResult, "isPending" | "isError" | "isSuccess">,
): string {
  if (query.isPending) return "pending";
  if (query.isError) return "error";
  if (query.isSuccess) return "ok";
  return "idle";
}
