"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { billingStatusLabel } from "@/features/route-lab/billing/billing-lab-fixtures";
import { applyLabReturnState } from "@/features/route-lab/billing/billing-lab-mock-client";
import { ROUTES } from "@/lib/config/routes";

import type { LabReturnSimulationState } from "@/features/route-lab/billing/lab-billing-types";

type BillingLabSuccessClientProps = {
  accountId: string;
  sessionId: string | null;
  baselineScenario: string;
};

const RETURN_OPTIONS: { value: LabReturnSimulationState; label: string }[] = [
  { value: "payment_ok", label: "Payment successful / account active (lab)" },
  { value: "payment_processing", label: "Payment processing (lab)" },
  { value: "payment_not_found", label: "Payment not found / needs support (lab)" },
];

export function BillingLabSuccessClient({
  accountId,
  sessionId,
  baselineScenario,
}: BillingLabSuccessClientProps) {
  const [returnState, setReturnState] = useState<LabReturnSimulationState>("payment_ok");

  const summary = useMemo(
    () => applyLabReturnState(accountId, baselineScenario, returnState),
    [accountId, baselineScenario, returnState],
  );

  const billingLabHref = `${ROUTES.routeLab}/o/${accountId}/billing`;

  return (
    <div className="space-y-6">
      <Surface className="space-y-4 p-5">
        {sessionId ? (
          <TypographyMuted className="text-sm">
            Query <code className="text-xs">session_id</code>:{" "}
            <code className="text-xs">{sessionId}</code>
          </TypographyMuted>
        ) : (
          <TypographyMuted className="text-sm">
            No <code>session_id</code> in query.
          </TypographyMuted>
        )}

        <div className="max-w-md space-y-2">
          <Label>Simulated return interpretation</Label>
          <Select
            value={returnState}
            onValueChange={(v) => setReturnState(v as LabReturnSimulationState)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETURN_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TypographyMuted className="text-xs">
            Baseline fixture scenario for mock merge: <code>{baselineScenario}</code>
          </TypographyMuted>
        </div>

        <div>
          <p className="text-sm font-medium">Mock refreshed billing summary</p>
          <TypographyMuted className="mt-1 text-xs">
            Status: {billingStatusLabel(summary.billingStatus)} · Access: {summary.accessStatus}
          </TypographyMuted>
          <pre className="bg-muted mt-3 max-h-72 overflow-auto rounded-lg p-3 text-xs">
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default">
            <Link href={billingLabHref}>Back to billing lab</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${billingLabHref}?state=invoice_requested`}>Jump to invoice scenario</Link>
          </Button>
        </div>
      </Surface>
    </div>
  );
}
