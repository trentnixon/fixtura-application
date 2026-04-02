"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SubmitButton, InlineAlert } from "@/components/auth/actions";
import { AuthForm, EmailInput } from "@/components/auth/forms";
import { ROUTES } from "@/lib/config/routes";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "We couldn't process your request. Please try again.");
        return;
      }

      toast.success("Reset link sent");
      router.push(ROUTES.checkEmail);
    } catch {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      {error && <InlineAlert message={error} variant="destructive" />}

      <EmailInput
        {...register("email")}
        error={errors.email?.message}
        disabled={submitting}
        description="We'll send a password reset link to this email address."
      />

      <SubmitButton loading={submitting}>Send reset link</SubmitButton>
    </AuthForm>
  );
}
