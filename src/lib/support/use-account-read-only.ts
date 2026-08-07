"use client";

import { useSupportView } from "@/lib/support/support-view-context";

/**
 * True when viewing a customer account via support super-user (non-owned route accountId).
 * Use for disabling/hiding mutation UI outside billing (billing uses useBillingSupportReadOnly).
 */
export function useAccountReadOnly(): boolean {
  const { isSupportView } = useSupportView();
  return isSupportView;
}
