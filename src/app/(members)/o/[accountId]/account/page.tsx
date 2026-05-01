import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { AccountSecurityContent } from "./_components/account-security-content";

export const metadata = buildPageMetadata({
  title: "Account Settings",
  description: "Manage your Fixtura Members account and security settings.",
});

export default async function AppAccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <AccountSecurityContent accountId={accountId} />
    </div>
  );
}
