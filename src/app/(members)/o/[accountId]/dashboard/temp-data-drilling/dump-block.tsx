import type { ReactNode } from "react";

/** Dev dump only — never log real tokens elsewhere. */
export function jsonStringifyRedactingToken(value: unknown): string {
  return JSON.stringify(
    value,
    (key, v) => (key === "token" && typeof v === "string" ? "[REDACTED]" : v),
    2,
  );
}

export function DumpBlock({
  title,
  isPending,
  isError,
  error,
  refetch,
  emptyMessage,
  children,
}: {
  title: string;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (isPending) {
    return (
      <section className="grid gap-2">
        <h2 className="text-foreground text-sm font-medium">{title}</h2>
        <p className="text-muted-foreground text-sm" role="status">
          Loading…
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="grid gap-2">
        <h2 className="text-foreground text-sm font-medium">{title}</h2>
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Request failed."}
        </p>
        <button
          type="button"
          className="text-primary w-fit text-sm underline"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-2">
      <h2 className="text-foreground text-sm font-medium">{title}</h2>
      {children ?? <p className="text-muted-foreground text-sm">{emptyMessage}</p>}
    </section>
  );
}
