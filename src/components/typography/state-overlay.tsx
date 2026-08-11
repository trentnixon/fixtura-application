import * as React from "react";

import { cn } from "@/lib/utils";

import { typographyBaseVariants, type TypographyTone } from "./base";

type StateProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** Alert / banner titles. */
export function TypographyAlertTitle<T extends React.ElementType = "h3">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "h3") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-base font-semibold sm:text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Alert / banner body copy. */
export function TypographyAlertDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm sm:text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Status chips / badges text. */
export function TypographyStatusLabel<T extends React.ElementType = "span">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "span") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-xs font-medium sm:text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Empty state heading. */
export function TypographyEmptyStateTitle<T extends React.ElementType = "h2">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "h2") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-xl font-semibold tracking-tight sm:text-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Empty state supporting text. */
export function TypographyEmptyStateDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm sm:text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Modal / drawer heading. */
export function TypographyDialogTitle<T extends React.ElementType = "h2">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "h2") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-xl leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Modal / drawer supporting text. */
export function TypographyDialogDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-sm", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Popover titles. */
export function TypographyPopoverTitle<T extends React.ElementType = "h4">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "h4") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-sm font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Popover body. */
export function TypographyPopoverDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: StateProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
