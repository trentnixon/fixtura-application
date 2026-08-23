"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SubmitButton, InlineAlert } from "@/components/auth/actions";
import { AuthForm, EmailInput } from "@/components/auth/forms";
import { AuthSurfaceHeader } from "@/components/auth/structure";
import { captureFormSubmitted, initAnalytics } from "@/lib/analytics";
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
    initAnalytics();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "We couldn't process your request. Please try again.");
        captureFormSubmitted("forgot_password", { result: "failed" });
        return;
      }

      captureFormSubmitted("forgot_password", { result: "success" });
      toast.success("Reset link sent");
      router.push(ROUTES.checkEmail);
    } catch {
      setError("A network error occurred. Please check your connection.");
      captureFormSubmitted("forgot_password", { result: "failed" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      {/* Identity Recovery style header matching kitchen-sink reference */}
      <AuthSurfaceHeader
        icon={<Undo2 className="size-6" />}
        title="Restore Access"
        description="Verification link will be sent to your inbox."
      />

      {error && <InlineAlert message={error} variant="destructive" />}

      <EmailInput
        {...register("email")}
        label="Verified Email"
        error={errors.email?.message}
        disabled={submitting}
        description="We'll send a password reset link to this address."
      />

      <div className="flex flex-col gap-3">
        <SubmitButton loading={submitting} buttonVariant="accent">
          Initiate Recovery
        </SubmitButton>
      </div>
    </AuthForm>
  );
}
