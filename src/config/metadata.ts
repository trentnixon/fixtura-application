/**
 * Central metadata defaults for Fixtura Members (Next.js App Router).
 * @see src/lib/metadata/buildMetadata.ts
 */

const defaultBaseUrl = "http://localhost:3000";

export const appMetadata = {
  appName: "Fixtura Members",
  appTitle: "Fixtura Members",
  /** Use with Next.js `title.template`; `%s` is the page segment. */
  titleTemplate: "%s | Fixtura Members",
  description: "Access your Fixtura member dashboard, organisations, and account tools.",
  brandName: "Fixtura",
  baseUrl: process.env["NEXT_PUBLIC_APP_URL"] ?? defaultBaseUrl,
  /** Brand assets live under `public/logos/`. */
  icons: {
    icon: [
      { url: "/logos/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/logos/favicon.ico",
    apple: "/logos/apple-touch-icon.png",
  },
  robotsDefault: { index: true, follow: true } as const,
};
