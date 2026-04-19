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
  /** Dev sandbox root — portal; gated by NEXT_PUBLIC_ENABLE_DEV_SANDBOX */
  sandbox: "/sandbox",
  kitchenSink: "/sandbox/kitchen-sink",
  routeLab: "/sandbox/route-lab",
  interactionLab: "/sandbox/interaction-lab",
  /** Dev sandbox — CMS-backed selects, lists & form patterns */
  dataLab: "/sandbox/data-lab",
  /** Interaction lab — Remotion player + vendored Fixtura preview */
  remotionPreview: "/sandbox/interaction-lab/remotion",

  // (members) gateway — authenticated, no account scope yet
  selectOrganisation: "/select-organisation",
  createOrganisation: "/create-organisation",
  /** Gateway: poll setup / retry after wizard complete (lifecycle v1). */
  createOrganisationSetup: "/create-organisation/setup",

  membersLogoutPage: "/logout",
  logout: "/api/auth/logout", // Action URL or action route
  fetchHealth: "/admin/system/fetch-health",
  systemInspector: "/admin/system/inspector",
  systemLanding: "/admin/system",
} as const;
