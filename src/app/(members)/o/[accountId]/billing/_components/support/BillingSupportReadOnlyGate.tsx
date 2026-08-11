"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  TypographyBodySmall,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { BILLING_SUPPORT_READ_ONLY_COPY } from "../../_constants/support/billingSupportReadOnly";
import { useBillingSupportReadOnly } from "../../_hooks/useBillingSupportReadOnly";

import type { ReactNode } from "react";

type BillingSupportReadOnlyGateProps = {
  accountId: string;
  children: ReactNode;
  /** When true, redirect to billing overview instead of showing an inline message. */
  redirectWhenReadOnly?: boolean;
};

/**
 * Blocks billing mutation flows (checkout / create subscription) in support view.
 */
export function BillingSupportReadOnlyGate({
  accountId,
  children,
  redirectWhenReadOnly = false,
}: BillingSupportReadOnlyGateProps) {
  const isReadOnly = useBillingSupportReadOnly();
  const router = useRouter();
  const billingHref = `/o/${encodeURIComponent(accountId)}/billing`;

  useEffect(() => {
    if (!isReadOnly || !redirectWhenReadOnly) return;
    router.replace(billingHref);
  }, [billingHref, isReadOnly, redirectWhenReadOnly, router]);

  if (!isReadOnly) {
    return <>{children}</>;
  }

  if (redirectWhenReadOnly) {
    return <BrandedLoader label="Loading billing" />;
  }

  return (
    <Card>
      <CardHeader>
        <TypographyPageTitle className="text-xl font-semibold">
          Read-only support view
        </TypographyPageTitle>
        <TypographyPageDescription>
          {BILLING_SUPPORT_READ_ONLY_COPY.createFlowBlocked}
        </TypographyPageDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={billingHref}>Back to billing overview</Link>
        </Button>
        <TypographyBodySmall className="text-muted-foreground w-full" role="status">
          Billing summary and order history remain available on the overview and history pages.
        </TypographyBodySmall>
      </CardContent>
    </Card>
  );
}
