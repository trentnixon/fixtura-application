"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SubmitButton, InlineAlert } from "@/components/auth/actions";
import { AuthForm, PasswordInput, ConfirmPasswordInput } from "@/components/auth/forms";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Password change failed. Please try again.");
        return;
      }

      toast.success("Password changed successfully");
      reset();
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      {error && <InlineAlert message={error} variant="destructive" />}

      <div className="space-y-4">
        <PasswordInput
          {...register("currentPassword")}
          label="Current Password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          disabled={submitting}
        />

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

      <SubmitButton loading={submitting}>Update password</SubmitButton>
    </AuthForm>
  );
}
