import * as React from "react";

import { cn } from "@/lib/utils";

import { typographyBaseVariants, type TypographyTone } from "./base";

type BodyProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** Prominent descriptive body (onboarding, feature intros). */
export function TypographyBodyLarge<T extends React.ElementType = "p">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: BodyProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-lg leading-7", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Compact supporting body. */
export function TypographyBodySmall<T extends React.ElementType = "p">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: BodyProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-sm leading-6", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Captions, chart notes, supplementary metadata. */
export function TypographyCaption<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: BodyProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(typographyBaseVariants({ font: "sans", tone }), "text-xs leading-5", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Disclaimers and secondary legal-style notes. */
export function TypographyFinePrint<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: BodyProps<T>) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-xs leading-5 opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
