"use client";

import { User, Lock, Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * AuthForm: Consistent wrapper for auth field groups.
 */
export function AuthForm({
  children,
  onSubmit,
  className,
}: {
  children: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  className?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      className={cn("space-y-6", className)}
    >
      {children}
    </form>
  );
}

/**
 * EmailInput: Labeled, validated email field.
 */
export interface EmailInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string | undefined;
  description?: string;
}

export function EmailInput({
  label = "Email",
  error,
  description,
  className,
  ...props
}: EmailInputProps) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={props.id || "email"}
        className="text-xs font-bold tracking-wider uppercase opacity-70"
      >
        {label}
      </Label>
      <div className="group relative">
        <User className="text-muted-foreground group-focus-within:text-primary absolute top-3.5 left-4 h-4 w-4 transition-colors" />
        <Input
          id={props.id || "email"}
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          required
          aria-invalid={!!error}
          className={cn(
            "h-11 rounded-xl pl-11",
            error && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />
      </div>
      {description && !error && (
        <p className="text-muted-foreground/60 text-[10px] font-bold tracking-widest uppercase">
          {description}
        </p>
      )}
      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
    </div>
  );
}

/**
 * PasswordInput: Secure password field.
 */
export interface PasswordInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string | undefined;
  description?: string;
}

export function PasswordInput({
  label = "Password",
  error,
  description,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid gap-2">
      <Label
        htmlFor={props.id || "password"}
        className="text-xs font-bold tracking-wider uppercase opacity-70"
      >
        {label}
      </Label>
      <div className="group relative">
        <Lock className="text-muted-foreground group-focus-within:text-primary absolute top-3.5 left-4 h-4 w-4 transition-colors" />
        <Input
          id={props.id || "password"}
          type={showPassword ? "text" : "password"}
          autoComplete={props.autoComplete || "current-password"}
          required
          aria-invalid={!!error}
          className={cn(
            "h-11 rounded-xl pr-11 pl-11 font-mono",
            error && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-primary absolute top-3.5 right-4 flex h-4 w-4 items-center justify-center transition-colors focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </button>
      </div>
      {description && !error && (
        <p className="text-muted-foreground/60 text-[10px] font-bold tracking-widest uppercase">
          {description}
        </p>
      )}
      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
    </div>
  );
}

/**
 * ConfirmPasswordInput: Password mismatch validation field.
 */
export function ConfirmPasswordInput({ error, ...props }: PasswordInputProps) {
  return (
    <PasswordInput
      id="confirm-password"
      label="Confirm Password"
      autoComplete="new-password"
      error={error}
      {...props}
    />
  );
}
