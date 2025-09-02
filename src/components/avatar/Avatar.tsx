"use client";

import * as React from "react";

import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type WrappedAvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  status?: "none" | "online" | "offline" | "busy";
  className?: string;
};

const sizeToClass: Record<NonNullable<WrappedAvatarProps["size"]>, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-base",
};

const statusToClass: Record<Exclude<NonNullable<WrappedAvatarProps["status"]>, "none">, string> = {
  online: "bg-emerald-500",
  offline: "bg-muted",
  busy: "bg-amber-500",
};

export function WrappedAvatar({
  src,
  alt,
  fallback = "?",
  size = "md",
  shape = "circle",
  status = "none",
  className,
  ...props
}: WrappedAvatarProps & React.ComponentProps<"div">) {
  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      <UIAvatar
        className={cn(sizeToClass[size], shape === "square" ? "rounded-md" : "rounded-full")}
      >
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </UIAvatar>

      {status !== "none" ? (
        <span
          aria-hidden
          className={cn(
            "ring-background absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2",
            statusToClass[status],
          )}
        />
      ) : null}
    </div>
  );
}
