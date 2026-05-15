import { redirect } from "next/navigation";

import { accountScopedRoutes } from "@/lib/config/account-routes";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  redirect(accountScopedRoutes.manageSponsorsAssignPosition(accountId));
}
