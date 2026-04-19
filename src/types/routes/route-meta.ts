import type { HttpMethod, RouteImplementationStatus } from "./route-status";

export interface AppRouteDefinition {
  key: string;
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  adminOnly?: boolean;
  status: RouteImplementationStatus;
  description: string;
  domain: "auth" | "account" | "assets" | "bundles" | "templates" | "season" | "admin";
}
