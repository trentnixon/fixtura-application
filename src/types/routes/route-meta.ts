import type { HttpMethod, RouteImplementationStatus } from "./route-status";

export interface AppRouteDefinition {
  key: string;
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  adminOnly?: boolean;
  status: RouteImplementationStatus;
  description: string;
  domain:
    | "auth"
    | "account"
    | "assets"
    | "template-gradients"
    | "template-images"
    | "template-modes"
    | "template-noises"
    | "template-palettes"
    | "template-particles"
    | "template-patterns"
    | "template-textures"
    | "template-videos"
    | "bundles"
    | "templates"
    | "season"
    | "admin";
}
