"use client";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem persists, contact support.",
  canRetry = true,
  onRetry,
}: {
  title?: string;
  description?: string;
  canRetry?: boolean;
  onRetry?: () => void;
}) {
  const handleRetry = () => {
    if (onRetry) return onRetry();
    return globalThis.location?.reload();
  };

  return (
    <div className="grid gap-3 rounded-xl border p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      {canRetry ? (
        <div className="flex items-center justify-center">
          <Button size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
