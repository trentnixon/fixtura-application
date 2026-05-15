import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

/** Positive integer path segment (sponsor id, allocation id, entity id). */
export function isValidPositiveIntSegment(segment: string): boolean {
  return isValidAccountIdSegment(segment);
}

export type GuardAccountStrapiOk = {
  ok: true;
  strapiUrl: string;
  token: string;
  accountId: string;
};

export type GuardAccountStrapiFail = { ok: false; response: NextResponse };

export async function guardAccountStrapiRequest(
  accountId: string,
): Promise<GuardAccountStrapiOk | GuardAccountStrapiFail> {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isValidAccountIdSegment(accountId)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid account id" }, { status: 400 }),
    };
  }

  if (!strapiUrl) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Service unavailable" }, { status: 503 }),
    };
  }

  return { ok: true, strapiUrl, token, accountId };
}
