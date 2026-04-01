"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { MembersLoadingSkeleton } from "@/components/layout/app/members-loading-skeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { useSession } from "@/hooks/use-session";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { postLogoutRequest } from "@/lib/auth/logout-client";
import { getSessionInvalidRedirectUrl } from "@/lib/config/auth-redirect";

import type { ReactNode } from "react";

export function MembersSessionBoundary({ children }: { children: ReactNode }) {
  const { data, isPending, isError, refetch } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (data?.authenticated) return;
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    queryClient.clear();
    postLogoutRequest().finally(() => {
      router.replace(getSessionInvalidRedirectUrl());
    });
  }, [isPending, data, router, queryClient]);

  if (isPending) {
    return <MembersLoadingSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title={AUTH_ERROR_MESSAGES.sessionVerifyTitle}
        description={AUTH_ERROR_MESSAGES.network}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data?.authenticated) {
    return (
      <div className="text-muted-foreground grid gap-3 text-center text-sm" role="status">
        <p>Signing you out…</p>
        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href={getSessionInvalidRedirectUrl()}>Go to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
