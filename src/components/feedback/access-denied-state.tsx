"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { ROUTES } from "@/lib/config/routes";

/**
 * Use when `parseJsonOrThrow` throws `ApiError` with `status === 403`.
 * Does not clear the session; user remains signed in.
 */
export function AccessDeniedState({
  title = "Access denied",
  description = AUTH_ERROR_MESSAGES.forbidden,
  backHref = ROUTES.app,
  backLabel = "Back to members",
}: {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="grid gap-3 rounded-xl border p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="flex justify-center">
        <Button asChild size="sm" variant="outline">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
