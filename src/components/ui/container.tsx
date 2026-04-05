import * as React from "react";

import { TypographyPageDescription, TypographyPageTitle } from "@/components/typography";
import { cn } from "@/lib/utils";

/**
 * Main Page Container
 * Ensures consistent horizontal alignment and maximum width across the application.
 */
function Container({
  className,
  as: Component = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: React.ElementType }) {
  return (
    <Component className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}

/**
 * Section Container
 * Used to group content blocks vertically with consistent spacing (rhythm).
 */
function Section({
  className,
  as: Component = "section",
  spacing = "md",
  ...props
}: React.ComponentProps<"section"> & {
  as?: React.ElementType;
  spacing?: "sm" | "md" | "lg" | "none";
}) {
  const spacingMap = {
    none: "",
    sm: "py-8 md:py-12",
    md: "py-12 md:py-16",
    lg: "py-16 md:py-24",
  };

  return <Component className={cn(spacingMap[spacing], className)} {...props} />;
}

/**
 * Page Header Container
 * Standardizes the top-level heading and description for pages.
 */
function PageHeader({
  className,
  title,
  description,
  children,
  ...props
}: React.ComponentProps<"header"> & { title: string; description?: string }) {
  return (
    <header className={cn("border-border mb-8 border-b pb-8", className)} {...props}>
      <div className="space-y-2">
        <TypographyPageTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </TypographyPageTitle>
        {description ? (
          <TypographyPageDescription className="max-w-3xl">{description}</TypographyPageDescription>
        ) : null}
      </div>
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}

/**
 * Content Surface
 * A simple container with background and subtle borders.
 */
function Surface({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border rounded-2xl border p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Premium Glass Surface
 * Mimics the high-end look of the login form with glassmorphism and subtle shadows.
 */
function GlassSurface({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative rounded-[1.25rem] border border-white/30 bg-white/40 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] backdrop-blur-md xl:p-10 dark:border-white/10 dark:bg-black/40",
        className,
      )}
      {...props}
    />
  );
}

export { Container, Section, PageHeader, Surface, GlassSurface };
