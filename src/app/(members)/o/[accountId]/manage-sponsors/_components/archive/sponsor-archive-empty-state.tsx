import { ArchiveRestore } from "lucide-react";
import Link from "next/link";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  SPONSOR_ARCHIVE_EMPTY_STATE_BACK_LABEL,
  SPONSOR_ARCHIVE_EMPTY_STATE_DESCRIPTION,
  SPONSOR_ARCHIVE_EMPTY_STATE_TITLE,
} from "./_constants/sponsor-archive-empty-state";
import { getSponsorArchivePoolHref } from "./_utils/get-sponsor-archive-pool-href";

import type { SponsorArchiveEmptyStateProps } from "./_types/sponsor-archive-empty-state";

export function SponsorArchiveEmptyState({ accountId }: SponsorArchiveEmptyStateProps) {
  return (
    <Card className="border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-10 text-center">
        <div
          className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-lg"
          aria-hidden
        >
          <ArchiveRestore className="size-6" />
        </div>
        <TypographyH4 className="mt-4 text-base font-semibold">
          {SPONSOR_ARCHIVE_EMPTY_STATE_TITLE}
        </TypographyH4>
        <TypographyMuted className="mt-2 max-w-xl text-sm leading-relaxed">
          {SPONSOR_ARCHIVE_EMPTY_STATE_DESCRIPTION}
        </TypographyMuted>
        <Button className="mt-5" variant="brandPrimaryOutline" asChild>
          <Link href={getSponsorArchivePoolHref(accountId)}>
            {SPONSOR_ARCHIVE_EMPTY_STATE_BACK_LABEL}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
