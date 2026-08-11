"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { TypographyBodySmall, TypographyCardTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

type CreateOrganisationCardProps = {
  className?: string;
  variant?: "grid" | "list" | "empty";
};

export function CreateOrganisationCard({
  className,
  variant = "grid",
}: CreateOrganisationCardProps) {
  if (variant === "empty") {
    return (
      <div
        className={cn(
          "border-border/60 bg-muted/10 flex w-full max-w-lg flex-col gap-4 rounded-xl border p-6 sm:p-8",
          className,
        )}
      >
        <TypographyCardTitle as="h2" className="text-xl font-semibold">
          Create your first organisation
        </TypographyCardTitle>
        <TypographyBodySmall as="p" tone="muted">
          An organisation is a Fixtura workspace for a club or association. Add its sport, branding,
          and organisation details now. If you leave before finishing, you can return and continue
          setup later.
        </TypographyBodySmall>
        <TypographyBodySmall as="p" tone="muted">
          After setup, Fixtura will prepare the workspace and import available organisation data.
        </TypographyBodySmall>
        <Button type="button" className="w-fit" asChild>
          <Link href={ROUTES.createOrganisation}>Create organisation</Link>
        </Button>
      </div>
    );
  }

  const isList = variant === "list";

  return (
    <div
      className={cn(
        "border-muted-foreground/40 bg-muted/5 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-center",
        isList ? "min-h-[4.5rem] flex-row justify-between px-4 py-3 text-left" : "aspect-square",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-1", isList && "flex-1 items-start text-left")}>
        <div className="flex items-center gap-2">
          <Plus className="text-muted-foreground size-5 shrink-0" aria-hidden />
          <TypographyCardTitle className="text-sm font-semibold sm:text-base">
            Add another organisation
          </TypographyCardTitle>
        </div>
        {!isList ? (
          <TypographyBodySmall
            as="p"
            tone="muted"
            className="hidden text-xs min-[1025px]:block sm:text-sm"
          >
            Create a separate workspace for another club or association.
          </TypographyBodySmall>
        ) : null}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(isList && "shrink-0")}
        asChild
      >
        <Link href={ROUTES.createOrganisation}>Create organisation</Link>
      </Button>
    </div>
  );
}
