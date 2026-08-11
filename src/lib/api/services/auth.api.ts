import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { LoginRequest, LoginResponse, CurrentUserResponse } from "@/types/api/auth";

/**
 * Domain-specific service for authentication related API calls.
 * Consumes the route registry and the central fetch client.
 */
export const authApi = {
  /** Authenticate user and establish session */
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse, LoginRequest>(appRoutes.auth.login.path, body),

  /** Destroy current session */
  logout: () => apiClient.post<void, undefined>(appRoutes.auth.logout.path, undefined),

  /** Get current authenticated user details */
  getCurrentUser: () => apiClient.get<CurrentUserResponse>(appRoutes.auth.me.path),
};
