"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SubmitButton, InlineAlert } from "@/components/auth/actions";
import { AuthForm, PasswordInput, ConfirmPasswordInput } from "@/components/auth/forms";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client/api-error";
import { usePostAccountSecurityPassword } from "@/lib/api/hooks/account/usePostAccountSecurityPassword";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "New passwords do not match",
    path: ["passwordConfirmation"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({
  accountId,
  onSuccess,
  footerCancelLabel = "Cancel",
  onDismiss,
}: {
  accountId: string;
  /** Invoked after a successful save and form reset */
  onSuccess?: () => void;
  /** When `onDismiss` is set (e.g. dialog), renders Cancel beside submit */
  footerCancelLabel?: string;
  onDismiss?: () => void;
}) {
  const mutation = usePostAccountSecurityPassword(accountId);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", passwordConfirmation: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    setError(null);
    try {
      await mutation.mutateAsync(values);
      toast.success("Password changed successfully");
      reset();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : AUTH_ERROR_MESSAGES.unexpected);
    }
  }

  const submitting = mutation.isPending;
  const newPassword = watch("password") ?? "";

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

        <PasswordStrengthMeter password={newPassword} />

        <ConfirmPasswordInput
          {...register("passwordConfirmation")}
          error={errors.passwordConfirmation?.message}
          disabled={submitting}
        />
      </div>

      {onDismiss ? (
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onDismiss}
            disabled={submitting}
          >
            {footerCancelLabel}
          </Button>
          <SubmitButton
            loading={submitting}
            fullWidth={false}
            className="mt-0 h-12 shrink-0 rounded-xl px-6 sm:min-w-[160px]"
          >
            Update password
          </SubmitButton>
        </div>
      ) : (
        <SubmitButton loading={submitting}>Update password</SubmitButton>
      )}
    </AuthForm>
  );
}
