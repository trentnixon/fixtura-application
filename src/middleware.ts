import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { applySignInRedirectQuery } from "@/lib/auth/member-route-sign-in";
import { ROUTES } from "@/lib/config/routes";

/** Legacy flat URLs → redirect here (or into scoped app after selection). */
const LEGACY_MEMBER_PREFIXES = [
  "/dashboard",
  "/settings",
  "/bundles",
  "/branding",
  "/template-builder",
  "/media-gallery",
  "/manage-sponsors",
  "/season",
  "/account",
] as const;

function isLegacyMemberPath(pathname: string): boolean {
  return LEGACY_MEMBER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const GATEWAY_PATHS = [ROUTES.selectOrganisation, ROUTES.createOrganisation] as const;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (process.env.NODE_ENV === "development") {
    console.log("[middleware]", {
      pathname,
      hasToken,
    });
  }

  if (hasToken && isLegacyMemberPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.selectOrganisation;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const publicAuthRoutes = [
    ROUTES.home,
    ROUTES.signIn,
    ROUTES.forgotPassword,
    ROUTES.sessionExpired,
    ROUTES.authError,
  ];

  if (hasToken && publicAuthRoutes.includes(pathname as (typeof publicAuthRoutes)[number])) {
    if (pathname === ROUTES.forgotPassword && searchParams.has("code")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = ROUTES.selectOrganisation;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isScopedMemberPrefix = pathname.startsWith("/o/");
  const isGatewayMember = (GATEWAY_PATHS as readonly string[]).includes(pathname);
  const isAdminMember = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogoutPage = pathname === ROUTES.membersLogoutPage;

  const isProtectedMember =
    isScopedMemberPrefix || isGatewayMember || isAdminMember || isLogoutPage;

  if (isProtectedMember) {
    if (!hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.signIn;
      url.search = "";
      applySignInRedirectQuery(url, pathname, request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/o/:path*",
    "/select-organisation",
    "/create-organisation",
    "/admin/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/bundles/:path*",
    "/branding/:path*",
    "/template-builder/:path*",
    "/media-gallery/:path*",
    "/manage-sponsors/:path*",
    "/season/:path*",
    "/account/:path*",
    "/logout",
    "/sign-in",
    "/forgot-password",
    "/session-expired",
    "/auth-error",
  ],
};
