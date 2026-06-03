import { BUNDLES_SCREEN_COPY } from "../_consts";

export function formatNextDeliveryCountdown(days: number): string {
  if (days <= 0) return BUNDLES_SCREEN_COPY.schedulerNextDeliveryToday;
  if (days === 1) return BUNDLES_SCREEN_COPY.schedulerNextDeliveryInOneDay;
  return `${BUNDLES_SCREEN_COPY.schedulerNextDeliveryInDaysPrefix}${days}${BUNDLES_SCREEN_COPY.schedulerNextDeliveryInDaysSuffix}`;
}
