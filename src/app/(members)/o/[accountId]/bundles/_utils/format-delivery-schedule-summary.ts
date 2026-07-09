import { BUNDLES_SCREEN_COPY } from "../_consts";

export function formatDeliveryScheduleSummary(
  deliveryDayLabel: string,
  nextDeliveryLabel: string,
): string {
  return `${BUNDLES_SCREEN_COPY.schedulerSummaryEveryPrefix}${deliveryDayLabel}${BUNDLES_SCREEN_COPY.schedulerSummarySeparator}${nextDeliveryLabel}`;
}
