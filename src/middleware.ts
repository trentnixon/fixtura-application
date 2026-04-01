import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (pathname === ROUTES.login) {
    if (hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.app;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(ROUTES.app)) {
    if (!hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.login;
      const fullPath = pathname + request.nextUrl.search;
      const fromValue = isSafeAppReturnPath(fullPath)
        ? fullPath
        : isSafeAppReturnPath(pathname)
          ? pathname
          : ROUTES.app;
      url.searchParams.set("from", fromValue);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
