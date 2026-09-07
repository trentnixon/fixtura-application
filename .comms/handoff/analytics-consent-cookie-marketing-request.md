# Marketing request — shared analytics consent cookie

**Date:** 2026-09-07  
**From:** Application team  
**To:** Marketing / www.fixtura.com.au  
**Blocks:** Production enablement of `NEXT_PUBLIC_FEATURE_ANALYTICS` on application (staging can proceed sooner)

## What we need

When a user grants analytics consent on www, write **both**:

1. Existing per-origin storage (if you still use it today)
2. A domain-scoped cookie:

- **Name:** `fixtura_analytics_consent`
- **Value:** `granted` (literal string — not `true`)
- **Domain:** `.fixtura.com.au`
- **Path:** `/`
- **SameSite:** `Lax`
- **Secure:** yes on HTTPS

Application now reads **cookie first**, then falls back to `localStorage` on the same origin.

## Why

`localStorage` is per-origin. Consent on www does not carry to application.fixtura.com.au without a shared cookie.

## Application status

- Read path: cookie → localStorage fallback (`src/lib/analytics/consent.ts`)
- Write helper for future in-app consent UI: `writeBrowserAnalyticsConsent` (cookie + localStorage)
- Re-sync on focus/visibility when user returns from another tab

## Verification

1. Grant consent on www in staging/production.
2. Open application on the same browser without re-consenting.
3. With `NEXT_PUBLIC_FEATURE_ANALYTICS=true` and key set, confirm `$pageview` events with `surface: app` appear in PostHog project `214725`.

## References

- `.comms/handoff/analytics-handoff.md` (decision #6 updated)
- `CONTEXT.md` — Analytics Consent glossary
