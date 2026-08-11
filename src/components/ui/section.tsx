import * as React from "react";

import { cn } from "@/lib/utils";

import { Separator } from "./separator";

type SectionBlockProps = React.ComponentProps<"section"> & {
  as?: React.ElementType;
  variant?: "plain" | "surface" | "inset";
  spacing?: "none" | "sm" | "md" | "lg";
};

const spacingMap: Record<NonNullable<SectionBlockProps["spacing"]>, string> = {
  none: "",
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

const blockVariantMap: Record<NonNullable<SectionBlockProps["variant"]>, string> = {
  plain: "",
  surface: "bg-background rounded-xl border p-5 sm:p-6",
  inset: "bg-muted/70 rounded-xl border border-transparent p-4 sm:p-5",
};

function SectionBlock({
  as: Component = "section",
  variant = "plain",
  spacing = "md",
  className,
  ...props
}: SectionBlockProps) {
  return (
    <Component
      className={cn(spacingMap[spacing], blockVariantMap[variant], className)}
      {...props}
    />
  );
}

type SectionDividerProps = React.ComponentProps<"div"> & {
  variant?: "line" | "labeled" | "inset";
  label?: string;
};

function SectionDivider({ variant = "line", label, className, ...props }: SectionDividerProps) {
  if (variant === "labeled") {
    return (
      <div className={cn("flex items-center gap-3 py-1", className)} aria-hidden {...props}>
        <Separator className="flex-1" />
        <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
          {label ?? "Section"}
        </span>
        <Separator className="flex-1" />
      </div>
    );
  }

  if (variant === "inset") {
    return (
      <div className={cn("px-4 sm:px-6", className)} {...props}>
        <Separator />
      </div>
    );
  }

  return <Separator className={className} {...props} />;
}

type SectionLabelProps = React.ComponentProps<"p"> & {
  variant?: "eyebrow" | "kicker";
};

function SectionLabel({ variant = "eyebrow", className, ...props }: SectionLabelProps) {
  const variantClassName =
    variant === "kicker"
      ? "text-foreground text-xs font-semibold tracking-wide uppercase"
      : "text-primary text-xs font-semibold tracking-wider uppercase";

  return <p className={cn(variantClassName, className)} {...props} />;
}

export { SectionBlock, SectionDivider, SectionLabel };
