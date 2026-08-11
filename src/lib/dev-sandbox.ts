export const isDevSandboxEnabled = process.env["NEXT_PUBLIC_ENABLE_DEV_SANDBOX"] === "true";

/** When true, `?orgSim=` on `/select-organisation` can force UI states without calling GET /account/me. */
export const isSelectOrgSimulatorEnabled =
  process.env["NEXT_PUBLIC_SELECT_ORG_SIMULATOR"] === "true";
