"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { LOGIN_REASON_SESSION } from "@/lib/config/auth-redirect";
import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

const inputClassName = cn(
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground",
  "focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm",
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const sessionExpiredNotice = searchParams.get("reason") === LOGIN_REASON_SESSION;

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          identifier: values.email,
          password: values.password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? AUTH_ERROR_MESSAGES.loginUnavailable);
        return;
      }

      toast.success("Signed in");
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      const from = searchParams.get("from");
      const safePath = from && isSafeAppReturnPath(from) ? from : ROUTES.app;
      router.push(safePath);
      router.refresh();
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {sessionExpiredNotice ? (
        <div
          className="bg-muted/50 text-foreground rounded-lg border px-3 py-2 text-sm"
          role="status"
        >
          {AUTH_ERROR_MESSAGES.sessionExpired}
        </div>
      ) : null}
      <div className="grid gap-2">
        <label htmlFor="members-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="members-email"
          type="email"
          autoComplete="email"
          className={inputClassName}
          disabled={submitting}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label htmlFor="members-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="members-password"
          type="password"
          autoComplete="current-password"
          className={inputClassName}
          disabled={submitting}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
