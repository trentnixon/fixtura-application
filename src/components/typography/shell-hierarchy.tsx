import * as React from "react";

import { cn } from "@/lib/utils";

import { typographyBaseVariants, type TypographyTone } from "./base";

type ShellProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** Hero-style route intros; use sparingly. */
export function TypographyDisplay<T extends React.ElementType = "h1">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "h1") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-5xl font-bold tracking-tight sm:text-6xl",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Main heading for a route or major screen. */
export function TypographyPageTitle<T extends React.ElementType = "h1">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "h1") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-3xl font-semibold tracking-tight sm:text-4xl",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Supporting summary under a page title. */
export function TypographyPageDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "max-w-3xl text-lg leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Major section within a page (dashboards, settings). */
export function TypographySectionTitle<T extends React.ElementType = "h2">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "h2") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Support text under section titles. */
export function TypographySectionDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm leading-6 sm:text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Nested sections (forms, settings panels). */
export function TypographySubsectionTitle<T extends React.ElementType = "h3">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "h3") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-base font-semibold tracking-tight sm:text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Card headers, tiles, summary blocks. */
export function TypographyCardTitle<T extends React.ElementType = "h3">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "h3") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "heading", tone }),
        "text-lg font-semibold tracking-tight sm:text-xl",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Body copy inside cards. */
export function TypographyCardDescription<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm leading-6 sm:text-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Short label above a heading (category, state). */
export function TypographyEyebrow<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-xs font-semibold tracking-wider uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Compact upper hierarchy label; more restrained than Eyebrow. */
export function TypographyOverline<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: ShellProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-[11px] font-medium tracking-widest uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
