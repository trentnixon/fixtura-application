import * as React from "react";

import { cn } from "@/lib/utils";

import { typographyBaseVariants, type TypographyTone } from "./base";

type NavProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** Primary sidebar / top nav labels. */
export function TypographyNavLabel<T extends React.ElementType = "span">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: NavProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm font-medium sm:text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Grouped navigation headings. */
export function TypographyNavSectionLabel<T extends React.ElementType = "span">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: NavProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-xs font-semibold tracking-wide uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Tabs and segmented controls. */
export function TypographyTabLabel<T extends React.ElementType = "span">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: NavProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Breadcrumb links and current page label. */
export function TypographyBreadcrumbText<T extends React.ElementType = "span">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: NavProps<T>) {
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
