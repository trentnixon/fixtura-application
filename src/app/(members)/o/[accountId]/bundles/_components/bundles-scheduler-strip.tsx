"use client";

import { useRouter } from "next/navigation";

import { FeedbackCardSoft, FeedbackCardStrong } from "@/components/ui/feedback-card";
import {
  daysUntilNextDelivery,
  weekdayKeyFromDaysOfWeekRelation,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";
import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  BundlesDeliveryScheduleSection,
  BundlesDeliveryScheduleSectionSkeleton,
} from "./bundles-delivery-schedule-section";
import { BUNDLES_SCREEN_COPY } from "../_consts";
import { formatNextDeliveryCountdown } from "../_utils";

export function BundlesSchedulerStrip({ accountId }: { accountId: string }) {
  const router = useRouter();
  const schedulerQuery = useAccountScheduler(accountId);
  const settingsHref = accountScopedRoutes.settings(accountId);

  if (schedulerQuery.isPending) {
    return <BundlesDeliveryScheduleSectionSkeleton />;
  }

  if (schedulerQuery.isError) {
    return (
      <FeedbackCardStrong
        kind="error"
        label={BUNDLES_SCREEN_COPY.feedbackErrorLabel}
        title={BUNDLES_SCREEN_COPY.errorTitle}
        description={
          schedulerQuery.error instanceof Error
            ? schedulerQuery.error.message
            : BUNDLES_SCREEN_COPY.errorFallback
        }
        primaryCta={BUNDLES_SCREEN_COPY.feedbackRetryAction}
        onPrimaryAction={() => void schedulerQuery.refetch()}
      />
    );
  }

  const schedulerDoc =
    schedulerQuery.data && !isAccountSchedulerGatewayRedirect(schedulerQuery.data)
      ? schedulerQuery.data.data.scheduler
      : null;

  if (!schedulerDoc) {
    return (
      <FeedbackCardSoft
        kind="info"
        label={BUNDLES_SCREEN_COPY.feedbackInfoLabel}
        title={BUNDLES_SCREEN_COPY.schedulerNoSchedulerTitle}
        description={BUNDLES_SCREEN_COPY.schedulerNoSchedulerBody}
        primaryCta={BUNDLES_SCREEN_COPY.schedulerChangeDeliveryDayAction}
        onPrimaryAction={() => router.push(settingsHref)}
      />
    );
  }

  const weekdayKey = weekdayKeyFromDaysOfWeekRelation(schedulerDoc.days_of_the_week);
  const deliveryDayLabel =
    weekdayKey != null
      ? weekdayLabel(weekdayKey)
      : schedulerDoc.days_of_the_week?.Name?.trim() ||
        BUNDLES_SCREEN_COPY.schedulerDeliveryDayUnknown;
  const nextDeliveryLabel =
    weekdayKey != null ? formatNextDeliveryCountdown(daysUntilNextDelivery(weekdayKey)) : "—";

  return (
    <BundlesDeliveryScheduleSection
      settingsHref={settingsHref}
      deliveryDayLabel={deliveryDayLabel}
      nextDeliveryLabel={nextDeliveryLabel}
    />
  );
}
