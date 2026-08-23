import { AnalyticsAccountGroup } from "@/components/analytics/analytics-account-group";
import { OrgAccessBoundary } from "@/components/auth/org-access-boundary";

import type { ReactNode } from "react";

export default async function AccountScopedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return (
    <OrgAccessBoundary accountId={accountId}>
      <AnalyticsAccountGroup accountId={accountId} />
      {children}
    </OrgAccessBoundary>
  );
}
