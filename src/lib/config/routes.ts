export const ROUTES = {
  // (public)
  home: "/",
  signIn: "/sign-in",
  forgotPassword: "/forgot-password",
  checkEmail: "/check-email",
  resetPassword: "/reset-password",
  verify: "/verify",
  authError: "/auth-error",
  sessionExpired: "/session-expired",
  help: "/help",
  support: "/support",
  maintenance: "/maintenance",
  kitchenSink: "/kitchen-sink",

  // (auth)
  dashboard: "/dashboard",
  settings: "/settings",
  bundles: "/bundles",
  templateBuilder: "/template-builder",
  mediaGallery: "/media-gallery",
  manageSponsors: "/manage-sponsors",
  season: "/season",
  account: "/account",
  logout: "/api/auth/logout", // Action URL or action route
} as const;
