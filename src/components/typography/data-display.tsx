import * as React from "react";

import { cn } from "@/lib/utils";

import { typographyBaseVariants, type TypographyTone } from "./base";

type DataProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** KPI / dashboard stat value. */
export function TypographyMetricValue<T extends React.ElementType = "span">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl md:text-4xl",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Label paired with a metric. */
export function TypographyMetricLabel<T extends React.ElementType = "span">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-sm", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Change indicators (+12%, -3%). */
export function TypographyMetricChange<T extends React.ElementType = "span">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm tabular-nums",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Chart / legend / filter labels. */
export function TypographyDataLabel<T extends React.ElementType = "span">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-xs sm:text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Inline / tabular data emphasis. */
export function TypographyDataValue<T extends React.ElementType = "span">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm font-medium tabular-nums sm:text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Table column headers. */
export function TypographyTableHeading<T extends React.ElementType = "th">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "th") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-left text-xs font-semibold tracking-wide uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Default table cell text. */
export function TypographyTableCell<T extends React.ElementType = "td">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "td") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-sm", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Secondary cell text (timestamps, context). */
export function TypographyTableMeta<T extends React.ElementType = "span">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: DataProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-xs", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
