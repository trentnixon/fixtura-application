"use client";

import {
  BillingDebugPanelBoolRow,
  BillingDebugPanelRow,
  BillingDebugPanelSectionTitle,
} from "../_components/debug/BillingDebugPanelRows";
import { BILLING_DEBUG_PANEL_SHELL_CLASS } from "../_constants/debug/billingDebugPanel";
import { useBillingDevToolsVisible } from "../_hooks/useBillingDebugPanel";

import type { SubscriptionTierCategory } from "@/types/api/account";

export type CreateSubscriptionWizardStatePanelProps = {
  step: number;
  selectedTierId: string | null;
  startDate: string;
  paymentPath: "card" | "invoice" | null;
  planCategoryFilter: SubscriptionTierCategory | null;
  effectivePlanCategory: SubscriptionTierCategory | null;
  showPlanCategoryToggle: boolean;
  orderedCategories: SubscriptionTierCategory[];
  tiersListLength: number;
  displayTiersLength: number;
  displayTierIds: string[];
  selectedTierPreview: {
    id: string;
    name: string;
    category: SubscriptionTierCategory;
  } | null;
  canCard: boolean;
  canInvoice: boolean;
  wizardBlocked: boolean;
  billingUiMode: string | null;
  minDate: string;
  dateOk: boolean;
  startOkInvoice: boolean;
  requiredInvoiceFilled: boolean;
  canSubmitInvoice: boolean;
  tiersQueryStatus: string;
  tiersQueryFetchStatus: string;
  checkoutPending: boolean;
  invoicePending: boolean;
  checkoutError: string | null;
  invoiceError: string | null;
  missingCheckoutUrl: boolean;
  invoiceSubmitted?: boolean;
  /** Staff-only Stripe immediate invoice panel (wizard step 4, invoice path). */
  showStripeImmediateInvoice: boolean;
  stripeImmediatePending: boolean;
  stripeImmediateError: string | null;
  stripeHostedUrl: string | null;
  stripeCreatedOrderId: number | null;
  stripeInvoicePaidDetected: boolean;
};

export function CreateSubscriptionWizardStatePanel(props: CreateSubscriptionWizardStatePanelProps) {
  const visible = useBillingDevToolsVisible();
  if (!visible) {
    return null;
  }

  const preview =
    props.selectedTierPreview == null
      ? "—"
      : `${props.selectedTierPreview.id} · ${props.selectedTierPreview.name} (${props.selectedTierPreview.category})`;

  return (
    <details className={`${BILLING_DEBUG_PANEL_SHELL_CLASS} mt-6 p-4`} open={false}>
      <summary className="cursor-pointer text-emerald-400 select-none">
        Dev: create subscription wizard state
      </summary>

      <div className="border-border mt-3 space-y-4 border-t pt-3">
        <div>
          <BillingDebugPanelSectionTitle>Wizard</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="step" value={String(props.step)} />
          <BillingDebugPanelRow label="paymentPath" value={props.paymentPath ?? "null"} />
        </div>

        <div>
          <BillingDebugPanelSectionTitle>Tiers</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="selectedTierId" value={props.selectedTierId ?? "null"} />
          <BillingDebugPanelRow label="selectedTier (resolved)" value={preview} />
          <BillingDebugPanelRow
            label="planCategoryFilter"
            value={props.planCategoryFilter ?? "null"}
          />
          <BillingDebugPanelRow
            label="effectivePlanCategory"
            value={props.effectivePlanCategory ?? "null"}
          />
          <BillingDebugPanelBoolRow
            label="showPlanCategoryToggle"
            value={props.showPlanCategoryToggle}
          />
          <BillingDebugPanelRow
            label="orderedCategories"
            value={props.orderedCategories.join(", ") || "—"}
          />
          <BillingDebugPanelRow label="tiersList.length" value={String(props.tiersListLength)} />
          <BillingDebugPanelRow
            label="displayTiers.length"
            value={String(props.displayTiersLength)}
          />
          <BillingDebugPanelRow
            label="displayTierIds"
            value={props.displayTierIds.join(", ") || "—"}
          />
        </div>

        <div>
          <BillingDebugPanelSectionTitle>Dates</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="startDate" value={props.startDate || "—"} />
          <BillingDebugPanelRow label="minDate" value={props.minDate} />
          <BillingDebugPanelBoolRow label="dateOk (card path)" value={props.dateOk} />
          <BillingDebugPanelBoolRow label="startOkInvoice" value={props.startOkInvoice} />
        </div>

        <div>
          <BillingDebugPanelSectionTitle>Gates</BillingDebugPanelSectionTitle>
          <BillingDebugPanelBoolRow label="wizardBlocked" value={props.wizardBlocked} />
          <BillingDebugPanelRow label="billingUiMode" value={props.billingUiMode ?? "null"} />
          <BillingDebugPanelBoolRow label="canCard" value={props.canCard} />
          <BillingDebugPanelBoolRow label="canInvoice" value={props.canInvoice} />
        </div>

        <div>
          <BillingDebugPanelSectionTitle>Invoice form gate</BillingDebugPanelSectionTitle>
          <BillingDebugPanelBoolRow
            label="requiredInvoiceFilled"
            value={props.requiredInvoiceFilled}
          />
          <BillingDebugPanelBoolRow label="canSubmitInvoice" value={props.canSubmitInvoice} />
        </div>

        <div>
          <BillingDebugPanelSectionTitle>Queries / mutations</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="tiersQuery.status" value={props.tiersQueryStatus} />
          <BillingDebugPanelRow
            label="tiersQuery.fetchStatus"
            value={props.tiersQueryFetchStatus}
          />
          <BillingDebugPanelBoolRow
            label="checkoutMutation.isPending"
            value={props.checkoutPending}
          />
          <BillingDebugPanelBoolRow
            label="invoiceMutation.isPending"
            value={props.invoicePending}
          />
        </div>

        <div>
          <BillingDebugPanelSectionTitle>Errors / flags</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="checkoutError" value={props.checkoutError ?? "null"} />
          <BillingDebugPanelRow label="invoiceError" value={props.invoiceError ?? "null"} />
          <BillingDebugPanelBoolRow label="missingCheckoutUrl" value={props.missingCheckoutUrl} />
          {props.invoiceSubmitted !== undefined ? (
            <BillingDebugPanelBoolRow label="invoiceSubmitted" value={props.invoiceSubmitted} />
          ) : null}
        </div>

        <div>
          <BillingDebugPanelSectionTitle>
            Staff Stripe invoice (immediate)
          </BillingDebugPanelSectionTitle>
          <BillingDebugPanelBoolRow
            label="showStripeImmediateInvoice"
            value={props.showStripeImmediateInvoice}
          />
          <BillingDebugPanelBoolRow
            label="stripeImmediatePending"
            value={props.stripeImmediatePending}
          />
          <BillingDebugPanelRow
            label="stripeImmediateError"
            value={props.stripeImmediateError ?? "null"}
          />
          <BillingDebugPanelRow label="stripeHostedUrl" value={props.stripeHostedUrl ?? "null"} />
          <BillingDebugPanelRow
            label="stripeCreatedOrderId"
            value={props.stripeCreatedOrderId != null ? String(props.stripeCreatedOrderId) : "null"}
          />
          <BillingDebugPanelBoolRow
            label="stripeInvoicePaidDetected"
            value={props.stripeInvoicePaidDetected}
          />
        </div>
      </div>
    </details>
  );
}
