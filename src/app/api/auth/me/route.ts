import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

import type { CurrentUserResponse } from "@/types/api/auth";

export async function GET() {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/users/me?populate=role`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user session" },
        { status: strapiRes.status },
      );
    }

    const strapiUser = await strapiRes.json();

    // Map Strapi User to Application User entity
    const userResponse: CurrentUserResponse = {
      user: {
        id: strapiUser.id.toString(),
        email: strapiUser.email,
        firstName: strapiUser.firstName || "",
        lastName: strapiUser.lastName || "",
        name:
          strapiUser.firstName && strapiUser.lastName
            ? `${strapiUser.firstName} ${strapiUser.lastName}`
            : strapiUser.username || strapiUser.email,
        role: strapiUser.role?.type === "admin" ? "admin" : "user",
        avatar: strapiUser.avatar?.url || undefined, // Adjust mapping if avatar exists in Strapi
      },
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
