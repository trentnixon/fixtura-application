import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { getStrapiUrl } from "@/lib/config/env";

type ResetPasswordBody = {
  password?: string;
  passwordConfirmation?: string;
  code?: string;
};

/**
 * Proxies the reset-password request to Strapi.
 * Strapi endpoint: POST /api/auth/reset-password
 */
export async function POST(request: Request) {
  const strapiUrl = getStrapiUrl();
  if (!strapiUrl) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.serverError }, { status: 500 });
  }

  let body: ResetPasswordBody;
  try {
    body = (await request.json()) as ResetPasswordBody;
  } catch {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unexpected }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const passwordConfirmation =
    typeof body.passwordConfirmation === "string" ? body.passwordConfirmation : "";
  const code = typeof body.code === "string" ? body.code : "";

  if (!password || !passwordConfirmation || !code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ password, passwordConfirmation, code }),
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      return NextResponse.json(
        { error: AUTH_ERROR_MESSAGES.resetPasswordFailed },
        { status: strapiRes.status === 400 ? 400 : 502 },
      );
    }

    // Strapi returns { jwt, user } on success, but we primarily care about the ok state
    // and let the user log in with their new password since the reset form logic
    // redirects to sign in.
    return NextResponse.json({ ok: true });
  } catch (cause) {
    Sentry.captureException(cause);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.network }, { status: 502 });
  }
}
