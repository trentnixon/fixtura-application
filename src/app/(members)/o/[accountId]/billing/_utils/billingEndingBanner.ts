import { formatBillingOrderEndLabel } from "./formatBillingOrderEndLabel";
import {
  BILLING_ENDING_BANNER_PERIOD_END_PREFIX,
  BILLING_ENDING_BANNER_PERIOD_END_SUFFIX,
} from "../_constants/billingEndingBanner";

import type { AccountBillingOrderDto } from "@/types/api/account";

export function shouldShowBillingEndingBanner(
  order: Pick<AccountBillingOrderDto, "cancel_at_period_end">,
): boolean {
  return order.cancel_at_period_end === true;
}

/** Optional trailing clause when `endOrderAt` formats to a non-empty label. */
export function billingEndingBannerPeriodEndTrail(endOrderAt: string | null | undefined): string {
  const end = formatBillingOrderEndLabel(endOrderAt ?? null);
  if (!end) return "";
  return `${BILLING_ENDING_BANNER_PERIOD_END_PREFIX}${end}${BILLING_ENDING_BANNER_PERIOD_END_SUFFIX}`;
}
