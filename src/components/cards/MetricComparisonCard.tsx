import * as React from "react";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export type MetricComparisonColumn = {
  label: React.ReactNode;
  value: React.ReactNode;
};

type MetricComparisonCardBase = {
  title: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  /** Band layout: `surface` matches settings-style Surface; `card` uses CardHeader/Content/Footer. */
  layout?: "surface" | "card";
  headerClassName?: string;
  /** Applied to the title/icon flex row inside the header (e.g. `items-start` for multi-line titles). */
  titleRowClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

export type MetricComparisonCardProps =
  | (MetricComparisonCardBase & {
      primary: MetricComparisonColumn;
      secondary: MetricComparisonColumn;
    })
  | (MetricComparisonCardBase & {
      /** Replaces the two-column comparison grid with free-form body content. */
      body: React.ReactNode;
    });

type MetricComparisonCardDivProps = Omit<
  React.ComponentProps<"div">,
  keyof MetricComparisonCardBase | "primary" | "secondary" | "body"
>;

function hasRenderableLabel(label: React.ReactNode): boolean {
  if (label == null || label === false) return false;
  if (typeof label === "string") return label.trim().length > 0;
  if (typeof label === "number") return !Number.isNaN(label);
  if (typeof label === "boolean") return label;
  return true;
}

function ComparisonGrid({
  primary,
  secondary,
  className,
}: {
  primary: MetricComparisonColumn;
  secondary: MetricComparisonColumn;
  className?: string;
}) {
  const primaryHasLabel = hasRenderableLabel(primary.label);
  const secondaryHasLabel = hasRenderableLabel(secondary.label);

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div
        className={cn(
          "border-border/50 flex flex-col overflow-hidden rounded-lg border p-0",
          primaryHasLabel ? "bg-muted/50" : "bg-muted/25 min-h-48 sm:min-h-52",
        )}
      >
        {primaryHasLabel ? (
          <div className="border-border/40 border-b px-3 py-2">
            <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
              {primary.label}
            </TypographyMuted>
          </div>
        ) : null}
        <div
          className={cn(
            primaryHasLabel
              ? "mt-1 px-3 pb-3 text-2xl font-bold tabular-nums"
              : "flex min-h-0 flex-1 text-base font-normal",
          )}
        >
          {primary.value}
        </div>
      </div>
      <div
        className={cn(
          "border-border/50 flex flex-col overflow-hidden rounded-lg border p-0",
          secondaryHasLabel ? "bg-muted/50" : "bg-muted/25 min-h-48 sm:min-h-52",
        )}
      >
        {secondaryHasLabel ? (
          <div className="border-border/40 border-b px-3 py-2">
            <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
              {secondary.label}
            </TypographyMuted>
          </div>
        ) : null}
        <div
          className={cn(
            secondaryHasLabel
              ? "mt-1 px-3 pb-3 text-2xl font-bold tabular-nums"
              : "flex min-h-0 flex-1 text-base font-normal",
          )}
        >
          {secondary.value}
        </div>
      </div>
    </div>
  );
}

export function MetricComparisonCard({
  title,
  icon,
  footer,
  layout = "surface",
  headerClassName,
  titleRowClassName,
  bodyClassName,
  footerClassName,
  className,
  ...rest
}: MetricComparisonCardProps & MetricComparisonCardDivProps) {
  const { body, primary, secondary, ...domRest } = rest as typeof rest & {
    body?: React.ReactNode;
    primary?: MetricComparisonColumn;
    secondary?: MetricComparisonColumn;
  };

  const bodySection =
    body !== undefined ? (
      body
    ) : (
      <ComparisonGrid
        primary={primary as MetricComparisonColumn}
        secondary={secondary as MetricComparisonColumn}
      />
    );

  const headerInner = (
    <div className={cn("flex items-center justify-between gap-4", titleRowClassName)}>
      {typeof title === "string" ? (
        <TypographyH4 className="text-sm font-semibold">{title}</TypographyH4>
      ) : (
        title
      )}
      {icon}
    </div>
  );

  const showFooter = footer != null;

  if (layout === "card") {
    return (
      <Card className={cn("gap-0 overflow-hidden p-0", className)} {...domRest}>
        <CardHeader
          className={cn("bg-muted/40 border-border space-y-0 border-b pt-6 pb-6", headerClassName)}
        >
          {headerInner}
        </CardHeader>
        <CardContent className={cn("pt-6 pb-6", bodyClassName)}>{bodySection}</CardContent>
        {showFooter ? (
          <CardFooter
            className={cn(
              "bg-muted/20 border-border text-muted-foreground flex w-full min-w-0 flex-col items-stretch border-t pt-6 pb-6",
              footerClassName,
            )}
          >
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    );
  }

  return (
    <Surface className={cn("overflow-hidden p-0", className)} {...domRest}>
      <div
        className={cn(
          "bg-muted/40 border-border flex items-center justify-between border-b px-6 py-4",
          headerClassName,
        )}
      >
        {headerInner}
      </div>
      <div className={cn("p-6", bodyClassName)}>{bodySection}</div>
      {showFooter ? (
        <div
          className={cn(
            "bg-muted/20 border-border text-muted-foreground flex items-center border-t px-6 py-4 text-xs",
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </Surface>
  );
}
