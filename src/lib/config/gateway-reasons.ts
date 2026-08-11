import { ROUTES } from "./routes";

/** Sign-in: user hit a protected members URL while logged out (middleware sets with `from`). */
export const LOGIN_REASON_CONTINUE = "continue" as const;

/** Query key on `/select-organisation` for gateway messaging. */
export const SELECT_ORG_REASON_QUERY = "reason" as const;

export const SELECT_ORG_GATEWAY_REASON = {
  forbidden: "forbidden",
  notFound: "not_found",
  invalidOrg: "invalid_org",
} as const;

export type SelectOrgGatewayReason =
  (typeof SELECT_ORG_GATEWAY_REASON)[keyof typeof SELECT_ORG_GATEWAY_REASON];

export function selectOrganisationUrlWithReason(reason: SelectOrgGatewayReason): string {
  const params = new URLSearchParams();
  params.set(SELECT_ORG_REASON_QUERY, reason);
  return `${ROUTES.selectOrganisation}?${params.toString()}`;
}

export function parseSelectOrgGatewayReason(value: string | null): SelectOrgGatewayReason | null {
  if (!value) return null;
  const allowed = Object.values(SELECT_ORG_GATEWAY_REASON) as string[];
  return allowed.includes(value) ? (value as SelectOrgGatewayReason) : null;
}

/** Shared copy for ownership failures — must not distinguish missing vs cross-user. */
const ORGANISATION_UNAVAILABLE_MESSAGE = "That organisation isn’t available. Choose one below.";

export function selectOrgReasonMessage(reason: SelectOrgGatewayReason): string {
  switch (reason) {
    case SELECT_ORG_GATEWAY_REASON.forbidden:
    case SELECT_ORG_GATEWAY_REASON.notFound:
      return ORGANISATION_UNAVAILABLE_MESSAGE;
    case SELECT_ORG_GATEWAY_REASON.invalidOrg:
      return "That organisation link isn’t valid. Choose one below.";
    default:
      return "";
  }
}

/**
 * Ownership-gate mapper for account-level access checks (e.g. organisation context).
 * Maps 403 and 404 to the same `not_found` reason so nonexistent and cross-user ids look identical.
 * `400` → invalid org segment. Nested slice hooks should keep {@link selectOrgReasonFromApiStatus}.
 */
export function selectOrgOwnershipUnavailableReason(status: number): SelectOrgGatewayReason | null {
  if (status === 403 || status === 404) return SELECT_ORG_GATEWAY_REASON.notFound;
  if (status === 400) return SELECT_ORG_GATEWAY_REASON.invalidOrg;
  return null;
}

/** Map Strapi/BFF HTTP status to gateway messaging (403 = no access, 404 = missing, 400 = bad id). */
export function selectOrgReasonFromApiStatus(status: number): SelectOrgGatewayReason | null {
  if (status === 403) return SELECT_ORG_GATEWAY_REASON.forbidden;
  if (status === 404) return SELECT_ORG_GATEWAY_REASON.notFound;
  if (status === 400) return SELECT_ORG_GATEWAY_REASON.invalidOrg;
  return null;
}

/**
 * Like {@link selectOrgReasonFromApiStatus} but omits 400 — for endpoints where 400 can mean invalid
 * query params (e.g. paginated list filters), not only invalid path `accountId`.
 */
export function selectOrgReasonFromApiStatusExcludingBadRequest(
  status: number,
): SelectOrgGatewayReason | null {
  if (status === 403) return SELECT_ORG_GATEWAY_REASON.forbidden;
  if (status === 404) return SELECT_ORG_GATEWAY_REASON.notFound;
  return null;
}

/**
 * Like {@link selectOrgReasonFromApiStatus} but omits **403**.
 * Use for account sub-resources where **403** means “no permission for this slice” (e.g. notifications),
 * not “lose access to the organisation” — the page should show an error instead of the select-org gateway.
 */
export function selectOrgReasonFromApiStatusExcludingForbidden(
  status: number,
): SelectOrgGatewayReason | null {
  if (status === 404) return SELECT_ORG_GATEWAY_REASON.notFound;
  if (status === 400) return SELECT_ORG_GATEWAY_REASON.invalidOrg;
  return null;
}
