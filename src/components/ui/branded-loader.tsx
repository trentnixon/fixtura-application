"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface BrandedLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  label?: string;
}

export function BrandedLoader({
  size = "md",
  fullPage = false,
  label = "Synchronizing Data Stream",
  className,
  ...props
}: BrandedLoaderProps) {
  const containerSize = size === "sm" ? "size-12" : size === "lg" ? "size-24" : "size-16";
  const innerSize = size === "sm" ? "size-8" : size === "lg" ? "size-16" : "size-12";
  const iconSize = size === "sm" ? "size-4" : size === "lg" ? "size-8" : "size-6";

  const content = (
    <div className={cn("flex flex-col items-center justify-center", className)} {...props}>
      {/* Branded Pulse */}
      <div className="relative flex items-center justify-center">
        <div className={cn("bg-primary/20 absolute animate-ping rounded-full", containerSize)} />
        <div className={cn("bg-primary/40 absolute animate-pulse rounded-full", innerSize)} />
        <div
          className={cn(
            "bg-primary shadow-primary/20 relative flex items-center justify-center rounded-2xl shadow-xl",
            iconSize === "size-4" ? "size-8" : "size-12",
          )}
        >
          <Loader2 className={cn("animate-spin text-white", iconSize)} strokeWidth={3} />
        </div>
      </div>

      {label && (
        <div className="mt-8 space-y-1 text-center">
          <h3 className="font-brand text-primary text-lg font-bold tracking-tight">Fixtura</h3>
          <p className="text-muted-foreground animate-pulse text-[10px] leading-none font-medium tracking-[0.2em] uppercase">
            {label}
          </p>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center p-8">
        <div className="from-primary via-brand-secondary to-primary/20 absolute top-0 left-0 h-1 w-full animate-pulse bg-gradient-to-r" />
        {content}
      </div>
    );
  }

  return content;
}
