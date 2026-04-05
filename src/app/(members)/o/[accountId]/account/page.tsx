import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AuthSurface } from "@/components/auth/structure";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

export const metadata = buildPageMetadata({
  title: "Account Settings",
  description: "Manage your Fixtura Members account and security settings.",
});

export default function AppAccountPage() {
  return (
    <div className="grid max-w-2xl gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and security settings.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Security</h2>
        <p className="text-muted-foreground text-sm">
          Change your password to keep your account secure.
        </p>

        <AuthSurface className="p-6">
          <ChangePasswordForm />
        </AuthSurface>
      </div>

      <div className="bg-muted/30 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">Other account settings are coming soon.</p>
      </div>
    </div>
  );
}
