import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

export type GuardStrapiOk = {
  ok: true;
  strapiUrl: string;
  token: string;
};

export type GuardStrapiFail = { ok: false; response: NextResponse };

/** Auth cookie + Strapi URL guard for routes without an account id segment. */
export async function guardStrapiRequest(): Promise<GuardStrapiOk | GuardStrapiFail> {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!strapiUrl) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Service unavailable" }, { status: 503 }),
    };
  }

  return { ok: true, strapiUrl, token };
}
