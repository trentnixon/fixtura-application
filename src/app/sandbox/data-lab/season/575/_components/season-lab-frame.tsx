"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, Section, Surface } from "@/components/ui/container";

import type { ReactNode } from "react";

type SeasonLabFrameProps = {
  title: string;
  description: string;
  endpoints: string[];
  onRefetch: () => void;
  isFetching: boolean;
  children: ReactNode;
};

export function SeasonLabFrame({
  title,
  description,
  endpoints,
  onRefetch,
  isFetching,
  children,
}: SeasonLabFrameProps) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description}>
        <Button type="button" variant="outline" size="sm" onClick={onRefetch}>
          Refetch
        </Button>
        {isFetching ? <TypographyMuted className="text-xs">Refreshing...</TypographyMuted> : null}
      </PageHeader>

      <Section spacing="none">
        <Surface className="overflow-hidden p-0">
          <div className="bg-muted border-b px-6 py-4">
            <p className="text-sm font-semibold">Endpoints under test</p>
          </div>
          <div className="space-y-3 p-6">
            {endpoints.map((endpoint) => (
              <div key={endpoint} className="flex items-start justify-between gap-4">
                <code className="text-foreground text-xs leading-relaxed break-all">
                  {endpoint}
                </code>
              </div>
            ))}
          </div>
        </Surface>
      </Section>

      <Section spacing="none">{children}</Section>
    </div>
  );
}

export function SeasonLabStatus({
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
      <Surface className="flex items-center gap-2 p-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
        <TypographyMuted className="text-sm">{pendingLabel}</TypographyMuted>
      </Surface>
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

export function SeasonLabPayloadCard({ title, payload }: { title: string; payload: unknown }) {
  return (
    <Card className="py-0 shadow-md ring-1">
      <CardHeader className="border-border border-b pb-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <pre className="bg-muted/35 overflow-x-auto rounded-b-xl px-6 py-4 text-xs leading-relaxed">
          {JSON.stringify(payload ?? null, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

export function SeasonLabLinkList({
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

export function SeasonLabRowLink({
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
      className="border-border hover:bg-muted/40 flex items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <TypographyMuted className="mt-0.5 truncate text-xs">{subtitle}</TypographyMuted>
        ) : null}
      </div>
      <span className="text-muted-foreground text-xs">Open</span>
    </Link>
  );
}
