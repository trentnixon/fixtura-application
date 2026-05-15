import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent text-sm font-medium shadow-xs transition-all hover:-translate-y-px hover:border-border/80 hover:shadow-md disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-transparent disabled:hover:shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:border-border/70",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "border-transparent text-primary underline-offset-4 shadow-none hover:translate-y-0 hover:border-transparent hover:bg-transparent hover:shadow-none hover:underline dark:hover:border-transparent",
        brand: "bg-[var(--brand-secondary)] text-white hover:bg-[var(--brand-secondary)]/90",
        brandOutline:
          "border-[var(--brand-secondary)] bg-background text-[var(--brand-secondary)] shadow-xs hover:bg-brand-secondary/15 hover:border-[var(--brand-secondary)] dark:border-[var(--brand-secondary)] dark:bg-input/30 dark:hover:bg-brand-secondary/20",
        brandPrimary:
          "bg-[var(--brand-primary)] text-primary-foreground hover:bg-[var(--brand-primary)]/90",
        brandPrimaryOutline:
          "border-[var(--brand-primary)] bg-background text-[var(--brand-primary)] shadow-xs hover:bg-brand/15 hover:border-[var(--brand-primary)] dark:border-[var(--brand-primary)] dark:bg-input/30 dark:hover:bg-brand/20",
        accent: "bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent)]/90",
        accentOutline:
          "border-[var(--brand-accent)] bg-background text-[var(--brand-accent)] shadow-xs hover:bg-brand-accent/15 hover:border-[var(--brand-accent)] dark:border-[var(--brand-accent)] dark:bg-input/30 dark:hover:bg-brand-accent/20",
        success:
          "bg-[var(--success-600)] text-white hover:bg-[var(--success-600)]/90 focus-visible:ring-[color-mix(in_oklch,var(--success-600),transparent_75%)]",
        successOutline:
          "border-[var(--success-600)] bg-background text-[var(--success-600)] shadow-xs hover:bg-[color-mix(in_oklch,var(--success-600),transparent_92%)] hover:border-[var(--success-600)] dark:bg-input/30 dark:hover:bg-[color-mix(in_oklch,var(--success-600),transparent_88%)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        /** Dense actions: tables, toolbars */
        compact: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows spinner, disables the control, sets `aria-busy`. Ignored when `asChild` is true. */
    loading?: boolean;
    /** Label while loading; falls back to `children` if omitted. */
    loadingText?: React.ReactNode;
    /** Full-width block button (e.g. mobile primary CTA). */
    fullWidth?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isLoading = Boolean(loading) && !asChild;
  const mergedClassName = cn(buttonVariants({ variant, size, className }), fullWidth && "w-full");

  if (asChild) {
    return (
      <Slot data-slot="button" className={mergedClassName} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      className={mergedClassName}
      disabled={isLoading || disabled}
      aria-busy={isLoading ? true : undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span className="inline-flex min-h-[1em] min-w-[4ch] items-center justify-center">
            {loadingText ?? children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
