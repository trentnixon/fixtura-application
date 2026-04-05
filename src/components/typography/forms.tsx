import * as React from "react";

import { cn } from "@/lib/utils";

import { typographyBaseVariants, type TypographyTone } from "./base";

type FormTextProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** Form field label. */
export function TypographyLabel<T extends React.ElementType = "label">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: FormTextProps<T>) {
  const Component = (as ?? "label") as React.ElementType;
  return (
    <Component
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export type TypographyLabelRequiredProps = Omit<
  React.ComponentPropsWithoutRef<"label">,
  "className" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
  tone?: TypographyTone;
  /** When true, shows a required marker (default asterisk). */
  required?: boolean;
  marker?: React.ReactNode;
};

/** Label with optional required marker. */
export function TypographyLabelRequired({
  className,
  tone = "default",
  children,
  required = true,
  marker = (
    <span className="text-destructive ml-0.5" aria-hidden>
      *
    </span>
  ),
  ...props
}: TypographyLabelRequiredProps) {
  return (
    <label
      className={cn(
        typographyBaseVariants({ font: "sans", tone }),
        "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required ? marker : null}
    </label>
  );
}

/** Hint text beneath an input. */
export function TypographyHelperText<T extends React.ElementType = "p">({
  as,
  className,
  tone = "muted",
  children,
  ...props
}: FormTextProps<T>) {
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

/** Validation and destructive inline messaging. */
export function TypographyErrorText<T extends React.ElementType = "p">({
  as,
  className,
  tone = "destructive",
  children,
  ...props
}: FormTextProps<T>) {
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

/** Positive inline validation. */
export function TypographySuccessText<T extends React.ElementType = "p">({
  as,
  className,
  tone = "success",
  children,
  ...props
}: FormTextProps<T>) {
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

/** Grouped field section title. */
export function TypographyFieldsetLegend<T extends React.ElementType = "legend">({
  as,
  className,
  tone = "default",
  children,
  ...props
}: FormTextProps<T>) {
  const Component = (as ?? "legend") as React.ElementType;
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
