import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

/**
 * AuthPageHeader: Standardised heading block for auth pages.
 */
export function AuthPageHeader({
  title,
  description,
  align = "center",
  className,
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header className={cn("space-y-4", align === "center" && "text-center", className)}>
      <div className={cn("flex", align === "center" && "justify-center")}>
        <img src="/logos/apple-touch-icon.png" alt="Fixtura Logo" className="h-16 w-16" />
      </div>
      <div className="space-y-1">
        <h1 className="font-brand text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm font-medium tracking-tight opacity-70">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

/**
 * AuthSurface: Main visual surface for forms and state content.
 */
export function AuthSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-[1.25rem] border border-white/30 bg-white/40 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] backdrop-blur-md xl:p-10 dark:border-white/10 dark:bg-black/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * SecondaryLinkGroup: Groups supporting links below auth content.
 */
export function SecondaryLinkGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-6 flex flex-col items-center gap-4 text-center", className)}>
      {children}
    </div>
  );
}
