"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackCardTinted } from "@/components/ui/feedback-card";

import type { ReactNode } from "react";

type SeasonRouteLabFrameProps = {
  title: string;
  description?: string;
  productionRoute?: string;
  header?: ReactNode;
  endpoints: string[];
  onRefetch: () => void;
  isFetching: boolean;
  children: ReactNode;
};

export function SeasonRouteLabFrame({
  title,
  description,
  productionRoute,
  header,
  endpoints,
  onRefetch,
  isFetching,
  children,
}: SeasonRouteLabFrameProps) {
  return (
    <div className="space-y-6">
      {header ? (
        header
      ) : (
        <header className="border-border space-y-2 border-b pb-6">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
          {productionRoute ? (
            <p className="text-muted-foreground font-mono text-xs">
              Production route: <span className="text-foreground">{productionRoute}</span>
            </p>
          ) : null}
        </header>
      )}

      {children}

      <section className="space-y-3 pt-2" aria-label="Debugging">
        <FeedbackCardTinted
          kind="critical"
          label="Debugging"
          title="Debug scope for this lab route"
          description="This block is development-only and intentionally separated from the FE user-facing UI."
          primaryCta="Refetch debug scope"
          metadata={isFetching ? "Refreshing debug data..." : "Idle"}
          onPrimaryAction={onRefetch}
        />
        <Card className="py-0 shadow-md ring-1">
          <CardHeader className="border-border border-b pb-4">
            <CardTitle className="text-sm">Debugging: endpoint scope under test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {endpoints.map((endpoint) => (
              <code
                key={endpoint}
                className="text-foreground block text-xs leading-relaxed break-all"
              >
                {endpoint}
              </code>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function SeasonRouteLabStatus({
  isPending,
  isError,
  errorMessage,
  pendingLabel,
}: {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  pendingLabel: string;
}) {
  if (isPending) {
    return (
      <div className="bg-card flex items-center gap-2 rounded-lg border p-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
        <TypographyMuted className="text-sm">{pendingLabel}</TypographyMuted>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="ring-destructive/20 bg-destructive/5 border-none ring-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="size-4" aria-hidden />
            Request failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{errorMessage ?? "Unknown error"}</p>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function SeasonRouteLabPayloadCard({ title, payload }: { title: string; payload: unknown }) {
  return (
    <div className="space-y-3">
      <FeedbackCardTinted
        kind="critical"
        label="Debugging"
        title={title}
        description="Raw payload shown for debugging only. Keep this block below FE user-facing content."
        primaryCta="Debug payload"
      />
      <Card className="py-0 shadow-md ring-1">
        <CardContent className="px-0 pb-0">
          <pre className="bg-muted/35 overflow-x-auto rounded-xl px-6 py-4 text-xs leading-relaxed">
            {JSON.stringify(payload ?? null, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export function SeasonRouteLabLinkList({
  title,
  emptyLabel,
  children,
}: {
  title: string;
  emptyLabel: string;
  children: ReactNode;
}) {
  const hasItems = Boolean(children);

  return (
    <Card className="py-0 shadow-md ring-1">
      <CardHeader className="border-border border-b pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {hasItems ? (
          <ul>{children}</ul>
        ) : (
          <div className="px-6 py-4">
            <TypographyMuted className="text-sm">{emptyLabel}</TypographyMuted>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SeasonRouteLabRowLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="border-border hover:bg-muted/40 flex w-full min-w-0 items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <TypographyMuted className="mt-0.5 truncate text-xs">{subtitle}</TypographyMuted>
        ) : null}
      </div>
      <Button asChild variant="accentOutline" size="sm">
        <span>Open</span>
      </Button>
    </Link>
  );
}
