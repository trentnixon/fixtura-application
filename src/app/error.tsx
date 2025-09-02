"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    globalThis.console?.error?.(error);
  }, [error]);

  return (
    <div className="mx-auto grid max-w-lg gap-4 py-12 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">{error.message || "Unexpected error"}</p>
      <div className="flex items-center justify-center gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go home
        </Button>
      </div>
    </div>
  );
}
