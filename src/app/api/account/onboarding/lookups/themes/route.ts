import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

/**
 * BFF: GET /api/account/onboarding/lookups/themes → Strapi premade themes (L3).
 * Response shape: `{ data: OnboardingThemeOption[] }` — each row includes `id`, `label`, `sortOrder`, `slug`,
 * plus `sport` (account sport enum or null) and `theme` (`{ primary, secondary, dark, white }` hex JSON or null).
 * @see create-organisation/.comms/phase-3/cms-request-onboarding-phase3-themes-and-logo.md
 */
export async function GET() {
  const guard = await guardStrapiRequest();
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(`${guard.strapiUrl}/api/account/onboarding/lookups/themes`, {
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
