"use client";

import { TypographyCardDescription, TypographyCardTitle } from "@/components/typography";
import { Card, CardHeader } from "@/components/ui/card";

import { BillingOverviewActions } from "./BillingOverviewActions";
import { BillingOverviewPageHeader } from "./BillingOverviewPageHeader";
import { BillingOverviewStatusState } from "./BillingOverviewStatusState";
import { BillingAccountExpiringSoonBanner } from "../../_components/banners/BillingAccountExpiringSoonBanner";
import { BillingEndingBanner } from "../../_components/banners/BillingEndingBanner";
import { BillingPaymentPendingBanner } from "../../_components/banners/BillingPaymentPendingBanner";
import { CheckoutReturnBanner } from "../../_components/banners/CheckoutReturnBanner";
import { BillingProductStateBadge } from "../../_components/billing-product-state-badge";
import { BillingPaidAwaitingStartCard } from "../../_components/overview/BillingPaidAwaitingStartCard";
import { BillingSections } from "../../_components/overview/BillingSections";
import { BillingOrganisationTrialNotice } from "../../_components/trial/BillingOrganisationTrialNotice";
import { useBillingSupportReadOnly } from "../../_hooks/useBillingSupportReadOnly";
import {
  findPaidAwaitingStartOrder,
  paidAwaitingStartDaysForOrder,
  resolveEndingSoonContext,
} from "../../_utils/orders/orderSeasonPassDisplayState";
import {
  resolveOrganisationTrialNoticePresentation,
  shouldShowBillingTrialStartCard,
  shouldShowBillingTrialUsedCardForUiMode,
  shouldShowOrganisationTrialNoticeInDialog,
  shouldShowProminentOrganisationTrialNotice,
} from "../../_utils/trial/billingOrganisationTrialOverview";
import { BillingCreateSeasonPassCard } from "../../season-pass/billing-create-season-pass-card";
import { BillingTrialDetailsDialog } from "../../trial/billing-trial-details-dialog";
import { BillingTrialStartCard } from "../../trial/billing-trial-start-card";
import { BillingTrialUsedCard } from "../../trial/billing-trial-used-card";
import { BILLING_ACCESS_UNCERTAIN_COPY } from "../_constants/billingAccessUncertain";
import { BILLING_HISTORY_VISIBLE_MODES } from "../_constants/billingOverviewActions";
import { useBillingOverviewContentState } from "../_hooks/useBillingOverviewContentState";
import {
  shouldShowBillingAccessUncertainCard,
  shouldShowCreateSeasonPassSection,
} from "../_utils/billingOverviewPresentation";

export function BillingContent({ accountId }: { accountId: string }) {
  const isBillingReadOnly = useBillingSupportReadOnly();
  const { state, refetchBilling } = useBillingOverviewContentState(accountId);
  const historyHref =
    state.kind === "ready"
      ? state.historyHref
      : `/o/${encodeURIComponent(accountId)}/billing/history`;
  const showBillingHistory =
    state.kind === "ready" && BILLING_HISTORY_VISIBLE_MODES.includes(state.billingUiMode);

  if (state.kind !== "ready") {
    return (
      <div className="grid gap-6">
        <BillingOverviewPageHeader
          showBillingHistory={showBillingHistory}
          historyHref={historyHref}
        />
        <BillingOverviewStatusState state={state} onRetryBilling={() => void refetchBilling()} />
      </div>
    );
  }

  const showStartTrial = shouldShowBillingTrialStartCard(
    state.billingUiMode,
    state.organisationTrialPresentation,
  );
  const orgTrialNoticePresentation = shouldShowProminentOrganisationTrialNotice(
    state.billingUiMode,
    state.organisationTrialPresentation,
  )
    ? resolveOrganisationTrialNoticePresentation(state.organisationTrialPresentation)
    : null;
  const orgTrialDialogNoticePresentation = shouldShowOrganisationTrialNoticeInDialog(
    state.organisationTrialPresentation,
  )
    ? "active_on_another_account"
    : null;
  const showTrialUsedCardForUiMode = shouldShowBillingTrialUsedCardForUiMode(
    state.billingUiMode,
    state.organisationTrialPresentation,
    Boolean(state.trialDetailsTrigger),
  );
  const showAccessUncertainCard = shouldShowBillingAccessUncertainCard(
    state.billingUiMode,
    state.organisationTrialPresentation,
    state.availableActions,
  );
  const paidAwaitingStartOrder = findPaidAwaitingStartOrder(state.ordersPayload);
  const paidAwaitingStartDays = paidAwaitingStartOrder
    ? paidAwaitingStartDaysForOrder(paidAwaitingStartOrder)
    : null;
  const showCreateSeasonPassSection =
    paidAwaitingStartOrder == null &&
    shouldShowCreateSeasonPassSection(
      state.billingUiMode,
      state.organisationTrialPresentation,
      state.availableActions,
    );
  const endingSoonContext = resolveEndingSoonContext(
    state.billingSummary.activeOrder,
    state.ordersPayload,
  );

  return (
    <div className="grid gap-6">
      <BillingOverviewPageHeader
        showBillingHistory={showBillingHistory}
        historyHref={historyHref}
      />
      {state.checkoutReturnNotice ? (
        <CheckoutReturnBanner outcome={state.checkoutReturnNotice} />
      ) : null}

      {state.billingUiMode === "paid_active" && endingSoonContext != null ? (
        <BillingAccountExpiringSoonBanner daysUntilEnd={endingSoonContext.daysUntilEnd} />
      ) : null}

      {(state.billingUiMode === "paid_active" || state.billingUiMode === "active_trial") &&
      state.billingSummary.activeOrder?.cancel_at_period_end === true ? (
        <BillingEndingBanner order={state.billingSummary.activeOrder} />
      ) : null}

      {state.billingUiMode === "payment_pending" ? (
        <BillingPaymentPendingBanner
          accountId={accountId}
          summary={state.billingSummary}
          orders={state.ordersPayload}
        />
      ) : null}

      {orgTrialNoticePresentation ? (
        <BillingOrganisationTrialNotice presentation={orgTrialNoticePresentation} />
      ) : null}

      {state.billingUiMode !== "payment_pending" && paidAwaitingStartOrder == null ? (
        <div
          className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
          role="region"
          aria-label="Billing status and actions"
        >
          <BillingProductStateBadge accountId={accountId} />
          <BillingOverviewActions
            billingUiMode={state.billingUiMode}
            billingSummary={state.billingSummary}
            trialDetailsTrigger={state.trialDetailsTrigger}
            createHref={state.createHref}
            organisationTrialNoticePresentation={orgTrialDialogNoticePresentation}
            suppressCreateSubscriptionCta={false}
            readOnly={isBillingReadOnly}
          />
        </div>
      ) : null}

      {showAccessUncertainCard ? (
        <Card>
          <CardHeader>
            <TypographyCardTitle className="font-brand">
              {BILLING_ACCESS_UNCERTAIN_COPY.title}
            </TypographyCardTitle>
            <TypographyCardDescription>
              {BILLING_ACCESS_UNCERTAIN_COPY.description}
            </TypographyCardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {showStartTrial && !isBillingReadOnly ? (
        <BillingTrialStartCard
          accountId={accountId}
          enabled={state.segmentOk}
          organisationTrialPresentation={state.organisationTrialPresentation}
          {...(state.availableActions !== undefined
            ? { availableActions: state.availableActions }
            : {})}
        />
      ) : null}

      {paidAwaitingStartOrder != null && paidAwaitingStartDays != null ? (
        <BillingPaidAwaitingStartCard
          daysUntilStart={paidAwaitingStartDays}
          order={paidAwaitingStartOrder}
        />
      ) : null}

      {showCreateSeasonPassSection && !isBillingReadOnly ? (
        <div className="grid gap-3">
          <BillingCreateSeasonPassCard accountId={accountId} />
          {showTrialUsedCardForUiMode && state.billingUiMode === "trial_expired" ? (
            <BillingTrialUsedCard
              accountId={accountId}
              trial={state.billingSummary.trial}
              uiMode={state.billingUiMode}
            />
          ) : null}
          {state.trialDetailsTrigger && state.billingUiMode === "no_billing" ? (
            <BillingTrialDetailsDialog
              trial={state.billingSummary.trial}
              uiMode={state.billingUiMode}
              emphasize={state.trialDetailsTrigger.emphasize}
              triggerVariant="text"
              organisationTrialNoticePresentation={orgTrialDialogNoticePresentation}
            />
          ) : null}
        </div>
      ) : null}

      {showTrialUsedCardForUiMode &&
      paidAwaitingStartOrder != null &&
      state.billingUiMode === "trial_expired" ? (
        <BillingTrialUsedCard
          accountId={accountId}
          trial={state.billingSummary.trial}
          uiMode={state.billingUiMode}
        />
      ) : null}

      <BillingSections
        data={state.billingSummary}
        billingUiMode={state.billingUiMode}
        orders={state.ordersPayload}
      />

      {showTrialUsedCardForUiMode && state.billingUiMode === "payment_pending" ? (
        <BillingTrialUsedCard
          accountId={accountId}
          trial={state.billingSummary.trial}
          uiMode={state.billingUiMode}
        />
      ) : null}
    </div>
  );
}
