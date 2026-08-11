import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PutTemplateOptionsBody } from "@/types/api/template-options";

/**
 * Persist template-option row via PUT …/accounts/:accountId/template-options.
 * Refetches account/me then catalog (and branding for header consistency).
 */
export function usePutTemplateOptions(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PutTemplateOptionsBody) => accountApi.putTemplateOptions(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "account" &&
          q.queryKey[1] === "all-template-options" &&
          q.queryKey[2] === accountId,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.branding(accountId) });
    },
  });
}

export function getPutTemplateOptionsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (typeof details === "object" && details !== null && "error" in details) {
      const msg = normalizeErrorFieldToString((details as { error?: unknown }).error);
      if (msg) return msg;
    }
    if (error.message.trim()) return error.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Could not save template options.";
}
