"use client";

import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PublicAreaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    globalThis.console?.error?.(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto grid max-w-lg gap-4 py-12 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">
        This page could not load. Try again, or return to the home page.
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/")}>
          Home
        </Button>
      </div>
    </div>
  );
}
