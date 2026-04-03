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
  return <OrgAccessBoundary accountId={accountId}>{children}</OrgAccessBoundary>;
}
