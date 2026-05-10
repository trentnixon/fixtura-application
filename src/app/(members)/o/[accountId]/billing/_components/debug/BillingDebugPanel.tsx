"use client";

import { useMemo } from "react";

import { TypographyDataLabel } from "@/components/typography";

import {
  BillingDebugPanelBoolRow,
  BillingDebugPanelRow,
  BillingDebugPanelSectionTitle,
} from "./BillingDebugPanelRows";
import {
  BILLING_DEBUG_DERIVATION_FLAG_KEYS,
  BILLING_DEBUG_PANEL_SHELL_CLASS,
  BILLING_DEBUG_SUMMARY_SLICE_KEYS,
} from "../../_constants/debug/billingDebugPanel";
import { useBillingDebugPanel } from "../../_hooks/useBillingDebugPanel";
import {
  collectBillingDebugPanelExtraEntries,
  resolveBillingDebugPanelFetchStatus,
} from "../../_utils/debug/billingDebugPanel";
import { formatBillingDebugSnapshotValue } from "../../_utils/debug/formatBillingDebugSnapshotValue";

import type { BillingDebugPanelProps } from "../../_types/debug/billingDebugPanel";

export function BillingDebugPanel({
  accountId,
  contextLabel,
  summary,
  orders,
  isSummaryLoading,
  summaryError,
  extra,
}: BillingDebugPanelProps) {
  const { visible, snapshot, funnel } = useBillingDebugPanel(summary, orders);

  const extraEntries = useMemo(() => collectBillingDebugPanelExtraEntries(extra), [extra]);
  const fetchStatus = resolveBillingDebugPanelFetchStatus(summary, {
    isSummaryLoading,
    summaryError,
  });

  if (!visible) {
    return null;
  }

  return (
    <details className={`${BILLING_DEBUG_PANEL_SHELL_CLASS} mt-6 p-4`} open={false}>
      <summary className="cursor-pointer text-emerald-400 select-none">
        Dev: billing state
        {contextLabel ? (
          <TypographyDataLabel as="span" className="text-emerald-600">
            {contextLabel}
          </TypographyDataLabel>
        ) : null}
      </summary>

      <div className="border-border mt-3 space-y-4 border-t pt-3">
        <div>
          <BillingDebugPanelSectionTitle>Route</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="accountId" value={accountId} />
        </div>

        {extraEntries.length > 0 ? (
          <div>
            <BillingDebugPanelSectionTitle>Context</BillingDebugPanelSectionTitle>
            {extraEntries.map(([k, v]) => (
              <BillingDebugPanelRow key={k} label={k} value={v === null ? "–" : String(v)} />
            ))}
          </div>
        ) : null}

        <div>
          <BillingDebugPanelSectionTitle>Billing summary fetch</BillingDebugPanelSectionTitle>
          <BillingDebugPanelRow label="status" value={fetchStatus} />
        </div>

        {snapshot ? (
          <>
            <div>
              <BillingDebugPanelSectionTitle>Derived</BillingDebugPanelSectionTitle>
              <BillingDebugPanelRow label="billingUiMode" value={snapshot.billingUiMode} />
              <BillingDebugPanelRow
                label="billingProductState"
                value={snapshot.billingProductState}
              />
              <BillingDebugPanelRow label="referenceIso" value={snapshot.referenceIso} />
            </div>

            <div>
              <BillingDebugPanelSectionTitle>Precedence flags</BillingDebugPanelSectionTitle>
              {BILLING_DEBUG_DERIVATION_FLAG_KEYS.map((k) => (
                <BillingDebugPanelBoolRow key={k} label={k} value={snapshot.derivationFlags[k]} />
              ))}
            </div>

            <div>
              <BillingDebugPanelSectionTitle>Summary slice</BillingDebugPanelSectionTitle>
              {BILLING_DEBUG_SUMMARY_SLICE_KEYS.map((k) => (
                <BillingDebugPanelRow
                  key={k}
                  label={k}
                  value={formatBillingDebugSnapshotValue(snapshot.summarySlice[k])}
                />
              ))}
            </div>

            <div>
              <BillingDebugPanelSectionTitle>Helpers</BillingDebugPanelSectionTitle>
              <BillingDebugPanelBoolRow
                label="canStartTrial"
                value={snapshot.helpers.canStartTrial}
              />
              <BillingDebugPanelRow
                label="trialDaysRemaining"
                value={
                  snapshot.helpers.trialDaysRemaining === null
                    ? "null"
                    : String(snapshot.helpers.trialDaysRemaining)
                }
              />
            </div>

            <div>
              <BillingDebugPanelSectionTitle>UI funnel gates</BillingDebugPanelSectionTitle>
              <BillingDebugPanelBoolRow
                label="shouldShowPlanCheckout"
                value={funnel.planCheckout}
              />
              <BillingDebugPanelBoolRow
                label="shouldShowInvoiceRequest"
                value={funnel.invoiceRequest}
              />
            </div>
          </>
        ) : null}
      </div>
    </details>
  );
}
