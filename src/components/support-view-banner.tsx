"use client";

import Link from "next/link";

import { InlineAlert } from "@/components/auth/actions";
import { Button } from "@/components/ui/button";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { ROUTES } from "@/lib/config/routes";
import { getSupportCustomerLabel } from "@/lib/support/support-customer-label";
import { buildSupportViewBannerMessage } from "@/lib/support/support-view-banner-copy";
import { useSupportView } from "@/lib/support/support-view-context";

/**
 * Persistent context strip when a support user is viewing a non-owned customer account.
 */
export function SupportViewBanner() {
  const { isSupportView, customerAccountId } = useSupportView();

  const orgQuery = useAccountOrganisationContext(customerAccountId ?? "", {
    enabled: isSupportView && Boolean(customerAccountId),
  });

  if (!isSupportView || !customerAccountId) return null;

  const storedLabel = getSupportCustomerLabel(customerAccountId);
  const orgName =
    orgQuery.data &&
    !isAccountOrganisationContextGatewayRedirect(orgQuery.data) &&
    orgQuery.data.data.accountOrganisationDetails?.Name
      ? orgQuery.data.data.accountOrganisationDetails.Name
      : storedLabel;

  const label = buildSupportViewBannerMessage({
    accountId: customerAccountId,
    orgName,
  });

  return (
    <div className="border-border mt-8 w-full border-t px-4 pt-4 pb-3 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <InlineAlert variant="info" message={label} />
        <Button variant="outline" size="sm" asChild className="shrink-0 self-start sm:self-center">
          <Link href={ROUTES.supportAccounts}>Back to support accounts</Link>
        </Button>
      </div>
    </div>
  );
}
