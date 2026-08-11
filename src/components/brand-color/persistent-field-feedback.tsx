"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export type PersistentFieldFeedbackVariant = "info" | "success" | "warning" | "error";

export type PersistentFieldFeedbackProps = {
  variant: PersistentFieldFeedbackVariant;
  children: ReactNode;
  className?: string;
  id?: string;
};

const VARIANT_STYLES: Record<PersistentFieldFeedbackVariant, { box: string; icon: typeof Info }> = {
  info: {
    box: "border-primary/20 bg-primary/6 text-foreground",
    icon: Info,
  },
  success: {
    box: "border-emerald-500/25 bg-emerald-500/8 text-foreground",
    icon: CheckCircle2,
  },
  warning: {
    box: "border-amber-500/30 bg-amber-500/10 text-foreground",
    icon: AlertTriangle,
  },
  error: {
    box: "border-destructive/30 bg-destructive/8 text-foreground",
    icon: AlertCircle,
  },
};

export function PersistentFieldFeedback({
  variant,
  children,
  className,
  id,
}: PersistentFieldFeedbackProps) {
  const { box, icon: Icon } = VARIANT_STYLES[variant];
  return (
    <div
      id={id}
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2 rounded-xl border px-3 py-2.5 text-sm leading-snug",
        box,
        className,
      )}
    >
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
