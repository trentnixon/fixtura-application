import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

export interface EndpointHealthResult {
  key: string;
  path: string;
  method: string;
  status: "ok" | "error" | "skipped";
  responseTimeMs?: number;
  httpStatus?: number;
  message?: string;
}

export interface FetchHealthResponse {
  service: "fetch-client";
  overallStatus: "ok" | "degraded" | "error";
  checkedAt: string;
  results: EndpointHealthResult[];
}

/**
 * Service for checking the health and connectivity of internal API routes.
 * Primarily used by admin diagnostics.
 */
export const healthApi = {
  /** Get live health status for registered routes */
  getFetchHealth: () => apiClient.get<FetchHealthResponse>(appRoutes.admin.fetchHealth.path),
};
