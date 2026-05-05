import type { AccountBillingOrderDto } from "@/types/api/account";

function formatEndLabel(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export type BillingEndingBannerProps = {
  order: Pick<AccountBillingOrderDto, "cancel_at_period_end" | "endOrderAt">;
};

/** Secondary marker — does not change primary billing UI mode when order is active. */
export function BillingEndingBanner({ order }: BillingEndingBannerProps) {
  if (order.cancel_at_period_end !== true) {
    return null;
  }
  const end = formatEndLabel(order.endOrderAt ?? null);

  return (
    <div
      className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-sm"
      role="status"
      data-testid="billing-ending-banner"
    >
      <p className="text-foreground font-medium">Subscription ending</p>
      <p className="text-muted-foreground mt-1">
        This subscription is scheduled to cancel at period end.
        {end ? ` Current period ends around ${end}.` : ""}
      </p>
    </div>
  );
}
