"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { shouldShowInvoiceRequest } from "./billing-invoice-request";
import { shouldShowPlanCheckout } from "./billing-plan-checkout";
import { getBillingDebugSnapshot, type BillingDebugSnapshot } from "./billing-state";

import type { AccountBillingSummaryV1 } from "@/types/api/account";

const shellClass =
  "rounded-lg border border-emerald-900/50 bg-black/90 font-mono text-[11px] text-emerald-300 shadow-lg backdrop-blur-sm";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 py-0.5">
      <span className="w-44 shrink-0 text-emerald-600">{label}</span>
      <span className="min-w-0 flex-1 break-all text-emerald-200">{value}</span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return <Row label={label} value={value ? "true" : "false"} />;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-bold tracking-wide text-emerald-500 uppercase">
      {children}
    </p>
  );
}

function formatSnapshotValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "(empty)";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

export type BillingDebugPanelProps = {
  accountId: string;
  contextLabel?: string;
  summary: AccountBillingSummaryV1 | null;
  isSummaryLoading: boolean;
  summaryError?: string | null;
  extra?: Record<string, string | number | boolean | null | undefined>;
};

export function BillingDebugPanel({
  accountId,
  contextLabel,
  summary,
  isSummaryLoading,
  summaryError,
  extra,
}: BillingDebugPanelProps) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible =
    mounted && (process.env.NODE_ENV === "development" || searchParams.get("debug") === "1");

  const snapshot = useMemo((): BillingDebugSnapshot | null => {
    if (!summary) return null;
    return getBillingDebugSnapshot(summary);
  }, [summary]);

  const funnel = useMemo(() => {
    if (!summary) {
      return { planCheckout: false, invoiceRequest: false };
    }
    return {
      planCheckout: shouldShowPlanCheckout(summary.availableActions),
      invoiceRequest: shouldShowInvoiceRequest(summary.availableActions),
    };
  }, [summary]);

  if (!visible) {
    return null;
  }

  const extraEntries = extra ? Object.entries(extra).filter(([, v]) => v !== undefined) : [];

  return (
    <details className={`${shellClass} mt-6 p-4`} open={false}>
      <summary className="cursor-pointer text-emerald-400 select-none">
        Dev: billing state
        {contextLabel ? <span className="text-emerald-600"> — {contextLabel}</span> : null}
      </summary>

      <div className="border-border mt-3 space-y-4 border-t pt-3">
        <div>
          <SectionTitle>Route</SectionTitle>
          <Row label="accountId" value={accountId} />
        </div>

        {extraEntries.length > 0 ? (
          <div>
            <SectionTitle>Context</SectionTitle>
            {extraEntries.map(([k, v]) => (
              <Row key={k} label={k} value={v === null ? "—" : String(v)} />
            ))}
          </div>
        ) : null}

        <div>
          <SectionTitle>Billing summary fetch</SectionTitle>
          {isSummaryLoading ? (
            <Row label="status" value="loading" />
          ) : summaryError ? (
            <Row label="status" value={`error: ${summaryError}`} />
          ) : !summary ? (
            <Row label="status" value="no payload" />
          ) : (
            <Row label="status" value="ok" />
          )}
        </div>

        {snapshot ? (
          <>
            <div>
              <SectionTitle>Derived</SectionTitle>
              <Row label="billingUiMode" value={snapshot.billingUiMode} />
              <Row label="billingProductState" value={snapshot.billingProductState} />
              <Row label="referenceIso" value={snapshot.referenceIso} />
            </div>

            <div>
              <SectionTitle>Precedence flags</SectionTitle>
              {(
                Object.keys(
                  snapshot.derivationFlags,
                ) as (keyof BillingDebugSnapshot["derivationFlags"])[]
              ).map((k) => (
                <BoolRow key={k} label={k} value={snapshot.derivationFlags[k]} />
              ))}
            </div>

            <div>
              <SectionTitle>Summary slice</SectionTitle>
              {(
                Object.keys(snapshot.summarySlice) as (keyof BillingDebugSnapshot["summarySlice"])[]
              ).map((k) => (
                <Row key={k} label={k} value={formatSnapshotValue(snapshot.summarySlice[k])} />
              ))}
            </div>

            <div>
              <SectionTitle>Helpers</SectionTitle>
              <BoolRow label="canStartTrial" value={snapshot.helpers.canStartTrial} />
              <Row
                label="trialDaysRemaining"
                value={
                  snapshot.helpers.trialDaysRemaining === null
                    ? "null"
                    : String(snapshot.helpers.trialDaysRemaining)
                }
              />
            </div>

            <div>
              <SectionTitle>UI funnel gates</SectionTitle>
              <BoolRow label="shouldShowPlanCheckout" value={funnel.planCheckout} />
              <BoolRow label="shouldShowInvoiceRequest" value={funnel.invoiceRequest} />
            </div>
          </>
        ) : null}
      </div>
    </details>
  );
}
