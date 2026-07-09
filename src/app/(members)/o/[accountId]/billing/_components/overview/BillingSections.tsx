import { BillingActiveTrialStatusCard } from "./BillingActiveTrialStatusCard";
import { BillingPaidActiveStatusCard } from "./BillingPaidActiveStatusCard";

import type { BillingSectionsProps } from "../../_types/overview/billingSections";

export function BillingSections({ data, billingUiMode, orders }: BillingSectionsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        {billingUiMode === "paid_active" ? (
          <BillingPaidActiveStatusCard
            activeOrder={data.activeOrder}
            currentPlan={data.currentPlan}
            orders={orders}
          />
        ) : null}

        {billingUiMode === "active_trial" ? (
          <BillingActiveTrialStatusCard trial={data.trial} />
        ) : null}
      </div>
    </div>
  );
}
