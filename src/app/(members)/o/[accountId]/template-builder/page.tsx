import { TemplateBuilderContent } from "./template-builder-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Template builder</h1>
        <p className="text-muted-foreground mt-1">
          Branding and template preview data from the CMS (read-only in this phase).
        </p>
      </div>
      <TemplateBuilderContent accountId={accountId} />
    </div>
  );
}
