"use client";

import Link from "next/link";

import {
  TypographyBodySmall,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/config/routes";

import {
  SUPPORT_READ_ONLY_UNAVAILABLE_DESCRIPTION,
  SUPPORT_READ_ONLY_UNAVAILABLE_TITLE,
} from "./support-read-only-copy";

type SupportReadOnlyUnavailableProps = {
  accountId?: string;
  /** Optional back link (e.g. manage-sponsors). Defaults to support accounts directory. */
  backHref?: string;
  backLabel?: string;
  description?: string;
};

/**
 * Full-page/card message when a route is blocked in support view (hidden nav or write-only flows).
 */
export function SupportReadOnlyUnavailable({
  accountId,
  backHref,
  backLabel = "Back to support accounts",
  description = SUPPORT_READ_ONLY_UNAVAILABLE_DESCRIPTION,
}: SupportReadOnlyUnavailableProps) {
  const defaultBackHref =
    backHref ??
    (accountId ? `/o/${encodeURIComponent(accountId)}/dashboard` : ROUTES.supportAccounts);

  return (
    <Card>
      <CardHeader>
        <TypographyPageTitle className="text-xl font-semibold">
          {SUPPORT_READ_ONLY_UNAVAILABLE_TITLE}
        </TypographyPageTitle>
        <TypographyPageDescription>{description}</TypographyPageDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={defaultBackHref}>{backLabel}</Link>
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={ROUTES.supportAccounts}>Support accounts</Link>
        </Button>
        <TypographyBodySmall className="text-muted-foreground w-full" role="status">
          Read-only support view — backend blocks mutations on customer accounts.
        </TypographyBodySmall>
      </CardContent>
    </Card>
  );
}
