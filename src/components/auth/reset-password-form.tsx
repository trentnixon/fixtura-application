"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  SubmitButton,
  InlineAlert,
  SuccessMessageBlock,
  ReturnToSignInAction,
} from "@/components/auth/actions";
import { AuthForm, PasswordInput, ConfirmPasswordInput } from "@/components/auth/forms";
import { AuthSurfaceHeader } from "@/components/auth/structure";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!code) {
      setError("Reset token is missing or has expired.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: values.password,
          passwordConfirmation: values.confirmPassword,
          code,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "The reset link is invalid or has expired.");
        return;
      }

      setSuccess(true);
      toast.success("Password updated");
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <SuccessMessageBlock
          title="Password Reset"
          description="Your password has been successfully updated. You can now sign in with your new password."
        />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="space-y-6">
        <InlineAlert
          message="The reset link is missing or has expired. Please request a new one."
          variant="destructive"
        />
        <div className="flex justify-center">
          <ReturnToSignInAction label="Back to sign in" />
        </div>
      </div>
    );
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      {/* Identity Recovery style header matching kitchen-sink reference */}
      <AuthSurfaceHeader
        icon={<KeyRound className="size-6" />}
        title="New Password"
        description="Choose a strong password to secure your account."
      />

      {error && <InlineAlert message={error} variant="destructive" />}

      <div className="space-y-4">
        <PasswordInput
          {...register("password")}
          label="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={submitting}
        />

        <ConfirmPasswordInput
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          disabled={submitting}
        />
      </div>

      <SubmitButton loading={submitting} buttonVariant="accent">
        Update password
      </SubmitButton>
    </AuthForm>
  );
}
