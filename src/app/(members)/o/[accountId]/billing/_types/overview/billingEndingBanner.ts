import type { AccountBillingOrderDto } from "@/types/api/account";

export type BillingEndingBannerProps = {
  order: Pick<AccountBillingOrderDto, "cancel_at_period_end" | "endOrderAt">;
};
