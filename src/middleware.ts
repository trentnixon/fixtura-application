import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (process.env.NODE_ENV === "development") {
    console.log("[middleware]", {
      pathname,
      hasToken,
    });
  }

  // Define public routes that should redirect authenticated users back to the app
  const publicAuthRoutes = [
    ROUTES.home,
    ROUTES.signIn,
    ROUTES.forgotPassword,
    ROUTES.sessionExpired,
    ROUTES.authError,
  ];

  if (hasToken && publicAuthRoutes.includes(pathname as any)) {
    // EXCEPTION: Allow access to forgot-password if a 'code' is present
    // even if the user is already authenticated (e.g. following a reset email link)
    if (pathname === ROUTES.forgotPassword && searchParams.has("code")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = ROUTES.dashboard;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // List of paths that require authentication
  const protectedRoutes = [
    ROUTES.dashboard,
    ROUTES.settings,
    ROUTES.bundles,
    ROUTES.templateBuilder,
    ROUTES.mediaGallery,
    ROUTES.manageSponsors,
    ROUTES.season,
    ROUTES.account,
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.signIn;
      const fullPath = pathname + request.nextUrl.search;
      const fromValue = isSafeAppReturnPath(fullPath)
        ? fullPath
        : isSafeAppReturnPath(pathname)
          ? pathname
          : ROUTES.dashboard;
      url.searchParams.set("from", fromValue);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/settings/:path*",
    "/bundles/:path*",
    "/template-builder/:path*",
    "/media-gallery/:path*",
    "/manage-sponsors/:path*",
    "/season/:path*",
    "/account/:path*",
    "/sign-in",
    "/forgot-password",
    "/session-expired",
    "/auth-error",
  ],
};
