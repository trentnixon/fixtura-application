"use client";

import { useSupportView } from "@/lib/support/support-view-context";

/**
 * True when viewing a customer account in support super-user mode.
 * Billing POST actions must be hidden; GET payloads remain full parity with owner.
 */
export function useBillingSupportReadOnly(): boolean {
  const { isSupportView } = useSupportView();
  return isSupportView;
}
