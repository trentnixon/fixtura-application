"use client";

import { Info } from "lucide-react";
import Link from "next/link";

import { TypographyBodySmall } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import { ROUTES } from "@/lib/config/routes";

type SelectOrgMissingHelpProps = {
  onRefresh: () => void;
  refreshing?: boolean;
};

export function SelectOrgMissingHelp({ onRefresh, refreshing = false }: SelectOrgMissingHelpProps) {
  return (
    <Surface className="border-primary/15 bg-primary/5 ring-primary/10 space-y-3 ring-1">
      <div className="flex items-start justify-between gap-4">
        <TypographyBodySmall as="p" className="text-primary font-medium">
          Can&apos;t see an organisation you expected?
        </TypographyBodySmall>
        <Info className="text-primary size-5 shrink-0" aria-hidden />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={refreshing} onClick={onRefresh}>
          {refreshing ? "Refreshing…" : "Refresh organisations"}
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={ROUTES.support}>Contact support</Link>
        </Button>
      </div>
    </Surface>
  );
}
