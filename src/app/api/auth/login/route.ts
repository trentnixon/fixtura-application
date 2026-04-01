import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getAuthCookieBaseOptions } from "@/lib/auth/auth-cookie";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { getStrapiUrl } from "@/lib/config/env";

type LoginBody = {
  identifier?: string;
  password?: string;
};

export async function POST(request: Request) {
  const strapiUrl = getStrapiUrl();
  if (!strapiUrl) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.loginUnavailable }, { status: 500 });
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unexpected }, { status: 400 });
  }

  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!identifier || !password) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.invalidCredentials }, { status: 400 });
  }

  let strapiRes: Response;
  try {
    strapiRes = await fetch(`${strapiUrl}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ identifier, password }),
      cache: "no-store",
    });
  } catch (cause) {
    Sentry.captureException(cause);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.network }, { status: 502 });
  }

  if (!strapiRes.ok) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.invalidCredentials }, { status: 401 });
  }

  let data: unknown;
  try {
    data = await strapiRes.json();
  } catch (cause) {
    Sentry.captureException(cause);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unexpected }, { status: 502 });
  }

  const jwt =
    typeof data === "object" &&
    data !== null &&
    "jwt" in data &&
    typeof (data as { jwt: unknown }).jwt === "string"
      ? (data as { jwt: string }).jwt
      : null;

  if (!jwt) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGES.unexpected }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  const opts = getAuthCookieBaseOptions();
  res.cookies.set(AUTH_COOKIE_NAME, jwt, opts);
  return res;
}
