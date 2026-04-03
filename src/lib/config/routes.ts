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

  // (members) gateway — authenticated, no account scope yet
  selectOrganisation: "/select-organisation",
  createOrganisation: "/create-organisation",

  membersLogoutPage: "/logout",
  logout: "/api/auth/logout", // Action URL or action route
  fetchHealth: "/admin/system/fetch-health",
  systemInspector: "/admin/system/inspector",
  systemLanding: "/admin/system",
} as const;
