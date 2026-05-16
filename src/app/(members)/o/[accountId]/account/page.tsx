import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { AccountPageContent } from "./_components/AccountPageContent";

import type { AccountPageProps } from "./_types/page";

export const metadata = buildPageMetadata({
  title: "Account Settings",
  description: "Manage your Fixtura Members account and security settings.",
});

export default async function AppAccountPage({ params }: AccountPageProps) {
  const { accountId } = await params;

  return <AccountPageContent accountId={accountId} />;
}
