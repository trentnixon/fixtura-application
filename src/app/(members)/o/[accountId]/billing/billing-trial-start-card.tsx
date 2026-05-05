"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client/api-error";
import { usePostAccountBillingStartTrial } from "@/lib/api/hooks/account/usePostAccountBillingStartTrial";
import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { canStartTrial } from "./billing-state";

const TRIAL_DURATION_DAYS = 14;

function formatTrialBannerDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** First and last calendar day of a TRIAL_DURATION_DAYS window starting on `startDay` (local). */
function getTrialInclusiveEndDate(startDay: Date) {
  const end = new Date(startDay);
  end.setDate(end.getDate() + (TRIAL_DURATION_DAYS - 1));
  return end;
}

function messageFromTrialStartFailure(e: unknown): string {
  if (!(e instanceof ApiError)) {
    return AUTH_ERROR_MESSAGES.network;
  }
  const primary = e.message?.trim();
  if (primary) {
    return primary;
  }
  const d = e.details;
  if (typeof d === "object" && d !== null) {
    const rec = d as Record<string, unknown>;
    const nested =
      normalizeErrorFieldToString(rec["message"]) ?? normalizeErrorFieldToString(rec["error"]);
    if (nested) {
      return nested;
    }
  }
  return AUTH_ERROR_MESSAGES.unexpected;
}

export type BillingTrialStartCardProps = {
  accountId: string;
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
};

/**
 * Production equivalent of route-lab `trial_available` — Start assigns trial via CMS; UI follows GET /billing refetch.
 */
export function BillingTrialStartCard({
  accountId,
  enabled,
  availableActions,
}: BillingTrialStartCardProps) {
  const mutation = usePostAccountBillingStartTrial(accountId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const trialSchedule = useMemo(() => {
    if (!confirmOpen) {
      return null;
    }
    const trialStartDay = new Date();
    trialStartDay.setHours(0, 0, 0, 0);
    const trialLastDay = getTrialInclusiveEndDate(trialStartDay);
    return {
      startLabel: formatTrialBannerDate(trialStartDay),
      endLabel: formatTrialBannerDate(trialLastDay),
    };
  }, [confirmOpen]);

  if (!enabled || !canStartTrial(availableActions)) {
    return null;
  }

  function handleOpenChange(next: boolean) {
    if (mutation.isPending && !next) {
      return;
    }
    setConfirmOpen(next);
  }

  async function handleConfirmStart() {
    setErrorMessage(null);
    setFeedback(null);
    try {
      // Path: accountApi.postAccountBillingStartTrial → POST …/api/accounts/{accountId}/billing/start-trial (BFF) → Strapi.
      const body = await mutation.mutateAsync();
      const msg =
        body && typeof body === "object" && "message" in body && typeof body.message === "string"
          ? body.message.trim()
          : "";
      setFeedback(msg || null);
      setConfirmOpen(false);
    } catch (e) {
      setErrorMessage(messageFromTrialStartFailure(e));
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            <CardHeader>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Limited-time free trial
              </p>
              <CardTitle className="text-primary font-brand mt-2 text-xl">
                Unlock Fixtura free for 14 days
              </CardTitle>
              <CardDescription>
                Launch your organisation&apos;s trial in seconds with no upfront payment. Explore
                premium automation, content delivery, and workflow tools today.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              {feedback ? (
                <p
                  className="border-border text-foreground rounded-md border px-3 py-2 text-sm"
                  role="status"
                >
                  {feedback}
                </p>
              ) : null}
              {errorMessage && !confirmOpen ? (
                <p className="text-destructive text-sm" role="alert">
                  {errorMessage}
                  {errorMessage.toLowerCase().includes("trial plan") ? (
                    <span className="text-muted-foreground mt-1 block text-xs">
                      The billing service could not assign a trial — often this means no trial plan
                      is linked to this account in CMS, while &quot;Start trial&quot; was still
                      offered. Ask your team to align GET /billing flags with a configured trial
                      tier.
                    </span>
                  ) : null}
                </p>
              ) : null}
            </CardContent>
          </div>
          <div className="bg-muted/30 flex w-full flex-col justify-center gap-3 border-t p-6 md:w-64 md:border-t-0 md:border-l">
            <p className="text-muted-foreground text-xs">No payment required to start.</p>
            <Button
              type="button"
              variant="accent"
              onClick={() => {
                setErrorMessage(null);
                setFeedback(null);
                setConfirmOpen(true);
              }}
            >
              Start my free trial
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md" aria-describedby="billing-trial-confirm-description">
          <DialogHeader>
            <DialogTitle>Ready to start your free trial?</DialogTitle>
            <DialogDescription id="billing-trial-confirm-description" asChild>
              <div className="[&_strong]:text-foreground space-y-2">
                <p>
                  You&apos;re one click away from <strong>{TRIAL_DURATION_DAYS} days</strong> of
                  premium Fixtura access for your organisation, completely free. No payment is taken
                  here.
                </p>
                {trialSchedule ? (
                  <p>
                    Starts <strong>{trialSchedule.startLabel}</strong>. Ends{" "}
                    <strong>{trialSchedule.endLabel}</strong>.
                  </p>
                ) : null}
              </div>
            </DialogDescription>
          </DialogHeader>
          {errorMessage ? (
            <div className="text-destructive space-y-1 px-1 text-sm" role="alert">
              <p>{errorMessage}</p>
              {errorMessage.toLowerCase().includes("trial plan") ? (
                <p className="text-muted-foreground text-xs">
                  The billing API rejected start-trial (HTTP 400). Check Strapi: a free-trial /
                  default trial tier must exist and match what GET /billing advertises via{" "}
                  <span className="font-mono">canStartTrial</span>.
                </p>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={mutation.isPending}
              onClick={() => void handleConfirmStart()}
            >
              {mutation.isPending ? "Starting trial…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
