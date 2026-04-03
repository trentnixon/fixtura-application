"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SubmitButton, ForgotPasswordLink, InlineAlert } from "@/components/auth/actions";
import { AuthForm, EmailInput, PasswordInput } from "@/components/auth/forms";
import { useLogin } from "@/lib/api/hooks/auth/useLogin";
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
  const login = useLogin();
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
    try {
      await login.mutateAsync({
        identifier: values.email,
        password: values.password,
      });

      toast.success("Signed in");
      const from = searchParams.get("from");
      const safePath = from && isSafeAppReturnPath(from) ? from : ROUTES.selectOrganisation;
      router.push(safePath);
    } catch (error: any) {
      // The error message from ApiError or network is surfaced by the hook or manually here
      toast.error(error.message ?? AUTH_ERROR_MESSAGES.loginUnavailable);
    }
  }

  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      {sessionExpiredNotice && (
        <InlineAlert message={AUTH_ERROR_MESSAGES.sessionExpired} variant="destructive" />
      )}

      <div className="space-y-4">
        <EmailInput
          {...register("email")}
          error={errors.email?.message}
          disabled={login.isPending}
        />

        <div className="space-y-1">
          <PasswordInput
            {...register("password")}
            error={errors.password?.message}
            disabled={login.isPending}
          />
          <ForgotPasswordLink />
        </div>
      </div>

      <SubmitButton loading={login.isPending}>Sign in</SubmitButton>
    </AuthForm>
  );
}
