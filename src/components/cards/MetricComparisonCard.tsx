import * as React from "react";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export type MetricComparisonColumn = {
  label: React.ReactNode;
  value: React.ReactNode;
};

export type MetricComparisonCardProps = {
  title: React.ReactNode;
  icon?: React.ReactNode;
  primary: MetricComparisonColumn;
  secondary: MetricComparisonColumn;
  footer: React.ReactNode;
  /** Band layout: `surface` matches settings-style Surface; `card` uses CardHeader/Content/Footer. */
  layout?: "surface" | "card";
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

function ComparisonGrid({
  primary,
  secondary,
  className,
}: {
  primary: MetricComparisonColumn;
  secondary: MetricComparisonColumn;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="bg-muted/50 rounded-lg p-3">
        <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
          {primary.label}
        </TypographyMuted>
        <div className="mt-1 text-2xl font-bold tabular-nums">{primary.value}</div>
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
          {secondary.label}
        </TypographyMuted>
        <div className="mt-1 text-2xl font-bold tabular-nums">{secondary.value}</div>
      </div>
    </div>
  );
}

export function MetricComparisonCard({
  title,
  icon,
  primary,
  secondary,
  footer,
  layout = "surface",
  headerClassName,
  bodyClassName,
  footerClassName,
  className,
  ...rest
}: MetricComparisonCardProps & Omit<React.ComponentProps<"div">, keyof MetricComparisonCardProps>) {
  const headerInner = (
    <div className="flex items-center justify-between gap-4">
      {typeof title === "string" ? (
        <TypographyH4 className="text-sm font-semibold">{title}</TypographyH4>
      ) : (
        title
      )}
      {icon}
    </div>
  );

  if (layout === "card") {
    return (
      <Card className={cn("gap-0 overflow-hidden p-0", className)} {...rest}>
        <CardHeader
          className={cn("bg-muted/40 border-border space-y-0 border-b pt-6 pb-6", headerClassName)}
        >
          {headerInner}
        </CardHeader>
        <CardContent className={cn("pt-6", bodyClassName)}>
          <ComparisonGrid primary={primary} secondary={secondary} />
        </CardContent>
        <CardFooter
          className={cn(
            "bg-muted/20 border-border text-muted-foreground flex w-full min-w-0 flex-col items-stretch border-t pt-6 pb-6",
            footerClassName,
          )}
        >
          {footer}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Surface className={cn("overflow-hidden p-0", className)} {...rest}>
      <div
        className={cn(
          "bg-muted/40 border-border flex items-center justify-between border-b px-6 py-4",
          headerClassName,
        )}
      >
        {headerInner}
      </div>
      <div className={cn("p-6", bodyClassName)}>
        <ComparisonGrid primary={primary} secondary={secondary} />
      </div>
      <div
        className={cn(
          "bg-muted/20 border-border text-muted-foreground flex items-center border-t px-6 py-4 text-xs",
          footerClassName,
        )}
      >
        {footer}
      </div>
    </Surface>
  );
}
