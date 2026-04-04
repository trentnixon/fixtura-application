"use client";

import { FeedbackCardTinted } from "@/components/ui/feedback-card";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

export function AccountLoadErrorFeedback({ onRetry }: { onRetry: () => void }) {
  return (
    <FeedbackCardTinted
      kind="error"
      label="Error"
      title="Could not load accounts"
      description={AUTH_ERROR_MESSAGES.network}
      primaryCta="Try again"
      onPrimaryAction={onRetry}
    />
  );
}

/** Route-lab preview: reload on retry (no server → client function props). */
export function AccountLoadErrorFeedbackLab() {
  return <AccountLoadErrorFeedback onRetry={() => globalThis.location?.reload()} />;
}
