import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { spamSuppression } from "@/lib/auth/spam-suppression";
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

  // 1. Spam Suppression & Rate Limiting Check
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const { allowed, reason } = spamSuppression.checkForgotPassword(ip, email);

  if (!allowed) {
    console.warn(`[AUTH_BLOCK] Forgot password blocked for ${email} from ${ip}. Reason: ${reason}`);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.tooManyRequests }, { status: 429 });
  }

  // 2. Record attempt
  spamSuppression.recordForgotPasswordAttempt(ip, email);

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    // 3. Generic Response (even if Strapi fails)
    // To prevent account enumeration, we always return success if the request was validly formatted and not rate-limited.
    if (!strapiRes.ok) {
      console.warn(
        `[AUTH_INFO] Forgot password proxy failed for ${email} (Strapi status: ${strapiRes.status})`,
      );
    }

    return NextResponse.json({ ok: true, message: AUTH_ERROR_MESSAGES.forgotPasswordSuccess });
  } catch (cause) {
    Sentry.captureException(cause);
    // Even on network failure, we return the same generic message to the client
    return NextResponse.json({ ok: true, message: AUTH_ERROR_MESSAGES.forgotPasswordSuccess });
  }
}
