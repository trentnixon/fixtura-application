import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type BrandingContainerHeaderTitleProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  className?: string;
  /** Dark navy header (default) or light grey band matching standard cards. */
  tone?: "dark" | "light";
};

export const BRANDING_CONTAINER_HEADER_CLASS_NAME =
  "bg-primary-950 border-primary-900/80 text-white px-6 py-5";

export const BRANDING_CONTAINER_HEADER_LIGHT_CLASS_NAME =
  "bg-muted/40 border-border text-foreground px-6 py-5";

export function BrandingContainerHeaderTitle({
  icon,
  title,
  description,
  className,
  tone = "dark",
}: BrandingContainerHeaderTitleProps) {
  const isLight = tone === "light";

  return (
    <div className={cn("flex w-full items-start gap-3", className)}>
      <span className={cn("mt-0.5 shrink-0", isLight ? "text-muted-foreground" : "text-white/90")}>
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xl leading-none font-semibold",
            isLight ? "text-foreground" : "text-white",
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "mt-2 text-sm leading-relaxed",
            isLight ? "text-muted-foreground" : "text-white/80",
          )}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
