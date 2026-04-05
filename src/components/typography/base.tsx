import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Shared font + tone tokens for typography primitives.
 * Semantic components merge these with size/weight classes.
 */
export const typographyBaseVariants = cva("", {
  variants: {
    font: {
      heading: "font-heading",
      sans: "font-sans",
      mono: "font-mono",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
      success: "text-[var(--success)]",
      warning: "text-[var(--warning)]",
    },
  },
  defaultVariants: {
    font: "sans",
    tone: "default",
  },
});

export type TypographyFont = NonNullable<VariantProps<typeof typographyBaseVariants>["font"]>;
export type TypographyTone = NonNullable<VariantProps<typeof typographyBaseVariants>["tone"]>;

export type TypographyBaseProps = {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
} & VariantProps<typeof typographyBaseVariants> &
  Omit<React.ComponentPropsWithoutRef<"span">, "className" | "children">;

/**
 * Low-level polymorphic typography primitive. Prefer named semantic exports for product UI.
 */
export function TypographyBase({
  as: Component = "span",
  font,
  tone,
  className,
  children,
  ...props
}: TypographyBaseProps) {
  return (
    <Component className={cn(typographyBaseVariants({ font, tone }), className)} {...props}>
      {children}
    </Component>
  );
}
