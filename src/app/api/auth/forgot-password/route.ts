import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { getStrapiUrl } from "@/lib/config/env";

type ForgotPasswordBody = {
  email?: string;
};

/**
 * Proxies the forgot-password request to Strapi.
 * Strapi endpoint: POST /api/auth/forgot-password
 */
export async function POST(request: Request) {
  const strapiUrl = getStrapiUrl();
  if (!strapiUrl) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.serverError }, { status: 500 });
  }

  let body: ForgotPasswordBody;
  try {
    body = (await request.json()) as ForgotPasswordBody;
  } catch {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unexpected }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      // Strapi doesn't always provide a clear error message here for security (don't leak if email exists)
      // but we should still handle the failure.
      return NextResponse.json(
        { error: AUTH_ERROR_MESSAGES.forgotPasswordFailed },
        { status: strapiRes.status === 400 ? 400 : 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (cause) {
    Sentry.captureException(cause);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.network }, { status: 502 });
  }
}
