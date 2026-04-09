import { ManageSponsorsContent } from "./manage-sponsors-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Manage sponsors</h1>
        <p className="text-muted-foreground mt-1">
          Published sponsors from the CMS for this account (read-only).
        </p>
      </div>
      <ManageSponsorsContent accountId={accountId} />
    </div>
  );
}
