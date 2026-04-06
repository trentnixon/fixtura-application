import { TemplateBuilderContent } from "./template-builder-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Template builder</h1>
        <p className="text-muted-foreground mt-1">
          Read-only: branding slice plus full template catalog from GET
          /api/accounts/:id/all-template-options (optional templateOptionId from /account/me or
          branding).
        </p>
      </div>
      <TemplateBuilderContent accountId={accountId} />
    </div>
  );
}
