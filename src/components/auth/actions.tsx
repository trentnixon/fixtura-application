import { MoveLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import type { ComponentProps } from "react";

/**
 * SubmitButton: Primary form action with loading state.
 * Uses shared `Button` loading behaviour (`aria-busy`, spinner). Defaults to `brand` (teal), not `default` (blue).
 * Pass `buttonVariant` for accent flows (e.g. recovery CTAs).
 */
export function SubmitButton({
  children,
  loading,
  className,
  buttonVariant = "brand",
  loadingText = "Please wait",
  fullWidth = true,
  disabled,
  ...props
}: ComponentProps<typeof Button> & {
  loading?: boolean;
  buttonVariant?: ComponentProps<typeof Button>["variant"];
  loadingText?: string;
  /** Auth surfaces default to full width; inline form footers can set `false`. */
  fullWidth?: boolean;
}) {
  return (
    <Button
      {...props}
      type="submit"
      variant={buttonVariant}
      size="lg"
      fullWidth={fullWidth}
      loading={Boolean(loading)}
      loadingText={loadingText}
      className={cn(
        "shadow-primary/20 mt-4 h-12 text-base font-bold shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.98]",
        className,
      )}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

/**
 * ForgotPasswordLink: Recovery path from sign-in form.
 */
export function ForgotPasswordLink({ className }: { className?: string }) {
  return (
    <div className={cn("text-right", className)}>
      <Link
        href={ROUTES.forgotPassword}
        className="text-primary cursor-pointer text-[10px] font-bold tracking-widest uppercase transition-opacity hover:underline hover:opacity-80"
      >
        Forgot?
      </Link>
    </div>
  );
}

/**
 * ReturnToSignInAction: Navigation back to sign-in.
 */
export function ReturnToSignInAction({
  className,
  label = "Back to sign in",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Link
      href={ROUTES.signIn}
      className={cn(
        "text-muted-foreground hover:text-foreground group inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all",
        className,
      )}
    >
      <MoveLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
      {label}
    </Link>
  );
}

/**
 * InlineAlert: Feedback within auth content.
 */
export function InlineAlert({
  message,
  variant = "destructive",
  className,
}: {
  message: string;
  variant?: "destructive" | "warning" | "info" | "success";
  className?: string;
}) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  const colors = {
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    success: "bg-brand/10 text-brand border-brand/20",
  };

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-top-1 flex items-start gap-3 rounded-lg border p-4 text-sm font-medium",
        colors[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}

/**
 * SuccessMessageBlock: Displays successful completion of a recovery action.
 */
export function SuccessMessageBlock({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("animate-in zoom-in-95 space-y-3 py-4 text-center duration-300", className)}>
      <div className="bg-brand/10 text-brand mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="text-foreground text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
