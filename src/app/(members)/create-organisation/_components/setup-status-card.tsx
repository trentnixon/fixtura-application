"use client";

import { useState } from "react";

import { InlineAlert } from "@/components/auth/actions";
import { TypographyFinePrint } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client/api-error";
import { useOnboardingSetupStatus } from "@/lib/api/hooks/account/useOnboardingSetupStatus";
import { useRetryOnboardingSetup } from "@/lib/api/hooks/account/useRetryOnboardingSetup";
import { isTerminalOnboardingSetupStatus } from "@/lib/config/onboarding";

import type { OnboardingSetupStatusData } from "@/types/api/account";

function progressLabel(progress: OnboardingSetupStatusData["progress"]): string | null {
  if (progress === undefined || progress === null) return null;
  if (typeof progress === "number") return `${Math.round(progress)}%`;
  if (typeof progress === "string") return progress.trim() || null;
  return null;
}

function statusDescription(data: OnboardingSetupStatusData): string {
  const phase = data.phase?.trim();
  const base = data.status.trim().toLowerCase();
  const parts: string[] = [];
  if (phase) parts.push(phase);
  if (base === "ready") parts.push("Organisation setup is complete.");
  else if (base === "failed")
    parts.push("Setup could not finish. You can retry, or contact support if this continues.");
  else if (base === "blocked")
    parts.push("Setup needs attention before you can continue using all features.");
  else if (base === "abandoned") parts.push("Setup was stopped.");
  else if (base === "in_progress" || base === "retryable")
    parts.push("We are preparing your organisation in the background.");
  else parts.push(`Status: ${data.status}.`);

  const pl = progressLabel(data.progress);
  if (pl) parts.push(`Progress: ${pl}.`);
  return parts.filter(Boolean).join(" ");
}

type SetupStatusCardProps = {
  accountId: string;
  /** When false, the card does not fetch (e.g. before account exists). */
  enabled?: boolean;
  /** When poll status is `failed`, show Retry (lifecycle v1). */
  showRetryOnFailure?: boolean;
};

/**
 * Polls S1 setup status until terminal; maps machine-readable fields to short copy.
 */
function pipelineDetail(data: OnboardingSetupStatusData): string | null {
  const a = data.initialSetupStatus;
  const b = data.initialDataFetchStatus;
  if (!a && !b) return null;
  const parts: string[] = [];
  if (a) parts.push(`Initial setup: ${a}`);
  if (b) parts.push(`Data fetch: ${b}`);
  return parts.join(" · ");
}

export function SetupStatusCard({
  accountId,
  enabled = true,
  showRetryOnFailure = false,
}: SetupStatusCardProps) {
  const query = useOnboardingSetupStatus(accountId, { enabled: enabled && Boolean(accountId) });
  const retryMutation = useRetryOnboardingSetup(accountId);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (!accountId || !enabled) return null;

  if (query.isPending && !query.data) {
    return (
      <div
        className="border-muted-foreground/30 bg-muted/10 rounded-md border border-dashed p-4"
        aria-live="polite"
      >
        <TypographyFinePrint className="text-muted-foreground">
          Loading setup status…
        </TypographyFinePrint>
      </div>
    );
  }

  if (query.isError) {
    const msg =
      query.error instanceof ApiError && query.error.status === 404
        ? "Setup status is not available yet. It will appear after your organisation is connected."
        : "We could not load setup status. Try again later.";
    return (
      <div className="border-muted-foreground/30 bg-muted/10 rounded-md border border-dashed p-4">
        <TypographyFinePrint className="text-muted-foreground">{msg}</TypographyFinePrint>
      </div>
    );
  }

  const data = query.data;
  if (!data) return null;

  const lower = data.status.trim().toLowerCase();
  const terminal = isTerminalOnboardingSetupStatus(data.status);
  const blocked = lower === "blocked";
  const failed = lower === "failed";
  const pipeline = pipelineDetail(data);

  return (
    <div className="border-border/60 bg-muted/20 flex flex-col gap-2 rounded-md border p-4">
      <TypographyFinePrint className="text-muted-foreground font-medium">
        Organisation setup
      </TypographyFinePrint>
      <p className="text-sm">{statusDescription(data)}</p>
      {pipeline ? (
        <TypographyFinePrint className="text-muted-foreground">{pipeline}</TypographyFinePrint>
      ) : null}
      {data.requiresUserAction ? (
        <InlineAlert
          message="Action is required to continue setup. Check your email or contact support if this persists."
          variant="info"
        />
      ) : null}
      {data.errorCode ? (
        <TypographyFinePrint className="text-muted-foreground">
          Reference: <span className="font-mono text-xs">{data.errorCode}</span>
        </TypographyFinePrint>
      ) : null}
      {retryError ? <InlineAlert message={retryError} variant="destructive" /> : null}
      {showRetryOnFailure && failed && terminal ? (
        <Button
          type="button"
          size="sm"
          className="w-fit"
          disabled={retryMutation.isPending}
          onClick={() => {
            setRetryError(null);
            retryMutation.mutate(
              {},
              {
                onError: (e) => {
                  if (e instanceof ApiError && e.status === 409) {
                    setRetryError(
                      "Retry is not available for this account right now. Refresh the page or contact support.",
                    );
                    return;
                  }
                  setRetryError(e instanceof Error ? e.message : "Retry failed.");
                },
              },
            );
          }}
        >
          {retryMutation.isPending ? "Retrying…" : "Retry setup"}
        </Button>
      ) : null}
      {!terminal ? (
        <TypographyFinePrint className="text-muted-foreground">
          Updating every few seconds…
        </TypographyFinePrint>
      ) : blocked ? (
        <InlineAlert
          message="Setup cannot continue automatically. Contact support if you need help."
          variant="destructive"
        />
      ) : null}
    </div>
  );
}
