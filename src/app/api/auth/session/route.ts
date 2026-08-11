import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isJwtExpiredOrInvalid } from "@/lib/auth/jwt-payload";

export async function GET() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token?.length) {
    return NextResponse.json({ authenticated: false });
  }
  if (isJwtExpiredOrInvalid(token)) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true });
}
