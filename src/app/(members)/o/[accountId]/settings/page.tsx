import { AccountSettingsContent } from "./account-settings-content";
import { SettingsAccountMeDump } from "./settings-account-me-dump";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Account configuration from the CMS (read-only in this phase).
        </p>
      </div>
      <SettingsAccountMeDump />
      <AccountSettingsContent accountId={accountId} />
    </div>
  );
}
