import { describe, expect, it } from "vitest";

import {
  SELECT_ORG_GATEWAY_REASON,
  parseSelectOrgGatewayReason,
  selectOrgOwnershipUnavailableReason,
  selectOrgReasonFromApiStatus,
  selectOrgReasonFromApiStatusExcludingBadRequest,
  selectOrgReasonFromApiStatusExcludingForbidden,
  selectOrganisationUrlWithReason,
  selectOrgReasonMessage,
} from "./gateway-reasons";

describe("gateway-reasons", () => {
  it("selectOrganisationUrlWithReason encodes known reasons", () => {
    expect(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.forbidden)).toBe(
      "/select-organisation?reason=forbidden",
    );
    expect(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.notFound)).toBe(
      "/select-organisation?reason=not_found",
    );
    expect(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg)).toBe(
      "/select-organisation?reason=invalid_org",
    );
  });

  it("parseSelectOrgGatewayReason accepts only allowlisted values", () => {
    expect(parseSelectOrgGatewayReason("forbidden")).toBe(SELECT_ORG_GATEWAY_REASON.forbidden);
    expect(parseSelectOrgGatewayReason(null)).toBeNull();
    expect(parseSelectOrgGatewayReason("")).toBeNull();
    expect(parseSelectOrgGatewayReason("evil")).toBeNull();
  });

  it("selectOrgReasonFromApiStatus maps HTTP statuses", () => {
    expect(selectOrgReasonFromApiStatus(403)).toBe(SELECT_ORG_GATEWAY_REASON.forbidden);
    expect(selectOrgReasonFromApiStatus(404)).toBe(SELECT_ORG_GATEWAY_REASON.notFound);
    expect(selectOrgReasonFromApiStatus(400)).toBe(SELECT_ORG_GATEWAY_REASON.invalidOrg);
    expect(selectOrgReasonFromApiStatus(500)).toBeNull();
  });

  it("selectOrgReasonFromApiStatusExcludingBadRequest omits 400", () => {
    expect(selectOrgReasonFromApiStatusExcludingBadRequest(403)).toBe(
      SELECT_ORG_GATEWAY_REASON.forbidden,
    );
    expect(selectOrgReasonFromApiStatusExcludingBadRequest(404)).toBe(
      SELECT_ORG_GATEWAY_REASON.notFound,
    );
    expect(selectOrgReasonFromApiStatusExcludingBadRequest(400)).toBeNull();
    expect(selectOrgReasonFromApiStatusExcludingBadRequest(500)).toBeNull();
  });

  it("selectOrgReasonFromApiStatusExcludingForbidden omits 403", () => {
    expect(selectOrgReasonFromApiStatusExcludingForbidden(403)).toBeNull();
    expect(selectOrgReasonFromApiStatusExcludingForbidden(404)).toBe(
      SELECT_ORG_GATEWAY_REASON.notFound,
    );
    expect(selectOrgReasonFromApiStatusExcludingForbidden(400)).toBe(
      SELECT_ORG_GATEWAY_REASON.invalidOrg,
    );
    expect(selectOrgReasonFromApiStatusExcludingForbidden(500)).toBeNull();
  });

  it("selectOrgReasonMessage returns non-empty copy for each reason", () => {
    for (const r of Object.values(SELECT_ORG_GATEWAY_REASON)) {
      expect(selectOrgReasonMessage(r).length).toBeGreaterThan(10);
    }
  });

  it("selectOrgReasonMessage uses identical copy for forbidden and not_found", () => {
    expect(selectOrgReasonMessage(SELECT_ORG_GATEWAY_REASON.forbidden)).toBe(
      selectOrgReasonMessage(SELECT_ORG_GATEWAY_REASON.notFound),
    );
  });

  it("selectOrgOwnershipUnavailableReason maps 403 and 404 to not_found", () => {
    expect(selectOrgOwnershipUnavailableReason(403)).toBe(SELECT_ORG_GATEWAY_REASON.notFound);
    expect(selectOrgOwnershipUnavailableReason(404)).toBe(SELECT_ORG_GATEWAY_REASON.notFound);
    expect(selectOrgOwnershipUnavailableReason(400)).toBe(SELECT_ORG_GATEWAY_REASON.invalidOrg);
    expect(selectOrgOwnershipUnavailableReason(500)).toBeNull();
  });
});
