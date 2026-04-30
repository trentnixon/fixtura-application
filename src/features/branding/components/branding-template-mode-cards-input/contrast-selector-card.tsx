"use client";

import { Contrast } from "lucide-react";

import { TypographyH3 } from "@/components/typography";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import type { ContrastSelectorCardProps } from "./_types";

export function ContrastSelectorCard({
  headerDescription,
  children,
  footer,
}: ContrastSelectorCardProps) {
  return (
    <Card className="w-full gap-0 overflow-hidden py-0">
      <CardHeader className="bg-primary-950 gap-3 py-6 text-white">
        <CardAction>
          <Contrast className="size-5 shrink-0 text-white" aria-hidden />
        </CardAction>
        <TypographyH3 className="text-xl leading-none font-semibold text-white">
          2. Contrast selector
        </TypographyH3>
        {headerDescription ? (
          <div className="text-white/80 **:text-white/80">{headerDescription}</div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 py-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-6 pb-6">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
