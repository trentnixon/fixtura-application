import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type ManageSponsorsContainerHeaderTitleProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  className?: string;
};

export const MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME =
  "bg-primary-950 border-primary-900/80 text-white px-6 py-5";

export function ManageSponsorsContainerHeaderTitle({
  icon,
  title,
  description,
  className,
}: ManageSponsorsContainerHeaderTitleProps) {
  return (
    <div className={cn("flex w-full items-start gap-3", className)}>
      <span className="mt-0.5 shrink-0 text-white/90">{icon}</span>
      <div className="min-w-0">
        <p className="text-xl leading-none font-semibold text-white">{title}</p>
        <div className="mt-2 text-sm leading-relaxed text-white/80">{description}</div>
      </div>
    </div>
  );
}
