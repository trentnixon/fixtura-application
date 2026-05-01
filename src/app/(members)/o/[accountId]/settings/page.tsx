import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { AccountSettingsContent } from "./account-settings-content";

export const metadata = buildPageMetadata({
  title: "Organisation settings",
  description:
    "Configure organisation preferences, bundle delivery, and display options for your Fixtura Members account.",
});

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Organisation settings</h1>
        <p className="text-muted-foreground mt-1">
          Load account configuration from the CMS and save organisation preferences — delivery
          grouping, juniors, association competition layout, etc.
        </p>
      </div>
      <AccountSettingsContent accountId={accountId} />
    </div>
  );
}
