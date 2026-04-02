"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SubmitButton, ForgotPasswordLink, InlineAlert } from "@/components/auth/actions";
import { AuthForm, EmailInput, PasswordInput } from "@/components/auth/forms";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { LOGIN_REASON_SESSION } from "@/lib/config/auth-redirect";
import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

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

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = form;

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
      const safePath = from && isSafeAppReturnPath(from) ? from : ROUTES.dashboard;
      router.push(safePath);
      router.refresh();
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.network);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      {sessionExpiredNotice && (
        <InlineAlert message={AUTH_ERROR_MESSAGES.sessionExpired} variant="destructive" />
      )}

      <div className="space-y-4">
        <EmailInput {...register("email")} error={errors.email?.message} disabled={submitting} />

        <div className="space-y-1">
          <PasswordInput
            {...register("password")}
            error={errors.password?.message}
            disabled={submitting}
          />
          <ForgotPasswordLink />
        </div>
      </div>

      <SubmitButton loading={submitting}>Sign in</SubmitButton>
    </AuthForm>
  );
}
