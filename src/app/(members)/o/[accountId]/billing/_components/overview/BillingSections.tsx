import { BillingActiveTrialStatusCard } from "./BillingActiveTrialStatusCard";
import { BillingPaidActiveStatusCard } from "./BillingPaidActiveStatusCard";
import { buildBillingSectionsViewModel } from "../../_utils/overview/billingOverviewStatusCards";
import { OrdersTableSection } from "../orders/OrdersTableSection";

import type { BillingSectionsProps } from "../../_types/overview/billingSections";

export function BillingSections({
  data,
  billingUiMode,
  orders,
  ordersLoadError,
  onRetryOrders,
}: BillingSectionsProps) {
  const { activeOrder } = data;
  const { meaningfulActiveOrder, showOrdersSection } = buildBillingSectionsViewModel(
    activeOrder,
    orders,
    ordersLoadError,
  );

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

      {showOrdersSection ? (
        <OrdersTableSection
          orders={orders}
          activeOrder={meaningfulActiveOrder}
          loadError={ordersLoadError}
          onRetry={onRetryOrders}
        />
      ) : null}
    </div>
  );
}
