export { ApiError } from "./client/api-error";
export { apiRequest, apiClient } from "./client/fetch-client";

// Compatibility aliases for the old system while we migrate
import { apiRequest } from "./client/fetch-client";
/** @deprecated Use apiRequest or apiClient instead */
export const apiFetch = apiRequest;
/** @deprecated Use apiRequest<T> or apiClient instead */
export const apiFetchJson = apiRequest;
