import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { getStrapiUrl } from "@/lib/config/env";

type ChangePasswordBody = {
  currentPassword?: string;
  password?: string;
  passwordConfirmation?: string;
};

/**
 * Proxies the change-password request to Strapi.
 * Strapi endpoint: POST /api/auth/change-password (Authenticated)
 */
export async function POST(request: Request) {
  const strapiUrl = getStrapiUrl();
  if (!strapiUrl) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.serverError }, { status: 500 });
  }

  const cookieStore = await cookies();
  const jwt = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!jwt) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unauthorized }, { status: 401 });
  }

  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unexpected }, { status: 400 });
  }

  const { currentPassword, password, passwordConfirmation } = body;
  if (!currentPassword || !password || !passwordConfirmation) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        currentPassword,
        password,
        passwordConfirmation,
      }),
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      const data = await strapiRes.json().catch(() => ({}));
      // Standard Strapi error response format: { error: { message: "..." } }
      const message =
        data.error?.message || "Password change failed. Please check your current password.";
      return NextResponse.json(
        { error: message },
        { status: strapiRes.status === 400 ? 400 : 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (cause) {
    Sentry.captureException(cause);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.network }, { status: 502 });
  }
}
